import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StockContext = createContext(undefined);

export const StockProvider = ({ children }) => {
  const [NSEData, setNSEData] = useState([]);
  const [BSEData, setBSEData] = useState([]);
  const [marketIndices, setMarketIndices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [optionTabIndex, setOptionTabIndex] = useState(0);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const updateNSEData = useCallback((data) => setNSEData(data), []);
  const updateBSEData = useCallback((data) => setBSEData(data), []);
  const updateMarketIndices = useCallback((data) => setMarketIndices(data), []);

  const getIconForCategory = useCallback((category) => {
    const map = {
      'Equity': 'trending-up',
      'Stock Option': 'tune',
      'Stock Future': 'bar-chart',
      'Index Option': 'tune',
      'Index Future': 'bar-chart',
      'Swing Trading': 'trending-up',
      'TWM Package (All In One)': 'star',
      'MCX Commodities': 'diamond',
      'Forex': 'currency-exchange',
      'International Club Commodities': 'public',
    };
    return map[category] || 'info';
  }, []);

  const packageCategories = useMemo(() => {
    return [...new Set(packages.map(pkg => pkg.type_name))];
  }, [packages]);

  const fetchPackages = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError('');

    const cacheKey = 'cachedPackages';
    const cacheTimeKey = 'cachedPackagesTime';

    try {
      if (!forceRefresh) {
        const [cachedPackages, cachedTime] = await Promise.all([
          AsyncStorage.getItem(cacheKey),
          AsyncStorage.getItem(cacheTimeKey)
        ]);

        if (cachedPackages && cachedTime) {
          const now = Date.now();
          const cachedTimestamp = parseInt(cachedTime, 10);
          if (now - cachedTimestamp < CACHE_DURATION) {
            setPackages(JSON.parse(cachedPackages));
            setLoading(false);
            return;
          }
        }
      }

      const token = await AsyncStorage.getItem('access_token');
      if (!token) throw new Error('Missing access token');

      const res = await fetch('https://gateway.twmresearchalert.com/package', {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();

      const transformed = data.data.flatMap((type) =>
        (type.subtypes || []).map((subtype) => ({
          type_id: type.type_id,
          type_name: type.type_name,
          package_id: subtype.subtype_id,
          title: subtype.subtype_name || 'Unnamed Package',
          price: subtype.price?.toString() || 'Contact for pricing',
          details: Array.isArray(subtype.details)
            ? subtype.details.map((d) => d.replace(/\?/g, '₹'))
            : [],
          categoryTag: type.type_name,
          icon: getIconForCategory(type.type_name),
          riskCategory: subtype.riskCategory || 'N/A',
          minimumInvestment: subtype.minimumInvestment || 'N/A',
          profitPotential: '15-25% p.a.',
        }))
      );

      const finalPackages = [
        ...transformed,
        {
          type_id: '10000',
          type_name: 'Offer',
          package_id: '10000',
          title: 'Refund offer',
          price: '10000',
          details: ['Profit Guarantee', 'Refund if no profit', 'Terms apply'],
          categoryTag: 'Custom Category',
          icon: 'star',
          riskCategory: 'Low',
          minimumInvestment: 'N/A',
          profitPotential: '10-20% p.a.',
        },
      ];

      setPackages(finalPackages);
      const now = Date.now();
      await Promise.all([
        AsyncStorage.setItem(cacheKey, JSON.stringify(finalPackages)),
        AsyncStorage.setItem(cacheTimeKey, now.toString()),
      ]);
      setLastFetchTime(now);
    } catch (err) {
      console.error('Fetch packages error:', err.message);
      setError('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  }, [getIconForCategory]);

  const getNSEBSEStocks = useCallback(async (stock) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=sensex`,
        {
          headers: {
            'x-rapidapi-key': 'your-api-key',
            'x-rapidapi-host': 'indian-stock-exchange-api2.p.rapidapi.com',
          },
        }
      );
      const data = await res.json();
      console.log(data.percentChange); // Replace with logic later
    } catch (err) {
      console.error('Fetch NSE/BSE error:', err);
      setError(`Failed to fetch ${stock} data`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      await fetchPackages(forceRefresh);
    } catch (err) {
      setError('Failed to fetch all data');
    } finally {
      setLoading(false);
    }
  }, [fetchPackages]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const value = useMemo(() => ({
    NSEData,
    BSEData,
    marketIndices,
    packages,
    loading,
    error,
    lastFetchTime,
    optionTabIndex,
    packageCategories,
    updateNSEData,
    updateBSEData,
    updateMarketIndices,
    getNSEBSEStocks,
    fetchPackages,
    fetchAllData,
    setOptionTabIndex,
  }), [
    NSEData,
    BSEData,
    marketIndices,
    packages,
    loading,
    error,
    lastFetchTime,
    optionTabIndex,
    packageCategories,
    updateNSEData,
    updateBSEData,
    updateMarketIndices,
    getNSEBSEStocks,
    fetchPackages,
    fetchAllData,
  ]);

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
