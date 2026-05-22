import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Trash2, Plus, Minus, Receipt, ArrowRight, CornerDownRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { dbService } from "../firebase/dbService";

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, tableNumber, setTableNumber, clearCart } = useCart();
  const { showToast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [inputTable, setInputTable] = useState(tableNumber || "");

  if (!isOpen) return null;

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }

    if (!inputTable.trim()) {
      showToast("Please enter your table number to place the order.", "warning");
      return;
    }

    // Save table number
    setTableNumber(inputTable.trim());
    setSubmitting(true);

    try {
      // Map cart to order schema
      const orderItems = cart.map(item => ({
        itemId: item.dish.id,
        name: item.dish.name,
        price: item.customPrice,
        quantity: item.quantity,
        customizations: item.customizations
      }));

      const newOrder = await dbService.createOrder({
        tableNumber: inputTable.trim(),
        items: orderItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      });

      showToast("Order placed successfully!", "success");
      clearCart();
      onClose();
      navigate(`/order-success?orderId=${newOrder.id}`);
    } catch (error) {
      console.error("Order submission failed:", error);
      showToast("Failed to place order. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      {/* Drawer Panel */}
      <div className="relative w-full sm:max-w-md h-[100dvh] md:h-screen glassmorphism text-gray-900 dark:text-white shadow-2xl flex flex-col justify-between animate-slide-left z-10 border-l border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5.5 h-5.5 text-brand" />
            <h2 className="font-serif text-xl font-bold">Your Order</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 py-12">
              <Receipt className="w-16 h-16 stroke-1 mb-4 opacity-50" />
              <p className="font-serif text-lg font-bold text-gray-600 dark:text-gray-400">Empty Cart</p>
              <p className="text-xs max-w-xs mt-1.5 leading-relaxed">
                Browse our selection and add items to your cart. We will prepare them fresh!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.cartItemId} 
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  <img
                    src={item.dish.image}
                    alt={item.dish.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-brand uppercase">
                    {item.dish.name.charAt(0)}
                  </div>
                </div>

                {/* Info & Modification */}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold truncate leading-snug">{item.dish.name}</h4>
                    <span className="text-sm font-bold text-brand">₹{(item.customPrice * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  {/* Customization descriptions */}
                  <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-gray-400 font-semibold tracking-wide uppercase">
                    <span className="flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3 text-brand" /> Spice: {item.customizations.spice}
                    </span>
                    {item.customizations.extraCheese && (
                      <span className="flex items-center gap-1">
                        <CornerDownRight className="w-3 h-3 text-brand" /> Extra Cheese (+ ₹50.00)
                      </span>
                    )}
                    {item.customizations.notes && (
                      <span className="flex items-start gap-1 italic text-gray-500 normal-case">
                        <CornerDownRight className="w-3 h-3 text-brand mt-0.5" /> "{item.customizations.notes}"
                      </span>
                    )}
                  </div>

                  {/* Quantity Controls / Delete */}
                  <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-gray-100/50 dark:border-gray-800/50">
                    <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 scale-90">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout calculations */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-4">
            {/* Table Number selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Table Assignment
              </label>
              <input
                type="number"
                value={inputTable}
                onChange={(e) => setInputTable(e.target.value)}
                placeholder="Enter table number (e.g. 4)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all"
                disabled={submitting}
              />
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
                <span>Total Due</span>
                <span className="text-brand">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className={`w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-dark hover:scale-[1.01] active:scale-[0.99] text-white font-bold text-sm shadow-lg hover:shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                submitting ? "opacity-75 cursor-wait" : ""
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending to Kitchen...</span>
                </>
              ) : (
                <>
                  <span>Place Kitchen Order</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;
