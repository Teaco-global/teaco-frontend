import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import { backendBaseUrl } from "../config";
import { appPrimaryColor } from "../constants"

interface User {
  id: number;
  name: string;
  userWorkspaceId: string;
}
interface ChannelUserWorkspace {
  id: number;
  room: Channel;
}

interface Channel {
  id: number;
  label: string;
  isPublic: boolean;
  memberCount?: number;
}

// Basic Button Component
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      className={`px-4 py-2 bg-[${appPrimaryColor}] text-white rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <input 
      className={`border rounded px-3 py-2 w-full ${className}`}
      {...props}
    />
  );
};

const Checkbox: React.FC<{
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => {
  return (
    <label className="inline-flex items-center">
      <input
        type="checkbox"
        className="form-checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && <span className="ml-2">{label}</span>}
    </label>
  );
};

// Basic Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        {children}
        <div className="mt-4 flex justify-end space-x-2">
          <Button onClick={onClose} className="bg-gray-300 text-black">Cancel</Button>
        </div>
      </div>
    </div>
  );
};

const Channels: React.FC = () => {
  // State variables
  const [channelUserWorkspaces, setChannelUserWorkspace] = useState<ChannelUserWorkspace[]>([]);
  const [acitceMembers, setActiveMembers] = useState<User[]>([]);
  const [acitveFilteredMembers, setActiveFilteredMembers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChannelUserWorkspaces, setFilteredChannelUserWorkspaces] = useState<ChannelUserWorkspace[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [channelName, setChannelName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // User and workspace data from local storage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(localStorage.getItem("workspaceData") || "{}");
  const accessToken = localStorage.getItem("accessToken");
  const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";

  // Fetch workspace users and channels on component mount
  useEffect(() => {
    fetchWorkspaceUsers();
    fetchChannels();
  }, []);

  // Fetch workspace users
  const fetchWorkspaceUsers = async () => {
    try {
      const response = await axios.get(
        `${backendBaseUrl}/teaco/api/v1/user-workspace/active-workspace-members`,
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );

      const membersData = response.data.data
      const filteredMembersData = membersData.filter(
        (member: any) => member.user.id !== userData.id
      );

      setActiveMembers(membersData);
      setActiveFilteredMembers(filteredMembersData);
    } catch (error) {
      toast.error("Error fetching workspace users");
      console.error("Error fetching workspace users:", error);
    }
  };

  // Fetch channels
  const fetchChannels = async () => {
    try {
      const response = await axios.get(
        `${backendBaseUrl}/teaco/api/v1/chat/assigned-channels`,
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );
      setChannelUserWorkspace(response.data.data);
      setFilteredChannelUserWorkspaces(response.data.data);
    } catch (error) {
      toast.error("Error fetching channels");
      console.error("Error fetching channels:", error);
    }
  };

  // Create a new channel
  const createChannel = async () => {
    try {
      // Validate channel name
      if (!channelName.trim()) {
        toast.error("Channel name cannot be empty");
        return;
      }

      // Prepare payload
      const payload = {
        label: channelName,
        isPublic,
        members: selectedUsers,
      };
      const response = await axios.post(
        `${backendBaseUrl}/teaco/api/v1/chat/create-channel`,
        payload,
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );
      toast.success(response.data.message)
      setChannelName("");
      setSelectedUsers([]);
      setIsPublic(true);
      setIsModalOpen(false);
      fetchChannels();
    } catch (error) {
      toast.error("Error creating channel");
      console.error("Error creating channel:", error);
    }
  };

  // Handle channel search
  const handleChannelSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = channelUserWorkspaces.filter((channelUserWorkspace) =>
      channelUserWorkspace.room.label.toLowerCase().includes(term)
    );

    setFilteredChannelUserWorkspaces(filtered);
  };

  // Toggle user selection for channel creation
  const toggleUserSelection = (userWorkspaceId: string) => {
    setSelectedUsers((prev) => 
      prev.includes(userWorkspaceId)
        ? prev.filter((id) => id !== userWorkspaceId)
        : [...prev, userWorkspaceId]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Left Sidebar - Channel List */}
        <div className="w-1/6 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b flex items-center">
            <div className="relative flex-1 mr-2">
              <Input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={handleChannelSearch}
                className="w-full pl-8"
              />
            </div>
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="ml-2"
            >
              +
            </Button>
          </div>
          
          {/* Channel List */}
          <div className="divide-y">
            {filteredChannelUserWorkspaces.map((filteredChannelsUserWorkspace) => (
              <div
                key={filteredChannelsUserWorkspace.room.id}
                className="p-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                    #
                  </div>
                  <div>
                    <div className="font-semibold">{filteredChannelsUserWorkspace.room.label}</div>
                    <div className="text-xs text-gray-500">
                    {/* {filteredChannelsUserWorkspace.room.isPublic ? 'Public' : 'Private'} · {filteredChannelsUserWorkspace.room.memberCount} members */}
                      {filteredChannelsUserWorkspace.room.isPublic ? 'Public' : 'Private'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col justify-center items-center bg-gray-50">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Select a Channel
          </h1>
          <p className="text-lg text-gray-600 text-center">
            Choose a channel from the list to start collaborating
          </p>
        </main>
      </div>
      
      {/* Create Channel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Channel"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Channel Name</label>
            <Input
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Enter channel name"
            />
          </div>
          
          <div>
            <Checkbox
              label="Public Channel"
              checked={isPublic}
              onChange={setIsPublic}
            />
          </div>
          
          <div>
            <label className="block mb-2">Select Channel Members</label>
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {acitveFilteredMembers.map((acitveFilteredMember:any) => (
                <div 
                  key={acitveFilteredMember.user.id} 
                  className="flex items-center space-x-2 mb-2"
                >
                  <Checkbox
                    label={acitveFilteredMember.user.name}
                    checked={selectedUsers.includes(acitveFilteredMember.id)}
                    onChange={() => toggleUserSelection(acitveFilteredMember.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={createChannel}
            disabled={!channelName.trim()}
            className="w-full"
          >
            Create Channel
          </Button>
        </div>
      </Modal>
      
      <Toaster />
    </div>
  );
};

export default Channels;