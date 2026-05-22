import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Sun, Moon, UtensilsCrossed, LayoutDashboard, LogOut, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onCartOpen }) => {
  const { getCartCount, tableNumber } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAdmin, isManager, logout } = useAuth();
  const location = useLocation();
  const [bounce, setBounce] = useState(false);
  const cartCount = getCartCount();

  useEffect(() => {
    if (cartCount === 0) return;
    setBounce(true);
    const timer = setTimeout(() => setBounce(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);

  const isLinkActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-gray-900 dark:text-white leading-none">
                Masala Craft
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand mt-0.5">
                Indian Bistro
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Table Number Indicator */}
            {tableNumber && (
              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
                Table {tableNumber}
              </div>
            )}

            {/* Dashboard shortcut if Admin or Manager logged in */}
            {(isAdmin || isManager) && (
              <Link
                to={isAdmin ? "/admin/dashboard" : "/manager/dashboard"}
                className={`p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${
                  isLinkActive(isAdmin ? "/admin/dashboard" : "/manager/dashboard") ? "bg-gray-100 dark:bg-gray-800 text-brand dark:text-brand" : ""
                }`}
                title={isAdmin ? "Admin Dashboard" : "Manager Dashboard"}
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onCartOpen}
              className={`relative p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${
                bounce ? "scale-110" : "scale-100"
              }`}
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5.5 h-5.5 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-[10px] font-bold text-white shadow-md animate-fade-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Login / Profile and Logout */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="hidden md:inline-block text-xs font-semibold text-gray-600 dark:text-gray-300 max-w-[120px] truncate">
                  Hi, {user.displayName || user.email.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Exit</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand to-brand-dark rounded-xl shadow-md hover:shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5 sm:hidden" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Table Badge */}
      {tableNumber && (
        <div className="sm:hidden flex items-center justify-center gap-1.5 py-1 bg-brand/5 border-b border-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
          Table {tableNumber}
        </div>
      )}
    </header>
  );
};

export default Navbar;
