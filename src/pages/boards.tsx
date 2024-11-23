import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import axios from "axios";
import { useParams } from "react-router-dom";
import { backendBaseUrl } from "../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MoreHorizontal, Plus, X } from 'lucide-react';

interface Column {
  id: string;
  label: string;
}

const Boards: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectName, setProjectName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("boards");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(localStorage.getItem("workspaceData") || "{}");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";
  const accessToken = localStorage.getItem("accessToken");
  const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await axios.get(
          `${backendBaseUrl}/teaco/api/v1/columns/${projectId}`,
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );

        setColumns(response.data.data || []);
        
        const projectResponse = await axios.get(
          `${backendBaseUrl}/teaco/api/v1/project/${projectId}`,
          {
            headers: {
              Authorization: `${accessToken}`,
              "x-workspace-secret-id": `${workspaceSecret}`,
            },
          }
        );
        setProjectName(projectResponse.data.data.name);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load board data.");
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [projectId, accessToken, workspaceSecret]);

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) {
      toast.error("Column name cannot be empty");
      return;
    }

    try {
      const response = await axios.post(
        `${backendBaseUrl}/teaco/api/v1/columns/${projectId}`,
        {
          label: newColumnName,
        },
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );

      setColumns([...columns, response.data.data]);
      setNewColumnName("");
      setIsModalOpen(false);
      toast.success("Column created successfully!");
    } catch (error) {
      console.error("Error creating column:", error);
      toast.error("Failed to create column.");
    }
  };

  const BoardColumn: React.FC<{ column: Column }> = ({ column }) => (
    <div className="w-72 h-[calc(70vh-300px)] bg-gray-50 rounded-lg p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="font-semibold text-gray-700">{column.label}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 hover:bg-gray-200 rounded">
            <MoreHorizontal size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {columns.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-2">Get started in the backlog</p>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
              Go to backlog
            </button>
          </div>
        )}
      </div>
    </div>
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
                  <span className="text-gray-600">Projects</span>
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
                    onClick={() => setActiveTab("timeline")}
                  >
                    Timeline
                  </button>
                </div>
              </div>

              <div className="flex-1 flex space-x-4 overflow-x-auto">
                {columns.map((column) => (
                  <BoardColumn key={column.id} column={column} />
                ))}
                <button 
                  className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg hover:bg-gray-100 shrink-0"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={24} className="text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-lg font-semibold mb-4">Add New Column</h2>
            
            <input
              type="text"
              placeholder="Enter column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateColumn}
                className="px-4 py-2 bg-[#0D00A8] text-white rounded-md hover:bg-[#0B0086]"
              >
                Create Column
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Boards;