import React, { useState, useEffect } from "react";
import { 
   Search, 
   Filter, 
   Utensils, 
   Salad, 
   IceCream, 
   CupSoda, 
   Flame,
   Sparkles,
   SearchX
} from "lucide-react";
import { dbService } from "../firebase/dbService";
import DishCard from "../components/DishCard";
import DetailModal from "../components/DetailModal";

// Helper to map icon name strings to Lucide Components
const CategoryIcon = ({ iconName, className }) => {
  switch (iconName) {
    case "Utensils": return <Utensils className={className} />;
    case "Salad": return <Salad className={className} />;
    case "IceCream": return <IceCream className={className} />;
    case "CupSoda": return <CupSoda className={className} />;
    case "Flame": return <Flame className={className} />;
    default: return <Utensils className={className} />;
  }
};

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, items] = await Promise.all([
          dbService.getCategories(),
          dbService.getMenuItems()
        ]);
        setCategories(cats);
        setDishes(items);
      } catch (err) {
        console.error("Error loading menu data:", err);
        setError("Could not load the menu. Please check your network connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTagFilter = (tag) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTags([]);
  };

  // Filter Logic
  const filteredDishes = dishes.filter((dish) => {
    // 1. Category check
    const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory;
    
    // 2. Search query check
    const matchesSearch = 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 3. Tag filters check (must match all selected tags)
    const matchesTags = selectedTags.every((tag) => 
      dish.tags && dish.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );

    return matchesCategory && matchesSearch && matchesTags;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg-DEFAULT text-gray-900 dark:text-white pb-20">
      
      {/* Page Header */}
      <div className="relative overflow-hidden bg-white/40 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-800 px-4 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Our Signature Menu</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Fresh ingredients, crafted by master chefs, served hot at your table.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left side filters (Desktop & Mobile Collapsible) */}
        <aside className="lg:w-64 flex-shrink-0 space-y-4">
          {/* Categories Sidebar */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glassmorphism border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <Filter className="w-4 h-4" /> Categories
            </h3>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-brand text-white shadow-md"
                    : "bg-white/40 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Sparkles className="w-4.5 h-4.5" />
                <span>All Specials</span>
              </button>
              
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-brand text-white shadow-md"
                      : "bg-white/40 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <CategoryIcon iconName={cat.icon} className="w-4.5 h-4.5" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Mobile Toggle for Diet Filters */}
          <div className="lg:hidden p-4 rounded-2xl glassmorphism border border-white/10 flex items-center justify-between">
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 w-full justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-brand" /> 
                <span>Dietary Preferences</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand">
                {isFilterExpanded ? "Hide" : "Show"}
              </span>
            </button>
          </div>

          {/* Collapsible Content */}
          <div className={`${isFilterExpanded ? "block animate-fade-in" : "hidden lg:block"} space-y-4`}>
            {/* Diet filters */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl glassmorphism border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Dietary Filters
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {["Vegetarian", "Vegan", "Spicy", "Gluten-Free"].map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer flex items-center justify-between ${
                        isActive
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span>{tag}</span>
                      {isActive && <span className="text-[10px] font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear Button if filter active */}
            {(selectedCategory !== "all" || searchQuery || selectedTags.length > 0) && (
              <button
                onClick={clearFilters}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-red-500/30 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Right side Menu Grid */}
        <main className="flex-grow">
          {error && (
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center font-medium text-sm">
              {error}
            </div>
          )}

          {loading ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[400px]">
                  <div className="aspect-[4/3] w-full shimmer-loader"></div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg shimmer-loader"></div>
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded shimmer-loader"></div>
                      <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-800 rounded shimmer-loader"></div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded shimmer-loader"></div>
                      <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 rounded-xl shimmer-loader"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDishes.length === 0 ? (
            /* Empty state */
            <div className="p-16 rounded-3xl glassmorphism text-center flex flex-col items-center justify-center max-w-xl mx-auto border border-white/5">
              <SearchX className="w-16 h-16 stroke-1 text-gray-400 dark:text-gray-500 mb-4 opacity-50" />
              <h3 className="font-serif text-xl font-bold mb-1.5">No Matches Found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mb-6">
                We couldn't find any dishes matching your search query or active filter chips. Try broadening your keywords.
              </p>
              <button
                onClick={clearFilters}
                className="py-2.5 px-5 rounded-xl bg-brand hover:scale-105 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            /* Active dish list */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onOpenDetails={setSelectedDish}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Dish Details modal popup */}
      {selectedDish && (
        <DetailModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
        />
      )}
    </div>
  );
};

export default Menu;
