import React, { createContext, useState, useEffect } from 'react';

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
    isAuthenticated: false
  });

  useEffect(() => {
    // Load auth data from localStorage on mount
    const storedData = localStorage.getItem('authData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setAuthData({
        ...parsedData,
        isAuthenticated: !!parsedData.access_token && parsedData.access_token_expiry > Math.floor(Date.now() / 1000)
      });
    }
  }, []);

  const login = (data) => {
    const newAuthData = {
      user_id: data.user_id,
      user_name: data.user_name,
      user_role: data.user_role,
      session_id: data.session_id,
      access_token: data.access_token,
      access_token_expiry: data.access_token_expiry,
      refresh_token: data.refresh_token,
      refresh_token_expiry: data.refresh_token_expiry,
      isAuthenticated: true
    };
    setAuthData(newAuthData);
    localStorage.setItem('authData', JSON.stringify(newAuthData));
  };

  const logout = () => {
    setAuthData({
      user_id: null,
      user_name: null,
      user_role: null,
      session_id: null,
      access_token: null,
      access_token_expiry: null,
      refresh_token: null,
      refresh_token_expiry: null,
      isAuthenticated: false
    });
    localStorage.removeItem('authData');
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};