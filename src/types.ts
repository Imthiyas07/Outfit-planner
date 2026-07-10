/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ClothingItem {
  id: string;
  userId: string;
  name: string;
  category: 'Tops' | 'Bottoms' | 'Shoes' | 'Outerwear' | 'Dresses' | 'Accessories' | string;
  color: string;
  occasion: 'Casual' | 'Formal' | 'Sporty' | 'Work' | 'Party' | string;
  imageUrl: string;
  createdAt: string;
}

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  description: string;
  clothingIds: string[]; // references ClothingItem.id
  createdAt: string;
}

export interface PlannedOutfit {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  outfitId?: string; // Optional: references Outfit.id
  clothingIds?: string[]; // Optional: custom direct items
  note?: string;
  createdAt: string;
}
