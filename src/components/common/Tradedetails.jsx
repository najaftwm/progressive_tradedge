import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // If using React Router
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck, faChartLine, faCircleCheck, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

export default function TradeDetails({ packages, userDetails, purchasedPackagesId }) {
  const { package_id } = useParams(); // assumes route: /trade/:package_id
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    const selected = packages.find((pkg) => pkg.package_id?.toString() === package_id?.toString());
    setTrade(selected);
  }, [packages, package_id]);

  const getISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().slice(0, 19).replace('T', ' ');
  };

  const getTagStyle = (riskCategory) => {
    if (riskCategory.includes('Low')) return { borderColor: 'text-green-600', icon: faCircleCheck };
    return { borderColor: 'text-red-600', icon: faExclamationCircle };
  };

  const handlePayment = async () => {
    const transaction_id = `TXN_${Date.now()}`;
    const payment_date = getISTDate();

    try {
      setIsRedirecting(true);
      const response = await axios.post('https://tradedge-server.onrender.com/api/paymentURL', {
        redirectUrl: `http://localhost:3000/paymentResult`,
        amount: Number(trade.price),
        user_id: userDetails?.user_id,
        package_id: trade.package_id,
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
    return <div className="h-screen flex items-center justify-center text-lg font-semibold">Redirecting...</div>;
  }

  if (!trade) {
    return <div className="h-screen flex items-center justify-center text-lg font-semibold">Trade not found</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2">
          <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold">{trade.categoryTag}</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-500 text-white p-5 rounded-xl shadow flex items-center justify-between">
          <h2 className="text-xl font-bold">{trade.title}</h2>
          <FontAwesomeIcon icon={faChartLine} size="lg" />
        </div>

        {/* Trade Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-xl p-4 border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">Min Investment</p>
            <p className="font-semibold">
              ₹ {trade.minimumInvestment ? Number(trade.minimumInvestment).toLocaleString('en-IN') : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Risk Category</p>
            <div className="flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={getTagStyle(trade.riskCategory).icon} className={`${getTagStyle(trade.riskCategory).borderColor}`} />
              <span className={`${getTagStyle(trade.riskCategory).borderColor} font-semibold`}>
                {trade.riskCategory || 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Profit Potential</p>
            <p className="font-semibold">{trade.profitPotential || 'N/A'}</p>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Pricing</h3>
          <p className="text-xl font-bold">
            ₹ {trade.price ? Number(trade.price).toLocaleString('en-IN') : 'Contact for pricing'}
          </p>
        </div>

        {/* Offer Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">What we offer</h3>
          <ul className="space-y-2">
            {trade.details.map((detail, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheck} className="text-green-600" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-4 inset-x-4">
        {purchasedPackagesId.includes(trade.package_id) ? (
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
