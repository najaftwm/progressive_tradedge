import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../context/AuthContext';
import { useStockContext } from '../context/StockContext';
import { Phone, Info, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TradeNotifications = ({ onNewTradeTip, onUpdateTradeLists }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [fetchedTrades, setFetchedTrades] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pusherRef = useRef(null);
  const fetchTradesRef = useRef(false);

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

  // Request permission for browser notifications
  useEffect(() => {
    console.log('Checking notification permission:', Notification.permission);
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        console.log('Notification permission status:', perm);
        if (perm !== 'granted') {
          setError('Notification permission denied. Enable notifications in your browser settings.');
        }
      });
    }
  }, []);

  // Manual test notification
  const sendTestNotification = () => {
    console.log('Triggering test notification');
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification('🔔 Test Notification', {
          body: 'If you see this, browser notifications are working.',
          icon: '/trade-icon.png',
        });
        notif.onshow = () => console.log('✅ Test notification displayed');
        notif.onerror = (e) => console.error('❌ Test notification error:', e);
        notif.onclick = () => {
          console.log('Test notification clicked');
          window.focus();
        };
      } catch (err) {
        console.error('❌ Test notification creation failed:', err);
        setError('Failed to create test notification.');
      }
    } else {
      console.warn('⚠️ Notification permission not granted');
      setError('Notification permission not granted. Please enable notifications.');
    }
  };

  // Fetch existing trades
  useEffect(() => {
    if (fetchTradesRef.current || !authData?.access_token) return;
    fetchTradesRef.current = true;

    const fetchTrades = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching trades with auth token:', authData?.access_token);
        const response = await fetch('https://gateway.twmresearchalert.com/trades?type=all', {
          headers: {
            Authorization: `Bearer ${authData?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const raw = await response.json();
        console.log('Raw API response:', JSON.stringify(raw, null, 2));

        const trades = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.trades)
          ? raw.trades
          : [];

        if (trades.length === 0) {
          console.warn('No trades found in API response');
          setError('No trades available from the server.');
        }

        const formattedTrades = trades.map((t) => ({
          id: String(t.trade_id || `generated_${Date.now()}`),
          stockSymbol: t.stock_symbol || 'UNKNOWN',
          stockName: t.stock_symbol || 'UNKNOWN',
          entryPrice: Number(t.entry_price || 0),
          targetPrice: Number(t.target_price || 0),
          stopLoss: Number(t.stop_loss || 0),
          timeFrame: t.time_frame || '1 Week',
          analysis: t.description || '',
          riskLevel: t.risk_level || 'Medium',
          recommendedInvestment: Number(t.recommended_investment || 50000),
          createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
          confidence: Number(t.confidence || 70),
          potentialProfit: Number(t.potential_profit || 5),
          potentialLoss: Number(t.potential_loss || 2),
          type: t.trade_type || 'buy',
          supportNumber: t.support_number || '9876543210',
        }));

        console.log('Formatted trades:', JSON.stringify(formattedTrades, null, 2));

        setFetchedTrades(formattedTrades);
        if (typeof onUpdateTradeLists === 'function') {
          const todaysTrades = formattedTrades.filter((trade) => isToday(trade.createdAt));
          onUpdateTradeLists(todaysTrades, formattedTrades);
        }
      } catch (error) {
        console.error('Failed to fetch trades:', error);
        setError(`Failed to fetch trades: ${error.message}`);
      } finally {
        setIsLoading(false);
        fetchTradesRef.current = false;
      }
    };

    fetchTrades();
  }, [authData, onUpdateTradeLists]);

  // Real-time updates with Pusher
  useEffect(() => {
    console.log('Initializing Pusher');
    pusherRef.current = new Pusher('ce530c8474b3ed1e6efd', {
      cluster: 'mt1',
      forceTLS: true,
      activityTimeout: 60000,
    });

    let retryCount = 0;
    const maxRetries = 5;

    const channel = pusherRef.current.subscribe('trade-channel');

    // Log all Pusher events for debugging
    channel.bind_global((event, data) => {
      console.log('Pusher event received:', { event, data: JSON.stringify(data, null, 2) });
    });

    channel.bind('new-trade', (data) => {
      console.log('📩 Received new trade from Pusher:', JSON.stringify(data, null, 2));

      const newTrade = {
        id: String(data.trade_id || `generated_${Date.now()}`),
        stockSymbol: data.stock_symbol || 'TEST',
        stockName: data.stock_symbol || 'TEST',
        entryPrice: Number(data.entry_price || 0),
        targetPrice: Number(data.target_price || 0),
        stopLoss: Number(data.stop_loss || 0),
        timeFrame: data.time_frame || '1 Week',
        analysis: data.description || '',
        riskLevel: data.risk_level || 'Medium',
        recommendedInvestment: Number(data.recommended_investment || 50000),
        createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
        confidence: Number(data.confidence || 70),
        potentialProfit: Number(data.potential_profit || 5),
        potentialLoss: Number(data.potential_loss || 2),
        type: data.trade_type || 'buy',
        supportNumber: data.support_number || '9876543210',
      };

      console.log('Formatted new trade:', JSON.stringify(newTrade, null, 2));

      setFetchedTrades((prev) => {
        const exists = prev.some((trade) => trade.id === newTrade.id);
        return exists ? prev : [newTrade, ...prev];
      });
      addLiveTrade?.(newTrade);

      // Show browser notification
      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification(`📈 New Trade: ${newTrade.stockSymbol}`, {
            body: `Entry: ₹${newTrade.entryPrice} | Target: ₹${newTrade.targetPrice} | SL: ₹${newTrade.stopLoss}`,
            icon: '/trade-icon.png',
          });

          notif.onshow = () => console.log('✅ Trade notification displayed');
          notif.onerror = (e) => console.error('❌ Trade notification error:', e);
          notif.onclick = () => {
            console.log('Trade notification clicked');
            window.focus();
            navigate('/main/TradeDetailedCard', { state: { ...newTrade } });
          };
        } catch (err) {
          console.error('❌ Trade notification creation failed:', err);
          setError('Failed to create trade notification.');
        }
      } else {
        console.warn('⚠️ Notification permission not granted');
        setError('Notification permission not granted for trade alerts.');
      }

      if (typeof onNewTradeTip === 'function') {
        onNewTradeTip(newTrade);
      }
    });

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to trade-channel');
      setIsConnected(true);
      retryCount = 0;
    });

    channel.bind('pusher:subscription_error', (data) => {
      console.error('Subscription error:', data);
      setIsConnected(false);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying Pusher subscription (${retryCount}/${maxRetries})`);
        setTimeout(() => pusherRef.current.subscribe('trade-channel'), 5000 * retryCount);
      } else {
        setError('Failed to subscribe to Pusher channel after retries.');
      }
    });

    pusherRef.current.connection.bind('connected', () => {
      console.log('Connected to Pusher');
      setIsConnected(true);
    });

    pusherRef.current.connection.bind('disconnected', () => {
      console.log('Disconnected from Pusher');
      setIsConnected(false);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying Pusher connection (${retryCount}/${maxRetries})`);
        setTimeout(() => pusherRef.current.connect(), 5000 * retryCount);
      } else {
        setError('Pusher connection lost after retries.');
      }
    });

    pusherRef.current.connection.bind('error', (err) => {
      console.error('Pusher connection error:', err);
      setIsConnected(false);
      setError('Pusher connection error occurred.');
    });

    return () => {
      console.log('Cleaning up Pusher');
      channel.unbind_all();
      channel.unsubscribe();
      pusherRef.current.disconnect();
      setIsConnected(false);
    };
  }, [addLiveTrade, onNewTradeTip]);

  const filteredTrades =
    filter === 'Today'
      ? fetchedTrades.filter((trade) => isToday(trade.createdAt))
      : fetchedTrades;

  return (
    <div className="p-3">
      {/* Connection Status */}
      

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm mb-2">
          <span>Error: {error}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-gray-600 text-sm mb-2">
          <span>Loading trades...</span>
        </div>
      )}

      {/* Test Notification Button */}
      

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
          <p className="text-center text-gray-500 text-sm py-6">
            {isLoading ? 'Loading...' : error ? 'Error loading trades' : 'No trades available'}
          </p>
        ) : (
          filteredTrades.map((trade) => (
            <div
              key={trade.id}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col space-y-2 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">{trade.stockSymbol}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(trade.createdAt).toLocaleDateString()} • {trade.timeFrame}
                  </p>
                </div>
                <span className="text-gray-800 font-bold">₹ {trade.entryPrice}</span>
              </div>

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

              <div className="flex justify-between mt-2">
                <button
                  onClick={() => (window.location.href = `tel:${trade.supportNumber}`)}
                  className="flex items-center px-4 py-2 border rounded-md text-black hover:bg-gray-100"
                >
                  <Phone className="w-4 h-4 mr-2" /> Support
                </button>
                <button
                  onClick={() =>
                    navigate('/main/TradeDetailedCard', { state: { ...trade } })
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