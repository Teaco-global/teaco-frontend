import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  FolderIcon,
  BookOpenIcon,
  EnvelopeIcon,
  UsersIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import InviteMemberModal from "../pages/modal/InviteMemberModal";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleInvite = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
  };


  const menuItems = [
    { name: "Home", icon: <HomeIcon className="h-6 w-6" /> },
    { name: "Chats", icon: <ChatBubbleLeftEllipsisIcon className="h-6 w-6" /> },
    { name: "Projects", icon: <FolderIcon className="h-6 w-6" /> },
    { name: "Wikis", icon: <BookOpenIcon className="h-6 w-6" /> },
    { name: "Mails", icon: <EnvelopeIcon className="h-6 w-6" /> },
    { name: "Spaces", icon: <UsersIcon className="h-6 w-6" /> },
    { name: "Invite", icon: <UserPlusIcon className="h-6 w-6" /> },
    { name: "Settings", icon: <Cog6ToothIcon className="h-6 w-6" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r flex flex-col justify-center items-start p-4">
      <ul className="space-y-4 text-lg w-full">
        {menuItems.map((item) => (
          <li key={item.name} className="w-full">
            {item.name === "Invite" ? (
              <button
              onClick={handleInvite}
              className="flex items-center gap-4 text-left py-3 pl-4 rounded-md hover:text-[#0D00A8]"
            >
              {item.icon}
              {item.name}
            </button>
            ): (
              <NavLink
              to={`/${item.name.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-4 text-left py-3 pl-4 rounded-md ${
                  isActive
                    ? "border-l-4 border-[#0D00A8] bg-[#e7e5ff] text-[#0D00A8]"
                    : "hover:text-[#0D00A8]"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-auto w-full">
        <hr className="my-4" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-red-600 hover:text-red-800 text-left py-3 pl-4 w-full text-lg"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          Log out
        </button>
      </div>
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-full max-w-md mx-4">
            <InviteMemberModal 
              isOpen={isInviteModalOpen} 
              onClose={handleCloseInviteModal} 
            />
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
