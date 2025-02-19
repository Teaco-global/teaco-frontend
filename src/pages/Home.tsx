import React, { useEffect, useState } from "react";
import { Bell, Rocket, Folder, AlertCircle, Clock, Calendar } from 'lucide-react';
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import webinarRafiki from "../assets/Webinar-rafiki.svg"
import { motion } from "framer-motion";

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

    return () => clearInterval(interval);
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
        <main className="flex-1 p-6 bg-white space-y-6">
          {/* Date and Greeting Section */}
          <div className="text-center p-4">
            <h1 className="text-3xl font-bold text-gray-800">
              {getGreeting()}, {userName}!
            </h1>
            <p className="text-xl text-gray-600">
              <br />
              {dateTime.toLocaleDateString()} | {dateTime.toLocaleTimeString()}
            </p>
          </div>

          {/* Illustration Section */}
          <div className="flex flex-col items-center justify-center mt-10">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome to Your Workspace
              </h2>
              {/* <p className="text-gray-600 mb-6">
                Here's a friendly illustration to brighten up your day!
              </p> */}
              {/* Placeholder for Illustration */}
              <div className="bg-white p-20 rounded-lg flex justify-center">
                <motion.img
                  src={webinarRafiki}
                  alt="Webinar Illustration"
                  className="w-[512px] h-auto max-w-full"
                  animate={{
                    y: [0, -10, 0], // Moves up and down
                  }}
                  transition={{
                    duration: 200, // Time for one cycle
                    repeat: Infinity, // Keeps looping
                    ease: "easeInOut", // Smooth movement
                  }}
                />
              </div>
            </div>
          </div>

          {/* Commented Out Sections */}
          {/*
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6 flex items-center">
              <Folder className="mr-4 text-purple-500 w-12 h-12" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">12</h3>
                <p className="text-gray-600">Assigned Projects</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 flex items-center">
              <AlertCircle className="mr-4 text-red-500 w-12 h-12" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">24</h3>
                <p className="text-gray-600">Open Issues</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 flex items-center">
              <AlertCircle className="mr-4 text-blue-500 w-12 h-12" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">8</h3>
                <p className="text-gray-600">Issues Closed</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white shadow rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Rocket className="mr-2 text-green-500" />
                <h2 className="text-xl font-semibold">Recent Project</h2>
              </div>
              <div className="space-y-4">
                {recentProjects.map(project => (
                  <div key={project.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{project.name}</h3>
                      <span className="text-sm text-gray-500">{project.status}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{width: `${project.progress}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Bell className="mr-2 text-blue-500" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <div className="space-y-2">
                {notifications.map(notification => (
                  <div key={notification.id} className="flex justify-between border-b pb-2 last:border-b-0">
                    <span className="text-gray-700">{notification.message}</span>
                    <span className="text-gray-500 text-sm">{notification.time}</span>
                  </div>
                ))}
              </div>
            </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Calendar className="mr-2 text-orange-500" />
                <h2 className="text-xl font-semibold">Upcoming Deadlines</h2>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map(deadline => (
                  <div 
                    key={deadline.id} 
                    className="flex justify-between items-center border-b pb-3 last:border-b-0"
                  >
                    <div>
                      <h3 className="font-medium">{deadline.project}</h3>
                      <p className="text-sm text-gray-500">Deadline: {deadline.deadline}</p>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 text-gray-500" size={18} />
                      <span 
                        className={`text-sm font-bold 
                          ${deadline.daysLeft <= 7 ? 'text-red-500' : 
                            deadline.daysLeft <= 14 ? 'text-orange-500' : 'text-green-500'}`
                        }
                      >
                        {deadline.daysLeft} days left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          */}
        </main>
      </div>
    </div>
  );
};

export default Home;