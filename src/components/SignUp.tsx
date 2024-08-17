import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import teacoLogo from '../assets/teaco.png'
import { backendBaseUrl } from '../config';

const SignUpForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    try {
      const response = await axios.post(`${backendBaseUrl}/teaco/api/v1/auth/sign-up`, {
        name,
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
        setError(error?.response?.data?.error?.message|| 'An error occurred');
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
            <label className="block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Your full name"
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
          <button type="submit" className="w-1/4 py-3 bg-primary text-white font-bold rounded-lg mx-auto block">
            Sign Up
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUpForm;
