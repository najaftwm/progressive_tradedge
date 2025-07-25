import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

const TradeDetailedCard = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // Use useLocation to access state

  // Destructure all params from the state object
  const {
    stockSymbol,
    stockName,
    entryPrice,
    targetPrice,
    stopLoss,
    timeFrame,
    analysis,
    riskLevel,
    recommendedInvestment,
    timestamp,
    confidence,
    potentialProfit = 0,
    potentialLoss = 0,
    type: predictionType,
  } = state || {};

  // State for live stock data
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stockSymbol) return;
    setLoading(true);
    setError(null);
    fetch(`https://latest-stock-price.p.rapidapi.com/price?Indices=NSE:${stockSymbol},BSE:${stockSymbol},NSE:NIFTY%2050`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // Replace with your API key
        'X-RapidAPI-Host': 'latest-stock-price.p.rapidapi.com',
      },
    })
      .then(res => res.json())
      .then(data => {
        setLiveData(data);
      })
      .catch(err => {
        setError('Failed to fetch live stock data');
      })
      .finally(() => setLoading(false));
  }, [stockSymbol]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-3">
      <div className="w-full">
        {/* Header with Back Button and Title */}
        <div className="flex flex-col items-center mb-2">
          <div className="w-full flex justify-start">
            <button onClick={() => navigate(-1)} className="p-2">
              <ArrowLeft size={28} className="text-blue-500 dark:text-blue-400" />
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white text-center mt-2">
            {stockName?.toUpperCase() || 'Stock Details'}
          </h1>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-300 opacity-70 mb-2 text-center">{stockSymbol || 'N/A'}</p>

        {/* Live Stock Data Section */}
        <div className="mb-3">
          <h2 className="font-bold text-base text-blue-600 dark:text-blue-500 mb-1">Live Stock Data</h2>
          {loading && <div className="animate-spin h-6 w-6 border-2 border-t-blue-600 dark:border-t-blue-500 rounded-full border-t-transparent mx-auto" />}
          {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
          {liveData && Array.isArray(liveData) && (
            <div>
              {liveData.map((item, idx) => (
                <div
                  key={idx}
                  className="mb-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm"
                >
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">
                    {item.symbol} ({item.exchange || item.indexName})
                  </p>
                  <p className="text-green-500 dark:text-green-400 text-sm">Last Price: ₹ {item.lastPrice}</p>
                  <p className={`${item.pChange > 0 ? 'text-green-500' : 'text-red-500'} dark:${item.pChange > 0 ? 'text-green-400' : 'text-red-400'} text-sm`}>
                    Change: {item.pChange}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Important Details in Boxes */}
        <div className="space-y-2">
          {/* Row 1: Entry Price & Target Price */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border-2 border-blue-500 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-blue-500 dark:text-blue-400">Entry Price</p>
              <p className="text-lg font-bold text-blue-500 dark:text-blue-400">₹ {Number(entryPrice || 0).toFixed(2)}</p>
            </div>
            <div className="border-2 border-green-500 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-green-500 dark:text-green-400">Target Price</p>
              <p className="text-lg font-bold text-green-500 dark:text-green-400">₹ {Number(targetPrice || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Row 2: Stop Loss & Risk Level */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border-2 border-red-500 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-red-500 dark:text-red-400">Stop Loss</p>
              <p className="text-lg font-bold text-red-500 dark:text-red-400">₹ {Number(stopLoss || 0).toFixed(2)}</p>
            </div>
            <div className="border-2 border-yellow-500 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-yellow-500 dark:text-yellow-400">Risk Level</p>
              <p className="text-lg font-bold text-yellow-500 dark:text-yellow-400">{riskLevel || 'N/A'}</p>
            </div>
          </div>

          {/* Row 3: Confidence & Profit Potential */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border-2 border-blue-600 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-blue-600 dark:text-blue-500">Confidence</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-500">{confidence || 0}%</p>
            </div>
            <div className="border-2 border-green-500 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-green-500 dark:text-green-400">Profit Potential</p>
              <p className="text-lg font-bold text-green-500 dark:text-green-400">{potentialProfit || 0}%</p>
            </div>
          </div>

          {/* Row 4: Potential Loss & Investment */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border-2 border-red-500 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-red-500 dark:text-red-400">Potential Loss</p>
              <p className="text-lg font-bold text-red-500 dark:text-red-400">{potentialLoss || 0}%</p>
            </div>
            <div className="border-2 border-blue-500 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-blue-500 dark:text-blue-400">Investment</p>
              <p className="text-lg font-bold text-blue-500 dark:text-blue-400">₹ {recommendedInvestment || 0}</p>
            </div>
          </div>

          {/* Time Frame (Standalone) */}
          <div className="border-2 border-yellow-500 rounded-lg p-3 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/20">
            <Clock size={22} className="text-yellow-500 dark:text-yellow-400 mr-2.5" />
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-yellow-500 dark:text-yellow-400 mb-1">Time Frame</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{timeFrame || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-2.5 bg-white dark:bg-gray-800 rounded-xl p-2.5 shadow-sm">
          <Calendar size={22} className="text-blue-500 dark:text-blue-400 mr-2.5" />
          <p className="text-base font-bold text-gray-800 dark:text-white">
            Date: <span className="font-bold">{timestamp ? new Date(timestamp).toLocaleString() : 'N/A'}</span>
          </p>
        </div>

        <p className="text-lg font-bold text-gray-800 dark:text-white mt-4 mb-1">Analysis:</p>
        <p className="text-base text-gray-600 dark:text-gray-300 mb-4">{analysis || 'No analysis available'}</p>
      </div>
    </div>
  );
};

export default TradeDetailedCard;