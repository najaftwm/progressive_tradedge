import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useStockContext } from '../context/StockContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Phone, Info, CheckCircle, AlertCircle } from 'lucide-react';
import TradeNotifications from '../components/websocketserver';

const Trades = () => {
  const { packages, loading } = useStockContext();
  const { authData } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const [todaysTrades, setTodaysTrades] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('Today');

  const getTagStyle = useCallback((riskCategory) => {
    if (riskCategory?.includes('Low')) return { color: 'text-green-500', icon: CheckCircle };
    return { color: 'text-red-500', icon: AlertCircle };
  }, []);

  const renderTradeTip = useCallback(({ item }) => {
    const TagIcon = getTagStyle(item.riskLevel).icon;
    return (
      <div className="bg-white rounded-xl mb-3.5 border border-gray-200 shadow-lg">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">{item.stockName.toUpperCase()}</h3>
              <div className="flex items-center">
                <span className="text-xs text-gray-600 opacity-70">
                  {new Date(item.timestamp).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-xs text-gray-600 opacity-70 ml-2">{item.timeFrame}</span>
              </div>
            </div>
            <span className="text-lg font-bold text-gray-800">₹ {item.entryPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 text-center">
              <span className="text-xs text-gray-600 opacity-80">Profit Potential</span>
              <span className="text-lg font-bold text-green-500">{item.prediction.potentialProfit}%</span>
            </div>
            <div className="flex-1 text-center">
              <span className="text-lg font-bold text-gray-800">₹ {item.targetPrice.toFixed(2)}</span>
            </div>
            <div className="flex-1 text-center">
              <span className="text-lg font-bold text-red-500">₹ {item.stopLoss.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center h-12">
            <div className="flex w-full">
              <button
                onClick={() => window.open('tel:7400330785')}
                className="flex-1 flex items-center justify-center mr-1.5 border border-gray-800 bg-white rounded-l-md py-1 text-sm font-semibold text-gray-800"
              >
                <Phone size={12} className="mr-1" /> Support
              </button>
              <button
                onClick={() => {
                  navigate('/main/TradeDetailedCard', { state: { ...item, ...item.prediction } });
                }}
                className="flex-1 flex items-center justify-center rounded-r-md bg-blue-500 text-white py-1 text-sm font-bold"
              >
                <Info size={14} className="mr-1" /> More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [getTagStyle, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <span className="text-lg font-semibold text-gray-800">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-2.5">
        <h1 className="text-xl font-semibold text-center text-gray-800">Trading Tips</h1>

        <TradeNotifications
          phoneNumber={authData?.user_email_id}
          onUpdateTradeLists={(_, all) => {
            const today = new Date();
            const isSameDay = (d1, d2) =>
              d1.getDate() === d2.getDate() &&
              d1.getMonth() === d2.getMonth() &&
              d1.getFullYear() === d2.getFullYear();

            const todaysOnly = all.filter((trade) =>
              isSameDay(new Date(trade.timestamp), today)
            );

            setTodaysTrades(todaysOnly);
            setAllTrades(all);
          }}
        />

        <div className="mt-1.5 mb-0.5">
          <div className="flex overflow-x-auto space-x-1.5 px-2.5 pb-1.5">
            {['Today', 'All'].map((timeFrame) => (
              <button
                key={timeFrame}
                onClick={() => setSelectedTimeFrame(timeFrame)}
                className={`py-1.5 px-3.5 rounded-xl border text-sm font-medium transition-colors ${
                  selectedTimeFrame === timeFrame
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-200 text-gray-800 border-gray-300'
                }`}
              >
                {timeFrame}
              </button>
            ))}
          </div>
        </div>

        <div className="px-2.5">
          {(selectedTimeFrame === 'Today' ? todaysTrades : allTrades).map((item, index) => (
            <div key={item.id || index}>{renderTradeTip({ item })}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trades;
