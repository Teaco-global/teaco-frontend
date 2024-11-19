import React from "react";
import { NavLink } from "react-router-dom";
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

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
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
    <aside className="w-64 bg-gray-100 border-r flex flex-col justify-content items-start p-4">
      {/* Sidebar Menu */}
      <ul className="space-y-4 text-lg w-full">
        {menuItems.map((item) => (
          <li key={item.name} className="w-full">
            <NavLink
              to={`/${item.name.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-4 text-left py-3 pl-4 rounded-md ${
                  isActive ? "bg-[#e7e5ff] text-[#0D00A8]" : "hover:text-[#0D00A8]"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <div className="mt-auto w-full">
        <hr className="my-4" />
        <button
          onClick={onLogout}
          className="flex items-center gap-4 text-red-600 hover:text-red-800 text-left py-3 pl-4 w-full text-lg"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
