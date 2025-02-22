import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import teacoLogo from '../assets/teaco.png';
import { backendBaseUrl } from '../config';

<div>
  <Toaster />
</div>;

const SignUpForm: React.FC = () => {
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Passwords must be at least 8 characters long');
      setError('Passwords must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendBaseUrl}/teaco/api/v1/auth/sign-up`, {
        name,
        workspaceName,
        email,
        password,
      });

      if (response.status === 200) {
        toast.success('Sign up successful!');
        setSuccess('Sign up successful!');
        navigate('/verify-account', { state: { email } });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'An error occurred');
      setError(error?.response?.data?.error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <img src={teacoLogo} alt="Teaco Logo" className="w-23 h-20" />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">Get started with your teamwork journey</h1>
        <p className="text-center mb-6">
          Already have an account? <a href="/login" className="text-primary">Log In</a>
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Username</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Your name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Your workspace name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Your email"
              required
            />
          </div>
          <div className="mb-4">
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
          <div className="mb-6">
            <label className="block mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="********"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-1/4 py-3 bg-primary text-white font-bold rounded-lg mx-auto block ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Sign Up'}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default SignUpForm;
