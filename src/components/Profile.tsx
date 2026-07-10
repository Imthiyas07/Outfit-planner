/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, ClothingItem, Outfit, PlannedOutfit } from '../types';
import { User as UserIcon, Mail, ShieldAlert, Check, Loader2, Sparkles, Award, TrendingUp, CalendarDays, Tags } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  user: User;
  clothes: ClothingItem[];
  outfits: Outfit[];
  plannedOutfits: PlannedOutfit[];
  token: string;
  onProfileChange: (updatedUser: User) => void;
}

export default function Profile({ user, clothes, outfits, plannedOutfits, token, onProfileChange }: ProfileProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: any = { name, email, avatarUrl };
      if (password.trim()) {
        payload.password = password;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      onProfileChange(data.user);
      setSuccess(true);
      setPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const regenerateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`);
  };

  return (
    <div id="profile-container" className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Account & Analytics</h2>
        <p className="text-sm text-slate-500 mt-0.5">Edit credentials, customize your layout, and view wardrobe statistics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card and Stats */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main Visual Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto group">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-950 bg-slate-50">
                <img src={avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={regenerateAvatar}
                className="absolute -bottom-1 -right-1 bg-black hover:bg-slate-900 text-white rounded-full p-1.5 shadow-none active:scale-90 transition-all cursor-pointer"
                title="Regenerate random avatar"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">{user.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">@{user.username}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Account ID:</span>
                <span className="font-mono text-slate-700 font-semibold">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Joined Closet:</span>
                <span className="font-semibold text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Wardrobe Stats */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-900" />
              Closet Metrics
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center">
                <Tags className="w-4 h-4 text-slate-900 mx-auto mb-1" />
                <span className="block text-lg font-extrabold text-slate-900 leading-none">{clothes.length}</span>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">Garments</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center">
                <Award className="w-4 h-4 text-slate-900 mx-auto mb-1" />
                <span className="block text-lg font-extrabold text-slate-900 leading-none">{outfits.length}</span>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">Outfits</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center">
                <CalendarDays className="w-4 h-4 text-slate-900 mx-auto mb-1" />
                <span className="block text-lg font-extrabold text-slate-900 leading-none">{plannedOutfits.length}</span>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">Plans</span>
              </div>
            </div>
          </div>

        </div>

        {/* Update Form Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Account Credentials</h3>
              <p className="text-xs text-gray-500 mt-0.5">Change your profile settings. Leave password blank if you do not want to alter it.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-100 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Account updated successfully!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Change Password
                </label>
                <input
                  type="password"
                  placeholder="•••••••• (Leave blank to keep current)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1.5 bg-black hover:bg-slate-900 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
