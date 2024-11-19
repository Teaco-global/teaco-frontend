import React from "react";
import teacoIconWhite from '../../public/teaco-icon-white.png'

interface TopBarProps {
  workspaceName: string;
  userName: string;
}

const TopBar: React.FC<TopBarProps> = ({ workspaceName, userName }) => {
  return (
    <header className="flex justify-between items-center bg-[#0D00A8] text-white p-4">
      {/* Workspace Name with Icon */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-[#0D00A8] font-bold">
          {workspaceName.charAt(0).toUpperCase()}
        </div>
        <span className="text-lg font-semibold">{workspaceName}</span>
      </div>

      {/* App Name with Icon */}
      <div className="flex items-center space-x-3">
          <img src={teacoIconWhite} alt="Teaco Logo" className="w-23 h-5" />
        <span className="text-lg font-semibold">Teaco</span>
      </div>

      {/* User Info */}
      <div className="flex items-center space-x-4">
        <span className="hidden md:inline">Welcome, {userName}</span>
        {/* Circular Profile */}
        <div className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-full font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
