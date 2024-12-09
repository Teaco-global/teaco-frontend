import React from "react";
import teacoIconWhite from "../../public/teaco-icon-white.png";

interface TopBarProps {
  workspaceName: string;
  userName: string;
}

const TopBar: React.FC<TopBarProps> = ({ workspaceName, userName }) => {
  return (
    <header className="flex justify-between items-center bg-[#0D00A8] text-white p-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-[#0D00A8] font-bold">
          {workspaceName.charAt(0).toUpperCase()}
        </div>
        <span className="text-lg font-semibold">{workspaceName}</span>
      </div>
      <div className="flex items-center space-x-3">
        <img src={teacoIconWhite} alt="Teaco Logo" className="w-23 h-5" />
        <span className="text-lg font-semibold">Teaco</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="hidden md:inline">{userName}</span>
        <div className="rounded-full border">
          <img
            src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
            alt="Profile"
            className="w-6 h-6 rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
