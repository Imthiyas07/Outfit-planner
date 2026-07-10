/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Outfit, ClothingItem } from '../types';
import { Plus, Trash2, X, FolderHeart, Image as ImageIcon, Check, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface OutfitsProps {
  outfits: Outfit[];
  clothes: ClothingItem[];
  token: string;
  onOutfitsChange: () => void;
}

export default function Outfits({ outfits, clothes, token, onOutfitsChange }: OutfitsProps) {
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedClothingIds, setSelectedClothingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Active Filter inside wardrobe picker
  const [pickerCategory, setPickerCategory] = useState('All');

  // Previewing details of a specific outfit
  const [previewOutfit, setPreviewOutfit] = useState<Outfit | null>(null);

  const toggleClothingSelection = (id: string) => {
    setSelectedClothingIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCreateOutfit = () => {
    setFormName('');
    setFormDescription('');
    setSelectedClothingIds([]);
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Please specify an outfit name");
      return;
    }
    if (selectedClothingIds.length === 0) {
      setError("Please select at least one clothing item to form this outfit");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: formName,
      description: formDescription,
      clothingIds: selectedClothingIds
    };

    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create outfit");
      }

      setShowModal(false);
      onOutfitsChange();
    } catch (err: any) {
      setError(err.message || "Failed to save outfit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this outfit combination? This will also remove it from any planned calendar dates.")) {
      return;
    }

    try {
      const res = await fetch(`/api/outfits/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete outfit");
      }

      onOutfitsChange();
    } catch (err: any) {
      alert(err.message || "Failed to delete outfit");
    }
  };

  const getClothesForOutfit = (outfit: Outfit) => {
    return outfit.clothingIds
      .map(id => clothes.find(c => c.id === id))
      .filter((c): c is ClothingItem => !!c);
  };

  return (
    <div id="outfits-container" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Outfit Combinations</h2>
          <p className="text-sm text-slate-500 mt-0.5">Combine your clothes into stylish, ready-to-wear visual sets.</p>
        </div>
        <button
          onClick={handleCreateOutfit}
          className="inline-flex items-center justify-center gap-1.5 bg-black hover:bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Outfit Set
        </button>
      </div>

      {/* Outfits List Grid */}
      {outfits.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl w-fit mx-auto mb-4">
            <FolderHeart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No outfit sets designed yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Mix and match garments to form full outfit layouts. You can combine a top, pants, shoes, and a blazer together into a single layout.
          </p>
          <button
            onClick={handleCreateOutfit}
            className="mt-5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
          >
            Create First Outfit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outfits.map(outfit => {
            const outfitClothes = getClothesForOutfit(outfit);
            return (
              <div
                key={outfit.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-none hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">{outfit.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {outfit.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewOutfit(outfit)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Preview outfit set"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(outfit.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete outfit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Overlapping Clothing Cards Deck */}
                  <div className="flex items-center -space-x-4 overflow-hidden py-5 mt-3">
                    {outfitClothes.slice(0, 5).map((cloth) => (
                      <div
                        key={cloth.id}
                        className="w-14 h-18 rounded-lg border-2 border-white overflow-hidden bg-slate-50 shadow-sm flex-shrink-0 group relative cursor-help"
                      >
                        <img src={cloth.imageUrl} alt={cloth.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white p-1 text-center font-medium leading-tight">
                          {cloth.name}
                        </span>
                      </div>
                    ))}
                    {outfitClothes.length > 5 && (
                      <div className="w-14 h-18 rounded-lg border-2 border-white bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        +{outfitClothes.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-[11px] text-slate-400">
                  <span className="font-medium bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                    {outfitClothes.length} items
                  </span>
                  <span>Created {new Date(outfit.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW OUTFIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-none border border-slate-200 flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Design Outfit Set</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select clothing elements and bundle them together.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* Left Side: Outfit details and selected elements */}
              <div className="w-full lg:w-2/5 p-6 border-r border-slate-200 overflow-y-auto space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Outfit Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sharp Business Suits"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Description / Style Guide
                    </label>
                    <textarea
                      placeholder="e.g. Best suited for conferences, client dinners, and corporate board meetings..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Selected Apparel Live row */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Selected Clothing Set ({selectedClothingIds.length})
                  </span>
                  {selectedClothingIds.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-450 bg-slate-50/50">
                      Click items from the wardrobe list on the right to add them to this bundle.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {selectedClothingIds.map(id => {
                        const cloth = clothes.find(c => c.id === id);
                        if (!cloth) return null;
                        return (
                          <div key={id} className="relative flex-shrink-0 w-16 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm group">
                            <img src={cloth.imageUrl} alt={cloth.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => toggleClothingSelection(id)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-sm hover:scale-105 transition-all cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white truncate py-0.5 px-1 font-medium text-center">
                              {cloth.category}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-black hover:bg-slate-900 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Save Outfit Set"}
                  </button>
                </div>
              </div>

              {/* Right Side: Wardrobe Item Picker */}
              <div className="w-full lg:w-3/5 p-6 bg-slate-50/60 overflow-y-auto space-y-4 max-h-[500px] lg:max-h-none">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pick Garments</span>
                  <div className="flex gap-1">
                    {['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'].map(cat => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setPickerCategory(cat)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          pickerCategory === cat
                            ? 'bg-black border-black text-white'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {clothes.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    No clothes found in your wardrobe. Please add clothes first!
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {clothes
                      .filter(item => pickerCategory === 'All' || item.category === pickerCategory)
                      .map(item => {
                        const isSelected = selectedClothingIds.includes(item.id);
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => toggleClothingSelection(item.id)}
                            className={`group aspect-[4/5] rounded-xl overflow-hidden border-2 text-left relative transition-all active:scale-[0.98] cursor-pointer ${
                              isSelected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-2">
                              <span className="text-[10px] text-white text-center font-semibold leading-tight">{item.name}</span>
                            </div>

                            {/* Category Badge */}
                            <span className="absolute top-1 left-1 bg-white/90 text-slate-800 text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                              {item.category}
                            </span>

                            {/* Checked Indicator */}
                            {isSelected && (
                              <span className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1 shadow-sm">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* DETAILED OUTFIT PREVIEW MODAL */}
      {previewOutfit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-none border border-slate-200 p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{previewOutfit.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Full catalog view of clothes configured in this set.</p>
              </div>
              <button
                onClick={() => setPreviewOutfit(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-150">
              "{previewOutfit.description || 'No detailed style description provided.'}"
            </p>

            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Composed Garments</span>
              <div className="grid grid-cols-3 gap-3">
                {getClothesForOutfit(previewOutfit).map(cloth => (
                  <div key={cloth.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-none">
                    <div className="aspect-[4/5] bg-slate-50">
                      <img src={cloth.imageUrl} alt={cloth.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2">
                      <h4 className="font-bold text-[11px] text-slate-800 truncate" title={cloth.name}>{cloth.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">{cloth.category} · {cloth.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewOutfit(null)}
                className="bg-black hover:bg-slate-900 text-white text-xs font-semibold py-2 px-5 rounded-xl transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
