import React, { useState, useCallback, useMemo, useContext, useEffect } from 'react';
import { useStockContext } from '../context/StockContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Phone, Info, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import TradeNotifications from '../components/websocketserver';

const Trades = () => {
  const { packages, loading: stockLoading } = useStockContext();
  const { authData, purchasedPackagesId, transactionsLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [todaysTrades, setTodaysTrades] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('Today');
  const [showAllTrades, setShowAllTrades] = useState(false); // Debug toggle
  const [refreshKey, setRefreshKey] = useState(0); // For triggering refetch

  // Log trade data for debugging
  useEffect(() => {
    console.log('Trades.jsx - Purchased Packages:', purchasedPackagesId);
    console.log('Trades.jsx - Today\'s Trades:', todaysTrades);
    console.log('Trades.jsx - All Trades:', allTrades);
    console.log('Trades.jsx - StockContext Packages:', packages);
  }, [todaysTrades, allTrades, purchasedPackagesId, packages]);

  // Filter trades based on purchased package IDs
  const filteredTrades = useMemo(() => {
    const trades = selectedTimeFrame === 'Today' ? todaysTrades : allTrades;
    if (purchasedPackagesId.length === 0) {
      console.log('Trades.jsx - No purchased packages, returning empty trades');
      return [];
    }
    if (showAllTrades) {
      console.log('Trades.jsx - Debug: Showing all trades, bypassing filter');
      return trades;
    }
    const filtered = trades.filter((trade) => {
      if (!trade.package_subtype_ids || !Array.isArray(trade.package_subtype_ids)) {
        console.warn('Trades.jsx - Trade missing or invalid package_subtype_ids:', trade);
        return true; // Include trades with empty package_subtype_ids as fallback
      }
      const hasMatch = trade.package_subtype_ids.some((id) => 
        purchasedPackagesId.includes(id.toString())
      );
      console.log('Trades.jsx - Trade:', trade.stock_symbol, 'package_subtype_ids:', trade.package_subtype_ids, 'Match:', hasMatch);
      return hasMatch;
    });
    console.log('Trades.jsx - Filtered Trades:', filtered);
    return filtered;
  }, [todaysTrades, allTrades, selectedTimeFrame, purchasedPackagesId, showAllTrades]);

  const getTagStyle = useCallback((riskCategory) => {
    if (riskCategory?.toUpperCase().includes('LOW')) return { color: 'text-green-500', icon: CheckCircle };
    return { color: 'text-red-500', icon: AlertCircle };
  }, []);

  const renderTradeTip = useCallback(({ item }) => {
    const TagIcon = getTagStyle(item.risk_level).icon;
    const packageNames = item.package_subtype_ids
      ?.map((id) => packages.find(pkg => pkg.package_id === id.toString())?.title)
      .filter(Boolean)
      .join(', ') || 'Unknown Package';
    return (
      <div className="bg-white rounded-xl mb-3.5 border border-gray-200 shadow-lg">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">{item.stock_symbol.toUpperCase()}</h3>
              <div className="flex items-center">
                <span className="text-xs text-gray-600 opacity-70">
                  {new Date(item.trade_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-xs text-gray-600 opacity-70 ml-2">[{packageNames}]</span>
              </div>
            </div>
            <span className="text-lg font-bold text-gray-800">{item.trade_type}</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 text-center">
              <span className="text-xs text-gray-600 opacity-80">Target Price</span>
              <span className="text-lg font-bold text-gray-800">₹ {item.target_price.toFixed(2)}</span>
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-gray-600 opacity-80">Stop Loss</span>
              <span className="text-lg font-bold text-red-500">₹ {item.stop_loss.toFixed(2)}</span>
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-gray-600 opacity-80">Risk Level</span>
              <span className={`text-lg font-bold ${getTagStyle(item.risk_level).color}`}>
                {item.risk_level}
              </span>
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
                  navigate('/main/TradeDetailedCard', { state: { ...item } });
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
  }, [getTagStyle, navigate, packages]);

  if (stockLoading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <span className="text-lg font-semibold text-gray-800">Loading...</span>
      </div>
    );
  }

  if (purchasedPackagesId.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-2.5">
        <h1 className="text-xl font-semibold text-center text-gray-800 mb-4">Trading Tips</h1>
        <span className="text-lg font-semibold text-gray-800 mb-4">
          Please subscribe to a package to view trading tips.
        </span>
        <button
          onClick={() => navigate('/main/PackageSelection')}
          className="flex items-center justify-center bg-blue-500 text-white rounded-md py-2 px-4 text-sm font-bold"
        >
          View Packages <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-2.5">
        <h1 className="text-xl font-semibold text-center text-gray-800">Trading Tips</h1>

        <div className="flex justify-between items-center mt-2 mb-4">
          <button
            onClick={() => setShowAllTrades(!showAllTrades)}
            className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm font-medium"
          >
            {showAllTrades ? 'Hide Unsubscribed Trades' : 'Show All Trades'}
          </button>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium"
          >
            <RefreshCw size={14} className="mr-1" /> Refresh
          </button>
        </div>

        <TradeNotifications
          key={refreshKey}
          phoneNumber={authData?.user_email_id}
          onUpdateTradeLists={(_, all) => {
            const today = new Date();
            const isSameDay = (d1, d2) =>
              d1.getDate() === d2.getDate() &&
              d1.getMonth() === d2.getMonth() &&
              d1.getFullYear() === d2.getFullYear();

            const todaysOnly = all.filter((trade) =>
              isSameDay(new Date(trade.trade_date), today)
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
          {filteredTrades.length === 0 ? (
            <span className="text-lg font-semibold text-gray-800">
              No trades available for your subscribed packages.
            </span>
          ) : (
            filteredTrades.map((item, index) => (
              <div key={item.id || `${item.stock_symbol}-${item.trade_date}-${index}`}>
                {renderTradeTip({ item })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Trades;