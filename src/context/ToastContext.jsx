import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-l-4 shadow-xl";
          let icon = <Info className="w-5 h-5 text-blue-500" />;

          switch (toast.type) {
            case "success":
              bgClass += " border-emerald-500";
              icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
              break;
            case "error":
              bgClass += " border-red-500";
              icon = <XCircle className="w-5 h-5 text-red-500" />;
              break;
            case "warning":
              bgClass += " border-amber-500";
              icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
              break;
            default:
              bgClass += " border-blue-500";
              break;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 p-4 rounded-r-lg glassmorphism transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in pointer-events-auto cursor-pointer ${bgClass}`}
              onClick={() => removeToast(toast.id)}
              style={{
                animation: "slideIn 0.25s ease-out forwards"
              }}
            >
              <div className="flex-shrink-0">{icon}</div>
              <div className="flex-grow text-sm font-medium pr-2">{toast.message}</div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
