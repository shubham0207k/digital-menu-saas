import React, { useState, useEffect } from "react";
import { X, Flame, ShieldAlert, Plus, Minus, FileText } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const DetailModal = ({ dish, onClose }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [spice, setSpice] = useState("medium");
  const [extraCheese, setExtraCheese] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!dish) return null;

  const basePrice = dish.price + (extraCheese ? 50.00 : 0);
  const totalPrice = basePrice * quantity;

  const handleAddToCart = () => {
    if (!dish.inStock) return;
    addToCart(dish, quantity, { spice, extraCheese, notes });
    showToast(`Added ${quantity}x ${dish.name} to order.`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glassmorphism text-gray-900 dark:text-white shadow-2xl transition-all duration-300 transform scale-100 flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image Section */}
        <div className="relative w-full md:w-1/2 h-48 md:h-auto md:min-h-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex-col items-center justify-center text-center p-6">
            <span className="font-serif text-5xl font-bold text-brand">{dish.name.charAt(0)}</span>
            <span className="text-xs text-gray-400 mt-4 uppercase tracking-widest">{dish.name}</span>
          </div>

          {/* Out of Stock banner */}
          {!dish.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="px-5 py-2.5 rounded-xl bg-red-600/90 text-white text-sm font-bold uppercase tracking-widest shadow-md">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Modal Content Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {dish.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand/10 border border-brand/20 text-brand"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2 tracking-wide leading-tight">
              {dish.name}
            </h2>
            <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span className="text-lg font-extrabold text-brand">₹{dish.price.toFixed(2)}</span>
              {dish.calories && (
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                  {dish.calories} kcal
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {dish.description}
            </p>

            {/* Customization Options */}
            {dish.inStock && (
              <div className="space-y-4 mb-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                {/* Spice Level (Standard for asian/spicy items) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    Spice Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["mild", "medium", "spicy", "extra"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSpice(lvl)}
                        className={`py-3 rounded-xl text-xs font-semibold uppercase transition-all tracking-wider border cursor-pointer ${
                          spice === lvl
                            ? "bg-brand border-brand text-white shadow-md"
                            : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extra Toppings */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    Add-ons
                  </label>
                  <button
                    onClick={() => setExtraCheese(!extraCheese)}
                    className={`flex items-center justify-between w-full p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      extraCheese
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>Extra Cheese</span>
                    <span className="font-bold">+ ₹50.00</span>
                  </button>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    <FileText className="w-4 h-4" /> Special Requests
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. No onions, sauce on the side, allergies..."
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand outline-none resize-none h-16 transition-all"
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Add to order / actions footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            {dish.inStock ? (
              <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow py-3 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-dark hover:scale-[1.02] active:scale-95 text-white font-bold text-sm shadow-lg hover:shadow-brand/20 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>Add to Order</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold justify-center">
                <ShieldAlert className="w-4.5 h-4.5" />
                This dish is currently unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
