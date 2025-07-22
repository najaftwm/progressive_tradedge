import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { authData, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-5">
      <h1 className="text-3xl font-bold text-black sm:text-4xl mb-4">
        Welcome, {authData.user_name || 'User'}!
      </h1>
      <p className="text-lg text-black mb-4">You are logged in with user ID: {authData.user_id}</p>
      <p className="text-sm text-gray-600 mb-4">Role: {authData.user_role}</p>
      <p className="text-sm text-gray-600 mb-4">Session ID: {authData.session_id}</p>
      <p className="text-sm text-gray-600 mb-4">
        Access Token Expires: {new Date(authData.access_token_expiry * 1000).toLocaleString()}
      </p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Home;