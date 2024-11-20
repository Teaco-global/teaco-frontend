import React from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";

const Wikis: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(localStorage.getItem("workspaceData") || "{}");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-4xl font-bold mb-6 text-center">
            Welcome to {workspaceName}
          </h1>
          <p className="text-lg text-gray-700 text-center">
            This is the wikis page.
          </p>
        </main>
      </div>
    </div>
  );
};

export default Wikis;