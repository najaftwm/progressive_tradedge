import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedLinkButton from '../components/animatedLinkButton';
import { AuthContext } from '../context/AuthContext';
import { useStockContext } from '../context/StockContext';
import axios from 'axios';

const Packs = () => {
  // === Hooks must be at top ===
  const { authData } = useContext(AuthContext) || {};
  const { packages, loading } = useStockContext() || { packages: [], loading: false };
  const navigate = useNavigate();

  const userDetails = {
    user_id: authData?.user_id,
    user_name: authData?.user_name,
    user_email_id: authData?.user_email_id,
  };

  const accessToken = authData?.access_token;

  // Extract unique tags/categories
  const uniqueTags = [
    ...new Set(Array.isArray(packages) ? packages.map(pack => pack.categoryTag).filter(Boolean) : []),
  ];

  const [selectedTag, setSelectedTag] = useState(uniqueTags[0] || '');
  const [expandedPackages, setExpandedPackages] = useState(new Set());

  // Filter services based on selectedTag, or show all if no tags
  const filteredServices =
    uniqueTags.length > 0 && selectedTag
      ? (Array.isArray(packages) ? packages.filter(pkg => pkg.categoryTag === selectedTag) : [])
      : packages;

  // Debug logs (optional)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Auth Token:', accessToken);
    // eslint-disable-next-line no-console
    console.log('Packages:', packages);
    // eslint-disable-next-line no-console
    console.log('Unique Tags:', uniqueTags);
    // eslint-disable-next-line no-console
    console.log('Selected Tag:', selectedTag);
    // eslint-disable-next-line no-console
    console.log('Filtered Services:', filteredServices);
  }, [accessToken, packages, uniqueTags, selectedTag, filteredServices]);

  // === Handlers ===
  const toggleDetails = packageId => {
    setExpandedPackages(prev => {
      const next = new Set(prev);
      if (next.has(packageId)) next.delete(packageId);
      else next.add(packageId);
      return next;
    });
  };

  const handleBuyNow = (item) => {
    try {
      const transaction_id = `TXN_${Date.now()}`;
      const upiLink = `upi://pay?pa=suryanshchandel09@sbi&pn=ASHUTOSH%20MISHRA&mc=0000&tid=${transaction_id}&tn=Tradedge%20Package%20Purchase&am=${item.price}&cu=INR`;

      // Store transaction details (optional)
      localStorage.setItem(
        'transactionDetails',
        JSON.stringify({
          package_id: item.package_id,
          user_id: userDetails.user_id,
          amount: item.price,
          transaction_id,
          payment_date: new Date(Date.now() + 5.5 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
        })
      );

      // Navigate to payment screen with query parameters
      navigate(`/payment?packageTitle=${encodeURIComponent(item.title)}&amount=${item.price}&paymentLink=${encodeURIComponent(upiLink)}`);
    } catch (error) {
      alert('Failed to initiate payment. Please try again.');
    }
  };

  // === After hooks, conditional returns ===
  if (!accessToken) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 p-6">
        <p className="text-lg mb-4 text-gray-800 dark:text-white">
          You are not logged in. Please log in to view available packages.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-3 flex items-center justify-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-white">Loading...</p>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-3 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Packs</h2>
        <p className="text-base text-gray-800 dark:text-white">No packages are available right now. Please check back later!</p>
      </div>
    );
  }

  // === Main render ===
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-3">
      {/* Header */}
      <div className="flex justify-between items-center p-2 mb-2">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white text-center flex-1">Packs</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded ml-2">Buy Pro</button>
      </div>

      {/* Tags bar */}
      {uniqueTags.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-2 mb-3">
          <div className="flex overflow-x-auto space-x-2 no-scrollbar">
            {uniqueTags.map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-1 rounded-full border font-medium text-sm whitespace-nowrap transition flex-shrink-0 ${
                  selectedTag === tag
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Package cards */}
      <div className="flex flex-col space-y-4 pb-20">
        {filteredServices.length > 0 ? (
          filteredServices.map(item => (
            <div key={item.package_id} className="rounded-xl shadow-lg p-4 bg-white dark:bg-gray-800">
              {/* Title and subtitle */}
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center">
                  <span className="text-base font-bold text-green-600 dark:text-green-400">{item.title}</span>
                  <CheckCircle size={20} className="text-green-500 dark:text-green-400 ml-2" />
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-300">Tradedge Package</span>
              </div>

              {/* Details row */}
              <div className="flex flex-row justify-between space-x-2 mb-3">
                <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-0 py-2 text-center min-w-0">
                  <CheckCircle size={14} className="text-green-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-600 dark:text-gray-300">Min Investment</div>
                  <div className="text-xs font-bold text-gray-800 dark:text-white truncate">
                    ₹
                    {item.minimumInvestment && !isNaN(Number(item.minimumInvestment))
                      ? new Intl.NumberFormat('en-IN').format(Number(item.minimumInvestment))
                      : 'N/A'}
                  </div>
                </div>
                <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-0 py-2 text-center min-w-0">
                  <CheckCircle size={14} className="text-green-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-600 dark:text-gray-300">Risk Category</div>
                  <div className="text-xs font-bold text-gray-800 dark:text-white truncate">
                    {item.riskCategory || 'N/A'}
                  </div>
                </div>
                <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-0 py-2 text-center min-w-0">
                  <CheckCircle size={14} className="text-green-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-600 dark:text-gray-300">Profit Potential</div>
                  <div className="text-xs font-bold text-gray-800 dark:text-white truncate">
                    {item.profitPotential || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Expandable details */}
              {expandedPackages.has(item.package_id) && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-semibold text-gray-800 dark:text-white mb-1">What we offer:</div>
                  {Array.isArray(item.details) &&
                    item.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start mb-1">
                        <CheckCircle size={12} className="text-green-500 mr-2 mt-1" />
                        <div className="text-xs text-gray-600 dark:text-gray-300">{detail}</div>
                      </div>
                    ))}
                </div>
              )}

              {/* Open/Hide details button */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleDetails(item.package_id);
                }}
                className="w-full py-3 mt-3 rounded bg-blue-500 text-white font-semibold text-base transition"
              >
                {expandedPackages.has(item.package_id) ? 'Hide Details' : 'Open Package'}
              </button>

              {/* Action buttons */}
              <div className="flex space-x-2 mt-3">
                <AnimatedButton
                  title="Enquiry"
                  icon={<Phone size={16} className="text-white mr-2" />}
                  onPress={() => (window.location.href = 'tel:7400330785')}
                  variant="secondary"
                  className="flex-1 bg-black text-white p-2 rounded min-h-[44px]"
                />
                <AnimatedLinkButton
                  title="Buy Now"
                  onPress={() => handleBuyNow(item)}
                  className="flex-1 bg-green-600 text-white p-2 rounded min-h-[44px]"
                  icon="shopping-cart"
                  showShimmer={true}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-base text-gray-800 dark:text-white mt-4">
            No packages available for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default Packs;