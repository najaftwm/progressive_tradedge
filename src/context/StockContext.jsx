import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [NSEData, setNSEData] = useState([]);
  const [BSEData, setBSEData] = useState([]);
  const [marketIndices, setMarketIndices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [optionTabIndex, setOptionTabIndex] = useState(0);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const packageCategories = useMemo(() => {
    const unique = [...new Set(packages.map(pkg => pkg.type_name))];
    return unique;
  }, [packages]);

  const updateNSEData = useCallback((data) => setNSEData(data), []);
  const updateBSEData = useCallback((data) => setBSEData(data), []);
  const updateMarketIndices = useCallback((data) => setMarketIndices(data), []);

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

  const getNSEBSEStocks = async (stock) => {
    const url = `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=sensex`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '7670ef5b00msh61aa95da79995d7p1fae1ajsna99a67851f30',
        'x-rapidapi-host': 'indian-stock-exchange-api2.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data.percentChange);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPackages = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'cachedPackages';
    const cacheTimeKey = 'cachedPackagesTime';
    let cachedData = null;

    try {
      setLoading(true);
      setError(null);

      if (!forceRefresh) {
        const cachedPackagesString = localStorage.getItem(cacheKey);
        const cachedTimeString = localStorage.getItem(cacheTimeKey);

        if (cachedPackagesString && cachedTimeString) {
          const cachedTime = parseInt(cachedTimeString);
          const now = Date.now();

          if (now - cachedTime < CACHE_DURATION) {
            cachedData = JSON.parse(cachedPackagesString);
            setPackages(cachedData);
            setLoading(false);
            return;
          }
        }
      }

      const response = await fetch('https://gateway.twmresearchalert.com/package', {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual auth logic
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const transformedPackages = [];

      for (let type of data.data) {
        if (!Array.isArray(type.subtypes)) continue;

        for (let subtype of type.subtypes) {
          transformedPackages.push({
            type_id: type.type_id || '',
            type_name: type.type_name || '',
            package_id: subtype.subtype_id || '',
            title: subtype.subtype_name || 'Unnamed Package',
            price: subtype.price?.toString() || 'Contact for pricing',
            details: Array.isArray(subtype.details)
              ? subtype.details.map(d => d.replace(/\?/g, '₹'))
              : ['Details not available'],
            categoryTag: type.type_name || 'Uncategorized',
            icon: getIconForCategory(type.type_name || ''),
            riskCategory: (subtype.riskCategory || 'N/A').replace(/^(\w)/, c => c.toUpperCase()),
            minimumInvestment: subtype.minimumInvestment || 'N/A',
            profitPotential: '15-25% p.a.'
          });
        }
      }

      setPackages(transformedPackages);
      const now = Date.now();
      localStorage.setItem(cacheKey, JSON.stringify(transformedPackages));
      localStorage.setItem(cacheTimeKey, now.toString());
      setLastFetchTime(now);

    } catch (error) {
      console.error('Error fetching packages:', error);
      if (!cachedData) setError('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  }, [getIconForCategory]);

  const fetchAllData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      await fetchPackages(forceRefresh);
    } catch (error) {
      console.error('Error fetching all data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchPackages]);

  useEffect(() => {
    fetchAllData(false);
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
  }), [
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
    packageCategories
  ]);

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) throw new Error('useStockContext must be used within a StockProvider');
  return context;
};