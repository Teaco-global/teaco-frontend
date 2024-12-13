import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import rocketImage from "../assets/rocket.svg";

const Home: React.FC = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(localStorage.getItem("workspaceData") || "{}");

  const userName = userData.name || "Guest";
  const workspaceName = workspaceData.label || "";

  // State for real-time date and time
  const [dateTime, setDateTime] = useState(new Date());

  // Update the date and time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Determine the greeting based on the time of day
  const hours = dateTime.getHours();
  const getGreeting = () => {
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <img
              src={rocketImage}
              alt="Rocket Launch"
              className="mx-auto mb-8 w-1/2"
            />
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              {getGreeting()}, {userName}!
            </h1>
            <p className="text-2xl text-gray-600">
              {dateTime.toDateString()}{" "}
            </p>
            <p className="text-xl">
              {dateTime.toLocaleTimeString()}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
