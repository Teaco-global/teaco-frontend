import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Column {
  id: string;
  label: string;
  issues?: Issue[];
}

enum IssueTypeEnum {
  FEATURE = 'FEATURE',
  BUG = 'BUG',
  ENHANCEMENT = 'ENHANCEMENT',
  REFACTOR = 'REFACTOR',
  DOCUMENTATION = 'DOCUMENTATION',
  TASK = 'TASK',
  CHORE = 'CHORE',
  QUESTION = 'QUESTION',
  SUPPORT = 'SUPPORT',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  UX = 'UX',
  DEPLOYMENT = 'DEPLOYMENT',
  TESTING = 'TESTING',
  CI_CD = 'CI_CD',
  UNCATEGORIZED = 'UNCATEGORIZED'
}

interface Issue {
  id: number;
  title: string;
  description: string | null;
  columnId: number | null;
  type: IssueTypeEnum
}

const Boards: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectName, setProjectName] = useState<string>("");
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("boards");

  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(localStorage.getItem("workspaceData") || "{}");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";
  const accessToken = localStorage.getItem("accessToken");
  const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        // Fetch columns
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
        
        // Fetch active sprint and issues
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

        //Fetch project
        const projectResponse = await axios.get(
          `${backendBaseUrl}/teaco/api/v1/project/${projectId}/`,
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );
        const projectData = projectResponse.data.data

        // Group issues by columnId
        const issues = activeSprintData.issues || [];
        const updatedColumns = fetchedColumns.map((column: Column) => ({
          ...column,
          issues: issues.filter((issue: Issue) => issue.columnId === Number(column.id)),
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

    // If dropped outside a droppable or in the same position, do nothing
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId.toString() &&
      source.index === destination.index
    ) return;

    try {
      // Update issue's column on the backend
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

      // Update local state
      const newColumns = [...columns];
      const sourceColumn = newColumns.find(
        col => col.id === source.droppableId
      );
      const destColumn = newColumns.find(
        col => col.id === destination.droppableId
      );
      const [movedIssue] = sourceColumn!.issues!.splice(source.index, 1);
      movedIssue.columnId = Number(destination.droppableId);
      destColumn!.issues!.splice(destination.index, 0, movedIssue);

      setColumns(newColumns);
      toast.success("Issue moved successfully!");
    } catch (error) {
      console.error("Error moving issue:", error);
      toast.error("Failed to move issue.");
    }
  };

  const BoardColumn: React.FC<{ column: Column }> = ({ column }) => (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <div 
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="w-72 h-[calc(70vh-300px)] bg-gray-50 rounded-lg p-4 flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">{column.label}</h3>
          </div>
           <div className="flex flex-col space-y-2 overflow-y-auto">
            {column.issues && column.issues.length > 0 ? (
              column.issues.map((issue, index) => (
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
                      className="p-2 bg-white shadow rounded"
                    >
                      <h4 className="text-sm font-medium">{issue.title}</h4>
                      <p className="text-xs text-gray-500">{issue.type}</p>
                    </div>
                  )}
                </Draggable>
              ))
            ) : null}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );

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
                <nav className="flex items-center space-x-2 text-sm mb-2">
                  <a href="/projects/" className="text-gray-600 hover:underline">
                    Projects
                  </a>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900">{projectName}</span>
                </nav>
                <h1 className="text-xl font-semibold mb-4">SCRUM board</h1>
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
                    onClick={() => navigate(`/projects/${projectId}/backlogs`)}
                  >
                    Backlogs
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "timeline"
                        ? "bg-[#0D00A8] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => navigate(`/projects/${projectId}/timeline`)}
                  >
                    Timeline
                  </button>
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
                        onClick={() => navigate(`/projects/${projectId}/backlogs`)}
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

      <ToastContainer />
    </div>
  );
};

export default Boards;