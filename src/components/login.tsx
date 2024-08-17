import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import teacoLogo from '../assets/teaco.png';
import { backendBaseUrl } from '../config';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${backendBaseUrl}/teaco/api/v1/auth/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('accessToken', response.data.token.access);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token.access}`;
        toast.success('Login successful!');
        navigate('/home');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'An error occurred');
      setError(error?.response?.data?.error?.message || 'An error occurred');
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
      <ToastContainer />
    </div>
  );
};

export default Login;
