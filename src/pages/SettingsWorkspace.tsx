import React, { useState } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import { PencilIcon } from "@heroicons/react/24/outline";

const SettingsWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Workspace");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(
    localStorage.getItem("workspaceData") || "{}"
  );

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";

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
                    onClick={() => navigate(`/settings/profile`)}
                  >
                    Profile
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "Workspace"
                        ? "bg-[#0D00A8] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("Workspace")}
                  >
                    Workspace
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "Teams"
                        ? "bg-[#0D00A8] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => navigate(`/settings/teams`)}
                  >
                    Teams
                  </button>
                </div>
              </div>
            </div>
            <div className="h-full flex flex-col space-y-6">
              {/* Profile picture section */}
              <div className="bg-white shadow-inner rounded-lg p-6">
                <div className="flex items-center space-x-6">
                  <div>
                    <img
                      src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <button className="px-4 py-2 shadow-md bg-white text-black rounded-md">
                      Upload
                    </button>
                    <button className="ml-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Details Section */}
              <div className="bg-white shadow-inner rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold flex justify-between items-center">
                  Workspace Information
                  <PencilIcon
                    className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setIsEditing(!isEditing)}
                  />
                </h2>
                <div className="grid grid-cols-1 md:grid-rows gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      placeholder={workspaceData.label}
                      readOnly={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md bg-white ${
                        isEditing ? "border-gray-300" : "bg-gray-100"
                      }`}
                    />
                  </div>
                </div>
                {/* Conditional rendering of the save button */}
                {isEditing && (
                  <button className="mt-4 px-4 py-2 bg-[#0D00A8] text-white rounded-md">
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsWorkspace;
