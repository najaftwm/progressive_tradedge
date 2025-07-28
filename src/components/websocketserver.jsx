import React, { useEffect, useState, useCallback } from 'react';
import Pusher from 'pusher-js';
import { useStockContext } from '../context/StockContext';
import { AuthContext } from '../context/AuthContext';

const TradeNotifications = ({ onNewTradeTip, existingTradeTips = [], onUpdateTradeLists, phoneNumber }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [liveTradeIds, setLiveTradeIds] = useState(new Set());
  const [fetchedTrades, setFetchedTrades] = useState([]);
  const [todaysTrades, setTodaysTrades] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [phone, setPhone] = useState('');

  const { authData } = React.useContext(AuthContext);
  const { addLiveTrade } = useStockContext();

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
        const authToken = authData?.access_token || 'your-auth-token';
        console.log('TradeNotifications.jsx - Fetching trades with token:', authToken ? 'Present' : 'Absent');

        const response = await fetch('https://gateway.twmresearchalert.com/trades?type=all', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        const raw = await response.json();
        console.log('TradeNotifications.jsx - Trades API response:', raw);
        // Log first trade to inspect fields
        if (raw.data?.length > 0) {
          console.log('TradeNotifications.jsx - First trade sample:', raw.data[0]);
        }

        let trades = [];
        if (Array.isArray(raw)) {
          trades = raw;
        } else if (Array.isArray(raw?.data)) {
          trades = raw.data;
        } else if (Array.isArray(raw?.trades)) {
          trades = raw.trades;
        } else {
          console.error('TradeNotifications.jsx - No valid array found in API response:', raw);
          return;
        }

        const formattedTrades = trades.map((t) => {
          const parsedDate = new Date(t.created_at || Date.now());
          // Try alternative field names for package_subtypes
          const packageSubtypes = t.package_subtypes || t.package_ids || t.subtypes || [];
          return {
            id: String(t.trade_id),
            stock_symbol: t.stock_symbol,
            stockName: t.stock_symbol,
            entryPrice: Number(t.entry_price || 0),
            target_price: Number(t.target_price),
            stop_loss: Number(t.stop_loss || 0),
            timeFrame: t.time_frame || '1 Week',
            prediction: {
              type: t.trade_type === 'buy' ? 'bullish' : 'bearish',
              confidence: Number(t.confidence || 70),
              potentialProfit: Number(t.potential_profit || 5),
              potentialLoss: Number(t.potential_loss || 2),
            },
            analysis: t.description || '',
            risk_level: t.risk_level || 'Medium',
            recommendedInvestment: Number(t.recommended_investment || 50000),
            timestamp: parsedDate.toISOString(),
            trade_date: parsedDate.toISOString(),
            trade_type: t.trade_type.toUpperCase(),
            package_subtype_ids: packageSubtypes?.map(String) || [],
          };
        });

        console.log('TradeNotifications.jsx - Formatted Trades:', formattedTrades);

        const isSameDay = (date1, date2) =>
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate();

        const today = new Date();
        const todaysTrades = formattedTrades.filter((trade) =>
          isSameDay(new Date(trade.trade_date), today)
        );

        setTodaysTrades(todaysTrades);
        setAllTrades(formattedTrades);

        if (typeof onUpdateTradeLists === "function") {
          console.log('TradeNotifications.jsx - Updating trade lists:', { todaysTrades, allTrades: formattedTrades });
          onUpdateTradeLists(todaysTrades, formattedTrades);
        }
      } catch (error) {
        console.error('TradeNotifications.jsx - Failed to fetch trades:', error);
      }
    };

    fetchTrades();
  }, [authData, onUpdateTradeLists]);

  const handleNewTradeNotification = useCallback(async (data) => {
    console.log('TradeNotifications.jsx - New trade notification:', data);
    const formattedTrade = {
      id: String(data.trade_id),
      stock_symbol: data.stock_symbol,
      stockName: data.stock_symbol,
      entryPrice: Number(data.entry_price || 0),
      target_price: Number(data.target_price || 0),
      stop_loss: Number(data.stop_loss || 0),
      timeFrame: data.time_frame || '1 Week',
      prediction: {
        type: data.trade_type === 'buy' ? 'bullish' : 'bearish',
        confidence: Number(data.confidence || 70),
        potentialProfit: Number(data.potential_profit || 5),
        potentialLoss: Number(data.potential_loss || 2),
      },
      analysis: data.message || '',
      risk_level: data.risk_level || 'Medium',
      recommendedInvestment: Number(data.recommended_investment || 50000),
      timestamp: data.timestamp || new Date().toISOString(),
      trade_date: data.timestamp || new Date().toISOString(),
      trade_type: data.trade_type.toUpperCase(),
      package_subtype_ids: (data.package_subtypes || data.package_ids || data.subtypes || [])?.map(String) || [],
    };

    console.log('TradeNotifications.jsx - Formatted trade:', formattedTrade);

    if (!liveTradeIds.has(formattedTrade.id)) {
      addLiveTrade?.(formattedTrade);
      onNewTradeTip?.(formattedTrade);
      setFetchedTrades((prev) => [formattedTrade, ...prev]);
      setLiveTradeIds((prev) => new Set(prev).add(formattedTrade.id));
      setTodaysTrades((prev) => isToday(formattedTrade.trade_date) ? [formattedTrade, ...prev] : prev);
      setAllTrades((prev) => [formattedTrade, ...prev]);
      if (typeof onUpdateTradeLists === "function") {
        console.log('TradeNotifications.jsx - Updating trade lists with new trade:', formattedTrade);
        onUpdateTradeLists(
          isToday(formattedTrade.trade_date) ? [formattedTrade, ...todaysTrades] : todaysTrades,
          [formattedTrade, ...allTrades]
        );
      }
    }

    const notification = {
      id: `trade_${data.trade_id}`,
      type: 'trade',
      title: 'New Trade Alert',
      message: data.message,
      timestamp: data.timestamp,
      data,
    };

    setNotifications((prev) => {
      const exists = prev.some(
        (n) => n.data?.trade_id === data.trade_id && n.type === 'trade'
      );
      return exists ? prev : [notification, ...prev];
    });

    const packageInfo =
      (data.package_subtypes || data.package_ids || data.subtypes)?.length > 0
        ? `Packages: ${(data.package_subtypes || data.package_ids || data.subtypes).join(', ')}`
        : '';

    if (Notification.permission === 'granted') {
      new Notification(`${data.stock_symbol} Trade Alert (${data.trade_type.toUpperCase()})`, {
        body: `Target: ₹${data.target_price} • ${packageInfo}`,
        data: {
          screen: 'TradeDetailedCard',
          tradeTip: {
            stockSymbol: data.stock_symbol,
            targetPrice: data.target_price,
            tradeType: data.trade_type,
            tradeId: data.trade_id,
            timestamp: data.timestamp,
            message: data.message,
          },
        },
      });
    }

    const rawPhone = phoneNumber || (authData?.userTransactions?.length ? authData.userTransactions[0]?.user?.whatsapp_number : '');
    const cleanedPhone = cleanPhoneNumber(rawPhone);

    console.log("TradeNotifications.jsx - Raw phone:", rawPhone, "| Cleaned:", cleanedPhone);

    if (cleanedPhone) {
      await sendTradeWhatsAppMessage(formattedTrade, cleanedPhone);
    } else {
      console.warn("TradeNotifications.jsx - Invalid phone number:", rawPhone);
      alert(`Cannot send WhatsApp. Invalid: ${rawPhone}`);
    }
  }, [authData, liveTradeIds, addLiveTrade, onNewTradeTip, phoneNumber, todaysTrades, allTrades, onUpdateTradeLists]);

  const handleFollowupNotification = useCallback((data) => {
    console.log('TradeNotifications.jsx - Follow-up notification:', data);
    const notification = {
      id: `followup_${data.id}_${Date.now()}`,
      type: 'followup',
      title: 'Follow-up Due',
      message: data.message,
      timestamp: data.timestamp,
      data,
    };
    setNotifications((prev) => {
      const exists = prev.some(
        (n) => n.data?.id === data.id && n.type === 'followup'
      );
      return exists ? prev : [notification, ...prev];
    });
  }, []);

  const handlePendingFollowups = useCallback((data) => {
    console.log('TradeNotifications.jsx - Pending follow-ups:', data);
    if (data.count > 0) {
      alert(`Pending Follow-ups: You have ${data.count} pending follow-ups`);
    }
  }, []);

  useEffect(() => {
    const pusher = new Pusher('ce530c8474b3ed1e6efd', { cluster: 'mt1' });
    const channel = pusher.subscribe('notifications-all');

    pusher.connection.bind('connected', () => {
      setIsConnected(true);
      console.log('TradeNotifications.jsx - Connected to Pusher');
    });

    pusher.connection.bind('disconnected', () => {
      setIsConnected(false);
      console.log('TradeNotifications.jsx - Disconnected from Pusher');
    });

    channel.bind('new-trade-notification', handleNewTradeNotification);
    channel.bind('new-notification', handleFollowupNotification);
    channel.bind('all-pending-followups', handlePendingFollowups);

    return () => {
      channel.unbind('new-trade-notification', handleNewTradeNotification);
      channel.unbind('new-notification', handleFollowupNotification);
      channel.unbind('all-pending-followups', handlePendingFollowups);
      pusher.unsubscribe('notifications-all');
      pusher.disconnect();
    };
  }, [handleNewTradeNotification, handleFollowupNotification, handlePendingFollowups]);

  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');

    if (digits.length === 12 && digits.startsWith('91')) {
      return digits;
    }

    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return `91${digits}`;
    }

    return '';
  };

  const sendTradeWhatsAppMessage = async (trade, phoneNumber) => {
    console.log("TradeNotifications.jsx - Cleaned phone number:", phoneNumber);
    console.log("TradeNotifications.jsx - Message payload:", {
      stock: trade.stock_symbol,
      target: trade.target_price,
      type: trade.prediction?.type,
    });

    try {
      const whatsappApiUrl = 'https://app2.cunnekt.com/v1/sendnotification';
      const apiKey = '3115c6ff026625317b9df24d692570ecab70ffb1';

      const messagePayload = {
        mobile: phoneNumber.replace(/^\+/, ''),
        templateid: '1207184657851670',
        parameters: {
          body: [
            { type: 'text', text: trade.stock_symbol },
            { type: 'text', text: `${trade.target_price}` },
            { type: 'text', text: `${trade.prediction?.type}` },
          ],
        },
      };

      const response = await fetch(whatsappApiUrl, {
        method: 'POST',
        headers: {
          'API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      const result = await response.json();
      console.log("TradeNotifications.jsx - WhatsApp API Response:", result);

      if (response.ok && result.status) {
        alert(`WhatsApp message sent to ${phoneNumber}`);
        return true;
      } else {
        console.error('TradeNotifications.jsx - WhatsApp message failed:', result);
        alert(`WhatsApp failed: ${result?.message || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error('TradeNotifications.jsx - Error sending WhatsApp message:', error);
      alert('Error sending WhatsApp confirmation.');
      return false;
    }
  };

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

  const renderTradeCard = ({ item }) => (
    <div className="bg-white p-4 mb-3 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold text-gray-800">{item.stock_symbol}</h3>
        <span className="text-xs text-gray-600">{formatTimestamp(item.trade_date)}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{item.analysis}</p>
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-xs text-gray-600 mb-1">Target Price: ₹{item.target_price}</p>
        <p className="text-xs text-gray-600 mb-1">Stop Loss: ₹{item.stop_loss}</p>
        <p className="text-xs text-gray-600 mb-1">Prediction: {item.prediction?.type}</p>
        <p className="text-xs text-gray-600">Risk Level: {item.risk_level}</p>
      </div>
    </div>
  );

  return (
    <div className="p-3">
      <div className="bg-white rounded-xl p-4 shadow-md flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Trade Notifications</h2>
        <div className={`flex items-center px-3 py-1.5 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
          <span className={`w-2.5 h-2.5 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className={`text-sm font-semibold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      <div className="mt-4">
        {fetchedTrades.map((item, index) => (
          <div key={item.id || index}>{renderTradeCard({ item })}</div>
        ))}
      </div>
    </div>
  );
};

export default TradeNotifications;