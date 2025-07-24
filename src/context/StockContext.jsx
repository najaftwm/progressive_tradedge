// Converted StockContext.jsx (from TypeScript to JSX)
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

import { AuthContext } from './AuthContext';

const StockContext = createContext(undefined);

export const StockProvider = ({ children }) => {
  const [NSEData, setNSEData] = useState([]);
  const [BSEData, setBSEData] = useState([]);
  const [marketIndices, setMarketIndices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [optionTabIndex, setOptionTabIndex] = useState(0);

  const CACHE_DURATION = 5 * 60 * 1000;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  // Use AuthContext to get access_token
  const { authData } = useContext(AuthContext);

  const packageCategories = useMemo(() => {
    const unique = [...new Set(packages.map(pkg => pkg.type_name))];
    return unique;
  }, [packages]);

  const updateNSEData = useCallback((data) => {
    setNSEData(data);
  }, []);

  const updateBSEData = useCallback((data) => {
    setBSEData(data);
  }, []);

  const updateMarketIndices = useCallback((data) => {
    setMarketIndices(data);
  }, []);

  const getIconForCategory = useCallback((category) => {
    switch (category) {
      case 'Equity': return 'trending-up';
      case 'Stock Option': return 'tune';
      case 'Stock Future': return 'bar-chart';
      case 'Index Option': return 'tune';
      case 'Index Future': return 'bar-chart';
      case 'Swing Trading': return 'trending-up';
      case 'TWM Package (All In One)': return 'star';
      case 'MCX Commodities': return 'diamond';
      case 'Forex': return 'currency-exchange';
      case 'International Club Commodities': return 'public';
      default: return 'info';
    }
  }, []);

  const getNSEBSEStocks = useCallback(async (stock) => {
    let attempts = 0;
    while (attempts < MAX_RETRIES) {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://indian-stock-exchange-api2.p.rapidapi.com/${stock}_most_active`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-key': process.env.REACT_APP_RAPID_API_KEY || '',
              'x-rapidapi-host': 'indian-stock-exchange-api2.p.rapidapi.com',
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const formattedData = data.map((stock) => ({
          ticker: stock.ticker,
          price: stock.price,
          netChange: stock.net_change,
          percentChange: stock.percent_change,
          high: stock.high,
          low: stock.low,
        }));

        if (stock === 'NSE') {
          updateNSEData(formattedData);
          localStorage.setItem('NSEData', JSON.stringify(formattedData));
        } else {
          updateBSEData(formattedData);
          localStorage.setItem('BSEData', JSON.stringify(formattedData));
        }

        return;
      } catch (err) {
        attempts++;
        if (attempts === MAX_RETRIES) {
          setError(`Failed to fetch ${stock} data`);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
      } finally {
        setLoading(false);
      }
    }
  }, [updateNSEData, updateBSEData]);

  // In StockContext.jsx, within fetchPackages
const fetchPackages = useCallback(async (forceRefresh = false) => {
  const cacheKey = 'cachedPackages';
  const cacheTimeKey = 'cachedPackagesTime';

  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);
      if (cached && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
        const data = JSON.parse(cached);
        setPackages(data);
        return;
      }
    } catch {}
  }

  try {
      // Prefer token from AuthContext, fallback to localStorage
      let token = authData?.access_token;
      if (!token) {
        const storedData = localStorage.getItem('authData');
        token = storedData ? JSON.parse(storedData).access_token : null;
      }
      console.log('Access token:', token ? 'Present' : 'Missing');
      if (!token) throw new Error('No token');

      const response = await fetch('https://gateway.twmresearchalert.com/package', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('API response:', data);

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid package data format');
      }

      const transformed = data.data.flatMap((type) => {
        return type.subtypes.map((subtype) => ({
          type_id: type.type_id || '',
          type_name: type.type_name || '',
          package_id: subtype.subtype_id || '',
          title: subtype.subtype_name || 'Unnamed',
          price: subtype.price?.toString() || 'N/A',
          details: Array.isArray(subtype.details) ? subtype.details : ['No details'],
          categoryTag: type.type_name || 'Uncategorized',
          icon: getIconForCategory(type.type_name),
          riskCategory: subtype.riskCategory || 'N/A',
          minimumInvestment: subtype.minimumInvestment || 'N/A',
          profitPotential: '15-25% p.a.',
        }));
      });

    // Add refund offer package
    transformed.push({
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
      icon: 'star',
      profitPotential: '10-20% p.a.',
    });

    setPackages(transformed);
    const now = Date.now();
    localStorage.setItem(cacheKey, JSON.stringify(transformed));
    localStorage.setItem(cacheTimeKey, now.toString());
    setLastFetchTime(now);
  } catch (err) {
    setError('Failed to fetch packages');
  } finally {
    setLoading(false);
  }
}, [getIconForCategory]);

  const fetchAllData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        getNSEBSEStocks('NSE'),
        getNSEBSEStocks('BSE'),
        fetchPackages(forceRefresh),
      ]);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [getNSEBSEStocks, fetchPackages]);

  useEffect(() => {
    const init = async () => {
      try {
        const cachedNSE = localStorage.getItem('NSEData');
        const cachedBSE = localStorage.getItem('BSEData');
        const cachedPackages = localStorage.getItem('cachedPackages');
        const cachedPackagesTime = localStorage.getItem('cachedPackagesTime');

        if (cachedNSE) setNSEData(JSON.parse(cachedNSE));
        if (cachedBSE) setBSEData(JSON.parse(cachedBSE));
        if (cachedPackages && cachedPackagesTime) {
          const time = parseInt(cachedPackagesTime);
          if (Date.now() - time < CACHE_DURATION) {
            setPackages(JSON.parse(cachedPackages));
            setLastFetchTime(time);
          }
        }
      } catch {}

      fetchAllData();
    };
    init();
  }, [fetchAllData]);

  const value = useMemo(() => ({
    NSEData,
    BSEData,
    marketIndices,
    packages,
    loading,
    error,
    updateNSEData,
    updateBSEData,
    updateMarketIndices,
    getNSEBSEStocks,
    fetchAllData,
    fetchPackages,
    lastFetchTime,
    optionTabIndex,
    setOptionTabIndex,
    packageCategories,
  }), [NSEData, BSEData, marketIndices, packages, loading, error, updateNSEData, updateBSEData, updateMarketIndices, getNSEBSEStocks, fetchAllData, fetchPackages, lastFetchTime, optionTabIndex, packageCategories]);

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
};
