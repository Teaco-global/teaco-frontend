import React, { useState, useEffect, useRef } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";
import {
  PaperAirplaneIcon
} from "@heroicons/react/24/outline";

import { backendBaseUrl } from "../config";
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

interface Message {
  id: number;
  body: string;
  senderId: number;
  createdAt: string;
}

const Chats: React.FC = () => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<WorkspaceMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page] = useState(1);
  const pageSize = 10;
  const [room, setCurrentRoom] = useState();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messagesPage, setMessagesPage] = useState(1);
  const [socket, setSocket] = useState<any>(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const workspaceData = JSON.parse(
    localStorage.getItem("workspaceData") || "{}"
  );
  const accessToken = localStorage.getItem("accessToken");
  const workspaceSecret = localStorage.getItem("x-workspace-secret-id");

  const userName = userData.name || "";
  const workspaceName = workspaceData.label || "";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    console.log(messagesPage)
    scrollToBottom();
  }, [messages, selectedMember]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchActiveMembers();
  }, [page]);

  useEffect(() => {
    const newSocket = io(backendBaseUrl, {
      auth: {
        token: accessToken,
      },
      extraHeaders: {
        "x-workspace-secret-id": workspaceSecret || "",
      },
    });
    newSocket.on('connect', () => {
      console.log("Socket connected");
    });

    newSocket.on("new_message", (message: Message) => {
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

  const fetchActiveMembers = async () => {
    try {
      const response = await axios.get(
        `${backendBaseUrl}/teaco/api/v1/user-workspace/active-workspace-members`,
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

  // Create chat room
  const createChatRoom = async (receiverId: number) => {
    try {
      const response = await axios.post(
        `${backendBaseUrl}/teaco/api/v1/chat/create-room`,
        { receiverId },
        {
          headers: {
            Authorization: `${accessToken}`,
            "x-workspace-secret-id": `${workspaceSecret}`,
          },
        }
      );
      setCurrentRoom(response.data.data);
      await fetchMessages(response.data.data.id);
    } catch (error) {
      toast.error("Error creating chat room");
      console.error("Error creating chat room:", error);
    }
  };

  // Fetch messages for a room
  const fetchMessages = async (roomId: number, page = 1) => {
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

      const newMessages = response.data.data;
      setMessages(page === 1 ? newMessages : [...messages, ...newMessages]);
      setMessagesPage(page);
    } catch (error) {
      toast.error("Error fetching messages");
      console.error("Error fetching messages:", error);
    }
  };

  // Send a message
  const sendMessage = async (room:any) => {
    try {
      if (socket && newMessage.trim()) {
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

  const handleMemberSelect = (member: WorkspaceMember) => {
    setSelectedMember(member);
    createChatRoom(member.id);
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
                  <div 
                    className="w-8 h-8 rounded-xl object-cover mr-2 bg-gray-300 text-black font-black text-center 
                          flex justify-center items-center" 
                  > 
                    {member.user.name ? member.user.name.split('')[0] : '?'} 
                  </div>
                  <div className="font-semibold">{member.user.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <main className="flex-1 flex flex-col">
          {selectedMember ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-white border-b p-4 flex items-center">
              <div 
                    className="w-8 h-8 rounded-xl object-cover mr-2 bg-gray-300 text-black font-black text-center 
                          flex justify-center items-center" 
                  > 
                    {selectedMember.user.name ? selectedMember.user.name.split('')[0] : '?'} 
                  </div>
                <h2 className="text-xl font-bold">
                  {selectedMember.user.name}
                </h2>
              </div> 
              {/* Message container */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === selectedMember.id
                            ? "justify-start"
                            : "justify-end"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg max-w-[70%] ${
                            message.senderId === selectedMember.id
                              ? "bg-gray-200"
                              : "bg-[#0D00A8] text-white"
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

              {/* Message box */}
              <div className="border-t p-8 bg-white flex">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-[#0D00A8] rounded mr-2"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && room) {
                      sendMessage(room);
                    }
                  }}
                />
                <button
                  className="text-[#0D00A8] px-4 py-2 rounded mr-2"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                ></button>
                <button
                  className="text-[#0D00A8] px-4 py-2 rounded"
                  onClick={() => sendMessage(room)}
                >
                  <PaperAirplaneIcon className="h-6 w-6" />
                </button>
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
