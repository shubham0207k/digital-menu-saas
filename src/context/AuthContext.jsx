import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../firebase/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const profile = await authService.getUserProfile(currentUser.uid, currentUser);
          setUser(profile ? { ...currentUser, ...profile } : currentUser);
        } catch (error) {
          console.error("Failed to load user profile:", error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      const profile = await authService.getUserProfile(loggedUser.uid, loggedUser);
      const fullUser = profile ? { ...loggedUser, ...profile } : loggedUser;
      setUser(fullUser);
      return fullUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const registeredUser = await authService.register(name, email, password, "customer");
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isCustomer = user?.role === "customer" || user?.role === undefined; // default to customer if logged in but undefined

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isManager, isCustomer, role: user?.role || (user ? "customer" : null) }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
