import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

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

  // Load auth data and check KYC on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedData = localStorage.getItem('authData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const isTokenValid = parsedData.access_token && parsedData.access_token_expiry > Math.floor(Date.now() / 1000);
          setAuthData({
            ...parsedData,
            isAuthenticated: isTokenValid,
          });
          if (isTokenValid && parsedData.user_id) {
            await fetchKycStatus(parsedData.user_id);
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Fetch KYC status
  const fetchKycStatus = useCallback(async (userId = authData.user_id) => {
    if (!userId) return null;
    setKycLoading(true);
    setKycError('');
    try {
      const response = await fetch(`https://gateway.twmresearchalert.com/kyc?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch KYC status');
      const data = await response.json();
      if (data.status === 'success') {
        setAuthData((prev) => ({
          ...prev,
          user_email_id: data.data.user_email_id,
          aadhar_name: data.data.aadhar_name,
          pan_name: data.data.pan_name,
          auth: data.data.auth,
        }));
        localStorage.setItem('authData', JSON.stringify({
          ...authData,
          user_email_id: data.data.user_email_id,
          aadhar_name: data.data.aadhar_name,
          pan_name: data.data.pan_name,
          auth: data.data.auth,
        }));
        setKycStatus(data.data.auth);
        return data.data.auth;
      } else {
        throw new Error(data.message || 'Failed to fetch KYC status');
      }
    } catch (error) {
      setKycError(error.message || 'An error occurred while fetching KYC status');
      throw error;
    } finally {
      setKycLoading(false);
    }
  }, [authData]);

  // Send KYC confirmation email
  const sendKycConfirmationMail = useCallback(async (userId, status) => {
    if (!authData.user_email_id) {
      console.warn('Email missing for KYC notification');
      return;
    }
    try {
      const response = await fetch('http://gateway.twmresearchalert.com?url=sendkycmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify({
          email: authData.user_email_id,
          type: 'kyc',
          status,
        }),
      });
      if (!response.ok) throw new Error('Failed to send KYC email');
      const data = await response.json();
      console.log('KYC email response:', data);
    } catch (error) {
      console.error(`Error sending KYC ${status} email:`, error.message || error);
    }
  }, [authData]);

  // Handle login
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
      user_email_id: null,
      aadhar_name: null,
      pan_name: null,
      auth: null,
    };
    setAuthData(newAuthData);
    localStorage.setItem('authData', JSON.stringify(newAuthData));
    fetchKycStatus(data.user_id);
  }, [fetchKycStatus]);

  // Handle logout
  const logout = useCallback(() => {
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
    localStorage.removeItem('authData');
  }, []);

  const value = useMemo(() => ({
    authData,
    login,
    logout,
    fetchKycStatus,
    sendKycConfirmationMail,
    kycStatus,
    kycLoading,
    kycError,
  }), [authData, login, logout, fetchKycStatus, sendKycConfirmationMail, kycStatus, kycLoading, kycError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};