import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import BuyProButton from './BuyProButton'; // Ensure this component is web compatible
import { AuthContext } from '../context/AuthContext'; // Adjust the import path if needed

export default function Header({ showBuyProButton = false, showLogoutButton = false, title }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/otp', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show some error UI here
    }
  };

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white shadow-md z-10 fixed top-0 left-0 right-0">
      {/* Profile and Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          aria-label="Go to Profile"
          className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
        >
          <FaUserCircle size={26} />
        </button>
        <span className="text-base font-semibold text-gray-800 truncate">{title}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {showBuyProButton && (
          <>
            <BuyProButton setIsPopupVisible={setIsPopupVisible} />
            {isPopupVisible && (
              <div
                className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-40 z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="upgrade-to-pro-title"
              >
                <div className="w-full max-w-md bg-white rounded-t-2xl p-6 shadow-lg">
                  <h2 id="upgrade-to-pro-title" className="text-xl font-bold text-gray-800 mb-3">
                    Upgrade to Pro
                  </h2>
                  <p className="text-gray-600 text-center mb-5">
                    Coming soon! Stay tuned for exciting features and enhancements.
                  </p>
                  <button
                    onClick={() => setIsPopupVisible(false)}
                    className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Close Upgrade to Pro popup"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {showLogoutButton && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Logout"
          >
            <span>Logout</span>
            <FaSignOutAlt size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
