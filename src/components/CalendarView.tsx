/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Outfit, PlannedOutfit, ClothingItem } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Sparkles, X, Plus, Clock, FileText, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface CalendarViewProps {
  plannedOutfits: PlannedOutfit[];
  outfits: Outfit[];
  clothes: ClothingItem[];
  token: string;
  onCalendarChange: () => void;
}

export default function CalendarView({ plannedOutfits, outfits, clothes, token, onCalendarChange }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlanDay, setSelectedPlanDay] = useState<string | null>(null); // YYYY-MM-DD
  const [selectedOutfitId, setSelectedOutfitId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar logic helpers
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Create grid cells (42 total cells)
  const cells: { dateStr: string; dayNum: number; currentMonth: boolean }[] = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevMonthVal = month === 0 ? 11 : month - 1;
    const prevYearVal = month === 0 ? year - 1 : year;
    const padMonth = String(prevMonthVal + 1).padStart(2, '0');
    const padDay = String(d).padStart(2, '0');
    cells.push({
      dateStr: `${prevYearVal}-${padMonth}-${padDay}`,
      dayNum: d,
      currentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const padMonth = String(month + 1).padStart(2, '0');
    const padDay = String(d).padStart(2, '0');
    cells.push({
      dateStr: `${year}-${padMonth}-${padDay}`,
      dayNum: d,
      currentMonth: true
    });
  }

  // Next month padding to complete the 42 cells grid
  const remainingCells = 42 - cells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthVal = month === 11 ? 0 : month + 1;
    const nextYearVal = month === 11 ? year + 1 : year;
    const padMonth = String(nextMonthVal + 1).padStart(2, '0');
    const padDay = String(d).padStart(2, '0');
    cells.push({
      dateStr: `${nextYearVal}-${padMonth}-${padDay}`,
      dayNum: d,
      currentMonth: false
    });
  }

  // Find plan for specific day
  const getPlanForDate = (dateStr: string) => {
    return plannedOutfits.find(p => p.date === dateStr);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedPlanDay(dateStr);
    const existingPlan = getPlanForDate(dateStr);
    if (existingPlan) {
      setSelectedOutfitId(existingPlan.outfitId || '');
      setNote(existingPlan.note || '');
    } else {
      setSelectedOutfitId('');
      setNote('');
    }
    setError(null);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanDay) return;

    setSaving(true);
    setError(null);

    const payload = {
      date: selectedPlanDay,
      outfitId: selectedOutfitId || undefined,
      note: note
    };

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule outfit");
      }

      setSelectedPlanDay(null);
      onCalendarChange();
    } catch (err: any) {
      setError(err.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePlan = async (id: string) => {
    if (!confirm("Remove scheduled outfit for this day?")) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove schedule");
      }

      setSelectedPlanDay(null);
      onCalendarChange();
    } catch (err: any) {
      setError(err.message || "Failed to remove schedule");
    } finally {
      setSaving(false);
    }
  };

  const getOutfitDetails = (outfitId?: string) => {
    if (!outfitId) return null;
    return outfits.find(o => o.id === outfitId);
  };

  const getClothesForOutfitId = (outfitId?: string) => {
    if (!outfitId) return [];
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) return [];
    return outfit.clothingIds
      .map(cid => clothes.find(c => c.id === cid))
      .filter((c): c is ClothingItem => !!c);
  };

  return (
    <div id="calendar-planner-container" className="space-y-6">
      
      {/* Calendar Header / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-900" />
            Calendar Planner
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Schedule what you wear every day to save morning dress time.</p>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>
          <span className="text-sm font-bold text-gray-800 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Grid Wrapper */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-none overflow-hidden">
        
        {/* Days of the Week Headers */}
        <div className="grid grid-cols-7 bg-slate-50/60 border-b border-slate-200 text-center py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* 42 grid cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {cells.map((cell, idx) => {
            const plan = getPlanForDate(cell.dateStr);
            const outfit = getOutfitDetails(plan?.outfitId);
            const outfitClothes = getClothesForOutfitId(plan?.outfitId);
            const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={`${cell.dateStr}-${idx}`}
                onClick={() => handleDayClick(cell.dateStr)}
                className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col justify-between transition-all cursor-pointer group hover:bg-slate-50/40 ${
                  cell.currentMonth ? 'bg-white' : 'bg-slate-50/30 opacity-40'
                } ${isToday ? 'bg-blue-50/10' : ''}`}
              >
                {/* Date number */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${
                    isToday 
                      ? 'bg-black text-white w-6 h-6 rounded-full flex items-center justify-center' 
                      : 'text-slate-500 group-hover:text-slate-900'
                  }`}>
                    {cell.dayNum}
                  </span>
                  {plan && (
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                  )}
                </div>

                {/* Scheduled item preview inside cell */}
                {plan && outfit ? (
                  <div className="mt-1 space-y-1 bg-slate-50 border border-slate-200 p-1.5 rounded-xl text-left">
                    <span className="block text-[9px] font-bold text-slate-800 truncate" title={outfit.name}>
                      {outfit.name}
                    </span>
                    
                    {/* Visual overlap mini thumbnails */}
                    <div className="flex items-center -space-x-1 overflow-hidden">
                      {outfitClothes.slice(0, 3).map((c, cidx) => (
                        <div key={cidx} className="w-4 h-5 rounded-sm overflow-hidden border border-white bg-slate-50 flex-shrink-0">
                          <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {outfitClothes.length > 3 && (
                        <span className="text-[7px] text-slate-750 font-bold ml-1">+{outfitClothes.length - 3}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center pb-2">
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Plus className="w-2.5 h-2.5" /> Plan look
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAN DETAILS / SCHEDULER MODAL */}
      {selectedPlanDay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-none border border-slate-200 flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-50 text-slate-900 rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Schedule Outfit Layout
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(selectedPlanDay).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanDay(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {/* Outfit Select dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Choose Outfit Set
                </label>
                {outfits.length === 0 ? (
                  <div className="p-3 text-xs bg-slate-50 rounded-xl text-slate-500 border border-slate-200">
                    You haven't saved any outfit sets yet. Please design an outfit set first before scheduling.
                  </div>
                ) : (
                  <select
                    value={selectedOutfitId}
                    onChange={(e) => setSelectedOutfitId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="">-- Clear / Select Outfit --</option>
                    {outfits.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Note input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Activity Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday party, client meeting, business trip, etc."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Clothes in Selected Outfit Visual Panel */}
              {selectedOutfitId && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Included Garments in this Look:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {getClothesForOutfitId(selectedOutfitId).map(c => (
                      <div key={c.id} className="w-12 h-16 rounded-lg border border-slate-200 overflow-hidden bg-white shadow-none flex-shrink-0 relative group">
                        <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-slate-900/60 text-[7px] text-white py-0.5 text-center truncate">{c.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {getPlanForDate(selectedPlanDay) && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleRemovePlan(getPlanForDate(selectedPlanDay)!.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2.5 px-4 rounded-xl border border-red-150 transition-all cursor-pointer"
                    >
                      Delete Plan
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanDay(null)}
                    className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-black hover:bg-slate-900 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {saving ? "Scheduling..." : "Schedule Look"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
