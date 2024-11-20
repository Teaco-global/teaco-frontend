import React from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import rocketImage from "../assets/rocket.svg"

const Home: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(localStorage.getItem("workspaceData") || "{}");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <img
              src={rocketImage} // Replace with the correct path
              alt="Rocket Launch"
              className="mx-auto mb-6 w-1/2"
            />
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Good things come to those who wait
            </h1>
            <p className="text-lg text-gray-600">
              Stay tuned for something amazing
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
