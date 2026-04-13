"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentSeller, getCurrentCustomer } from '../lib/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSeller(getCurrentSeller());
    setCustomer(getCurrentCustomer());
    setLoading(false);

    const handleAuthStateChange = (event) => {
      const { type, data } = event.detail;
      if (type === 'seller') {
        setSeller(data);
      } else if (type === 'customer') {
        setCustomer(data);
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ seller, customer, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
