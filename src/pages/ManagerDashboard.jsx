import React, { useEffect, useState } from "react";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Bell, 
  Inbox, 
  MapPin, 
  Loader2, 
  TrendingUp, 
  AlertCircle,
  Play,
  Check,
  CheckSquare
} from "lucide-react";
import { dbService } from "../firebase/dbService";
import { useToast } from "../context/ToastContext";

const ManagerDashboard = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Tabs: 'active' or 'completed'
  const [activeTab, setActiveTab] = useState("active");
  // For mobile view, which active column is selected: 'pending', 'preparing', 'ready'
  const [mobileColumn, setMobileColumn] = useState("pending");

  useEffect(() => {
    setLoading(true);
    let unsubscribe;
    try {
      unsubscribe = dbService.listenToOrders((updatedOrders) => {
        setOrders(updatedOrders);
        setLoading(false);
      });
    } catch (err) {
      console.error("Failed to fetch live orders:", err);
      showToast("Could not subscribe to live orders feed", "error");
      setLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleStatusTransition = async (orderId, currentStatus) => {
    let nextStatus = "";
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "completed";
    else return;

    setUpdatingId(orderId);
    try {
      await dbService.updateOrderStatus(orderId, nextStatus);
      showToast(`Order status updated to ${nextStatus}`, "success");
    } catch (err) {
      console.error("Error transitioning status:", err);
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getElapsedTime = (timestamp) => {
    const elapsedMs = Date.now() - timestamp;
    const elapsedMins = Math.floor(elapsedMs / 60000);
    if (elapsedMins < 1) return "Just now";
    return `${elapsedMins}m ago`;
  };

  // Filter orders
  const activeOrders = orders.filter(o => o.status !== "completed");
  const completedOrders = orders.filter(o => o.status === "completed");

  const pendingOrders = activeOrders.filter(o => o.status === "pending");
  const preparingOrders = activeOrders.filter(o => o.status === "preparing");
  const readyOrders = activeOrders.filter(o => o.status === "ready");

  const renderOrderCard = (order) => {
    const isTransitioning = updatingId === order.id;

    return (
      <div 
        key={order.id} 
        className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4 animate-fade-in"
      >
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 font-bold block uppercase">
              #{order.id.slice(-6)}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {getElapsedTime(order.timestamp)}
              </span>
            </div>
          </div>
          
          <div className="px-3 py-1 rounded-xl bg-brand/10 border border-brand/20 text-brand text-xs font-black">
            Table {order.tableNumber}
          </div>
        </div>

        {/* Items Summary */}
        <div className="space-y-2 border-y border-gray-100 dark:border-gray-800/60 py-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-bold text-brand mr-1">x{item.quantity}</span>
                <span className="font-semibold">{item.name}</span>
                {item.customizations?.spice && (
                  <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold uppercase tracking-wider">
                    {item.customizations.spice}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex justify-between items-center sm:block">
            <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold block">
              Total Price
            </span>
            <span className="text-sm font-black text-gray-900 dark:text-white">
              ₹{order.total.toFixed(2)}
            </span>
          </div>

          {order.status !== "completed" && (
            <button
              onClick={() => handleStatusTransition(order.id, order.status)}
              disabled={isTransitioning}
              className={`w-full sm:w-auto py-3 sm:py-2 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isTransitioning ? "opacity-50 cursor-wait" : ""
              } ${
                order.status === "pending"
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10"
                  : order.status === "preparing"
                  ? "bg-brand hover:bg-brand-dark shadow-brand/10"
                  : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10"
              }`}
            >
              {isTransitioning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : order.status === "pending" ? (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Cook</span>
                </>
              ) : order.status === "preparing" ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Mark Ready</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Serve Plate</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-50 dark:bg-darkbg-DEFAULT">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">Loading Dispatch Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50 dark:bg-darkbg-DEFAULT text-gray-900 dark:text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Workspace Title & Stats Summary */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-2">
              <ChefHat className="w-8 h-8 text-brand" /> Manager Workspace
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Monitor incoming orders, track cook timers, and dispatch plates in real-time.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-2 shadow-sm">
              <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold block">New Placed</span>
                <span className="text-sm font-black leading-none">{pendingOrders.length}</span>
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-2 shadow-sm">
              <ChefHat className="w-4 h-4 text-brand animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold block">Preparing</span>
                <span className="text-sm font-black leading-none">{preparingOrders.length}</span>
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold block">Served Today</span>
                <span className="text-sm font-black leading-none">{completedOrders.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global tab selectors (Active / Completed) */}
        <div className="flex border-b border-gray-200 dark:border-gray-800/60 pb-px">
          <button
            onClick={() => setActiveTab("active")}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "active"
                ? "border-brand text-brand"
                : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "completed"
                ? "border-brand text-brand"
                : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Completed Archives ({completedOrders.length})
          </button>
        </div>

        {/* Dashboard Content */}
        {activeTab === "active" ? (
          <>
            {/* Desktop View: Kanban columns */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Column 1: Pending (Placed) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    Placed / Pending
                  </span>
                  <span className="text-xs font-black bg-amber-500/25 px-2 py-0.5 rounded-full">
                    {pendingOrders.length}
                  </span>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {pendingOrders.length === 0 ? (
                    <div className="text-center py-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400">
                      <Inbox className="w-8 h-8 mx-auto mb-2 stroke-1 text-gray-300" />
                      <p className="text-xs">No pending tickets.</p>
                    </div>
                  ) : (
                    pendingOrders.map(renderOrderCard)
                  )}
                </div>
              </div>

              {/* Column 2: Preparing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-3 py-2 bg-brand/10 border border-brand/20 rounded-2xl text-brand">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                    In Kitchen / Cooking
                  </span>
                  <span className="text-xs font-black bg-brand/25 px-2 py-0.5 rounded-full">
                    {preparingOrders.length}
                  </span>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {preparingOrders.length === 0 ? (
                    <div className="text-center py-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400">
                      <ChefHat className="w-8 h-8 mx-auto mb-2 stroke-1 text-gray-300" />
                      <p className="text-xs">No active kitchen preparation.</p>
                    </div>
                  ) : (
                    preparingOrders.map(renderOrderCard)
                  )}
                </div>
              </div>

              {/* Column 3: Ready for serving */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Ready / Dispatch
                  </span>
                  <span className="text-xs font-black bg-emerald-500/25 px-2 py-0.5 rounded-full">
                    {readyOrders.length}
                  </span>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {readyOrders.length === 0 ? (
                    <div className="text-center py-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 stroke-1 text-gray-300" />
                      <p className="text-xs">No dispatches ready.</p>
                    </div>
                  ) : (
                    readyOrders.map(renderOrderCard)
                  )}
                </div>
              </div>

            </div>

            {/* Mobile View: Tabbed sub-columns */}
            <div className="md:hidden space-y-4">
              <div className="grid grid-cols-3 gap-1 p-1 bg-gray-200/50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setMobileColumn("pending")}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                    mobileColumn === "pending"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Pending ({pendingOrders.length})
                </button>
                <button
                  onClick={() => setMobileColumn("preparing")}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                    mobileColumn === "preparing"
                      ? "bg-brand text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Kitchen ({preparingOrders.length})
                </button>
                <button
                  onClick={() => setMobileColumn("ready")}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                    mobileColumn === "ready"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Ready ({readyOrders.length})
                </button>
              </div>

              <div className="space-y-4">
                {mobileColumn === "pending" && (
                  pendingOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 text-gray-400">
                      <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">No pending tickets.</p>
                    </div>
                  ) : (
                    pendingOrders.map(renderOrderCard)
                  )
                )}
                {mobileColumn === "preparing" && (
                  preparingOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 text-gray-400">
                      <ChefHat className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">No active kitchen preparation.</p>
                    </div>
                  ) : (
                    preparingOrders.map(renderOrderCard)
                  )
                )}
                {mobileColumn === "ready" && (
                  readyOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 text-gray-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">No dispatches ready.</p>
                    </div>
                  ) : (
                    readyOrders.map(renderOrderCard)
                  )
                )}
              </div>
            </div>
          </>
        ) : (
          /* Completed Orders tab */
          <div className="space-y-4">
            {completedOrders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 stroke-1 text-gray-300" />
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">No Orders Completed Yet</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Once active orders are served, they will be archived here for record keeping.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm opacity-80"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 font-bold block uppercase">
                          #{order.id.slice(-6)}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                          {new Date(order.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        Served
                      </div>
                    </div>

                    <div className="space-y-2 border-y border-gray-100 dark:border-gray-800/60 py-3 my-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-bold mr-1">x{item.quantity}</span>
                            <span>{item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-400 dark:text-gray-500">Total Price</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ManagerDashboard;
