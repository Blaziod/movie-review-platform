import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
})();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storedUser);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
