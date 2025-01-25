import React, { useState } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import teacoLogo from '../assets/teaco.png';
import toast, { Toaster } from "react-hot-toast";
import { backendBaseUrl } from '../config';

<div>
  <Toaster />
</div>;

interface User {
  id: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

interface Workspace {
  id: number;
  secret: string;
  label: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
}

interface UserWorkspace {
  id: number;
}

interface AuthMeResponse {
  data: {
    userWorkspace: UserWorkspace;
    user: User;
    workspace: Workspace;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAuthMe = async (token: string): Promise<AuthMeResponse> => {
    try {
      const response = await axios.get(`${backendBaseUrl}/teaco/api/v1/auth/me`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch user data');
    }
  };

  const fetchActiveWorkspace = async (token: string): Promise<any> => {
    try {
      const response = await axios.get(`${backendBaseUrl}/teaco/api/v1/user-workspace/active-workspaces`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      if (response.data?.data?.length === 0) {
        throw new Error('No active workspaces found');
      }
      return response.data.data.workspace;
    } catch (error: any) {
      throw new Error('Failed to fetch active workspace');
    }
  };

  const loginWorkspace = async (workspaceId: number, token: string): Promise<string> => {
    try {
      const response = await axios.post(`${backendBaseUrl}/teaco/api/v1/user-workspace/workspace-login`, {
        workspaceId,
      }, {
        headers: {
          Authorization: `${token}`,
        }
      });
      return response.data.data.token;
    } catch (error: any) {
      throw new Error('Failed to log into workspace');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const loginResponse = await axios.post(`${backendBaseUrl}/teaco/api/v1/auth/login`, {
        email,
        password,
      });

      if (loginResponse.status === 200) {
        const accessToken = loginResponse.data.token.access;
        localStorage.setItem('accessToken', accessToken);
        axios.defaults.headers.common['Authorization'] = `${accessToken}`;
        try {
          const authMeData = await fetchAuthMe(accessToken);
          localStorage.setItem('userWorkspaceData', JSON.stringify(authMeData.data.userWorkspace));
          localStorage.setItem('userData', JSON.stringify(authMeData.data.user));
          localStorage.setItem('workspaceData', JSON.stringify(authMeData.data.workspace));
          const activeWorkspace = await fetchActiveWorkspace(accessToken);
          const workspaceSecret = await loginWorkspace(activeWorkspace.id, accessToken);
          localStorage.setItem('x-workspace-secret-id', workspaceSecret);

          toast.success('Login successful!');
          navigate('/home', {
            state: {
              userName: authMeData.data.user.name,
              workspaceName: authMeData.data.workspace.label,
            },
          });
        } catch (workspaceError) {
          toast.error('Failed to complete workspace setup');
          setError('Failed to complete workspace setup');
          localStorage.removeItem('accessToken');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    } catch (error: any) {
      console.log(error?.response?.data?.error)
      toast.error(error?.response?.data?.error || 'An error occurred');
      setError(error?.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={teacoLogo} alt="Teaco Logo" className="w-23 h-20" />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">Welcome back!</h1>
        <p className="text-center mb-6">
          Don't have an account? <a href="/sign-up" className="text-primary">Sign Up</a>
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="johndoe@gmail.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="********"
              required
            />
          </div>
          <button type="submit" className="w-1/4 py-3 bg-primary text-white font-bold rounded-lg mx-auto block">
            Log in
          </button>
          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-primary">Forgot Password?</a>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default Login;
