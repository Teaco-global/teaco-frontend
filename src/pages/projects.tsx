import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import axios from "axios";
import { backendBaseUrl } from "../config";
import CreateProjectModal from "../components/CreateProjectModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(localStorage.getItem("workspaceData") || "{}");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${backendBaseUrl}/teaco/api/v1/project`, {
          headers: {
            Authorization: `${accessToken}`,
          },
        });
        setProjects(response.data.data || []);
        setFilteredProjects(response.data.data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [accessToken]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredProjects(
        projects.filter((project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const handleCreateProject = async (data: any) => {
    try {
      const response = await axios.post(`${backendBaseUrl}/teaco/api/v1/project/create`, data, {
        headers: {
          Authorization: `${accessToken}`,
        },
      });
      toast.success('Project created successfully')
      setProjects((prev) => [...prev, response.data.data]);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Error creating project.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const deletProjectResponse = await axios.delete(`${backendBaseUrl}/teaco/api/v1/project/${id}`, {
        headers: {
          Authorization: `${accessToken}`,
        },
      });
      toast.success(deletProjectResponse.data.message);
      setProjects((prev) => prev.filter((project) => project.id !== id));
      setFilteredProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error deleting project.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ThreeDotsMenu: React.FC<{ projectId: string }> = ({ projectId }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          &#x22EE;
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg">
            <button
              onClick={() => handleDeleteProject(projectId)}
              className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
        {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                You don’t have any projects yet.
              </h2>
              <p className="text-2xl text-gray-500 mb-4">
                Kickstart by creating your first project
              </p>
              <button
                className="bg-[#0D00A8] text-white px-4 py-2 rounded"
                onClick={() => setShowModal(true)}
              >
                Create Project +
              </button>
              {showModal && (
                <CreateProjectModal
                  onClose={() => setShowModal(false)}
                  onSubmit={handleCreateProject}
                />
              )}
            </div>
          ) : (
            <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-normal">Projects</h1>
            
            <button
              className="bg-[#0D00A8] text-white px-4 py-2 rounded"
              onClick={() => setShowModal(true)}
            >
              Create Project +
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full px-4 py-2 border rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-[##e7e5ff]">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Created At</th>
                <th className="py-3 px-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <tr
                    key={project.id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 text-[#0D00A8]">{project.name}</td>
                    <td className="py-3 px-4">{project.description || "N/A"}</td>
                    <td className="py-3 px-4">{project.status}</td>
                    <td className="py-3 px-4">{formatDate(project.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <ThreeDotsMenu projectId={project.id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-3 px-4 text-gray-500"
                  >
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </>
          )}
        </main>
      </div>
      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onSubmit={handleCreateProject} />}
      <ToastContainer />
    </div>
  );
};

export default Projects;