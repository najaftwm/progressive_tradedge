import React, { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../context/AuthContext';
import { useStockContext } from '../context/StockContext';
import { Phone, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TradeNotifications = ({ onNewTradeTip, existingTradeTips = [], onUpdateTradeLists, phoneNumber }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [fetchedTrades, setFetchedTrades] = useState([]);
  const [filter, setFilter] = useState('All');

  const { authData } = useAuth();
  const { addLiveTrade } = useStockContext();
  const navigate = useNavigate();

  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch('https://gateway.twmresearchalert.com/trades?type=all', {
          headers: {
            Authorization: `Bearer ${authData?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const raw = await response.json();
        let trades = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.trades)
          ? raw.trades
          : [];

        const formattedTrades = trades.map((t) => ({
          id: String(t.trade_id),
          stockSymbol: t.stock_symbol,
          stockName: t.stock_symbol,
          entryPrice: Number(t.entry_price || 0),
          targetPrice: Number(t.target_price || 0),
          stopLoss: Number(t.stop_loss || 0),
          timeFrame: t.time_frame || '1 Week',
          analysis: t.description || '',
          riskLevel: t.risk_level || 'Medium',
          recommendedInvestment: Number(t.recommended_investment || 50000),
          createdAt: t.created_at || Date.now(),
          confidence: Number(t.confidence || 70),
          potentialProfit: Number(t.potential_profit || 5),
          potentialLoss: Number(t.potential_loss || 2),
          type: t.trade_type,
          supportNumber: t.support_number || '9876543210',
        }));

        setFetchedTrades(formattedTrades);
      } catch (error) {
        console.error('❌ Failed to fetch trades:', error);
      }
    };

    fetchTrades();
  }, [authData]);

  const filteredTrades =
    filter === 'Today'
      ? fetchedTrades.filter((trade) => isToday(trade.createdAt))
      : fetchedTrades;

  return (
    <div className="p-3">
      {/* Filter Buttons */}
      <div className="flex space-x-2 mt-3">
        <button
          onClick={() => setFilter('Today')}
          className={`px-4 py-2 rounded-full border transition-all ${
            filter === 'Today' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-800'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter('All')}
          className={`px-4 py-2 rounded-full border transition-all ${
            filter === 'All' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-800'
          }`}
        >
          All
        </button>
      </div>

      {/* Trade Cards */}
      <div className="mt-3 space-y-3">
        {filteredTrades.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-6">No trades available</p>
        ) : (
          filteredTrades.map((trade) => (
            <div
              key={trade.id}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col space-y-2 hover:shadow-lg transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">{trade.stockSymbol}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(trade.createdAt).toLocaleDateString()} • {trade.timeFrame}
                  </p>
                </div>
                <span className="text-gray-800 font-bold">₹ {trade.entryPrice}</span>
              </div>

              {/* Profit Section */}
              <div>
                <p className="text-xs text-gray-500">Profit Potential</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold">{trade.potentialProfit}%</span>
                  <div className="flex space-x-4">
                    <span className="text-black font-semibold">₹ {trade.targetPrice}</span>
                    <span className="text-red-500 font-semibold">₹ {trade.stopLoss}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-2">
                {/* Support */}
                <button
                  onClick={() => (window.location.href = `tel:${trade.supportNumber}`)}
                  className="flex items-center px-4 py-2 border rounded-md text-black hover:bg-gray-100"
                >
                  <Phone className="w-4 h-4 mr-2" /> Support
                </button>

                {/* More Info */}
                <button
                  onClick={() =>
                    navigate('/main/TradeDetailedCard', {
                      state: { ...trade },
                    })
                  }
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Info className="w-4 h-4 mr-2" /> More Info
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradeNotifications;
