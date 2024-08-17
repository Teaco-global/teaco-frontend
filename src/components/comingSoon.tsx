import React, { useEffect, useState } from 'react';
import axios from 'axios';
import teacoLogo from '../assets/teaco.png';
import { useNavigate } from 'react-router-dom';
import { backendBaseUrl } from '../config';

const ComingSoon: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          throw new Error('Unauthorized: No token found');
        }

        const response = await axios.get(`${backendBaseUrl}/teaco/api/v1/auth/home`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        setMessage(response.data.message); // Store the backend response message in the state
      } catch (error: any) {
        console.error(error);
        setMessage(error?.response?.data?.error?.message || 'Unauthorized access');
        navigate('/login'); // Redirect to login if unauthorized
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    // Set the target date to 30 days from now
    const targetDate = new Date('2024-08-13T15:16:48.160Z');
    targetDate.setDate(targetDate.getDate() + 30);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        // Clear the interval if the countdown is finished
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <img src={teacoLogo} alt="Teaco Logo" className="w-25 h-20 mb-4" />
      <h1 className="text-5xl font-bold text-center leading-snug">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
          {message || 'Loading...'}  {/* Display the response message or a loading placeholder */}
        </span><br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
          We are getting live after
        </span>
        <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
      </h1>
      {message && (
        <p className="text-center text-lg mt-4 text-gray-700">
        </p>
      )}
    </div>
  );
};

export default ComingSoon;
