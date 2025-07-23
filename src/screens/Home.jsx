import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/bottomnav';
import KycComponent from '../components/Login/KycComponent';
import refundFrame from '../images/refundframe1.png';

export default function Home() {
  const navigate = useNavigate();
  const { isInitializing, isLoggedIn, userDetails } = useContext(AuthContext);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const sendTestNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('🚀 Test Notification', {
            body: 'This is a test push sent from Home!',
          });
          console.log('✅ Test notification sent');
        }
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Optional: Top Navigation */}
      {/* <TopNav /> */}

      <main className="flex-1 p-4 mt-14 mb-16">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* KYC Section */}
          <KycComponent />
          <div className="mx-3 mt-2 bg-transparent">
      <div
        onClick={() => navigate('/main/TradeDetails?package_id=10000')}
        className="cursor-pointer rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105"
      >
        <div
        className="w-full h-52 bg-cover bg-center rounded-lg"
        style={{ backgroundImage: `url(${refundFrame})` }}
        ></div>
      </div>
    </div>

          {/* Welcome Section */}
          <div className="bg-green-600 rounded-xl shadow-md p-6 text-white">
        <h2 className="text-sm font-medium">Your Trusted Research Analyst</h2>
        <h1 className="text-2xl font-bold mt-1">Pay for Successful Research Calls</h1>
        <p className="text-white text-sm mt-2">Start your wealth creation journey!</p>

        <div className="flex justify-between items-center mt-6">
            <button
            onClick={() => navigate('/trades')}
            className="bg-white text-green-700 px-5 py-2 rounded-md font-semibold shadow hover:bg-gray-100 transition"
            >
            Explore
            </button>
            <img
            src="src/images/logo.png" // Replace with actual logo path
            alt="Tradedge Logo"
            className="w-8 h-8"
            />
        </div>
        </div>

        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Floating Test Notification Button */}
      <button
        onClick={sendTestNotification}
        className="fixed bottom-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
      >
        Test Notification
      </button>

      {/* Popup */}
      {isPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <p className="text-gray-800">Notification Popup</p>
            <button
              onClick={() => setIsPopupVisible(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
