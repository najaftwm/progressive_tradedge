import React from 'react';
import { useNavigate } from 'react-router-dom';

const BuyProButton = ({ setIsPopupVisible }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/BuyPackageOffer')}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-800 via-pink-600 to-yellow-500 shadow-md hover:scale-105 transition-transform"
    >
      <svg width="23" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0L26 12L36 4L32 24H4L0 4L10 12L18 0Z" fill="#f09f33" />
      </svg>
      <span className="text-white font-bold drop-shadow-sm">Buy Pro</span>
    </button>
  );
};

export default BuyProButton;
