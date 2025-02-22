// import React, { useState, useEffect } from "react";
// import TopBar from "../components/TopBar";
// import Sidebar from "../components/SideBar";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { backendBaseUrl } from "../config";
// import { PencilIcon } from "@heroicons/react/24/outline";

// // Type definitions
// interface User {
//   id: number;
//   email: string;
//   name: string;
// }

// interface Workspace {
//   id: number;
//   label: string;
// }

// interface AuthMeResponse {
//   data: {
//     user: User;
//     workspace: Workspace;
//   };
// }

// const SettingsProfile: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<string>("Profile");
//   const [userData, setUserData] = useState<User | null>(null);
//   const [workspaceData, setWorkspaceData] = useState<Workspace | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const navigate = useNavigate();

//   // API call to fetch user details
//   const fetchAuthMe = async (token: string): Promise<AuthMeResponse> => {
//     try {
//       const response = await axios.get(
//         `${backendBaseUrl}/teaco/api/v1/auth/me`,
//         {
//           headers: {
//             Authorization: `${token}`,
//           },
//         }
//       );
//       return response.data;
//     } catch (error: any) {
//       throw new Error("Failed to fetch user data");
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");

//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const getUserData = async () => {
//       try {
//         setLoading(true);
//         const response = await fetchAuthMe(token);
//         setUserData(response.data.user);
//         setWorkspaceData(response.data.workspace);
//       } catch (err: any) {
//         setError(err.message);
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getUserData();
//   }, [navigate]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-500">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-white">
//       <TopBar
//         workspaceName={workspaceData?.label || ""}
//         userName={userData?.name || ""}
//       />
//       <div className="flex flex-1">
//         <Sidebar />
//         <main className="flex-1 p-6">
//           <div className="h-full flex flex-col">
//             <div className="mb-6">
//               <nav className="flex items-center space-x-2 text-lg mb-10">
//                 <span className="text-gray-600 font-normal">Members</span>
//                 {/* <span className="text-gray-400">/</span>
//                 <span className="text-gray-900">{activeTab}</span> */}
//               </nav>
//               <div className="mb-6 flex justify-between">
//                 <div className="flex space-x-1 mb-4">
//                   <button
//                     className={`px-4 py-2 rounded-lg ${
//                       activeTab === "Profile"
//                         ? "bg-[#0D00A8] text-white"
//                         : "text-gray-500 hover:bg-gray-100"
//                     }`}
//                     onClick={() => setActiveTab("Profile")}
//                   >
//                     Profile
//                   </button>
//                   <button
//                     className={`px-4 py-2 rounded-lg ${
//                       activeTab === "workspace"
//                         ? "bg-[#0D00A8] text-white"
//                         : "text-gray-500 hover:bg-gray-100"
//                     }`}
//                     onClick={() => navigate(`/settings/workspace`)}
//                   >
//                     Workspace
//                   </button>
//                   <button
//                     className={`px-4 py-2 rounded-lg ${
//                       activeTab === "teams"
//                         ? "bg-[#0D00A8] text-white"
//                         : "text-gray-500 hover:bg-gray-100"
//                     }`}
//                     onClick={() => navigate(`/settings/teams`)}
//                   >
//                     Teams
//                   </button>
//                 </div>
//               </div>
//               <div className="h-full flex flex-col space-y-6">
                
//                 {/* Profile Details Section */}
//                 <div className="bg-white shadow-inner rounded-lg p-6 space-y-4">
//                   <h2 className="text-xl font-semibold flex justify-between items-center">
//                     Profile Information
//                     <PencilIcon
//                       className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700"
//                       onClick={() => setIsEditing(!isEditing)}
//                     />
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-rows gap-4">
//                     <div>
//                       <label className="block text-gray-700 font-medium mb-2">
//                         Profile Image
//                       </label>
//                       <div className="flex items-center space-x-6">
//                         <div>
//                           <img
//                             src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
//                             alt="Profile"
//                             className="w-24 h-24 rounded-full object-cover"
//                           />
//                         </div>
//                         <div>
//                           <button className="px-4 py-2 shadow-md bg-white text-black rounded-md">
//                             Upload
//                           </button>
//                           <button className="ml-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 font-medium mb-2">
//                         Full Name
//                       </label>
//                       <input
//                         type="text"
//                         placeholder={userData?.name}
//                         readOnly={!isEditing}
//                         className={`w-full px-3 py-2 border rounded-md bg-white ${
//                           isEditing ? "border-gray-300" : "bg-gray-100"
//                         }`}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 font-medium mb-2">
//                         Email
//                       </label>
//                       <input
//                         type="text"
//                         placeholder={userData?.email}
//                         readOnly={!isEditing}
//                         className={`w-full px-3 py-2 border rounded-md bg-white ${
//                           isEditing ? "border-gray-300" : "bg-gray-100"
//                         }`}
//                       />
//                     </div>
//                   </div>
//                   {/* Conditional rendering of the save button */}
//                   {isEditing && (
//                     <button className="mt-4 px-4 py-2 bg-[#0D00A8] text-white rounded-md">
//                       Save Changes
//                     </button>
//                   )}
//                 </div>

//                 {/* Password Update Section */}
//                 <div className="bg-white shadow-inner rounded-lg p-6 space-y-4">
//                   <h2 className="text-xl font-semibold">Password</h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-gray-700 font-medium mb-2">
//                         Current Password
//                       </label>
//                       <input
//                         type="password"
//                         placeholder="Enter current password"
//                         className="w-full px-3 py-2 border rounded-md"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 font-medium mb-2">
//                         New Password
//                       </label>
//                       <input
//                         type="password"
//                         placeholder="Enter new password"
//                         className="w-full px-3 py-2 border rounded-md"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <button className="mt-4 px-4 py-2 bg-[#0D00A8] text-white rounded-md">
//                       Update password
//                     </button>
//                     <a href="" className="ml-4 text-[#0D00A8]">
//                       Forgot password?
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default SettingsProfile;
