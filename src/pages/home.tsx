import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/topBar';
import Sidebar from '../components/sideBar';

const Home: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // Remove the token from storage
    navigate('/'); // Redirect to the login page
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }
        const config = {
          headers: {
            Authorization: `${token}`,
          },
        };

        const response = await axios.get('http://localhost:3000/teaco/api/v1/auth/me', config);
        const { user, workspace } = response.data.data;
        setUserName(user.name);
        setWorkspaceName(workspace.label);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        localStorage.removeItem('accessToken'); 
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* TopBar */}
      <TopBar workspaceName={workspaceName} userName={userName} />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar onLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-4xl font-bold mb-6 text-center">Welcome to the {workspaceName}</h1>
          <p className="text-lg text-gray-700 text-center">
            This is the main content area of the application.
          </p>
        </main>
      </div>
    </div>
  );
};

export default Home;
