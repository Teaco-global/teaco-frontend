import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/outline";

interface WorkspaceMember {
  id: number;
  user: {
    name: string;
    email: string;
  };
  status: string;
  userWorkspaceRoles: {
    role: {
      label: string;
    }
  }[];
}

const SettingsTeams: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Teams");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(
    localStorage.getItem("workspaceData") || "{}"
  );
  const accessToken = localStorage.getItem("accessToken");
  const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";

  useEffect(() => {
    fetchWorkspaceMembers();
  }, [page]);

  const fetchWorkspaceMembers = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/teaco/api/v1/user-workspace/workspace-members`, {
        params: {
          offset: (page - 1) * pageSize,
          limit: pageSize,
          sort: 'ASC'
        },
        headers: {
          Authorization: `${accessToken}`,
          "x-workspace-secret-id": `${workspaceSecret}`,
        },
      });

      setMembers(response.data.data);
      setTotalCount(response.data.count);
    } catch (error) {
      console.error("Error fetching workspace members:", error);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="h-full flex flex-col">
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-lg mb-10">
                <span className="text-gray-500">Settings</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900">{activeTab}</span>
              </nav>
              <div className="mb-6 flex justify-between">
                <div className="flex space-x-1 mb-4">
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "Profile"
                        ? "bg-[#0D00A8] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => navigate("/settings/profile")}
                  >
                    Profile
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "Workspace"
                        ? "bg-[#0D00A8] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => navigate("/settings/workspace")}
                  >
                    Workspace
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "Teams"
                        ? "bg-[#0D00A8] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("Teams")}
                  >
                    Teams
                  </button>
                </div>
              </div>
              <div className="text-lg font-semibold py-4">
                Workspace Members ({totalCount})
              </div>

              {/* Members Table */}
              <div className="bg-white ">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-black">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-black">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-black">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-black">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-3 whitespace-nowrap">{member.user.name}</td>
                        <td className="px-6 py-3 whitespace-nowrap">{member.user.email}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          {member.userWorkspaceRoles[0]?.role?.label || 'N/A'}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">{member.status}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <button className="text-red-700 hover:text-red-900">
                            {/* Delete */}
                          <TrashIcon className="w-23 h-5 ml-10"/>  
                          </button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-3 flex items-center justify-center">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsTeams;