import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from 'react-router-dom';
import teacoLogo from '../assets/teaco.png';
import { backendBaseUrl } from '../config';

<div>
  <Toaster />
</div>;
const AcceptInvitation: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Assume we get the invitation token from the URL or location state
  const invitationToken = location.state?.token || new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
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
      const response = await axios.put(`${backendBaseUrl}/teaco/api/v1/user-workspace/accept-invite`, {
        accept: true,
        token: invitationToken,
        password,
      });

      if (response.status === 200) {
        toast.success(response.data.message);
        setSuccess('Invitation accepted successfully!');
        navigate('/login');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 'An error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!invitationToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
          <div className="flex justify-center mb-6">
            <img src={teacoLogo} alt="Teaco Logo" className="w-23 h-20" />
          </div>
          <h1 className="text-3xl font-bold mb-6 text-primary">Invalid Invitation</h1>
          <p className="text-red-500">No invitation token found. Please check your invitation link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <img src={teacoLogo} alt="Teaco Logo" className="w-23 h-20" />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">Accept Invitation</h1>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">New Password</label>
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
            className={`w-1/2 py-3 bg-primary text-white font-semibold rounded-lg mx-auto block ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Accept Invitation'}
          </button>
        </form>
      </div>
      <Toaster/>
    </div>
  );
};

export default AcceptInvitation;