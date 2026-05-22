import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  QrCode, 
  Utensils, 
  Clock, 
  FolderPlus, 
  Layers,
  ChefHat,
  Archive,
  RefreshCw,
  LogOut,
  Flame,
  UserPlus,
  Play,
  CheckSquare,
  Lock,
  Mail,
  Upload,
  AlertCircle
} from "lucide-react";
import { dbService } from "../firebase/dbService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Staff Management states
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerEmail, setNewManagerEmail] = useState("");
  const [newManagerPassword, setNewManagerPassword] = useState("");
  const [creatingManager, setCreatingManager] = useState(false);

  // QR Generator states
  const [qrTable, setQrTable] = useState("1");
  const [generatedQrUrl, setGeneratedQrUrl] = useState("");

  // Menu Item Modal/Form states
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemCalories, setItemCalories] = useState("");
  const [itemTags, setItemTags] = useState([]);

  // Image upload progress states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Category Form states
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Utensils");

  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [cats, items, staff] = await Promise.all([
          dbService.getCategories(),
          dbService.getMenuItems(),
          dbService.getManagers()
        ]);
        setCategories(cats);
        setDishes(items);
        setManagers(staff);
        if (cats.length > 0) setItemCategory(cats[0].id);
      } catch (err) {
        showToast("Error loading manager data.", "error");
      }
    };
    loadStaticData();

    // Live listener for orders
    const unsubscribe = dbService.listenToOrders((incomingOrders) => {
      setOrders(incomingOrders);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGenerateQR = () => {
    if (!qrTable) return;
    const origin = window.location.origin;
    const path = `${origin}/menu?table=${qrTable}`;
    const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(path)}`;
    setGeneratedQrUrl(qrApi);
    showToast(`QR Code generated for Table ${qrTable}!`, "success");
  };

  const handleNextStatus = async (orderId, currentStatus) => {
    let nextStatus = "";
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "completed";
    else return;

    try {
      await dbService.updateOrderStatus(orderId, nextStatus);
      showToast(`Order status updated to ${nextStatus}`, "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await dbService.deleteMenuItem(id);
      setDishes(prev => prev.filter(item => item.id !== id));
      showToast("Dish removed from menu.", "success");
    } catch (err) {
      showToast("Error deleting item.", "error");
    }
  };

  const handleToggleStock = async (item) => {
    try {
      const updatedStock = !item.inStock;
      await dbService.updateMenuItem(item.id, { inStock: updatedStock });
      setDishes(prev => 
        prev.map(i => i.id === item.id ? { ...i, inStock: updatedStock } : i)
      );
      showToast(`${item.name} is now ${updatedStock ? 'in-stock' : 'out-of-stock'}.`, "info");
    } catch (err) {
      showToast("Failed to toggle stock.", "error");
    }
  };

  const openFormModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemPrice(item.price.toString());
      setItemCategory(item.category);
      setItemDescription(item.description);
      setItemImage(item.image);
      setItemCalories(item.calories?.toString() || "");
      setItemTags(item.tags || []);
    } else {
      setEditingItem(null);
      setItemName("");
      setItemPrice("");
      setItemCategory(categories[0]?.id || "mains");
      setItemDescription("");
      setItemImage("/assets/butter_chicken.png");
      setItemCalories("");
      setItemTags([]);
    }
    setShowItemModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !itemCategory) {
      showToast("Please fill in required fields", "warning");
      return;
    }

    const dishPayload = {
      name: itemName,
      price: parseFloat(itemPrice),
      category: itemCategory,
      description: itemDescription,
      image: itemImage || "/assets/butter_chicken.png",
      calories: itemCalories ? parseInt(itemCalories) : null,
      tags: itemTags
    };

    try {
      if (editingItem) {
        await dbService.updateMenuItem(editingItem.id, dishPayload);
        setDishes(prev => 
          prev.map(i => i.id === editingItem.id ? { ...i, ...dishPayload } : i)
        );
        showToast("Dish details updated.", "success");
      } else {
        const added = await dbService.addMenuItem(dishPayload);
        setDishes(prev => [...prev, added]);
        showToast("New dish added successfully.", "success");
      }
      setShowItemModal(false);
    } catch (err) {
      showToast("Failed to save menu item.", "error");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadProgress(0);

    const { isMock, storage } = await import("../firebase/config");

    if (isMock) {
      let prog = 0;
      const interval = setInterval(() => {
        prog += 20;
        setUploadProgress(prog);
        if (prog >= 100) {
          clearInterval(interval);
          const mockImages = [
            "/assets/butter_chicken.png",
            "/assets/samosa_chaat.png",
            "/assets/dum_biryani.png",
            "/assets/dal_makhani.png",
            "/assets/paneer_tikka.png"
          ];
          const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
          setItemImage(randomImg);
          setUploadingImage(false);
          showToast("Image mock-uploaded successfully!", "success");
        }
      }, 200);
    } else {
      try {
        const storageRef = ref(storage, `dishes/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error("Upload error:", error);
            showToast("Upload failed.", "error");
            setUploadingImage(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setItemImage(downloadURL);
            setUploadingImage(false);
            showToast("Image uploaded successfully!", "success");
          }
        );
      } catch (err) {
        console.error("Storage error:", err);
        showToast("Storage initialization failed.", "error");
        setUploadingImage(false);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const added = await dbService.addCategory({
        name: newCatName.trim(),
        icon: newCatIcon
      });
      setCategories(prev => [...prev, added]);
      setNewCatName("");
      showToast("Category added.", "success");
    } catch (err) {
      showToast("Failed to add category.", "error");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Deleting this category will not delete its items. Proceed?")) return;
    try {
      await dbService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast("Category removed.", "success");
    } catch (err) {
      showToast("Error deleting category.", "error");
    }
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    if (!newManagerName.trim() || !newManagerEmail.trim() || !newManagerPassword.trim()) {
      showToast("Please fill in all details.", "warning");
      return;
    }

    if (newManagerPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "warning");
      return;
    }

    setCreatingManager(true);
    try {
      const { authService } = await import("../firebase/authService");
      await authService.registerSecondary(
        newManagerName.trim(),
        newManagerEmail.trim(),
        newManagerPassword.trim(),
        "manager"
      );

      const staff = await dbService.getManagers();
      setManagers(staff);

      setNewManagerName("");
      setNewManagerEmail("");
      setNewManagerPassword("");
      showToast("Manager account created successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to create manager account.", "error");
    } finally {
      setCreatingManager(false);
    }
  };

  const handleDeleteManager = async (uid) => {
    if (!window.confirm("Delete this manager account?")) return;
    try {
      await dbService.deleteManager(uid);
      setManagers(prev => prev.filter(m => m.uid !== uid));
      showToast("Manager account deleted.", "success");
    } catch (err) {
      showToast("Failed to delete manager.", "error");
    }
  };

  const handleTagToggle = (tag) => {
    setItemTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Analytics helper calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status === "completed" ? o.total : 0), 0);
  const pendingRevenue = orders.reduce((sum, o) => sum + (o.status !== "completed" ? o.total : 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== "completed").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg-DEFAULT text-gray-900 dark:text-white pb-20">
      
      {/* Top dashboard menu bar */}
      <div className="bg-white/45 dark:bg-gray-900/40 border-b border-gray-150 dark:border-gray-850 px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Masala Craft Control Center</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin dashboard to manage kitchen queues, table setup, staff, and menus.</p>
          </div>
          <button 
            onClick={logout}
            className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-550 hover:text-white text-xs font-bold rounded-xl border border-red-500/20 hover:border-red-500 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Tabs (Sidebar style) */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 p-2 rounded-2xl bg-white/40 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-850 scrollbar-none">
            {[
              { id: "orders", label: "Orders Queue", icon: ChefHat, count: activeOrdersCount },
              { id: "menu", label: "Menu CRUD", icon: Utensils },
              { id: "categories", label: "Categories", icon: Layers },
              { id: "staff", label: "Staff Setup", icon: Users },
              { id: "qr", label: "Table QR Setup", icon: QrCode },
              { id: "analytics", label: "Analytics", icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
                  activeTab === tab.id
                    ? "bg-brand text-white shadow-md"
                    : "text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <tab.icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-auto flex items-center justify-center h-5 px-1.5 rounded-full text-[9px] font-black bg-red-500 text-white shadow animate-pulse">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Dashboard Pages */}
        <main className="flex-grow min-w-0">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400">Syncing database operations...</p>
            </div>
          ) : (
            <>
              {/* --- TAB 1: ORDERS --- */}
              {activeTab === "orders" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="font-serif text-xl font-bold">Kitchen Dispatch Queue</h2>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand/10 text-brand">
                      {activeOrdersCount} Active Tickets
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-16 rounded-3xl glassmorphism text-center border border-white/5 flex flex-col items-center justify-center">
                      <ChefHat className="w-16 h-16 stroke-1 text-gray-400 mb-3 opacity-55 animate-pulse" />
                      <h4 className="font-serif text-lg font-bold">All Quiet in the Kitchen</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">No orders are active right now. New guest tickets will appear here in real-time.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {orders.map((order) => {
                        const isCompleted = order.status === "completed";
                        return (
                          <div 
                            key={order.id} 
                            className={`p-5 rounded-2xl border transition-all ${
                              isCompleted 
                                ? "bg-white/10 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800 opacity-60" 
                                : "bg-white dark:bg-gray-900 border-brand/20 shadow-md ring-1 ring-brand/10 hover:shadow-lg animate-fade-in"
                            }`}
                          >
                            {/* Order Header */}
                            <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-800/60 mb-3.5">
                              <div>
                                <span className="text-[10px] font-mono font-bold text-gray-400 block">TICKET #{order.id}</span>
                                <span className="text-lg font-serif font-black text-brand">Table {order.tableNumber}</span>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                order.status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-955/35 dark:text-amber-400" :
                                order.status === "preparing" ? "bg-blue-100 text-blue-800 dark:bg-blue-955/35 dark:text-blue-400" :
                                order.status === "ready" ? "bg-indigo-100 text-indigo-850 dark:bg-indigo-950/30 dark:text-indigo-400" :
                                "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450"
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="text-xs">
                                  <div className="flex justify-between font-bold text-gray-850 dark:text-gray-200">
                                    <span>{item.name} <span className="text-brand font-black">x{item.quantity}</span></span>
                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                  {item.customizations && (
                                    <div className="pl-3 mt-0.5 text-[9px] text-gray-450 font-medium space-y-0.5">
                                      <p>• Spice: <span className="uppercase text-brand">{item.customizations.spice}</span></p>
                                      {item.customizations.notes && <p className="italic text-gray-550">“{item.customizations.notes}”</p>}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Total and Actions */}
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-800 dark:text-white">Total: <span className="text-brand">₹{order.total.toFixed(2)}</span></span>
                              
                              {!isCompleted ? (
                                <button
                                  onClick={() => handleNextStatus(order.id, order.status)}
                                  className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-brand to-brand-dark text-white text-[10px] font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span>
                                    Advance to {
                                      order.status === "pending" ? "Preparing" :
                                      order.status === "preparing" ? "Ready" : "Completed"
                                    }
                                  </span>
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                                  Completed ✓
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB 2: MENU CRUD --- */}
              {activeTab === "menu" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="font-serif text-xl font-bold">Menu Manager</h2>
                    <button
                      onClick={() => openFormModal()}
                      className="py-2 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add New Plate
                    </button>
                  </div>

                  {/* Desktop Table List */}
                  <div className="rounded-3xl glassmorphism border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl bg-white dark:bg-transparent">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100/50 dark:bg-gray-900/50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">Plate</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 dark:divide-gray-850 font-medium">
                          {dishes.map((dish) => (
                            <tr key={dish.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="w-10 h-10 object-cover rounded-lg bg-gray-200"
                                />
                                <div>
                                  <p className="font-bold text-gray-950 dark:text-white text-sm">{dish.name}</p>
                                  <p className="text-[10px] text-gray-450 font-light truncate max-w-xs">{dish.description}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-500 capitalize">{dish.category}</td>
                              <td className="px-6 py-4 font-bold text-brand">₹{dish.price.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleToggleStock(dish)}
                                  className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider cursor-pointer ${
                                    dish.inStock 
                                      ? "bg-green-100 text-green-850 dark:bg-green-950/30 dark:text-green-450" 
                                      : "bg-red-100 text-red-850 dark:bg-red-950/30 dark:text-red-450"
                                  }`}
                                >
                                  {dish.inStock ? "In Stock" : "Out of Stock"}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => openFormModal(dish)}
                                  className="p-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand hover:text-white transition-colors cursor-pointer inline-flex"
                                  title="Edit plate"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDish(dish.id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer inline-flex"
                                  title="Delete plate"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 3: CATEGORIES --- */}
              {activeTab === "categories" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                  
                  {/* Left Column: List Categories */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-xl font-bold">Menu Categories</h2>
                    <div className="rounded-3xl glassmorphism border border-gray-200 dark:border-white/10 p-6 shadow-xl space-y-3 bg-white dark:bg-transparent">
                      {categories.map((cat) => (
                        <div key={cat.id} className="flex justify-between items-center p-3 rounded-xl bg-white/40 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-850">
                          <div className="flex items-center gap-2">
                            <span className="p-2 rounded-lg bg-brand/10 text-brand">
                              <Utensils className="w-4 h-4" />
                            </span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{cat.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">({cat.id})</span>
                          </div>
                          
                          {!["mains", "appetizers", "breads", "desserts", "beverages"].includes(cat.id) ? (
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-400 hover:text-red-500 transition-colors cursor-pointer animate-fade-in"
                              title="Delete category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                              System
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Add Category Form */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-xl font-bold">New Category</h2>
                    <form onSubmit={handleAddCategory} className="rounded-3xl glassmorphism border border-gray-200 dark:border-white/10 p-6 shadow-xl space-y-4 bg-white dark:bg-transparent">
                      
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          Category Title
                        </label>
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="e.g. Rice Specials"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          Ribbon Icon
                        </label>
                        <select
                          value={newCatIcon}
                          onChange={(e) => setNewCatIcon(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand dark:bg-gray-900 outline-none"
                        >
                          <option value="Utensils">Fork & Spoon (Utensils)</option>
                          <option value="Salad">Salad Bowl (Salad)</option>
                          <option value="IceCream">Ice Cream (IceCream)</option>
                          <option value="CupSoda">Drinks (CupSoda)</option>
                          <option value="Flame">Flame/Tandoor (Flame)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <FolderPlus className="w-4.5 h-4.5" /> Create Category
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* --- TAB 4: STAFF MANAGEMENT --- */}
              {activeTab === "staff" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                  {/* Left Column: Staff Directory */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-xl font-bold">Staff Directory</h2>
                    <div className="rounded-3xl glassmorphism border border-gray-200 dark:border-white/10 p-6 shadow-xl space-y-3 bg-white dark:bg-transparent">
                      {managers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-1" />
                          <p className="text-xs">No manager accounts registered yet.</p>
                        </div>
                      ) : (
                        managers.map((staff) => (
                          <div key={staff.uid} className="flex justify-between items-center p-3.5 rounded-xl bg-white/40 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-850">
                            <div>
                              <p className="text-sm font-bold text-gray-800 dark:text-white">{staff.displayName}</p>
                              <p className="text-[10px] text-gray-450 mt-0.5">{staff.email}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteManager(staff.uid)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete staff account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Register New Manager Account */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-xl font-bold">Create Manager Account</h2>
                    <form onSubmit={handleAddManager} className="rounded-3xl glassmorphism border border-gray-200 dark:border-white/10 p-6 shadow-xl space-y-4 bg-white dark:bg-transparent">
                      
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          Full Name
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={newManagerName}
                            onChange={(e) => setNewManagerName(e.target.value)}
                            placeholder="e.g. Sarah Connor"
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={newManagerEmail}
                            onChange={(e) => setNewManagerEmail(e.target.value)}
                            placeholder="manager@restaurant.com"
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            value={newManagerPassword}
                            onChange={(e) => setNewManagerPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand outline-none"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={creatingManager}
                        className="w-full py-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-4.5 h-4.5" />
                        <span>{creatingManager ? "Provisioning..." : "Provision Manager Account"}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* --- TAB 5: TABLE QR CODE SETUP --- */}
              {activeTab === "qr" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                  <div className="space-y-4">
                    <h2 className="font-serif text-xl font-bold">QR Code Hub</h2>
                    <div className="p-6 rounded-3xl glassmorphism border border-gray-200 dark:border-white/10 shadow-xl space-y-4 bg-white dark:bg-transparent">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Input a physical table number. We will output a printable card design that links automatically to your digital menu with the table identification prefilled.
                      </p>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          Table Number
                        </label>
                        <input
                          type="number"
                          value={qrTable}
                          onChange={(e) => setQrTable(e.target.value)}
                          placeholder="e.g. 5"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-sm font-bold focus:ring-1 focus:ring-brand focus:border-brand outline-none"
                          min="1"
                        />
                      </div>

                      <button
                        onClick={handleGenerateQR}
                        className="w-full py-3 rounded-xl bg-brand text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <QrCode className="w-4.5 h-4.5" /> Compile QR Flyer
                      </button>
                    </div>
                  </div>

                  {/* Right panel: compiled flyer card */}
                  <div className="flex flex-col items-center justify-center">
                    {generatedQrUrl ? (
                      <div className="p-8 rounded-3xl bg-white border border-gray-200 text-gray-900 shadow-2xl w-full max-w-sm flex flex-col items-center justify-between text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand via-amber-400 to-brand-dark"></div>
                        
                        <div className="space-y-1 mt-3">
                          <span className="font-serif text-2xl font-bold tracking-wide text-gray-900">Masala Craft</span>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-brand">Tabletop dining menu</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 my-6 shadow-inner">
                          <img
                            src={generatedQrUrl}
                            alt={`QR Code Table ${qrTable}`}
                            className="w-44 h-44 object-contain animate-fade-in"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Station Location</span>
                            <span className="text-3xl font-serif font-black text-brand">TABLE {qrTable}</span>
                          </div>
                          
                          <p className="text-[10px] text-gray-550 max-w-[200px] leading-relaxed">
                            Scan with your smartphone camera to browse, customize, and order instantly.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 text-gray-450 max-w-sm w-full flex flex-col items-center justify-center py-16">
                        <QrCode className="w-16 h-16 stroke-1 text-gray-400 mb-2 opacity-50" />
                        <h4 className="font-bold text-xs uppercase tracking-wider">Preview Card Empty</h4>
                        <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] leading-relaxed">
                          Enter a location code on the left to compile your restaurant print flyer.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- TAB 6: ANALYTICS --- */}
              {activeTab === "analytics" && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="font-serif text-xl font-bold">Analytics Panel</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl glassmorphism border border-gray-250 dark:border-white/10 shadow-lg flex items-start gap-4 bg-white dark:bg-transparent">
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                        <IndianRupee className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Settled Gross</span>
                        <span className="text-2xl font-serif font-bold text-emerald-500">₹{totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl glassmorphism border border-gray-250 dark:border-white/10 shadow-lg flex items-start gap-4 bg-white dark:bg-transparent">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Ticket Value</span>
                        <span className="text-2xl font-serif font-bold text-amber-500">₹{pendingRevenue.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl glassmorphism border border-gray-250 dark:border-white/10 shadow-lg flex items-start gap-4 bg-white dark:bg-transparent">
                      <div className="p-3.5 rounded-2xl bg-brand/10 border border-brand/20 text-brand">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Orders Placed</span>
                        <span className="text-2xl font-serif font-bold text-brand">{orders.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl glassmorphism border border-gray-250 dark:border-white/10 shadow-xl bg-white dark:bg-transparent space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-450 dark:text-gray-500">
                      Ticket Distribution Status
                    </h3>
                    
                    <div className="space-y-4 pt-2">
                      {["pending", "preparing", "ready", "completed"].map((status) => {
                        const count = orders.filter(o => o.status === status).length;
                        const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                        return (
                          <div key={status} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="capitalize">{status}</span>
                              <span className="text-gray-455">{count} orders ({Math.round(percentage)}%)</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  status === "pending" ? "bg-amber-500" :
                                  status === "preparing" ? "bg-blue-500" :
                                  status === "ready" ? "bg-indigo-550" :
                                  "bg-emerald-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* --- ADD / EDIT MENU ITEM MODAL WITH PROGRESS UPLOADER --- */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl glassmorphism text-gray-900 dark:text-white shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-white/10 flex flex-col justify-between">
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-150 dark:border-gray-850">
              <h3 className="font-serif text-lg font-bold text-gray-850 dark:text-white">
                {editingItem ? `Edit Details: ${editingItem.name}` : "Create Menu Plate"}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-405 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-450">Dish Title *</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Garlic Butter Naan"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-450">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="e.g. 150.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-450">Category *</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand dark:bg-gray-900 outline-none"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-450">Description</label>
                <textarea
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Describe ingredients, cooking styles, flavors..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand outline-none h-16 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-450">Calories (kcal)</label>
                  <input
                    type="number"
                    value={itemCalories}
                    onChange={(e) => setItemCalories(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-xs focus:ring-1 focus:ring-brand focus:border-brand outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-450 font-semibold">Image / Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={itemImage}
                      onChange={(e) => setItemImage(e.target.value)}
                      placeholder="/assets/butter_chicken.png"
                      className="flex-grow px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent text-[10px] focus:ring-1 focus:ring-brand focus:border-brand outline-none"
                    />
                    <label className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-brand flex items-center justify-center cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploadingImage && (
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-gray-400">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div className="h-full bg-brand rounded" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-455">Dietary Badges</label>
                <div className="flex flex-wrap gap-2">
                  {["Vegetarian", "Vegan", "Spicy", "Gluten-Free"].map((tag) => {
                    const hasTag = itemTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          hasTag
                            ? "bg-brand/10 border-brand text-brand"
                            : "border-gray-250 dark:border-gray-850 text-gray-400"
                        }`}
                      >
                        {tag} {hasTag ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-gray-850 flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-grow py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-655 dark:text-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Save Plate
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
