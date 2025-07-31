import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStockContext } from '../../context/StockContext';
import { MdArrowBack, MdStar, MdChevronRight, MdChevronLeft, MdExpandLess, MdExpandMore } from 'react-icons/md';

const latestOffers = [
  { id: 1, title: 'Get ₹25 OFF on your first month!', desc: 'Limited time offer for new users.' },
  { id: 2, title: 'Save ₹100 with TradEdge', desc: 'Apply coupon at checkout.' },
  { id: 3, title: 'Refer & Earn', desc: 'Invite friends and earn rewards.' },
];

const OFFER_DURATION = 25 * 60; // 25 minutes in seconds
const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

export default function BuyPackageOffer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { packages } = useStockContext();
  const package_id = searchParams.get('package_id');

  const [secondsLeft, setSecondsLeft] = useState(OFFER_DURATION);
  const [expanded, setExpanded] = useState([true, false, false]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // Timer for offer countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // ✅ Auto-slide effect
  useEffect(() => {
    const autoSlide = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % latestOffers.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(autoSlide);
  }, []);

  // ✅ Smooth scroll whenever currentSlide changes
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: currentSlide * sliderRef.current.offsetWidth,
        behavior: 'smooth',
      });
    }
  }, [currentSlide]);

  const group1 = packages.filter((_, i) => i % 3 === 0);
  const group2 = packages.filter((_, i) => i % 3 === 1);
  const group3 = packages.filter((_, i) => i % 3 === 2);
  const groups = [
    { title: 'Stocks Only', data: group1 },
    { title: 'Stocks + Futures', data: group2 },
    { title: 'Stocks + Options', data: group3 },
  ];

  const handleSlide = (dir) => {
    setCurrentSlide(prev =>
      dir === 'left'
        ? (prev - 1 + latestOffers.length) % latestOffers.length
        : (prev + 1) % latestOffers.length
    );
  };

  const handlePay = () => {
    if (selectedPackage) {
      navigate(`/Tradedetails?package_id=${selectedPackage.package_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-36">
      {/* Header */}
      <div className="p-4">
        <button onClick={() => navigate(-1)} className="text-orange-500 bg-orange-100 p-2 rounded-full hover:bg-orange-200 transition-colors">
          <MdArrowBack size={24} />
        </button>
      </div>

      {/* Offers Slider */}
      <div className="flex flex-col items-center justify-center px-8 py-6 relative">
        <div className="relative w-full max-w-xl">
          <button 
            onClick={() => handleSlide('left')} 
            className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-orange-100 transition-colors"
          >
            <MdChevronLeft size={28} className="text-orange-500" />
          </button>
          <div className="overflow-hidden w-full" ref={sliderRef}>
            <div className="flex">
              {latestOffers.map((item) => (
                <div 
                  key={item.id} 
                  className="min-w-full bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-2xl shadow-xl mx-2 transform hover:scale-105 transition-transform duration-300"
                >
                  <h2 className="text-orange-600 text-xl font-extrabold tracking-tight">{item.title}</h2>
                  <p className="text-gray-700 mt-3 text-base font-medium">{item.desc}</p>
                  <button className="mt-4 text-orange-500 font-semibold underline hover:text-orange-600 transition-colors">
                    Learn More
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => handleSlide('right')} 
            className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-orange-100 transition-colors"
          >
            <MdChevronRight size={28} className="text-orange-500" />
          </button>
        </div>
        <div className="flex justify-center mt-4 gap-2">
          {latestOffers.map((_, index) => (
            <div 
              key={index} 
              className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`} 
            />
          ))}
        </div>
      </div>

      {/* Offer Banner */}
      <div className="bg-orange-50 p-4 rounded-xl border border-yellow-300 mx-4 mt-8 text-center">
        <h3 className="text-red-500 font-bold text-xl">EXTRA ₹25 OFF</h3>
        <p className="text-gray-700 mt-1">
          Offer ends in <span className="bg-red-500 text-white px-2 py-1 rounded mx-1">{minutes.toString().padStart(2, '0')}</span>m
          <span className="bg-red-500 text-white px-2 py-1 rounded mx-1">{seconds.toString().padStart(2, '0')}</span>s
        </p>
      </div>

      {/* Packages */}
      <div className="mt-8 px-4">
        {groups.map((group, idx) => (
          <div key={group.title} className="mb-4">
            <button
              onClick={() => setExpanded(e => e.map((v, i) => i === idx ? !v : v))}
              className={`flex justify-between items-center w-full px-4 py-3 rounded-lg shadow-sm font-semibold ${expanded[idx] ? 'bg-orange-500 text-white' : 'bg-white text-gray-800'}`}
            >
              <span>{group.title}</span>
              {expanded[idx] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
            </button>

            {expanded[idx] && (
              <div className="mt-2 flex gap-4 overflow-x-auto py-2">
                {group.data.map((pack) => (
                  <div
                    key={pack.package_id}
                    onClick={() => setSelectedPackage(pack)}
                    className={`min-w-[180px] border-2 rounded-xl p-4 flex-shrink-0 cursor-pointer ${selectedPackage?.package_id === pack.package_id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}
                  >
                    <h3 className="text-orange-500 font-bold">{pack.title}</h3>
                    <p className="text-lg font-bold text-gray-600 mt-2">₹{pack.price}</p>
                    <p className="text-sm mt-1 text-gray-600">{pack.details?.[0]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Multibagger Banner */}
      <div className="bg-yellow-100 flex items-center gap-2 px-4 py-2 mx-4 rounded-lg mt-4">
        <MdStar className="text-yellow-500" />
        <span className="font-bold text-yellow-600">MULTIBAGGERS</span>
        <span className="text-gray-800 text-sm">stock included in 1 yr & loyalty plans</span>
      </div>

      {/* Coupon Applied Banner */}
      <div className="bg-green-100 flex justify-between items-center px-4 py-3 mx-4 rounded-lg mt-4">
        <div className="flex gap-2 items-center">
          <MdStar className="text-green-500" />
          <span className="text-green-600 font-semibold">₹100 saved with TradEdge</span>
        </div>
        <span className="text-green-600 font-semibold">Applied</span>
      </div>

      {/* Sticky Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t pb-6 border-gray-200">
        <button
          disabled={!selectedPackage}
          onClick={handlePay}
          className={`w-full py-3 text-white font-semibold rounded-lg transition ${selectedPackage ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          {selectedPackage ? `Pay ₹${selectedPackage.price}` : 'Select a package to pay'}
        </button>
        <p className="text-center text-xs text-gray-500 mt-2">Cancel anytime • Billed monthly • Renews @ ₹899</p>
      </div>
    </div>
  );
}
