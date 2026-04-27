import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerSchema, type RegisterInput } from '@calcura/shared';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(accessToken, user);
      toast.success(`Welcome to Calcura, ${user.username}! 🎉`);
      navigate('/dashboard');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? 'Registration failed');
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-navy-800 flex-1 border-r border-white/8">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-5xl font-black text-gradient mb-3">Calcura</div>
          <p className="text-slate-400 text-lg mb-8">Join thousands of aspirants training daily</p>
          <div className="flex flex-col gap-3">
            {[
              'Free to join — no credit card',
              'Practice any of 14 modules instantly',
              '7-tier rank system from Novice to Calcura Genius',
              'Track your improvement over time with analytics',
              'Compete globally on the leaderboard',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-2.5"
              >
                <CheckCircle size={16} className="text-green-400 shrink-0" />
                <span className="text-slate-400 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm flex flex-col gap-8"
        >
          <div className="lg:hidden text-center">
            <div className="text-3xl font-black text-gradient">Calcura</div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-slate-400 text-sm">Start training for free</p>
          </div>

          <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Username</label>
              <input
                {...register('username')}
                className={`input-field ${errors.username ? 'error' : ''}`}
                placeholder="e.g. mathwizard99"
                autoComplete="username"
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

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
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
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
              disabled={registerMutation.isPending}
              className="btn-primary w-full mt-2"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
