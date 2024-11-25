import React, { useState, useEffect } from "react";
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
}

const Backlogs: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectName, setProjectName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("boards");

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
    const fetchColumns = async () => {
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
                    onClick={() => {
                      setActiveTab("boards");
                      navigate(`/projects/${projectId}/boards`);
                    }}
                  >
                    Boards
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "backlogs"
                        ? "bg-[#0D00A8] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setActiveTab("backlogs");
                      navigate(`/projects/${projectId}/backlogs`);
                    }}
                  >
                    Backlogs
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "timeline"
                        ? "bg-[#0D00A8] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setActiveTab("timeline");
                      navigate(`/projects/${projectId}/timeline`);
                    }}
                  >
                    Timeline
                  </button>
                </div>
              </div>

              <div className="flex-1 flex space-x-4 overflow-x-auto">
                Hello
              </div>
            </div>
          )}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Backlogs;
