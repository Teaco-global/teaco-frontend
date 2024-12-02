import React from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";

const Settings: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(localStorage.getItem("workspaceData") || "{}");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";
  const settingsMenuItems = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤' // You can replace with an actual icon component
    },
    { 
      id: 'workspace', 
      label: 'Workspace', 
      icon: '🏢' // You can replace with an actual icon component
    },
    { 
      id: 'teams', 
      label: 'Teams', 
      icon: '👥' // You can replace with an actual icon component
    }
  ];
  

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Here i want settings menu in sidebar with profile, workspace and teams options */}
        </main>
      </div>
    </div>
  );
};

export default Settings;