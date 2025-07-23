import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useStockContext } from './StockContext';

const UseContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [userDetailsError, setUserDetailsError] = useState('');
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userTransactions, setUserTransactions] = useState([]);
  const [transactionsError, setTransactionsError] = useState('');
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [purchasedPackagesId, setPurchasedPackagesId] = useState([]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const userId = localStorage.getItem('user_id');

        if (accessToken && userId) {
          await Promise.all([
            getUserDetails(userId),
            getUserTransactions(userId)
          ]);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkLoginStatus();
  }, []);

  const getUserDetails = useCallback(async (userId) => {
    if (!userId) return;
    setUserDetailsLoading(true);
    setUserDetailsError('');

    try {
      const response = await axios.get(`https://gateway.twmresearchalert.com/kyc?user_id=${userId}`);

      if (response.data.status === 'success') {
        setUserDetails(response.data.data);
        localStorage.setItem('user_details', JSON.stringify(response.data.data));
      } else {
        setUserDetailsError(response.data.message || 'Failed to fetch user details');
      }
    } catch (error) {
      setUserDetailsError('An error occurred while fetching user details');
    } finally {
      setUserDetailsLoading(false);
    }
  }, []);

  const getUserTransactions = useCallback(async (userId) => {
    if (!userId) return;
    setTransactionsLoading(true);
    setTransactionsError('');

    try {
      const response = await axios.get(`https://tradedge-server.onrender.com/api/userTransactionsById?user_id=${userId}`);

      if (response.data.transactions.status === 'success') {
        const packages = response.data.transactions.data.packages || [];
        setUserTransactions(packages);

        const packageIds = packages
          .filter(pkg =>
            parseFloat(pkg.payment_history?.[0]?.amount) === parseFloat(pkg.package_details.package_price) &&
            pkg.payment_history?.[0]?.payment_status === 'completed'
          )
          .map(pkg => pkg.package_details.subtype_id);

        setPurchasedPackagesId(packageIds);
      } else {
        setTransactionsError(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      setTransactionsError('An error occurred while fetching transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  const handleLogin = useCallback(async (loginData, router) => {
    setLoginLoading(true);
    setErrorMessage('');

    try {
      const userId = loginData.user_id.replace('LNUSR', '');

      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('user_id', userId);

      await Promise.all([
        getUserDetails(userId),
        getUserTransactions(userId)
      ]);

      setIsLoggedIn(true);
      router.replace('/home');

      const stockContext = useStockContext();
      if (stockContext) {
        await stockContext.fetchPackages(true);
      }

      return true;
    } catch (error) {
      setErrorMessage('Error processing login');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    } finally {
      setLoginLoading(false);
    }
  }, [getUserDetails, getUserTransactions]);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('user_details');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      setUserDetails(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  const value = useMemo(() => ({
    isLoggedIn,
    userDetails,
    userDetailsLoading,
    userDetailsError,
    loginLoading,
    errorMessage,
    isInitializing,
    userTransactions,
    transactionsLoading,
    transactionsError,
    purchasedPackagesId,
    setIsLoggedIn,
    handleLogin,
    logout,
    getUserTransactions,
  }), [
    isLoggedIn,
    userDetails,
    userDetailsLoading,
    userDetailsError,
    loginLoading,
    errorMessage,
    isInitializing,
    userTransactions,
    transactionsLoading,
    transactionsError,
    purchasedPackagesId,
    handleLogin,
    logout,
    getUserTransactions,
  ]);

  return <UseContext.Provider value={value}>{children}</UseContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UseContext);
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};
