import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ShoppingBag, 
  Sun, 
  Moon, 
  UtensilsCrossed, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Home, 
  BookOpen, 
  Menu as HamburgerIcon, 
  X as CloseIcon 
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onCartOpen }) => {
  const { getCartCount, tableNumber } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAdmin, isManager, logout } = useAuth();
  const location = useLocation();
  const [bounce, setBounce] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-wide text-gray-900 dark:text-white leading-none">
                Masala Craft
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-brand mt-0.5">
                Indian Bistro
              </span>
            </div>
          </Link>

          {/* Right Area: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3.5">
            {/* Table Number Indicator */}
            {tableNumber && (
              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
                Table {tableNumber}
              </div>
            )}

            {/* Desktop Dashboard Shortcut */}
            {(isAdmin || isManager) && (
              <Link
                to={isAdmin ? "/admin/dashboard" : "/manager/dashboard"}
                className={`hidden md:flex p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${
                  isLinkActive(isAdmin ? "/admin/dashboard" : "/manager/dashboard") ? "bg-gray-100 dark:bg-gray-800 text-brand dark:text-brand" : ""
                }`}
                title={isAdmin ? "Admin Dashboard" : "Manager Dashboard"}
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}

            {/* Global Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Desktop Cart Trigger */}
            <button
              onClick={onCartOpen}
              className={`hidden md:flex relative p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${
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

            {/* Desktop Account / Logout */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 max-w-[120px] truncate">
                  Hi, {user.displayName || user.email.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand to-brand-dark rounded-xl shadow-md hover:shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all items-center gap-1"
              >
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Open Navigation Drawer"
            >
              <HamburgerIcon className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Active Table Banner */}
      {tableNumber && (
        <div className="sm:hidden flex items-center justify-center gap-1.5 py-1 bg-brand/5 border-b border-brand/10 text-brand text-[9px] font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
          Table {tableNumber}
        </div>
      )}

      {/* Mobile Slide-Out Side Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm transition-opacity">
          {/* Click back to close */}
          <div className="absolute inset-0" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <div className="relative w-72 h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col justify-between p-6 border-r border-gray-200 dark:border-gray-800 animate-slide-right z-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <span className="font-serif text-lg font-bold">Masala Craft</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
                    isLinkActive("/") 
                      ? "bg-brand/10 text-brand" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Home className="w-4.5 h-4.5" /> Home
                </Link>
                <Link
                  to="/menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
                    isLinkActive("/menu") 
                      ? "bg-brand/10 text-brand" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <BookOpen className="w-4.5 h-4.5" /> Digital Menu
                </Link>
                
                {user && (isAdmin || isManager) && (
                  <Link
                    to={isAdmin ? "/admin/dashboard" : "/manager/dashboard"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
                      isLinkActive(isAdmin ? "/admin/dashboard" : "/manager/dashboard") 
                        ? "bg-brand/10 text-brand" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <LayoutDashboard className="w-4.5 h-4.5" /> Operational Dashboard
                  </Link>
                )}
              </nav>
            </div>

            {/* Drawer Footer Account Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <div className="p-2 rounded-full bg-brand/10 text-brand">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Hi, {user.displayName || user.email.split('@')[0]}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white text-xs font-bold text-center block shadow-md"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Visible only on screens < md) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 md:hidden flex items-center justify-around py-2.5 shadow-lg">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
            isLinkActive("/") ? "text-brand" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        
        <Link
          to="/menu"
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
            isLinkActive("/menu") ? "text-brand" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Menu</span>
        </Link>
        
        <button
          onClick={onCartOpen}
          className={`relative flex flex-col items-center gap-0.5 text-[9px] font-bold text-gray-500 dark:text-gray-400 ${
            bounce ? "scale-110" : "scale-100"
          } transition-transform`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-[8px] font-black text-white shadow-md">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {user ? (
          <Link
            to={isAdmin ? "/admin/dashboard" : isManager ? "/manager/dashboard" : "/menu"}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
              isLinkActive(isAdmin ? "/admin/dashboard" : isManager ? "/manager/dashboard" : "/menu")
                ? "text-brand"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {isAdmin || isManager ? (
              <LayoutDashboard className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span>{isAdmin || isManager ? "Dashboard" : "Account"}</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
              isLinkActive("/login") ? "text-brand" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <User className="w-5 h-5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>

      <style>{`
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-right {
          animation: slideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
