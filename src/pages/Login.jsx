import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, AlertCircle, UtensilsCrossed, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all credentials.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email.trim(), password);
      showToast(`Welcome back, ${user.displayName || "User"}!`, "success");
      
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "manager") {
        navigate("/manager/dashboard");
      } else {
        navigate("/menu");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid authentication credentials.");
      showToast(err.message || "Login failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    showToast(`Loaded ${demoEmail.split('@')[0]} credentials. Click Sign In to log in.`, "info");
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-50 dark:bg-darkbg-DEFAULT text-gray-900 dark:text-white px-4 py-8">
      {/* Background radial glares */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-brand/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-brand-dark/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Portal Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-lg mb-3">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight">Sign In</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light">
            Access your orders, management workspace, or administration settings.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl glassmorphism border border-gray-200 dark:border-white/10 shadow-2xl space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 pl-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 pl-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-bold text-sm shadow-lg hover:shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                submitting ? "opacity-75 cursor-wait" : "hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register CTA */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-1">
            Don't have a customer account?{" "}
            <Link to="/register" className="text-brand font-bold hover:underline inline-flex items-center gap-0.5">
              Sign up here <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick-fill Demo Credentials Card */}
          <div className="p-4 rounded-2xl bg-brand/5 border border-brand/10 space-y-2">
            <span className="block text-[9px] uppercase tracking-widest font-black text-brand text-center">
              Demo Credentials (Click to Autofill)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@restaurant.com", "admin123")}
                className="py-2 px-1 text-[10px] font-bold rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand text-gray-700 dark:text-gray-300 transition-all cursor-pointer truncate font-semibold"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("manager@restaurant.com", "manager123")}
                className="py-2 px-1 text-[10px] font-bold rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand text-gray-700 dark:text-gray-300 transition-all cursor-pointer truncate font-semibold"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("customer@restaurant.com", "customer123")}
                className="py-2 px-1 text-[10px] font-bold rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand text-gray-700 dark:text-gray-300 transition-all cursor-pointer truncate font-semibold"
              >
                Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
