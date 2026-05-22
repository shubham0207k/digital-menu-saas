import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, AlertCircle, UtensilsCrossed } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const AdminLogin = () => {
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
      await login(email, password);
      showToast("Logged in as Administrator", "success");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid authentication credentials.");
      showToast(err.message || "Login failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-50 dark:bg-darkbg-DEFAULT text-gray-900 dark:text-white px-4">
      {/* Background radial glares */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-brand/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-brand-dark/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-8">
        
        {/* Portal Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-lg mb-4">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight">Restaurant Portal</h2>
          <p className="text-xs text-gray-550 dark:text-gray-400 mt-1.5 font-light">
            Authenticate to access dashboard controls.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl glassmorphism border border-white/10 shadow-2xl space-y-6">
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
                  placeholder="admin@restaurant.com"
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
              {submitting ? "Signing in..." : "Access Dashboard"}
            </button>
          </form>

          {/* Testing Credentials Callout */}
          <div className="p-4 rounded-2xl bg-brand/5 border border-brand/10 space-y-1 text-center">
            <span className="text-[9px] uppercase tracking-widest font-black text-brand">Demo Admin credentials</span>
            <div className="text-xs space-y-0.5 text-gray-600 dark:text-gray-300 font-medium">
              <p>Email: <span className="font-mono font-bold text-gray-800 dark:text-white select-all">admin@restaurant.com</span></p>
              <p>Password: <span className="font-mono font-bold text-gray-800 dark:text-white select-all">admin123</span></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
