import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginSchema, type LoginInput } from '@calcura/shared';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, loginAsGuest } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(accessToken, user);
      toast.success(`Welcome back, ${user.username}!`);
      navigate('/dashboard');
    },
    onError: (err: any) => {
      const status = err.response?.status;
      const msg = err.response?.data?.error;
      if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        toast.error('Backend not running. Use "Practice as Guest" to start practicing now!', { duration: 5000 });
      } else if (status === 401) {
        toast.error('Invalid email or password.');
      } else {
        toast.error(msg ?? 'Login failed. Please try again.');
      }
    },
  });

  const handleGuestMode = () => {
    loginAsGuest();
    toast.success('Practicing as Guest — all 14 modules available!', { duration: 3000 });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-navy-800 flex-1 border-r border-white/8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-5xl font-black text-gradient mb-4">Calcura</div>
          <p className="text-xl text-slate-400 mb-8">Train your mind. Master the numbers.</p>
          <div className="flex flex-col gap-4">
            {[
              { icon: '🧠', text: '14 practice modules covering all competitive exam topics' },
              { icon: '⚡', text: 'Precision timer with performance.now() accuracy' },
              { icon: '📈', text: 'Analytics dashboard with rank system and activity heatmap' },
              { icon: '🏆', text: 'Global leaderboard — compete with aspirants worldwide' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-slate-400 text-sm leading-relaxed">{item.text}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {['SSC CGL', 'IBPS PO', 'CAT', 'GMAT', 'RRB NTPC', 'NDA'].map((tag) => (
              <span key={tag} className="module-badge text-slate-400 text-xs">{tag}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm flex flex-col gap-6"
        >
          {/* Logo (mobile) */}
          <div className="lg:hidden text-center">
            <div className="text-3xl font-black text-gradient">Calcura</div>
            <p className="text-slate-500 text-sm mt-1">Train your mind. Master the numbers.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in to continue your practice</p>
          </div>

          {/* ── Guest Mode Banner ─────────────────────────────────────────── */}
          <motion.button
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={handleGuestMode}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-indigo-500/50 bg-indigo-500/10 hover:bg-indigo-500/15 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div className="text-left">
                <div className="text-sm font-bold text-white">Practice as Guest</div>
                <div className="text-xs text-indigo-300">Start instantly — no signup needed</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-600 font-medium">or sign in</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
              <input
                {...register('email')}
                type="email"
                className={`input-field ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          {/* Backend status note */}
          <p className="text-center text-xs text-slate-700 leading-relaxed">
            Account features require the backend server.<br />
            Guest mode works fully offline.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
