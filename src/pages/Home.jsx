import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, ArrowRight, ShieldCheck, QrCode, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const Home = () => {
  const navigate = useNavigate();
  const { tableNumber, setTableNumber } = useCart();
  const { showToast } = useToast();
  const [inputTable, setInputTable] = useState(tableNumber || "");

  const handleStartBrowsing = (e) => {
    e.preventDefault();
    if (inputTable.trim()) {
      setTableNumber(inputTable.trim());
      showToast(`Welcome! Browsing for Table ${inputTable.trim()}`, "success");
      navigate(`/menu?table=${inputTable.trim()}`);
    } else {
      showToast("Entering a table number helps us deliver items to your table!", "info");
      navigate("/menu");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-darkbg-DEFAULT text-gray-900 dark:text-white px-4 py-12">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-dark/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full text-center relative z-10 space-y-12">
        {/* Restaurant Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest animate-bounce">
            <Sparkles className="w-3.5 h-3.5" /> Luxury Dining Reimagined
          </div>
          <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-gray-950 dark:text-white">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-amber-400 to-brand-dark">Masala Craft</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-light">
            Indulge in a seamless contactless dining experience. Scan, customize, and order your favorite dishes directly to your table.
          </p>
        </div>

        {/* Table Selection / Browse CTA */}
        <div className="max-w-md mx-auto p-8 rounded-3xl glassmorphism shadow-2xl space-y-6 border border-gray-200/20 dark:border-white/10">
          <h3 className="font-serif text-lg font-bold">Ready to Order?</h3>
          
          <form onSubmit={handleStartBrowsing} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 pl-1">
                Enter Table Number
              </label>
              <input
                type="number"
                value={inputTable}
                onChange={(e) => setInputTable(e.target.value)}
                placeholder="e.g. 12"
                className="w-full px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-800 bg-transparent text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all text-center font-bold text-lg text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-bold text-sm shadow-lg hover:shadow-brand/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Interactive Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Visual Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl glassmorphism border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand/10 text-brand">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold mb-1.5">Scan from Table</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Scan the QR code at your table to sync your table number automatically.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glassmorphism border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand/10 text-brand">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold mb-1.5">Customize Plates</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Adjust spice, request changes, and add toppings with easy toggles.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glassmorphism border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand/10 text-brand">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold mb-1.5">Order Safely</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Your order is sent straight to the chef with simulated live tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
