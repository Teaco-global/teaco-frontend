import React from 'react';
import Sidebar from './components/sideBar';

interface TopbarProps {
  title: string; // Title for the topbar (e.g., "Dashboard", "Projects", etc.)
}

const Topbar: React.FC<TopbarProps> = ({ title }) => {
  return (
    <header className="w-full h-16 bg-[#0D00A8] text-white flex items-center px-6 shadow-md">
      <h1 className="text-xl font-semibold">{title}</h1>
    </header>
  );
};

const DashboardLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar onLogout={() => console.log("Logged out")} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar title={title} />

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
