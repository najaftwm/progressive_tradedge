import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    user_id: null,
    user_name: null,
    user_role: null,
    session_id: null,
    access_token: null,
    access_token_expiry: null,
    refresh_token: null,
    refresh_token_expiry: null,
    isAuthenticated: false,
    user_email_id: null,
    aadhar_name: null,
    pan_name: null,
    auth: null,
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [kycStatus, setKycStatus] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState('');
  const [userTransactions, setUserTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState('');
  const [purchasedPackagesId, setPurchasedPackagesId] = useState([]);

  useEffect(() => {
    console.log('User Data Updated - Timestamp:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.table({
      'Auth Data': {
        UserID: authData.user_id,
        Name: authData.user_name,
        Email: authData.user_email_id,
        Role: authData.user_role,
        SessionID: authData.session_id,
        AccessToken: authData.access_token ? 'Present' : 'Absent',
        AccessTokenExpiry: authData.access_token_expiry ? new Date(authData.access_token_expiry * 1000).toLocaleString() : null,
        AadharName: authData.aadhar_name,
        PanName: authData.pan_name,
        KYCStatus: authData.auth,
        IsAuthenticated: authData.isAuthenticated,
      },
      'User Details': userDetails || 'Not Available',
      'User Transactions Count': userTransactions.length,
      'Purchased Package IDs': purchasedPackagesId.join(', ') || 'None',
      'KYC Status': kycStatus || 'Not Available',
    });
  }, [authData, userDetails, userTransactions, purchasedPackagesId, kycStatus]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedData = localStorage.getItem('authData');
        const storedPackages = localStorage.getItem('purchasedPackagesId');
        const parsedData = storedData ? JSON.parse(storedData) : null;
        const parsedPackages = storedPackages ? JSON.parse(storedPackages) : [];
        console.log('Initializing AuthProvider - Stored authData:', parsedData || 'None', 'Stored purchasedPackagesId:', parsedPackages);
        if (!parsedData?.user_id) {
          console.warn('No user_id found in localStorage, skipping data fetch');
          setPurchasedPackagesId(parsedPackages);
          setIsInitializing(false);
          return;
        }
        const isTokenValid = parsedData.access_token && parsedData.access_token_expiry > Math.floor(Date.now() / 1000);
        setAuthData({
          ...parsedData,
          isAuthenticated: isTokenValid,
        });
        setPurchasedPackagesId(parsedPackages);
        console.log('User data after initialization:', {
          ...parsedData,
          isAuthenticated: isTokenValid,
        });
        if (parsedData.user_id && isTokenValid) {
          const numericUserId = parsedData.user_id.replace('LNUSR', '');
          await Promise.all([
            fetchUserDetails(numericUserId),
            fetchUserTransactions(numericUserId, true),
            fetchKycStatus(numericUserId),
          ]);
        } else {
          console.warn('Invalid or expired token, skipping data fetch');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsInitializing(false);
        console.log('AuthProvider initialization complete - isInitializing:', false);
      }
    };
    checkLoginStatus();
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      console.log('Refreshing token with refresh_token:', authData.refresh_token ? 'Present' : 'Absent');
      const response = await axios.post('https://tradedge-server.onrender.com/api/refreshToken', {
        refresh_token: authData.refresh_token,
      });
      const newAuthData = {
        ...authData,
        access_token: response.data.access_token,
        access_token_expiry: response.data.access_token_expiry,
        refresh_token: response.data.refresh_token || authData.refresh_token,
        refresh_token_expiry: response.data.refresh_token_expiry || authData.refresh_token_expiry,
        isAuthenticated: true,
      };
      setAuthData(newAuthData);
      localStorage.setItem('authData', JSON.stringify(newAuthData));
      console.log('Token refreshed successfully:', newAuthData.access_token);
      return newAuthData.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data?.message || error.message);
      throw new Error('Failed to refresh token');
    }
  }, [authData]);

  const fetchUserDetails = useCallback(async (userId) => {
    if (!userId) {
      console.warn('fetchUserDetails - No userId provided');
      return;
    }
    setUserDetailsLoading(true);
    setUserDetailsError('');
    try {
      console.log('Fetching user details for userId:', userId, 'with token:', authData.access_token ? 'Present' : 'Absent');
      const numericUserId = userId.replace('LNUSR', '');
      const response = await axios.get(`https://gateway.twmresearchalert.com/kyc?user_id=${numericUserId}`, {
        headers: { Authorization: `Bearer ${authData.access_token}` || '' },
      });
      console.log('fetchUserDetails - Full API response:', response.data);
      if (response.data.status === 'success') {
        const details = response.data.data;
        setUserDetails(details);
        setAuthData(prev => {
          const updatedData = {
            ...prev,
            user_id: details.user_id || prev.user_id,
            user_name: details.username || prev.user_name,
            user_email_id: details.user_email_id,
            aadhar_name: details.aadhar_name,
            pan_name: details.pan_name,
            auth: details.auth,
          };
          localStorage.setItem('authData', JSON.stringify(updatedData));
          console.log('fetchUserDetails - Fetched user details:', details);
          return updatedData;
        });
      } else {
        setUserDetailsError(response.data.message || 'Failed to fetch user details');
        console.log('fetchUserDetails - Error message:', response.data.message);
      }
    } catch (error) {
      setUserDetailsError(error.response?.data?.message || error.message || 'An error occurred while fetching user details');
      console.error('fetchUserDetails - Full Error:', error.response || error);
    } finally {
      setUserDetailsLoading(false);
      console.log('fetchUserDetails - Completed, userDetailsLoading:', false);
    }
  }, [authData]);

  const fetchKycStatus = useCallback(async (userId = authData.user_id) => {
    if (!userId) {
      console.warn('fetchKycStatus - No userId provided, skipping KYC fetch');
      return null;
    }
    setKycLoading(true);
    setKycError('');
    try {
      console.log('fetchKycStatus - Fetching KYC for userId:', userId);
      const numericUserId = userId.replace('LNUSR', '');
      const response = await axios.get(`https://gateway.twmresearchalert.com/kyc?user_id=${numericUserId}`, {
        headers: { Authorization: `Bearer ${authData.access_token}` || '' },
      });
      if (response.data.status === 'success') {
        setKycStatus(response.data.data.auth);
        console.log('fetchKycStatus - Updated kycStatus:', response.data.data.auth);
        return response.data.data.auth;
      } else {
        throw new Error(response.data.message || 'Failed to fetch KYC status');
      }
    } catch (error) {
      setKycError(error.response?.data?.message || error.message || 'An error occurred while fetching KYC status');
      console.error('fetchKycStatus - Full Error:', error.response || error);
      throw error;
    } finally {
      setKycLoading(false);
      console.log('fetchKycStatus - Completed, kycLoading:', false);
    }
  }, [authData]);

  const fetchUserTransactions = useCallback(async (userId, forceRefresh = false) => {
    if (!userId) {
      console.warn('fetchUserTransactions - No userId provided');
      return;
    }
    const cacheKey = 'purchasedPackagesId';
    const cacheTimeKey = 'purchasedPackagesTime';
    if (!forceRefresh) {
      try {
        const cachedPackages = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        if (cachedPackages && cachedTime && Date.now() - parseInt(cachedTime) < 5 * 60 * 1000) {
          setPurchasedPackagesId(JSON.parse(cachedPackages));
          console.log('fetchUserTransactions - Using cached purchasedPackagesId:', JSON.parse(cachedPackages));
          return;
        }
      } catch {}
    }
    setTransactionsLoading(true);
    setTransactionsError('');
    let attempts = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    while (attempts < MAX_RETRIES) {
      try {
        console.log('Fetching user transactions for userId:', userId, 'Attempt:', attempts + 1);
        const numericUserId = userId.replace('LNUSR', '');
        const response = await axios.get(
          `https://tradedge-server.onrender.com/api/userTransactionsById?user_id=${numericUserId}`,
          {
            headers: { Authorization: `Bearer ${authData.access_token}` || '' },
          }
        );
        console.log('fetchUserTransactions - Raw API Response:', response.data);
        if (response.data.transactions?.status === 'success') {
          const packages = response.data.transactions.data.packages || [];
          console.log('Parsed Packages:', packages);
          if (!Array.isArray(packages)) {
            console.warn('fetchUserTransactions - Packages is not an array:', packages);
            setUserTransactions([]);
            setPurchasedPackagesId([]);
            localStorage.setItem(cacheKey, JSON.stringify([]));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
            return;
          }
          const packageIds = packages
            .filter(
              (pkg) =>
                pkg?.payment_history?.[0]?.amount &&
                parseFloat(pkg.payment_history[0].amount) === parseFloat(pkg.package_details?.package_price) &&
                pkg.payment_history[0]?.payment_status === 'completed' &&
                pkg.package_details?.subtype_id
            )
            .map((pkg) => pkg.package_details.subtype_id)
            .filter(Boolean);
          console.log('Completed Package IDs:', packageIds);
          setUserTransactions(packages);
          setPurchasedPackagesId(packageIds);
          localStorage.setItem(cacheKey, JSON.stringify(packageIds));
          localStorage.setItem(cacheTimeKey, Date.now().toString());
          console.log('Transactions fetched successfully - Count:', packages.length);
          return;
        } else {
          throw new Error(response.data.message || 'Failed to fetch transactions');
        }
      } catch (error) {
        attempts++;
        if (attempts === MAX_RETRIES) {
          setTransactionsError(error.response?.data?.message || error.message || 'An error occurred while fetching transactions');
          console.error('fetchUserTransactions - Full Error:', error.response || error);
          setUserTransactions([]);
          setPurchasedPackagesId([]);
          localStorage.setItem(cacheKey, JSON.stringify([]));
          localStorage.setItem(cacheTimeKey, Date.now().toString());
          break;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
      } finally {
        setTransactionsLoading(false);
        console.log('fetchUserTransactions - Finished loading, transactionsLoading:', false);
      }
    }
  }, [authData.access_token]);

  useEffect(() => {
    if (!authData.user_id || !authData.isAuthenticated) return;
    const numericUserId = authData.user_id.replace('LNUSR', '');
    const interval = setInterval(() => {
      console.log('Refreshing purchased packages for userId:', numericUserId);
      fetchUserTransactions(numericUserId, true);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [authData.user_id, authData.isAuthenticated, fetchUserTransactions]);

  const sendKycConfirmationMail = useCallback(async (userId, status) => {
    if (!authData.user_email_id) {
      console.warn('sendKycConfirmationMail - Email missing for KYC notification');
      return;
    }
    try {
      console.log('sendKycConfirmationMail - Sending email for userId:', userId, 'status:', status);
      const response = await axios.post('http://gateway.twmresearchalert.com?url=sendkycmail', {
        email: authData.user_email_id,
        type: 'kyc',
        status,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData.access_token}`,
        },
      });
      console.log('sendKycConfirmationMail - KYC email response:', response.data);
    } catch (error) {
      console.error('sendKycConfirmationMail - Error:', error.response || error);
    }
  }, [authData]);

  const login = useCallback((data) => {
    const newAuthData = {
      user_id: data.user_id,
      user_name: data.user_name,
      user_role: data.user_role,
      session_id: data.session_id,
      access_token: data.access_token,
      access_token_expiry: data.access_token_expiry,
      refresh_token: data.refresh_token,
      refresh_token_expiry: data.refresh_token_expiry,
      isAuthenticated: true,
      user_email_id: data.user_email_id || null,
      aadhar_name: null,
      pan_name: null,
      auth: null,
    };
    setAuthData(newAuthData);
    localStorage.setItem('authData', JSON.stringify(newAuthData));
    console.log('User logged in successfully - Timestamp:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.table({
      UserID: newAuthData.user_id,
      Name: newAuthData.user_name,
      Email: newAuthData.user_email_id,
      Role: newAuthData.user_role,
      SessionID: newAuthData.session_id,
      AccessToken: newAuthData.access_token ? 'Present' : 'Absent',
      AccessTokenExpiry: newAuthData.access_token_expiry ? new Date(newAuthData.access_token_expiry * 1000).toLocaleString() : null,
      AadharName: newAuthData.aadhar_name,
      PanName: newAuthData.pan_name,
      KYCStatus: newAuthData.auth,
      IsAuthenticated: newAuthData.isAuthenticated,
    });
    const numericUserId = newAuthData.user_id.replace('LNUSR', '');
    fetchUserDetails(numericUserId);
    fetchUserTransactions(numericUserId, true);
    fetchKycStatus(numericUserId);
  }, [fetchUserDetails, fetchUserTransactions, fetchKycStatus]);

  const logout = useCallback(() => {
    console.log('logout - Clearing authData and localStorage - Timestamp:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    setAuthData({
      user_id: null,
      user_name: null,
      user_role: null,
      session_id: null,
      access_token: null,
      access_token_expiry: null,
      refresh_token: null,
      refresh_token_expiry: null,
      isAuthenticated: false,
      user_email_id: null,
      aadhar_name: null,
      pan_name: null,
      auth: null,
    });
    setKycStatus(null);
    setUserDetails(null);
    setUserTransactions([]);
    setPurchasedPackagesId([]);
    localStorage.removeItem('authData');
    localStorage.removeItem('purchasedPackagesId');
    localStorage.removeItem('purchasedPackagesTime');
    console.log('logout - localStorage cleared');
  }, []);

  const value = useMemo(() => ({
    authData,
    isInitializing,
    kycStatus,
    kycLoading,
    kycError,
    userDetails,
    userDetailsLoading,
    userDetailsError,
    userTransactions,
    transactionsLoading,
    transactionsError,
    purchasedPackagesId,
    login,
    logout,
    fetchKycStatus,
    sendKycConfirmationMail,
    fetchUserDetails,
    fetchUserTransactions,
    refreshToken,
  }), [
    authData,
    isInitializing,
    kycStatus,
    kycLoading,
    kycError,
    userDetails,
    userDetailsLoading,
    userDetailsError,
    userTransactions,
    transactionsLoading,
    transactionsError,
    purchasedPackagesId,
    login,
    logout,
    fetchKycStatus,
    sendKycConfirmationMail,
    fetchUserDetails,
    fetchUserTransactions,
    refreshToken,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};