import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStockContext } from '../context/StockContext'; // ✅ Correct usage of custom context

// Heroicons
import {
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid';

export default function Tradedetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { packages } = useStockContext();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const package_id = searchParams.get('package_id');
  const [trade, setTrade] = useState(null);

  // ✅ Simulated: Replace with real AuthContext if needed
  const purchasedPackagesId = [];

  useEffect(() => {
    const selected = packages.find((pkg) => pkg.package_id?.toString() === package_id?.toString());
    setTrade(selected || null);
  }, [packages, package_id]);

  const isRefundOffer = package_id === '10000';

  const refundOfferData = {
    package_id: '10000',
    title: 'Refund offer',
    price: '10000',
    details: [
      'Profit Guarantee',
      'Refund if no profit',
      'If we fail to generate at least one profitable trade in 7 days period we will refund the amount.',
      'If you engage in self-trading or any other trading activity that is not part of our recommendations, we will not be responsible for providing a refund.',
    ],
    categoryTag: 'Refund',
    minimumInvestment: 'NaN',
    riskCategory: 'Low',
    profitPotential: '10-20% p.a.',
  };

  const getISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().slice(0, 19).replace('T', ' ');
  };

  const getTagStyle = (riskCategory) => {
    if (riskCategory.includes('Low')) return { borderColor: 'text-green-600', Icon: CheckCircleIcon };
    return { borderColor: 'text-red-600', Icon: ExclamationCircleIcon };
  };

  const handlePayment = async () => {
    const transaction_id = `TXN_${Date.now()}`;
    const payment_date = getISTDate();

    try {
      setIsRedirecting(true);
      const response = await axios.post('https://tradedge-server.onrender.com/api/paymentURL', {
        redirectUrl: `http://localhost:49000/paymentResult`,
        amount: Number(isRefundOffer ? refundOfferData.price : trade.price),
        user_id: null, // Replace with actual user_id
        package_id,
        transaction_id,
        payment_date,
      });

      window.location.href = response.data.redirectUrl;
    } catch (error) {
      alert('Failed to redirect to payment.');
    } finally {
      setIsRedirecting(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Redirecting...
      </div>
    );
  }

  if (!trade && !isRefundOffer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Trade not found
      </div>
    );
  }

  const selectedTrade = isRefundOffer ? refundOfferData : trade;

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold">{selectedTrade.categoryTag}</h1>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-500 text-white p-5 rounded-xl shadow flex items-center justify-between">
          <h2 className="text-xl font-bold">{selectedTrade.title}</h2>
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>

        {/* Trade Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-xl p-4 border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">Min Investment</p>
            <p className="font-semibold">
              ₹{' '}
              {selectedTrade.minimumInvestment && selectedTrade.minimumInvestment !== 'NaN'
                ? Number(selectedTrade.minimumInvestment).toLocaleString('en-IN')
                : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Risk Category</p>
            <div className="flex items-center justify-center gap-2">
              {(() => {
                const { Icon, borderColor } = getTagStyle(selectedTrade.riskCategory);
                return <Icon className={`w-5 h-5 ${borderColor}`} />;
              })()}
              <span className={`${getTagStyle(selectedTrade.riskCategory).borderColor} font-semibold`}>
                {selectedTrade.riskCategory || 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Profit Potential</p>
            <p className="font-semibold">{selectedTrade.profitPotential || 'N/A'}</p>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Pricing</h3>
          <p className="text-xl font-bold">
            ₹ {selectedTrade.price ? Number(selectedTrade.price).toLocaleString('en-IN') : 'Contact for pricing'}
          </p>
        </div>

        {/* Offer Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">What we offer</h3>
          <ul className="space-y-2">
            {selectedTrade.details.map((detail, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-600" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-4 space-y-6 pb-24">
        {isRefundOffer || (trade && purchasedPackagesId.includes(package_id)) ? (
          <div className="bg-green-100 text-green-700 font-semibold text-center py-3 rounded-lg">
            Subscribed
          </div>
        ) : (
          <button
            onClick={handlePayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-150"
          >
            Subscribe
          </button>
        )}
      </div>
    </div>
  );
}
