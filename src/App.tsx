import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignUpForm from './components/SignUp';
import VerifyEmail from './components/Verify-account';
import Login from "./components/Login";
import Home from './pages/Home'
import Chats from './pages/Chats';
import Projects from './pages/Projects';
import Wikis from './pages/Wikis';
import Mails from './pages/Mails';
import Channels from './pages/Channels';
import Settings from './pages/SettingsProfile';
import Boards from './pages/Boards';
import Backlogs from './pages/Backlogs';
import SettingsProfile from './pages/SettingsProfile';
import SettingsWorkspace from './pages/SettingsWorkspace';
import SettingsTeams from './pages/SettingsTeams';
import AcceptInvitation from './pages/AcceptInvitation';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/sign-up" element={<SignUpForm />} />
        <Route path="/verify-account" element={<VerifyEmail />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/chats" element={<PrivateRoute><Chats /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/projects/:projectId/boards" element={<PrivateRoute><Boards /></PrivateRoute>} />
        <Route path="/projects/:projectId/backlogs" element={<PrivateRoute><Backlogs /></PrivateRoute>} />
        <Route path="/projects/:projectId/timeline" element={<PrivateRoute><Boards /></PrivateRoute>} />
        <Route path="/wikis" element={<PrivateRoute><Wikis /></PrivateRoute>} />
        <Route path="/mails" element={<PrivateRoute><Mails /></PrivateRoute>} />
        <Route path="/channels" element={<PrivateRoute><Channels /></PrivateRoute>} />
        {/* <Route path="/invite" element={<PrivateRoute><Invite /></PrivateRoute>} /> */}
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/settings/profile" element={<PrivateRoute><SettingsProfile /></PrivateRoute>} />
        <Route path="/settings/workspace" element={<PrivateRoute><SettingsWorkspace /></PrivateRoute>} />
        <Route path="/settings/teams" element={<PrivateRoute><SettingsTeams /></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
