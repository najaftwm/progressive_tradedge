// src/pages/ReferralScreen.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaExclamationCircle } from 'react-icons/fa';
import referImage from '../images/refer.png';

const ReferralScreen = () => {
  // Local theme colors (consistent with Trades.jsx)
  const colors = {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    primary: '#3b82f6',
    border: '#e5e7eb',
    isDarkMode: false, // Toggle for dark mode testing
  };

  const referrerCode = '3M60AVJSWTN9';
  const [toast, setToast] = useState({ show: false, message: '' });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referrerCode);
      setToast({ show: true, message: 'Referral code copied to clipboard.' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    } catch (error) {
      setToast({ show: true, message: 'Failed to copy referral code.' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    }
  };

  const handleInviteFriends = () => {
    const message = `Download Tradedge app. Use my referral code *${referrerCode}*`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    try {
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      setToast({ show: true, message: 'Failed to open WhatsApp.' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4 pt-20 pb-6">
      <div className="max-w-xl mx-auto">
        {/* Image */}
        <div className="flex justify-center mb-4">
          <img
            src={referImage} // Replace with actual image URL
            alt="Referral"
            className="w-full h-64 object-contain"
          />
        </div>

        {/* Title and Subtitle */}
        <p className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Refer your friend
        </p>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
          Share this code with your friend and help them discover Tradedge!
        </p>

        {/* Referral Code */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{referrerCode}</span>
          <button
            onClick={handleCopyCode}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <FaCopy size={24} />
          </button>
        </div>

        {/* Invite Text */}
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
          Invite your friends to join and grow together.
        </p>

        {/* Invite Button */}
        <button
          onClick={handleInviteFriends}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
        >
          Invite Friends
        </button>

        {/* Stats Card */}
        <div className="flex justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Referral Count</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">0</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subscription Count</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">0</p>
          </div>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-4 rounded-lg shadow-md flex items-center gap-2 max-w-md w-full mx-auto"
          >
            <FaExclamationCircle />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReferralScreen;