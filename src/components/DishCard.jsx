import React from "react";
import { Plus, Flame, Clock } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const DishCard = ({ dish, onOpenDetails }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!dish.inStock) return;
    addToCart(dish, 1);
    showToast(`Added ${dish.name} to order!`, "success");
  };

  // Tag color mapping
  const getTagColor = (tag) => {
    switch (tag.toLowerCase()) {
      case "vegan":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "vegetarian":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400";
      case "spicy":
        return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400";
      case "gluten-free":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div 
      onClick={() => onOpenDetails(dish)}
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden glassmorphism shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    >
      {/* Dish Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            // Gradient fallback if image is missing/broken
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback gradient banner with text initials */}
        <div className="hidden absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950 flex-col items-center justify-center text-center p-4">
          <span className="font-serif text-3xl font-bold text-brand">{dish.name.charAt(0)}</span>
          <span className="text-[10px] text-gray-400 mt-2 font-medium tracking-wider uppercase">{dish.name}</span>
        </div>

        {/* Nutritional & Tag Overlays */}
        {dish.calories && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>{dish.calories} kcal</span>
          </div>
        )}

        {/* Out of Stock banner */}
        {!dish.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-red-600/90 text-white text-xs font-bold uppercase tracking-widest shadow-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="flex flex-col flex-grow p-5">
        {/* Diet Chips */}
        {dish.tags && dish.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {dish.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Name & Price */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand transition-colors">
            {dish.name}
          </h3>
          <span className="text-base font-bold text-brand whitespace-nowrap">
            ₹{dish.price.toFixed(2)}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed flex-grow">
          {dish.description}
        </p>

        {/* Card Footer Actions */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 15-20 min
          </span>
          <button
            onClick={handleQuickAdd}
            disabled={!dish.inStock}
            className={`flex items-center justify-center p-2 rounded-xl text-white shadow-md transition-all duration-300 ${
              dish.inStock
                ? "bg-gradient-to-r from-brand to-brand-dark hover:shadow-brand/20 hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-gray-400 dark:bg-gray-800 cursor-not-allowed opacity-50"
            }`}
            aria-label="Add to cart"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
