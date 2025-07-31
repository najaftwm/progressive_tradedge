// src/pages/Stocks.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaTimes, FaExclamationCircle } from 'react-icons/fa';

export default function Stocks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [exchangePrices, setExchangePrices] = useState({ nse: '-', bse: '-', nifty: '-' });

  // Mock stock list to replace NSEData and BSEData
  const mockStocks = [
    { ticker: 'RELIANCE.NS', name: 'Reliance Industries' },
    { ticker: 'RELIANCE.BO', name: 'Reliance Industries' },
    { ticker: 'TCS.NS', name: 'Tata Consultancy Services' },
    { ticker: 'TCS.BO', name: 'Tata Consultancy Services' },
    { ticker: 'INFY.NS', name: 'Infosys' },
    { ticker: 'INFY.BO', name: 'Infosys' },
    { ticker: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { ticker: 'HDFCBANK.BO', name: 'HDFC Bank' },
  ];

  // Format number with commas
  const formatNumber = (num) => {
    if (!num || isNaN(Number(num))) return '-';
    return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Fetch live price
  const fetchLivePrice = async (symbol) => {
    try {
      const res = await fetch(`https://harshikapatil13.pythonanywhere.com/stock/live?ticker=${symbol}`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.livePrice === 'number' || typeof data.livePrice === 'string') {
          return `${data.livePrice}`;
        }
      }
    } catch (e) {}
    return '-';
  };

  // Fetch exchange prices
  const fetchExchangePrices = async (baseSymbol) => {
    const nseSymbol = baseSymbol.endsWith('.NS') ? baseSymbol : baseSymbol + '.NS';
    const bseSymbol = baseSymbol.endsWith('.BO') ? baseSymbol : baseSymbol + '.BO';
    const niftySymbol = '^NSEI';
    setExchangePrices({ nse: '-', bse: '-', nifty: '-' });
    const [nse, bse, nifty] = await Promise.all([
      fetchLivePrice(nseSymbol),
      fetchLivePrice(bseSymbol),
      fetchLivePrice(niftySymbol),
    ]);
    setExchangePrices({ nse, bse, nifty });
  };

  // Simplified fuzzy search
  const getFuzzyMatches = (query, stocks, maxResults = 5) => {
    if (!query) return [];
    const q = query.toUpperCase().trim();
    const scored = stocks
      .map((stock) => {
        const ticker = stock.ticker.toUpperCase();
        const name = stock.name.toUpperCase();
        let score = 100;
        if (ticker === q || name === q) score = 0;
        else if (ticker.startsWith(q) || name.startsWith(q)) score = 1;
        else if (ticker.includes(q) || name.includes(q)) score = 2;
        return { ...stock, score };
      })
      .filter((stock) => stock.score < 3)
      .sort((a, b) => a.score - b.score)
      .slice(0, maxResults);
    return scored;
  };

  // Handle search
  const handleSearch = async () => {
    const clearErrorAfterDelay = (message) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    };

    if (!searchQuery.trim()) {
      setShowPrompt(true);
      clearErrorAfterDelay('Please enter a stock symbol');
      return;
    }

    setShowPrompt(false);
    setLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      let symbol = searchQuery.trim().toUpperCase();
      let found = false;

      // Check mock stock list
      const stockMatch = mockStocks.find(
        (s) => s.ticker.toUpperCase() === symbol || s.ticker.toUpperCase() === symbol + '.NS' || s.ticker.toUpperCase() === symbol + '.BO'
      );

      if (stockMatch) {
        symbol = stockMatch.ticker;
        found = true;
      } else {
        // Try appending .NS or .BO
        for (const suffix of ['.NS', '.BO']) {
          const trySymbol = symbol + suffix;
          const match = mockStocks.find((s) => s.ticker.toUpperCase() === trySymbol);
          if (match) {
            symbol = match.ticker;
            found = true;
            break;
          }
        }
      }

      // If no match, try fuzzy search
      if (!found) {
        const matches = getFuzzyMatches(searchQuery, mockStocks);
        if (matches.length > 0) {
          setSuggestions(matches);
          setShowSuggestions(true);
          setLoading(false);
          return;
        } else {
          // Try API directly
          for (const suffix of ['.NS', '.BO']) {
            const trySymbol = symbol + suffix;
            const res = await fetch(`https://harshikapatil13.pythonanywhere.com/stock/live?ticker=${trySymbol}`);
            if (res.ok) {
              symbol = trySymbol;
              found = true;
              break;
            }
          }
          if (!found) {
            clearErrorAfterDelay('Stock not found. Please check the symbol.');
            setLoading(false);
            return;
          }
        }
      }

      // Check for index keywords
      const indexKeywords = ['NIFTY', 'NIFTY 50', '^NSEI', 'SENSEX', 'BANKNIFTY', 'BANK NIFTY'];
      if (indexKeywords.includes(symbol)) {
        const response = await fetch('https://harshikapatil13.pythonanywhere.com/stock/indices');
        if (!response.ok) {
          clearErrorAfterDelay(`HTTP error! status: ${response.status}`);
          setLoading(false);
          return;
        }
        const indices = await response.json();
        const match = indices.find(
          (idx) => idx.symbol?.toUpperCase() === symbol || idx.name?.toUpperCase().includes(symbol)
        );
        if (!match) {
          clearErrorAfterDelay('Index not found. Please check the name.');
          setLoading(false);
          return;
        }

        const indexStockData = {
          symbol: match.symbol || symbol,
          companyName: match.name || symbol,
          sector: 'Index',
          currentPrice: match.price ?? 0,
          open: match.open ?? 0,
          high: match.high ?? 0,
          low: match.low ?? 0,
          volume: match.volume ?? 0,
          previousClose: match.prevClose ?? 0,
          change: match.change ?? 0,
          changePercent: match.changePercent ?? 0,
          marketCap: 0,
          peRatio: 0,
          eps: 0,
          dividend: 0,
          dividendYield: 0,
        };

        setStockData(indexStockData);
        setHistoricalData([]);
      } else {
        // Fetch stock data
        const response = await fetch(`https://harshikapatil13.pythonanywhere.com/stock/live?ticker=${symbol}`);
        if (!response.ok) {
          if (response.status === 404) {
            clearErrorAfterDelay('Stock not found. Please check the symbol.');
            setLoading(false);
            return;
          }
          if (response.status === 504) {
            clearErrorAfterDelay('Server timed out. Please try again later.');
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const stockDataObj = {
          symbol: symbol,
          companyName: data.name || symbol,
          sector: '',
          currentPrice: data.livePrice ?? 0,
          open: data.livePrice ?? 0,
          high: data.livePrice ?? 0,
          low: data.livePrice ?? 0,
          volume: 0,
          previousClose: data.livePrice ?? 0,
          change: 0,
          changePercent: 0,
          marketCap: 0,
          peRatio: 0,
          eps: 0,
          dividend: 0,
          dividendYield: 0,
        };

        setStockData(stockDataObj);

        // Fetch historical data
        try {
          const histRes = await fetch(`https://harshikapatil13.pythonanywhere.com/stock/historical?ticker=${symbol}`);
          if (histRes.ok) {
            const histData = await histRes.json();
            if (Array.isArray(histData)) {
              setHistoricalData(histData);
            } else {
              setHistoricalData([]);
            }
          } else {
            setHistoricalData([]);
          }
        } catch {
          setHistoricalData([]);
        }
      }

      // Fetch exchange prices
      fetchExchangePrices(symbol.replace(/\.(NS|BO)/, ''));
    } catch (e) {
      clearErrorAfterDelay(e.message || 'Failed to fetch stock data');
      setStockData(null);
      setHistoricalData([]);
    } finally {
      setLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setStockData(null);
    setHistoricalData([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setShowPrompt(true);
    setExchangePrices({ nse: '-', bse: '-', nifty: '-' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 pt-20 ">
      <div className="max-w-xl mx-auto">
        {/* Search Bar */}
        <div className="flex gap-2 items-center mb-6">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter stock symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-md"
          >
            <FaSearch />
          </button>
          {stockData && (
            <button
              onClick={clearSearch}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg shadow-md"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Prompt */}
        {showPrompt && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-500 dark:text-gray-400 mb-4"
          >
            Please enter a stock name or symbol to begin your search.
          </motion.p>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-red-500 text-white p-4 rounded-lg mb-4 flex items-center gap-2"
          >
            <FaExclamationCircle />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {/* Stock Data Card */}
        {stockData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-center mb-4">{stockData.companyName}</h2>
            <div className="flex justify-between items-center">
              <motion.div
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                className="text-2xl font-bold text-blue-600"
              >
                ₹{formatNumber(stockData.currentPrice)}
              </motion.div>
              <div
                className={`px-4 py-2 rounded-lg ${
                  stockData.change >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                }`}
              >
                <span
                  className={`text-lg font-bold ${
                    stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stockData.change >= 0 ? '▲' : '▼'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-blue-600 text-sm">Open</p>
                <p className="text-blue-600 font-semibold text-lg">₹{formatNumber(stockData.open)}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-green-600 text-sm">High</p>
                <p className="text-green-600 font-semibold text-lg">₹{formatNumber(stockData.high)}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <p className="text-red-600 text-sm">Low</p>
                <p className="text-red-600 font-semibold text-lg">₹{formatNumber(stockData.low)}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 text-sm">Volume</p>
                <p className="font-semibold text-lg">{formatNumber(stockData.volume)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exchanges Card */}
        {stockData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">Exchanges</h3>
            <div className="space-y-4">
              {[
                { label: 'NSE', price: exchangePrices.nse, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                { label: 'BSE', price: exchangePrices.bse, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                { label: 'NIFTY 50', price: exchangePrices.nifty, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              ].map(({ label, price, color, bg }) => (
                <div
                  key={label}
                  className={`flex justify-between items-center ${bg} rounded-lg p-3`}
                >
                  <span className={`capitalize font-semibold w-24 ${color}`}>{label}</span>
                  {price === '-' ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-lg font-bold">₹{formatNumber(price)}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Historical Data */}
        {stockData && historicalData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">Historical Data (Last 7 Days)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    {['Date', 'Open', 'High', 'Low', 'Close', 'Volume'].map((header) => (
                      <th
                        key={header}
                        className="px-2 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historicalData.slice(-7).map((item, idx) => (
                    <tr key={idx} className="border border-gray-300 dark:border-gray-700">
                      <td className="px-2 py-2 text-sm text-gray-900 dark:text-white">{item.date || '-'}</td>
                      <td className="px-2 py-2 text-sm text-gray-900 dark:text-white">₹{formatNumber(item.open)}</td>
                      <td className="px-2 py-2 text-sm text-gray-900 dark:text-white">₹{formatNumber(item.high)}</td>
                      <td className="px-2 py-2 text-sm text-gray-900 dark:text-white">₹{formatNumber(item.low)}</td>
                      <td className="px-2 py-2 text-sm text-blue-600 font-semibold">₹{formatNumber(item.close)}</td>
                      <td className="px-2 py-2 text-sm text-gray-900 dark:text-white">{formatNumber(item.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Suggestions Modal */}
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-md max-h-[70vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Did you mean:</h3>
              {suggestions.map((item, idx) => (
                <div
                  key={item.ticker + idx}
                  className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setSearchQuery(item.ticker);
                    setShowSuggestions(false);
                    setTimeout(() => handleSearch(), 100);
                  }}
                >
                  <p className="text-blue-600 font-semibold">{item.ticker}</p>
                  <p className="text-gray-700 dark:text-gray-300">{item.name}</p>
                </div>
              ))}
              <button
                onClick={() => setShowSuggestions(false)}
                className="mt-4 text-red-600 font-semibold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}