import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import AddIssueModal from "./modal/AddIssueModal";
import { backendBaseUrl } from "../config";
import { Issue } from "../Interface";
import { IssueTypeEnum } from "../enum";
import StartSprintModal from "./modal/StartSprintModal";

const Backlogs: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
  const [sprintIssues, setSprintIssues] = useState<Issue[]>([]);
  const [backlogIssuesCount, setBacklogIssuesCount] = useState<Number>(0);
  const [sprintIssuesCount, setSprintIssuesCount] = useState<Number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectName, setProjectName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("backlogs");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isStartSprintModalOpen, setIsStartSprintModalOpen] = useState<boolean>(false);
  const [createdSprint, setCreatedSprint] = useState<any>(null);

  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(
    localStorage.getItem("workspaceData") || "{}"
  );

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";
  const accessToken = localStorage.getItem("accessToken");
  const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backlogResponse = await axios.get(
          `${backendBaseUrl}/teaco/api/v1/project/${projectId}/backlogs`,
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );
        const sprintResponse = await axios.get(
          `${backendBaseUrl}/teaco/api/v1/project/${projectId}/sprints/created`,
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );
        const projectResponse = await axios.get(
          `${backendBaseUrl}/teaco/api/v1/project/${projectId}/`,
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );

        const projectData = projectResponse.data.data;
        const fetchedBacklogIssues = backlogResponse.data.data || [];
        const fetchedSprintData = sprintResponse.data.data;

        setBacklogIssues(fetchedBacklogIssues);
        setBacklogIssuesCount(fetchedBacklogIssues.length)

        setSprintIssues(fetchedSprintData?.issues || []);
        setSprintIssuesCount(fetchedSprintData.issues.length)

        setCreatedSprint(fetchedSprintData);
        setProjectName(projectData.name);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load backlog and sprint data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, accessToken, workspaceSecret]);

  const handleAddIssue = () => {
    if (createdSprint) {
      setIsModalOpen(true);
    } else {
      toast.info("Create a sprint first before adding issues.");
    }
  };

  const handleStartSprint = () => {
    if (createdSprint) {
      setIsStartSprintModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseStartSprintModal = () => {
    setIsStartSprintModalOpen(false);
  };

  interface IssueItemProps {
    issue: Issue;
    isInSprint: boolean;
    onMove: (issueId: string, target: "backlog" | "sprint") => void;
  }

  const handleMoveIssue = async (
    issueId: string,
    target: "backlog" | "sprint"
  ) => {
    try {
      if (target === "sprint") {
        await axios.put(
          `${backendBaseUrl}/teaco/api/v1/project/${projectId}/issues/${issueId}`,
          {
            sprintId: createdSprint.id,
          },
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );
      } else {
        await axios.put(
          `${backendBaseUrl}/teaco/api/v1/project/${projectId}/issues/${issueId}`,
          {
            sprintId: null,
          },
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );
      }

      if (target === "sprint") {
        const movedIssue = backlogIssues.find(
          (issue) => issue.id.toString() === issueId
        );
        setBacklogIssues((prev) =>
          prev.filter((issue) => issue.id.toString() !== issueId)
        );
        setSprintIssues((prev) => [...prev, movedIssue!]);
      } else {
        const movedIssue = sprintIssues.find(
          (issue) => issue.id.toString() === issueId
        );
        setSprintIssues((prev) =>
          prev.filter((issue) => issue.id.toString() !== issueId)
        );
        setBacklogIssues((prev) => [...prev, movedIssue!]);
      }

      toast.success(
        `Issue moved to ${target === "sprint" ? "Sprint" : "Backlog"}!`
      );
    } catch (error) {
      console.error("Error moving issue:", error);
      toast.error("Failed to move issue.");
    }
  };

  const IssueItem: React.FC<IssueItemProps> = ({
    issue,
    isInSprint,
    onMove,
  }) => {
    return (
      <div className="p-5 bg-white rounded-lg shadow hover:bg-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs font-medium text-white ${
                issue.type === IssueTypeEnum.FEATURE
                  ? "bg-blue-500"
                  : issue.type === IssueTypeEnum.BUG
                  ? "bg-red-500"
                  : issue.type === IssueTypeEnum.ENHANCEMENT
                  ? "bg-green-500"
                  : issue.type === IssueTypeEnum.REFACTOR
                  ? "bg-yellow-500"
                  : issue.type === IssueTypeEnum.DOCUMENTATION
                  ? "bg-purple-500"
                  : issue.type === IssueTypeEnum.TASK
                  ? "bg-gray-500"
                  : issue.type === IssueTypeEnum.CHORE
                  ? "bg-gray-400"
                  : issue.type === IssueTypeEnum.QUESTION
                  ? "bg-cyan-500"
                  : issue.type === IssueTypeEnum.SUPPORT
                  ? "bg-indigo-500"
                  : issue.type === IssueTypeEnum.SECURITY
                  ? "bg-red-600"
                  : issue.type === IssueTypeEnum.PERFORMANCE
                  ? "bg-orange-500"
                  : issue.type === IssueTypeEnum.UX
                  ? "bg-pink-500"
                  : issue.type === IssueTypeEnum.DEPLOYMENT
                  ? "bg-blue-600"
                  : issue.type === IssueTypeEnum.TESTING
                  ? "bg-green-600"
                  : issue.type === IssueTypeEnum.CI_CD
                  ? "bg-yellow-600"
                  : "bg-slate-700"
              }`}
              style={{ marginRight: "10px" }}
            >
              {issue.type.toLocaleLowerCase()}
            </span>
            <h3 className="text-lg font-medium mr-2">{issue.title}</h3>
          </div>
          <button
            onClick={() =>
              onMove(issue.id.toString(), isInSprint ? "backlog" : "sprint")
            }
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            {isInSprint ? "Move to Backlog" : `Move to Sprint ${createdSprint.sprintCount}`}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-gray-500">Loading backlog...</p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <nav className="flex items-center space-x-2 text-lg mb-10">
                  <a
                    href="/projects/"
                    className="text-gray-600 hover:underline"
                  >
                    Projects
                  </a>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900">{projectName}</span>
                </nav>
                <h1 className="text-4xl font-semibold mb-10">Backlog</h1>
                <div className="mb-6 flex justify-between">
                  <div className="flex space-x-1 mb-4">
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        activeTab === "boards"
                          ? "bg-[#0D00A8] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={() => navigate(`/projects/${projectId}/boards`)}
                    >
                      Boards
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        activeTab === "backlogs"
                          ? "bg-[#0D00A8] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveTab("backlogs")}
                    >
                      Backlogs
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        activeTab === "timeline"
                          ? "bg-[#0D00A8] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={() =>
                        navigate(`/projects/${projectId}/timeline`)
                      }
                    >
                      Timeline
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={handleAddIssue}
                      className="bg-[#0D00A8] text-white px-4 py-2 rounded-lg text-lg"
                    >
                      Add Issue +
                    </button>
                    <button
                      onClick={handleStartSprint}
                      className="bg-[#0D00A8] text-white px-4 py-2 rounded-lg text-lg"
                    >
                      Start sprint
                    </button>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-400">
                  SCRUM Sprint-{createdSprint.sprintCount} ({sprintIssuesCount} issues)
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                  {sprintIssues.length === 0 ? (
                    <p className="text-gray-500">No issues in the sprint</p>
                  ) : (
                    <div className="grid grid-flow-row gap-4">
                      {sprintIssues.map((issue) => (
                        <IssueItem
                          key={issue.id}
                          issue={issue}
                          isInSprint={true}
                          onMove={handleMoveIssue}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-400">
                  Backlogs ({backlogIssuesCount.toFixed()} issues)
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                  {backlogIssues.length === 0 ? (
                    <p className="text-gray-500">No issues in the backlog</p>
                  ) : (
                    <div className="grid grid-flow-row gap-4">
                      {backlogIssues.map((issue) => (
                        <IssueItem
                          key={issue.id}
                          issue={issue}
                          isInSprint={false}
                          onMove={handleMoveIssue}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isModalOpen && createdSprint && (
                <AddIssueModal
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  projectId={projectId || ""}
                />
              )}
              {isStartSprintModalOpen && createdSprint && (
                <StartSprintModal
                  isOpen={isStartSprintModalOpen}
                  onClose={handleCloseStartSprintModal}
                  projectId={projectId || ""}
                  sprintId={ createdSprint.id || ""}
                />
              )}
            </div>
          )}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Backlogs;
