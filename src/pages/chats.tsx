import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

<div>
  <Toaster />
</div>;
interface User {
  id: number;
  name: string;
  email: string;
}
interface WorkspaceMember {
  id: number;
  user: User;
  userWorkspaceRoles: Array<{ role: { label: string } }>;
}

const Chats: React.FC = () => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<WorkspaceMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(
    localStorage.getItem("workspaceData") || "{}"
  );
  const accessToken = localStorage.getItem("accessToken");
  const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";

  useEffect(() => {
    fetchActiveMembers();
  }, [page]);
  const fetchActiveMembers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/teaco/api/v1/user-workspace/active-workspace-members`,
        {
          params: {
            offset: (page - 1) * pageSize,
            limit: pageSize,
            sort: "ASC",
          },
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );
      const membersData = response.data.data;
      const filteredMembersData = membersData.filter(
        (member: WorkspaceMember) => member.user.id !== userData.id
      );
      setMembers(filteredMembersData);
      setFilteredMembers(filteredMembersData);
    } catch (error) {
      toast.error("Error fetching workspace members");
      console.error("Error fetching workspace members:", error);
    }
  };

  // Search members
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = members.filter(
      (member) =>
        member.user.name.toLowerCase().includes(term) ||
        member.user.email.toLowerCase().includes(term)
    );

    setFilteredMembers(filtered);
  };

  // Select member for chat
  const handleMemberSelect = (member: WorkspaceMember) => {
    setSelectedMember(member);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="w-1/6 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search members..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="divide-y">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className={`p-2 cursor-pointer rounded-lg hover:bg-gray-100 flex items-center ${
                  selectedMember?.id === member.id ? "bg-blue-100" : ""
                }`}
                onClick={() => handleMemberSelect(member)}
              >
                <div className="flex items-center">
                  <div>
                    <img
                      src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
                      alt="Profile"
                      className="w-8 h-8 rounded-xl object-cover mr-2"
                    />
                  </div>
                  <div className="font-normal">{member.user.name}</div>
                  {/* <div className="text-sm text-gray-500">{member.user.email}</div> */}
                </div>
                {/* {member.userWorkspaceRoles[0]?.role?.label && (
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {member.userWorkspaceRoles[0].role.label}
                  </span>
                )} */}
              </div>
            ))}
          </div>
        </div>

        <main className="flex-1 flex flex-col">
          {selectedMember ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-white border-b p-4 flex items-center">
                <div>
                  <img
                    src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
                    alt="Profile"
                    className="w-10 h-10 rounded-2xl object-cover mr-2"
                  />
                </div>
                <h2 className="text-xl font-bold">
                  {selectedMember.user.name}
                </h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="text-center text-gray-500">
                  No messages yet. Start a conversation!
                </div>
              </div>
              <div className="border-t p-4 bg-white">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-black">
                  <p>Select a member to start a chat</p>
            </div>
          )}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Chats;
