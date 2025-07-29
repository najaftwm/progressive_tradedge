import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BottomNav from '../components/bottomnav';
import KycComponent from '../components/Login/KycComponent';
import refundFrame from '../images/refundframe1.png';
import { useStockContext } from '../context/StockContext';
import ExplorePackageCard from '../components/Home/explorePackageCard';
import TradeCard from '../components/Home/TradeCard';
import logo from '../images/logo.png';

export default function Home() {
  const navigate = useNavigate();
  const { isInitializing, isLoggedIn, userDetails } = useContext(AuthContext);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { packages } = useStockContext();

  const explorePackagesId = ['5', '3', '10', '9'];
  const bestTradesId = ['2', '4', '11', '9'];

  const explorePackages = packages.filter(pkg => explorePackagesId.includes(pkg.package_id));
  const bestTrades = packages.filter(pkg => bestTradesId.includes(pkg.package_id));
const { authData, kycStatus } = useContext(AuthContext);

  // Directly check if KYC is completed (status 'Y')
  const isKycCompleted = kycStatus === 'Y' || authData?.auth === 'Y';



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
 console.log('All packages:', packages);
console.log('Explore packages:', explorePackages);
console.log('Best trades:', bestTrades);
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Optional: Top Navigation */}
      {/* <TopNav /> */}

      <main className="flex-1 p-4 mt-14 mb-16">
        <div className="max-w-2xl mx-auto space-y-6">
         {/* Render KYC component ONLY if KYC is NOT completed */}
          {!isKycCompleted && (
            <div className="mx-2">
              <KycComponent />
            </div>
          )}
          <div className="mx-3 mt-2 bg-transparent">
      <div
        onClick={() => navigate('/TradeDetails?package_id=10000')}
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
            <img src="/icons/logo.png" alt="Tradedge Logo" className="w-8 h-8" />
        </div>
        </div>

        {/* Explore Packages */}
      <div>
        <h2 className="text-2xl font-bold  text-gray-700 mb-4">Explore Packages</h2>
        <div className="flex overflow-x-auto gap-4">
          {explorePackages.map((item) => (
            <ExplorePackageCard key={item.package_id} item={item} />
          ))}
          <div
            onClick={() => navigate('/trades')}
            className="min-w-[200px] flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-gray-100 transition"
          >
            <span className="text-blue-600 font-medium">See More →</span>
          </div>
        </div>
      </div>

      {/* Best Trades */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-400 text-white p-6  rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Best Trades</h2>
          <div className="flex items-center gap-  2">
            <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="font-semibold">SEBI Reg</span>
          </div>
        </div>

        <div className="grid grid-cols-2  sm:grid-cols-2 gap-4">
         {bestTrades.map((item) => (
        <TradeCard key={item.package_id} item={item} />
      ))}
        </div>
      </div>

        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

     

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
