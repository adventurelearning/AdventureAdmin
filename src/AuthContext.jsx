// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext();


const getStoredAuth = () => {
  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("authToken");
    return storedToken;
  }
  return null;
};


export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredAuth());


  const login = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };
   console.log(token);
   
  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
