import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import teacoLogo from '../assets/teaco.png';
import { backendBaseUrl } from '../config';

interface LocationState {
  email: string;
}

const VerifyEmail: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(5).fill(''));
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const state = location.state as LocationState;
  const email = state?.email || 'your email address';
  const navigate = useNavigate();

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling && element.value !== '') {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData('text');
    if (pastedText.length === otp.length && !isNaN(Number(pastedText))) {
      const pastedOtp = pastedText.split('');
      setOtp(pastedOtp);

      // Automatically focus the last field
      const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="text"]'));
      if (inputs[pastedOtp.length - 1]) {
        inputs[pastedOtp.length - 1].focus();
      }
    } else {
      toast.error('Please paste a valid 5-digit OTP');
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 5) {
      toast.error('Please enter a valid 5-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendBaseUrl}/teaco/api/v1/auth/verify-account`, {
        email,
        verificationCode: otpCode,
      });

      if (response.status === 200) {
        toast.success('OTP verified successfully!');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setLoading(true);
      await axios.post(`${backendBaseUrl}/teaco/api/v1/auth/resend-verification-code`, { email });
      toast.success('OTP has been resent to your email');
    } catch (error: any) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
        <img src={teacoLogo} alt="Teaco Logo" className="w-23 h-20 mb-4 mx-auto" />
        <h1 className="text-2xl font-bold mb-2 text-primary">Please check your email</h1>
        <p className="text-gray-600 mb-4">We have just sent an OTP to {email}</p>
        <div className="flex justify-center mb-6 space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target, index)}
              onPaste={index === 0 ? handlePaste : undefined} // Only handle paste on the first input
              className="w-12 h-12 text-center border rounded-lg text-2xl"
            />
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className={`w-1/4 py-3 bg-primary text-white font-bold rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        <p className="mt-4 text-gray-600">
          Didn’t receive a code?{' '}
          <button onClick={resendOtp} className="text-primary underline" disabled={loading}>
            Resend code
          </button>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VerifyEmail;
