import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../services/api_service';
import logo from '../../assets/icon_resort.png';
import background from '../../assets/Background.png';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiService.post('/auth/admin-login', { email, password });

      if (data.success) {
        localStorage.setItem('admin_token', data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${background})` }}
      />
      {/* Dark Overlay with Blur */}
      <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-md" />

      <div className="relative z-20 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-[2.5rem] border border-white/20 flex flex-col items-center">
          {/* Logo Section */}
          <div className="mb-10 flex items-center gap-2">
            <img
              src={logo}
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-[#1a8a3d] leading-none mb-1">
                THAO NGUYEN
              </h1>
              <div className="flex items-center gap-1">
                <p className="text-[10px] font-medium text-[#1a8a3d] tracking-[0.2em] whitespace-nowrap uppercase">
                  HOTEL & RESORT
                </p>
                <div className="flex gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="text-[#1a8a3d] text-[10px]">★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <form className="w-full space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100 flex items-center justify-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-green-600 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all sm:text-sm font-semibold text-slate-900 placeholder-slate-400"
                  placeholder="Example@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-green-600 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all sm:text-sm font-semibold text-slate-900 placeholder-slate-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-green-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-green-200 text-sm font-black text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  SIGN IN
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
        <p className="text-center mt-8 text-white/60 text-xs font-medium tracking-wide">
          © 2026 Thao Nguyen Hotel & Resort. All rights reserved.
        </p>
      </div>
    </div >
  );
};

export default AdminLogin;

