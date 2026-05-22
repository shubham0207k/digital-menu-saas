import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, MapPin, Receipt, ArrowRight, ChefHat, BellRing, Utensils } from "lucide-react";
import confetti from "canvas-confetti";
import { dbService } from "../firebase/dbService";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // Launch celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#D4AF37", "#B45309", "#10B981"]
    });

    // Initial fetch
    const fetchOrder = async () => {
      try {
        const orders = await dbService.getOrders();
        const found = orders.find(o => o.id === orderId);
        if (found) {
          setOrder(found);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Listen to updates (real Firestore snapshot OR mock CustomEvent)
    const handleMockUpdate = (e) => {
      if (e.detail && e.detail.id === orderId) {
        setOrder(e.detail);
      }
    };
    window.addEventListener("order-updated", handleMockUpdate);

    // Setup Firestore listener if running real firebase
    let unsubscribe;
    try {
      unsubscribe = dbService.listenToOrders((updatedOrders) => {
        const found = updatedOrders.find(o => o.id === orderId);
        if (found) {
          setOrder(found);
        }
      });
    } catch (err) {
      console.log("Realtime order stream failed (mock mode or firebase issue). Relying on event listeners.");
    }

    return () => {
      window.removeEventListener("order-updated", handleMockUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkbg-DEFAULT text-gray-800 dark:text-gray-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="font-semibold">Loading receipt details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkbg-DEFAULT text-gray-800 dark:text-gray-200 px-4">
        <div className="text-center space-y-6 max-w-md">
          <Receipt className="w-16 h-16 mx-auto stroke-1 text-red-500 opacity-80" />
          <h2 className="font-serif text-2xl font-bold">Order Not Found</h2>
          <p className="text-xs text-gray-500">
            We couldn't retrieve the details for Order ID: {orderId}. If you ordered recently, check with our staff.
          </p>
          <Link
            to="/menu"
            className="inline-block py-2.5 px-6 rounded-xl bg-brand text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  // Helper to determine status progress step
  const getStatusStep = (status) => {
    switch (status) {
      case "pending": return 1;
      case "preparing": return 2;
      case "ready": return 3;
      case "completed": return 4;
      default: return 1;
    }
  };

  const currentStep = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg-DEFAULT text-gray-900 dark:text-white py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">Order Placed Successfully!</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Your ticket is sent to the kitchen. Lay back, relax, and track your dish progress.
          </p>
        </div>

        {/* Live Status Tracker */}
        <div className="p-6 sm:p-8 rounded-3xl glassmorphism border border-white/10 shadow-xl space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-brand animate-pulse" /> Live Kitchen Pipeline
          </h3>

          {/* Tracker bar */}
          <div className="relative flex items-center justify-between max-w-md mx-auto py-4">
            
            {/* Background progress track lines */}
            <div className="absolute left-6 right-6 top-[2.2rem] h-[3px] bg-gray-200 dark:bg-gray-800 -z-10"></div>
            <div 
              className="absolute left-6 top-[2.2rem] h-[3px] bg-brand transition-all duration-700 -z-10"
              style={{ width: `${currentStep === 1 ? "0%" : currentStep === 2 ? "33.3%" : currentStep === 3 ? "66.6%" : "100%"}` }}
            ></div>

            {/* Step 1: Received */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= 1 
                    ? "bg-brand text-white shadow-md shadow-brand/20 scale-105" 
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                }`}
              >
                <BellRing className="w-4.5 h-4.5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= 1 ? "text-brand" : "text-gray-400"}`}>
                Received
              </span>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= 2 
                    ? "bg-brand text-white shadow-md shadow-brand/20 scale-105" 
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                }`}
              >
                <ChefHat className="w-4.5 h-4.5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= 2 ? "text-brand" : "text-gray-400"}`}>
                Preparing
              </span>
            </div>

            {/* Step 3: Ready */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= 3 
                    ? "bg-brand text-white shadow-md shadow-brand/20 scale-105" 
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                }`}
              >
                <Utensils className="w-4.5 h-4.5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= 3 ? "text-brand" : "text-gray-400"}`}>
                Ready
              </span>
            </div>

            {/* Step 4: Served */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= 4 
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105" 
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                }`}
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= 4 ? "text-emerald-500" : "text-gray-400"}`}>
                Served
              </span>
            </div>
          </div>

          {/* Prompt status message */}
          <div className="text-center py-2 px-4 rounded-xl bg-brand/5 border border-brand/10 max-w-sm mx-auto text-xs font-medium text-brand">
            {order.status === "pending" && "The kitchen is verifying your ticket details."}
            {order.status === "preparing" && "Our chefs are cooking your fresh plate right now."}
            {order.status === "ready" && "Your dishes are ready! Our staff will serve them to your table shortly."}
            {order.status === "completed" && "Your dishes have been served! Bon Appetit."}
          </div>
        </div>

        {/* Receipt / Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items card */}
          <div className="p-6 rounded-3xl glassmorphism border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-brand" /> Items Summary
            </h3>
            
            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4 py-1.5 border-b border-gray-100/50 dark:border-gray-800/50 last:border-0">
                  <div className="text-xs">
                    <p className="font-bold">{item.name} <span className="text-brand text-[10px]">x{item.quantity}</span></p>
                    {item.customizations?.spice && (
                      <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Spice: {item.customizations.spice}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals calculation */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
                <span>Paid</span>
                <span className="text-brand">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Table info card */}
          <div className="p-6 rounded-3xl glassmorphism border border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand" /> Table Location
              </h3>
              
              <div className="py-6 flex flex-col items-center justify-center text-center rounded-2xl bg-gray-100/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Delivering To</span>
                <span className="text-4xl font-serif font-black text-brand mt-1.5">Table {order.tableNumber}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                Order ID: <span className="font-mono font-bold uppercase select-all text-gray-600 dark:text-gray-200">{order.id}</span>
              </p>
              <Link
                to="/menu"
                className="w-full py-2.5 rounded-xl border border-brand/35 text-brand hover:bg-brand hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Add More Items</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
