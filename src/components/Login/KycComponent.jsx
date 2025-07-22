import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const KycComponent = ({ onKycComplete }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-black text-lg mb-4">KYC Component Placeholder</p>
      <button
        onClick={onKycComplete}
        className="bg-black text-white px-8 py-3 rounded-lg shadow-md hover:bg-gray-800"
      >
        Complete KYC
      </button>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default KycComponent;