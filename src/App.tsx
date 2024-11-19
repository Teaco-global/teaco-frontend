import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpForm from './components/SignUp';
import VerifyEmail from './components/verify-account';
import Login from './components/login';
import Home from './pages/home';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Home/>} />
        <Route path="/sign-up" element={<SignUpForm />} />
        <Route path="/verify-account" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element= { <Home/>}/>
      </Routes>
    </Router>
  );
};

export default App;
