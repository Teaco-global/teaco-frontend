import React from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";

// Mock data for projects
const projects = [
  {
    name: "Go to market sample",
    key: "GTMS",
    type: "Team-managed business",
    lead: "Rajesh Adhikari",
    leadInitials: "RA",
    leadColor: "bg-blue-500",
  },
  {
    name: "PM Personal",
    key: "PP",
    type: "Team-managed business",
    lead: "Bina Maharjan",
    leadInitials: "BM",
    leadColor: "bg-green-500",
  },
  {
    name: "Scrum",
    key: "SCRUM",
    type: "Team-managed software",
    lead: "Pratik Karki",
    leadInitials: "PK",
    leadColor: "bg-purple-500",
  },
];

const Projects: React.FC = () => {
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
          <h1 className="text-xl font-normal mb-6">Projects</h1>
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Key</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Lead</th>
                <th className="py-3 px-4 font-semibold text-sm">More Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr
                  key={index}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-4 flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${project.leadColor} mr-3`}
                    >
                      {project.name.charAt(0)}
                    </div>
                    {project.name}
                  </td>
                  <td className="py-3 px-4">{project.key}</td>
                  <td className="py-3 px-4">{project.type}</td>
                  <td className="py-3 px-4 flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${project.leadColor} mr-2`}
                    >
                      {project.leadInitials}
                    </div>
                    {project.lead}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-blue-500 hover:underline">
                      More actions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default Projects;
