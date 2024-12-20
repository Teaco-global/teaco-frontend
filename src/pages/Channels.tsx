import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { appPrimaryColor } from "../constants/index";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import { backendBaseUrl } from "../config";
import CreateChannelModal from "./modal/CreateChannelModal";
import UpdateChannelModal from "./modal/UpdateChannelModal";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";

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

interface UserWorkspace {
  id: number;
  user: User;
}

interface Message {
  id: number;
  body: string;
  senderId: number;
  createdAt: string;
  sender?: UserWorkspace;
}

const Channels: React.FC = () => {
  const [channelUserWorkspaces, setChannelUserWorkspace] = useState<
    ChannelUserWorkspace[]
  >([]);
  const [acitveMembers, setActiveMembers] = useState<User[]>([]);
  const [acitveFilteredMembers, setActiveFilteredMembers] = useState<User[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChannelUserWorkspaces, setFilteredChannelUserWorkspaces] =
    useState<ChannelUserWorkspace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [room, setCurrentRoom] = useState();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;
  const [messagesPage, setMessagesPage] = useState(1);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // User and workspace data
  const userWorkspaceData = JSON.parse(
    localStorage.getItem("userWorkspaceData") || "{}"
  );
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(
    localStorage.getItem("workspaceData") || "{}"
  );
  const accessToken = localStorage.getItem("accessToken");
  const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const newSocket = io(backendBaseUrl, {
      auth: {
        token: accessToken,
      },
      extraHeaders: {
        "x-workspace-secret-id": workspaceSecret || "",
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("new_channel_message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchWorkspaceUsers();
    fetchChannels();
  }, []);

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

      const membersData = response.data.data;
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

  const handleCreateChannel = async (
    channelName: string,
    isPublic: boolean,
    selectedUsers: string[]
  ) => {
    try {
      const payload = { label: channelName, isPublic, members: selectedUsers };
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
      toast.success(response.data.message);
      fetchChannels();
    } catch (error) {
      toast.error("Error creating channel");
    }
  };

  // Search channels
  const handleChannelSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = channelUserWorkspaces.filter((channelUserWorkspace) =>
      channelUserWorkspace.room.label.toLowerCase().includes(term)
    );

    setFilteredChannelUserWorkspaces(filtered);
  };

  // Handle channel selection
  const handleChannelSelect = async (
    channel: any,
    roomId: number,
    page = 1
  ) => {
    try {
      const response = await axios.get(
        `${backendBaseUrl}/teaco/api/v1/chat/get-messages`,
        {
          params: {
            roomId,
            offset: (page - 1) * pageSize,
            limit: 100000,
            sort: "ASC",
            order: "createdAt",
          },
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );

      console.log(response.data.data);
      setCurrentRoom(channel);
      setSelectedChannel(channel);
      const newMessages = response.data.data;
      setMessages(page === 1 ? newMessages : [...messages, ...newMessages]);
      setMessagesPage(page);
    } catch (error) {
      toast.error("Error fetching channel messages");
      console.error("Error fetching channel messages:", error);
    }
  };

  const sendMessage = async (room: any) => {
    try {
      if (socket && newMessage.trim()) {
        console.log(userWorkspaceData.id);
        socket.emit("send_message", {
          roomId: room.id,
          body: newMessage,
        });

        setNewMessage("");
      }
    } catch (error) {
      toast.error("Error sending message");
      console.error("Error sending message:", error);
    }
  };

  const handleUpdateChannel = async (
    channelName: string,
    isPublic: boolean,
    selectedUsers: string[]
  ) => {
    try {
      if (!selectedChannel) return;
      
      const payload = {
        channelId: selectedChannel.id,
        label: channelName,
        isPublic,
        members: selectedUsers
      };
      
      const response = await axios.put(
        `${backendBaseUrl}/teaco/api/v1/chat/update-channel`,
        payload,
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );
      
      toast.success(response.data.message);
      fetchChannels(); 
      setIsUpdateModalOpen(false);
    } catch (error) {
      toast.error("Error updating channel");
      console.error("Error updating channel:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <TopBar workspaceName={workspaceName} userName={userName} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Channels List */}
        <div className="w-1/8 bg-white border-r overflow-y-auto">
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

            <Button onClick={() => setIsModalOpen(true)} className="ml-2">
              +
            </Button>
          </div>

          <div className="divide-y">
            {filteredChannelUserWorkspaces.map(
              (filteredChannelsUserWorkspace) => (
                <div
                  key={filteredChannelsUserWorkspace.room.id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                    selectedChannel?.id ===
                    filteredChannelsUserWorkspace.room.id
                      ? "bg-blue-100"
                      : ""
                  }`}
                  onClick={() =>
                    handleChannelSelect(
                      filteredChannelsUserWorkspace.room,
                      filteredChannelsUserWorkspace.room.id
                    )
                  }
                >
                  <div className="flex items-center">
                    <div>
                      <div className="font-semibold">
                        # {filteredChannelsUserWorkspace.room.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {filteredChannelsUserWorkspace.room.isPublic
                          ? "Public"
                          : "Private"}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {selectedChannel ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                # {selectedChannel.label}
              </h2>
              <div>
                <Cog8ToothIcon 
                  className="h-6 w-6" 
                  onClick={() => setIsUpdateModalOpen(true)}
                />
              </div>
            </div>
            <div
              className="flex-1 p-4 overflow-y-auto bg-gray-50"
              style={{ maxHeight: "calc(100vh - 250px)" }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex flex-col ${
                        message.senderId === userWorkspaceData.id
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      {/* Sender's name above the message */}
                      {message.senderId !== userWorkspaceData.id && (
                        <div className="text-sm text-gray-500 mb-1">
                          {message.sender?.user.name}
                        </div>
                      )}
                      <div
                        className={`p-2 rounded-lg max-w-[70%] ${
                          message.senderId === userWorkspaceData.id
                            ? "bg-[#0D00A8] text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        {message.body}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-8 bg-white flex">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 border border-[] rounded mr-2"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && room) {
                    sendMessage(room);
                  }
                }}
              />
              <button
                className={`text-[${appPrimaryColor}] px-4 py-2 rounded`}
                onClick={() => sendMessage(room)}
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        ) : (
          <main className="flex-1 flex flex-col justify-center items-center bg-gray-50">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Select a Channel
            </h1>
            <p className="text-lg text-gray-600 text-center">
              Choose a channel from the list to start collaborating
            </p>
          </main>
        )}
      </div>

      <CreateChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateChannel={handleCreateChannel}
        activeFilteredMembers={acitveFilteredMembers}
      />

    {selectedChannel && (
            <UpdateChannelModal
              isOpen={isUpdateModalOpen}
              onClose={() => setIsUpdateModalOpen(false)}
              onUpdateChannel={handleUpdateChannel}
              activeFilteredMembers={acitveFilteredMembers}
              currentChannel={{
                name: selectedChannel.label,
                isPublic: selectedChannel.isPublic,
                members: acitveMembers
                  .filter(member => member.id !== userWorkspaceData.id)
                  .map(member => member.id.toString())
              }}
            />
          )}
      <Toaster />
    </div>
  );
};

export default Channels;
