import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../config";
import "react-toastify/dist/ReactToastify.css";
import { Column, Issue } from "../Interface";
import { IssueTypeEnum, PriorityEnum } from "../enum";
import AddIssueModal from "./modal/AddIssueModal";
import { differenceInDays } from "date-fns";
import { Tooltip } from "react-tooltip";
import toast, { Toaster } from "react-hot-toast";
import IssueModal from "./modal/IssueModal";
import { CheckIcon } from "@heroicons/react/24/outline";

<div>
  <Toaster />
</div>;


// Weight configuration for different factors
const WEIGHTS = {
  priority: {
    HIGH: 0.5,    // 50% weight for high priority
    MEDIUM: 0.3,  // 30% weight for medium priority
    LOW: 0.2      // 20% weight for low priority
  },
  type: {
    // Critical issues (highest weight)
    BUG: 0.45,         // 45% - Critical issues affecting functionality
    SECURITY: 0.45,    // 45% - Security vulnerabilities
    
    // Core development (high weight)
    FEATURE: 0.40,     // 40% - New features
    PERFORMANCE: 0.35, // 35% - Performance improvements
    
    // Important improvements (medium-high weight)
    UX: 0.30,         // 30% - User experience improvements
    ENHANCEMENT: 0.30, // 30% - General enhancements
    
    // Infrastructure (medium weight)
    DEPLOYMENT: 0.25,  // 25% - Deployment related
    CI_CD: 0.25,      // 25% - CI/CD pipeline
    TESTING: 0.25,    // 25% - Testing improvements
    
    // Code quality (medium-low weight)
    REFACTOR: 0.20,   // 20% - Code refactoring
    
    // Support and maintenance (lower weight)
    SUPPORT: 0.15,    // 15% - User support issues
    QUESTION: 0.15,   // 15% - Questions and clarifications
    DOCUMENTATION: 0.15, // 15% - Documentation updates
    
    // Routine tasks (lowest weight)
    TASK: 0.10,       // 10% - General tasks
    CHORE: 0.10,      // 10% - Routine chores
    
    // Default
    UNCATEGORIZED: 0.05 // 5% - Uncategorized issues
  },
  points: 0.3         // 30% weight for story points
};

// Normalize story points to a 0-1 scale
const normalizePoints = (points: number): number => {
  const MAX_POINTS = 13; // Maximum story points (adjust as needed)
  return Math.min(points / MAX_POINTS, 1);
};

// Calculate weighted score  for a single issue
const calculateWeightedScore = (issue: Issue): number => {
  // Priority score (0-1 scale)
  const priorityScore = WEIGHTS.priority[issue.priority] || 0;
  
  // Type score (0-1 scale)
  const typeScore = WEIGHTS.type[issue.type] || WEIGHTS.type.UNCATEGORIZED;
  
  // Story points score (normalized to 0-1 scale)
  const pointsScore = normalizePoints(issue.estimatedPoints);

  // Damping factor (similar to Google's PageRank)
  const dampingFactor = 0.85;

  // Calculate final score using Google's weighted formula
  // Score = (1-d) + d(w1*s1 + w2*s2 + w3*s3)
  const score = (1 - dampingFactor) + dampingFactor * (
    (priorityScore * 0.4) +  // Priority contributes 40%
    (typeScore * 0.4) +      // Type contributes 40%
    (pointsScore * 0.2)      // Points contribute 20%
  );

  return score;
};

// Sort issues using Google's weighted sort
const googleWeightedSort = (issues: Issue[]): Issue[] => {
  // Calculate scores for all issues
  const scoredIssues = issues.map(issue => ({
    issue,
    score: calculateWeightedScore(issue)
  }));

  // Sort by score in descending order
  scoredIssues.sort((a, b) => b.score - a.score);

  // Return sorted issues
  return scoredIssues.map(item => item.issue);
};

