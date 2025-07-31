import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useStockContext } from '../context/StockContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Phone, Info } from 'lucide-react';
import TradeNotifications from '../components/websocketserver';

const Trades = () => {
  const { packages, loading: stockLoading } = useStockContext();
  const { authData, purchasedPackagesId, transactionsLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [todaysTrades, setTodaysTrades] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('Today');
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('Trades.jsx - Purchased Packages:', purchasedPackagesId);
    console.log('Trades.jsx - Today\'s Trades:', todaysTrades);
    console.log('Trades.jsx - All Trades:', allTrades);
    console.log('Trades.jsx - StockContext Packages:', packages);
  }, [todaysTrades, allTrades, purchasedPackagesId, packages]);

  const filteredTrades = useMemo(() => {
    const trades = selectedTimeFrame === 'Today' ? todaysTrades : allTrades;
    if (purchasedPackagesId.length === 0 && !showAllTrades) {
      console.log('Trades.jsx - No purchased packages, returning empty trades');
      return [];
    }

    const today = new Date();
    return trades.filter((trade) => {
      if (!trade.package_subtype_ids || !Array.isArray(trade.package_subtype_ids)) {
        console.warn('Trades.jsx - Trade missing or invalid package_subtype_ids:', trade);
        return false;
      }

      const validUntil = new Date(trade.valid_until || trade.trade_date);
      if (validUntil < today && !showAllTrades) {
        console.log('Trades.jsx - Trade expired:', trade.stockSymbol);
        return false;
      }

      if (showAllTrades) {
        console.log('Trades.jsx - Debug: Showing all trades, bypassing filter');
        return true;
      }

      const hasValidPackage = trade.package_subtype_ids.some((id) => {
        const pkg = packages.find((p) => p.package_id === id.toString());
        const pkgNotExpired = pkg && new Date(pkg.expiry_date || pkg.expiry || today) >= today;
        const userHasPkg = purchasedPackagesId.includes(id.toString());
        return pkgNotExpired && userHasPkg;
      });

      console.log(
        'Trades.jsx - Trade:',
        trade.stockSymbol,
        '| package_subtype_ids:',
        trade.package_subtype_ids,
        '| HasValidPackage:',
        hasValidPackage
      );

      return hasValidPackage;
    });
  }, [todaysTrades, allTrades, selectedTimeFrame, purchasedPackagesId, showAllTrades, packages]);

  const getTagStyle = useCallback((riskCategory) => {
    if (riskCategory?.toUpperCase().includes('LOW')) return 'text-green-600';
    if (riskCategory?.toUpperCase().includes('MEDIUM')) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const renderTradeTip = useCallback(
    ({ item }) => {
      const profitPotential = item.targetPrice - item.entryPrice;
      const potentialLoss = item.entryPrice - item.stopLoss;

      return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold text-gray-800">{item.stockSymbol.toUpperCase()}</h3>
            <span className="text-xs text-gray-500">
              {new Date(item.trade_date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}{' '}
              1 Week
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-green-600">Profit Potential</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-green-600">₹{profitPotential.toFixed(2)}</span>
              <span className="text-sm font-semibold text-red-600 ml-2">₹{potentialLoss.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.open('tel:7400330785')}
              className="flex-1 flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
            >
              <Phone size={12} className="mr-1" /> Support
            </button>
            <button
              onClick={() =>
                navigate('/main/TradeDetailedCard', {
                  state: {
                    ...item,
                    stockName: item.stockSymbol, // Ensure stockName is passed
                  },
                })
              }
              className="flex-1 flex items-center justify-center bg-blue-500 text-white rounded-md py-2 text-xs font-semibold hover:bg-blue-600"
            >
              <Info size={12} className="mr-1" /> More Info
            </button>
          </div>
        </div>
      );
    },
    [navigate]
  );

  const handleUpdateTradeLists = useCallback((todays, all) => {
    setTodaysTrades(todays);
    setAllTrades(all);
  }, []);

  const handleNewTradeTip = useCallback((trade) => {
    console.log('Trades.jsx - New trade received:', trade);
    setTodaysTrades((prev) => {
      if (new Date(trade.trade_date).toDateString() === new Date().toDateString()) {
        return [trade, ...prev.filter((t) => t.id !== trade.id)];
      }
      return prev;
    });
    setAllTrades((prev) => [trade, ...prev.filter((t) => t.id !== trade.id)]);
  }, []);

  if (stockLoading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <span className="text-lg font-semibold text-gray-800">Loading...</span>
      </div>
    );
  }

  if (purchasedPackagesId.length === 0 && !showAllTrades) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Trading Tips</h1>
        <span className="text-lg font-semibold text-gray-800 mb-4">
          Please subscribe to a package to view trading tips.
        </span>
        <button
          onClick={() => navigate('/main/PackageSelection')}
          className="flex items-center justify-center bg-blue-500 text-white rounded-md py-2 px-4 text-sm font-semibold hover:bg-blue-600"
        >
          View Packages
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100  pt-20 p-4">
      <div className="bg-white rounded-lg p-4 shadow-md flex items-center justify-between  mb-4">
        <h2 className="text-lg font-bold text-gray-800">Trade Notifications</h2>
        <div className="flex items-center px-3 py-1.5 rounded-full bg-green-100">
          <span className="w-2.5 h-2.5 rounded-full mr-2 bg-green-600"></span>
          <span className="text-sm font-semibold text-green-700">Connected</span>
        </div>
      </div>
      
      <TradeNotifications
        key={refreshKey}
        phoneNumber={authData?.whatsapp_number || authData?.user_email_id}
        onUpdateTradeLists={handleUpdateTradeLists}
        onNewTradeTip={handleNewTradeTip}
        pusherKey="ce530c8474b3ed1e6efd"
        cluster="mt1"
        channel="notifications-all"
      />
      {filteredTrades.length === 0 ? (
        <div className="text-center p-4">
          <span className="text-lg font-semibold text-gray-600">
            No trades available for your subscribed packages.
          </span>
        </div>
      ) : (
        filteredTrades.map((item, index) => (
          <div key={item.id || `${item.stockSymbol}-${item.trade_date}-${index}`}>
            {renderTradeTip({ item })}
          </div>
        ))
      )}
    </div>
  );
};

export default Trades;