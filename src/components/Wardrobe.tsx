/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClothingItem } from '../types';
import { Search, Plus, Filter, SlidersHorizontal, Trash2, Edit3, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface WardrobeProps {
  clothes: ClothingItem[];
  token: string;
  onClothesChange: () => void;
}

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Dresses', 'Accessories'];
const OCCASIONS = ['All', 'Casual', 'Formal', 'Work', 'Sporty', 'Party'];
const COLORS = ['White', 'Black', 'Blue', 'Grey', 'Red', 'Yellow', 'Green', 'Brown', 'Navy', 'Pink', 'Beige', 'Khaki', 'Maroon'];

// Gorgeous predefined premium image presets by category for quick entry
const PRESETS: Record<string, { name: string; url: string }[]> = {
  'Tops': [
    { name: "White Formal Shirt", url: "/src/assets/images/white_formal_shirt_1783701961307.jpg" },
    { name: "Black Shirt", url: "/src/assets/images/black_shirt_1783701970742.jpg" },
    { name: "Navy Blue Shirt", url: "/src/assets/images/navy_blue_shirt_1783701982078.jpg" },
    { name: "Light Blue Shirt", url: "/src/assets/images/light_blue_shirt_1783701994914.jpg" },
    { name: "Olive Green Shirt", url: "/src/assets/images/olive_green_shirt_1783702006151.jpg" },
    { name: "Beige Shirt", url: "/src/assets/images/beige_shirt_1783702028962.jpg" },
    { name: "Grey Shirt", url: "/src/assets/images/grey_shirt_1783702040000.jpg" },
    { name: "Brown Shirt", url: "/src/assets/images/brown_shirt_1783702051720.jpg" },
    { name: "Maroon Shirt", url: "/src/assets/images/maroon_shirt_1783702063557.jpg" },
    { name: "Sky Blue Shirt", url: "/src/assets/images/sky_blue_shirt_1783702075155.jpg" }
  ],
  'Bottoms': [
    { name: "Black Jeans", url: "/src/assets/images/black_jeans_1783702089506.jpg" },
    { name: "Blue Jeans", url: "/src/assets/images/blue_jeans_1783702101249.jpg" },
    { name: "Grey Formal Trousers", url: "/src/assets/images/grey_formal_trousers_1783702111031.jpg" },
    { name: "Beige Chinos", url: "/src/assets/images/beige_chinos_1783702121958.jpg" },
    { name: "Khaki Chinos", url: "/src/assets/images/khaki_chinos_1783702132204.jpg" },
    { name: "Navy Blue Trousers", url: "/src/assets/images/navy_blue_trousers_1783702146790.jpg" },
    { name: "White Trousers", url: "/src/assets/images/white_trousers_1783702159054.jpg" },
    { name: "Brown Chinos", url: "/src/assets/images/brown_chinos_1783702170203.jpg" },
    { name: "Olive Green Pants", url: "/src/assets/images/olive_green_pants_1783702179763.jpg" },
    { name: "Dark Grey Pants", url: "/src/assets/images/dark_grey_pants_1783702189695.jpg" }
  ],
  'Shoes': [
    { name: "White Sneakers", url: "/src/assets/images/white_sneakers_1783702202604.jpg" },
    { name: "Black Sneakers", url: "/src/assets/images/black_sneakers_1783702213566.jpg" },
    { name: "Brown Loafers", url: "/src/assets/images/brown_loafers_1783702225540.jpg" },
    { name: "Black Formal Shoes", url: "/src/assets/images/black_formal_shoes_1783702237397.jpg" },
    { name: "White Running Shoes", url: "/src/assets/images/white_running_shoes_1783702249344.jpg" }
  ],
  'Outerwear': [
    { name: "Black Leather Jacket", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400" },
    { name: "Professional Navy Blazer", url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400" },
    { name: "Wool Trench Coat", url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=400" }
  ],
  'Dresses': [
    { name: "Bright Summer Floral Dress", url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=400" },
    { name: "Chic Cocktail Black Dress", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400" }
  ],
  'Accessories': [
    { name: "Minimalist Aviators", url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400" },
    { name: "Rose Gold Quartz Watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400" },
    { name: "Premium Leather Belt", url: "https://images.unsplash.com/photo-1624222247344-550fb8fe8b43?auto=format&fit=crop&q=80&w=400" }
  ]
};

export default function Wardrobe({ clothes, token, onClothesChange }: WardrobeProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Tops');
  const [formColor, setFormColor] = useState('White');
  const [formOccasion, setFormOccasion] = useState('Casual');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filtered list
  const filteredClothes = clothes.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.category.toLowerCase().includes(search.toLowerCase()) || 
                          item.color.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesOccasion = selectedOccasion === 'All' || item.occasion === selectedOccasion;
    const matchesColor = selectedColor === 'All' || item.color === selectedColor;

    return matchesSearch && matchesCategory && matchesOccasion && matchesColor;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Tops');
    setFormColor('White');
    setFormOccasion('Casual');
    
    // Default to first preset of 'Tops'
    const defaultPreset = PRESETS['Tops']?.[0]?.url || '';
    setFormImageUrl(defaultPreset);
    
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (item: ClothingItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormColor(item.color);
    setFormOccasion(item.occasion);
    setFormImageUrl(item.imageUrl);
    setError(null);
    setShowModal(true);
  };

  // When form category changes, auto-load first preset image
  const handleCategoryChange = (cat: string) => {
    setFormCategory(cat);
    const categoryPresets = PRESETS[cat];
    if (categoryPresets && categoryPresets.length > 0) {
      setFormImageUrl(categoryPresets[0].url);
      if (!formName) {
         setFormName(categoryPresets[0].name);
      }
    }
  };

  const selectPreset = (name: string, url: string) => {
    setFormImageUrl(url);
    setFormName(name);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Please fill out the item name");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: formName,
      category: formCategory,
      color: formColor,
      occasion: formOccasion,
      imageUrl: formImageUrl
    };

    try {
      const url = editingItem ? `/api/clothes/${editingItem.id}` : '/api/clothes';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save item");
      }

      setShowModal(false);
      onClothesChange();
    } catch (err: any) {
      setError(err.message || "Something went wrong saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this clothing item? Doing so will remove it from all outfit combinations.")) {
      return;
    }

    try {
      const res = await fetch(`/api/clothes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete item");
      }

      onClothesChange();
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    }
  };

  return (
    <div id="wardrobe-container" className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Wardrobe</h2>
          <p className="text-sm text-slate-500 mt-0.5">Explore, search, filter, and add your stylish clothes.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 bg-black hover:bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Clothing Item
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-none flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clothes (e.g. White, Jeans)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Occasion Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="bg-transparent border-none focus:outline-none font-medium cursor-pointer"
            >
              <option value="All">All Occasions</option>
              {OCCASIONS.filter(o => o !== 'All').map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="bg-transparent border-none focus:outline-none font-medium cursor-pointer"
            >
              <option value="All">All Colors</option>
              {COLORS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all duration-150 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-50 text-blue-700 border-transparent shadow-none'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of clothes */}
      {filteredClothes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mx-auto mb-4">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No items match your query</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Try adjusting your search keywords, category filter, or click the button below to add your first clothing item to this section!
          </p>
          <button
            onClick={openAddModal}
            className="mt-5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
          >
            Add Clothing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredClothes.map(item => (
            <motion.div
              layout
              key={item.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-none hover:border-slate-300 transition-all duration-200 flex flex-col"
            >
              {/* Product Image */}
              <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay with Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
                    title="Edit item details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-white hover:bg-red-50 text-red-600 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Badges */}
                <span className="absolute top-2 left-2 bg-white/95 border border-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow-sm">
                  {item.category}
                </span>
                <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-medium px-2 py-0.5 rounded-lg">
                  {item.occasion}
                </span>
              </div>

              {/* Product Details */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-3 h-3 rounded-full border border-slate-200 inline-block shadow-sm" style={{ backgroundColor: item.color.toLowerCase() === 'white' ? '#fff' : item.color.toLowerCase() }}></span>
                    <span className="text-[11px] text-slate-500 font-medium">{item.color}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Clothing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-none border border-slate-200 flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? "Edit Clothing Details" : "Add New Clothing Item"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5 flex-1 grid grid-cols-1 md:grid-cols-12 gap-5">
              {error && (
                <div className="md:col-span-12 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {/* Form Input fields */}
              <div className="space-y-4 md:col-span-7">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Denim Hoodie"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors cursor-pointer"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Occasion
                    </label>
                    <select
                      value={formOccasion}
                      onChange={(e) => setFormOccasion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors cursor-pointer"
                    >
                      {OCCASIONS.filter(o => o !== 'All').map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Color
                    </label>
                    <select
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors cursor-pointer"
                    >
                      {COLORS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Or Custom Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview & Preset Selection */}
              <div className="md:col-span-5 bg-slate-50 rounded-2xl p-4 flex flex-col justify-between border border-slate-100">
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Choose Preset Photo
                  </span>
                  
                  {/* Presets grid for current category */}
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {(PRESETS[formCategory] || []).map(preset => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => selectPreset(preset.name, preset.url)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 relative group hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer ${
                          formImageUrl === preset.url ? 'border-blue-600' : 'border-transparent'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white py-0.5 px-1 truncate font-medium">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Live Preview</span>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-white">
                    {formImageUrl ? (
                      <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                        <ImageIcon className="w-5 h-5 mb-1" />
                        No image chosen
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Controls */}
              <div className="md:col-span-12 border-t border-slate-100 pt-5 flex justify-end gap-3.5">
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
                  className="bg-black hover:bg-slate-900 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  {saving ? "Saving..." : (editingItem ? "Update Item" : "Create Item")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