interface WorkspaceMember {
  id: number;  // This is the userWorkspaceId
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const Boards: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectName, setProjectName] = useState<string>("");
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("boards");
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [isAddIssueModalOpen, setIsAddIssueModalOpen] =
    useState<boolean>(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [showMemberFilter, setShowMemberFilter] = useState<boolean>(false);

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
    const fetchWorkspaceMembers = async () => {
      try {
        const response = await axios.get(
          `${backendBaseUrl}/teaco/api/v1/user-workspace/active-workspace-members`,
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );
        setWorkspaceMembers(response.data.data);
      } catch (error) {
        console.error("Error fetching workspace members:", error);
        toast.error("Failed to load workspace members.");
      }
    };

    fetchWorkspaceMembers();
  }, [accessToken, workspaceSecret]);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await axios.get(
          `${backendBaseUrl}/teaco/api/v1/project/${projectId}/columns`,
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );

        const fetchedColumns = response.data.data || [];

        const sprintResponse = await axios.get(
          `${backendBaseUrl}/teaco/api/v1/project/${projectId}/sprints/active`,
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );
        const activeSprintData = sprintResponse.data.data;
        const daysLeft = activeSprintData
          ? differenceInDays(
              activeSprintData.dueDate,
              activeSprintData.startDate
            )
          : null;
        setDaysLeft(daysLeft!);

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
        const issues = activeSprintData?.issues || [];
        const updatedColumns = fetchedColumns.map((column: Column) => ({
          ...column,
          issues: googleWeightedSort(
            issues.filter((issue: Issue) => issue.columnId === Number(column.id))
          ),
        }));

        setColumns(updatedColumns);
        setActiveSprint(activeSprintData);
        setProjectName(projectData.name);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load board data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [projectId, accessToken, workspaceSecret]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId.toString() &&
      source.index === destination.index
    )
      return;

    try {
      await axios.put(
        `${backendBaseUrl}/teaco/api/v1/project/${projectId}/issues/${draggableId}`,
        { columnId: destination.droppableId },
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );

      const newColumns = [...columns];
      const sourceColumn = newColumns.find(
        (col) => col.id === source.droppableId
      );
      const destColumn = newColumns.find(
        (col) => col.id === destination.droppableId
      );
      const [movedIssue] = sourceColumn!.issues!.splice(source.index, 1);
      movedIssue.columnId = Number(destination.droppableId);
      
      // Add issue to destination column and apply Google's weighted sort
      destColumn!.issues!.push(movedIssue);
      destColumn!.issues = googleWeightedSort(destColumn!.issues!);

      setColumns(newColumns);
      toast.success("Issue moved successfully!");
    } catch (error) {
      console.error("Error moving issue:", error);
      toast.error("Failed to move issue.");
    }
  };

  const handleEndSprint = async () => {
    try {
      await axios.put(
        `${backendBaseUrl}/teaco/api/v1/project/${projectId}/sprints/${activeSprint.id}/end`,
        {},
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );
      toast.success("Sprint ended successfully!");
      navigate(`/projects/${projectId}/backlogs`);
    } catch (error: any) {
      console.error("Error ending sprint:", error.response?.data?.message);
      toast.error(error.response?.data?.message);
    }
  };

  const handleAddIssue = () => {
    setIsAddIssueModalOpen(true);
  };

  const handleCloseAddIssueModal = () => {
    setIsAddIssueModalOpen(false);
  };

  const BoardColumn: React.FC<{ column: Column }> = ({ column }) => (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="w-[400px] h-[60vh] bg-gray-50 rounded-sm p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">{column.label}</h3>
          </div>
          <div className="flex flex-col space-y-6 overflow-y-auto">
            {column.issues && column.issues.length > 0
              ? column.issues.map((issue, index) => (
                  <Draggable
                    key={issue.id}
                    draggableId={`${issue.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-2 bg-white shadow rounded hover:bg-gray-200"
                        onClick={() => {
                          setSelectedIssue(issue);
                          setIsIssueModalOpen(true);
                        }}
                      >
                        <span>
                          <h3 className="text-lg font-medium mb-4 text-white flex items-center">
                            <CheckIcon className="w-23 h-5 border border-gray-300 rounded-lg mr-2 text-white bg-blue-500" />
                            <span className="text-gray-500 font-semibold">
                              SCRUM-{issue.issueCount}
                            </span>
                          </h3>
                        </span>
                        <h4 className="text-lg font-medium">{issue.title}</h4>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-normal text-white ${
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
                        >
                          {issue.type.toLocaleLowerCase()}
                        </span>
                        <span
                          className={`inline-block rounded-full mx-2 px-2 py-1 text-xs font-normal text-white ${
                            issue.priority === PriorityEnum.HIGH
                              ? "bg-red-800"
                              : issue.priority === PriorityEnum.LOW
                              ? "bg-blue-800"
                              : "bg-orange-800"
                          }`}
                        >
                          {issue.priority.toLocaleLowerCase()}
                        </span>

                        <span
                          className={`inline-block rounded-full mx-2 px-2 py-1 text-xs font-normal text-black bg-gray-200`}
                        >
                          {issue.estimatedPoints}
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))
              : null}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-gray-500">Loading board...</p>
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
                <h1 className="text-4xl font-semibold mb-10">
                  {activeSprint
                    ? `SCRUM Sprint-${activeSprint.sprintCount}`
                    : "SCRUM board"}
                </h1>
                <div className="mb-6 flex justify-between">
                  <div className="flex space-x-1 mb-4">
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        activeTab === "boards"
                          ? "bg-[#0D00A8] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveTab("boards")}
                    >
                      Boards
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        activeTab === "backlogs"
                          ? "bg-[#0D00A8] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={() =>
                        navigate(`/projects/${projectId}/backlogs`)
                      }
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

                  {activeSprint && (
                    <div className="flex items-center space-x-4">
                      <span
                        className={`text-gray-600 font-medium ${
                          isTooltipVisible ? "cursor-pointer" : ""
                        }`}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        data-tooltip-id="sprint-tooltip"
                      >
                        {daysLeft === 0 || daysLeft === 1
                          ? `${daysLeft} day left`
                          : `${daysLeft} days left`}
                      </span>
                      <Tooltip id="sprint-tooltip" className="bg-white">
                        <div>
                          <p>
                            Start Date:{" "}
                            {new Date(
                              activeSprint.startDate
                            ).toLocaleDateString()}
                          </p>
                          <p>
                            Due Date:{" "}
                            {new Date(
                              activeSprint.dueDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </Tooltip>
                      <div className="flex gap-4">
                        <button
                          onClick={handleAddIssue}
                          className="bg-[#0D00A8] text-white px-6 py-3 rounded-lg text-lg"
                        >
                          Add Issue +
                        </button>
                        <button
                          onClick={handleEndSprint}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg text-lg"
                        >
                          End Sprint
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 flex space-x-4 overflow-x-auto">
                  {activeSprint === null ? (
                    <div className="w-72 h-[calc(70vh-300px)] bg-gray-50 rounded-lg p-4 flex flex-col justify-center items-center">
                      <h3 className="text-gray-600 text-center mb-4">
                        Get started in the backlog
                      </h3>
                      <button
                        className="bg-[#0D00A8] text-white px-4 py-2 rounded-lg"
                        onClick={() =>
                          navigate(`/projects/${projectId}/backlogs`)
                        }
                      >
                        Go to Backlog
                      </button>
                    </div>
                  ) : (
                    columns.map((column) => (
                      <BoardColumn key={column.id} column={column} />
                    ))
                  )}
                </div>
              </DragDropContext>
            </div>
          )}
        </main>
      </div>

      {activeSprint && (
        <AddIssueModal
          isOpen={isAddIssueModalOpen}
          onClose={handleCloseAddIssueModal}
          projectId={projectId!}
          activeSprint={activeSprint!}
          workspaceMembers={workspaceMembers}
        />
      )}

      {selectedIssue && (
        <IssueModal
          isOpen={isIssueModalOpen}
          onClose={() => {
            setIsIssueModalOpen(false);
            setSelectedIssue(null);
          }}
          issue={selectedIssue}
          projectId={projectId!}
          workspaceMembers={workspaceMembers}
          onIssueUpdate={() => {
            // Optional: You might want to refresh the board data after an issue update
            // You can call your fetchBoardData function here
          }}
        />
      )}

      <Toaster />
    </div>
  );
};

export default Boards;
