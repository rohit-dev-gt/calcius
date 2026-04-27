import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Lock, Download, Trash2, Volume2, Zap, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { userApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { changePasswordSchema } from '@calcura/shared';
import { useNavigate } from 'react-router-dom';

const profileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  country: z.string().max(100).optional(),
});

const EXAM_TAGS = ['SSC CGL', 'SSC CHSL', 'IBPS PO', 'IBPS Clerk', 'SBI PO', 'CAT', 'GMAT', 'RRB NTPC', 'NDA'];

export function SettingsPage() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues: { username: user?.username ?? '' } });

  // Password form
  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const updateProfileMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated!');
      queryClient.invalidateQueries({ queryKey: ['user-me'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Update failed'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed!');
      resetPwd();
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Change failed'),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: () => {
      clearAuth();
      navigate('/login');
      toast.success('Account deleted');
    },
    onError: () => toast.error('Failed to delete account'),
  });

  const handleExportData = async () => {
    try {
      const res = await userApi.exportData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calcura-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-black text-white">Settings</h1>

      {/* Profile */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <User size={16} />
          Profile
        </div>
        <form onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Username</label>
            <input {...registerProfile('username')} className="input-field" placeholder="Username" />
            {profileErrors.username && <p className="text-red-400 text-xs mt-1">{profileErrors.username.message}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Country</label>
            <input {...registerProfile('country')} className="input-field" placeholder="e.g. India" />
          </div>
          <div className="text-xs text-slate-500">Email: {user?.email} (not editable)</div>
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="btn-primary w-fit"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Lock size={16} />
          Change Password
        </div>
        <form onSubmit={handlePwdSubmit((data) => changePasswordMutation.mutate(data))} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Current Password</label>
            <input {...registerPwd('currentPassword')} type="password" className="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">New Password</label>
            <input {...registerPwd('newPassword')} type="password" className="input-field" placeholder="Min 8 characters" />
            {pwdErrors.newPassword && <p className="text-red-400 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
          </div>
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="btn-primary w-fit"
          >
            {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Zap size={16} />
          Preferences
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-white">Sound Effects</div>
              <div className="text-xs text-slate-500">Tick on start, chime on answer</div>
            </div>
            <div
              onClick={() => setSoundEnabled((s) => !s)}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${soundEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}
              style={{ position: 'relative' }}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>
          <div className="h-px bg-white/8" />
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-white">Animations</div>
              <div className="text-xs text-slate-500">Framer Motion transitions</div>
            </div>
            <div
              onClick={() => setAnimationsEnabled((s) => !s)}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${animationsEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}
              style={{ position: 'relative' }}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${animationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>
        </div>
      </div>

      {/* Exam tags */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Tag size={16} />
          Target Exams
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAM_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/30 text-indigo-300 bg-indigo-500/10"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-600">Calcura covers all topics tested in the above exams.</p>
      </div>

      {/* Data */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Download size={16} />
          My Data
        </div>
        <button onClick={handleExportData} className="btn-ghost w-fit border border-white/10 text-slate-300">
          <Download size={14} />
          Export All Data (JSON)
        </button>
        <p className="text-xs text-slate-600">Downloads all your question logs, sessions, and stats.</p>
      </div>

      {/* Danger zone */}
      <div className="card p-6 flex flex-col gap-4 border-red-500/20">
        <div className="flex items-center gap-2 text-red-400 font-semibold">
          <Trash2 size={16} />
          Danger Zone
        </div>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="btn-ghost w-fit text-red-400 border border-red-500/20 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-sm text-red-400 font-medium">
              This will permanently delete your account and all data. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => deleteAccountMutation.mutate()}
                disabled={deleteAccountMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                {deleteAccountMutation.isPending ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="btn-ghost border border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <div className="text-center text-xs text-slate-700 pb-4">
        Calcura v1.0.0 · Made for competitive exam aspirants · © 2025
      </div>
    </div>
  );
}
