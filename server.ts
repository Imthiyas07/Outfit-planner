/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Initialize express app
const app = express();
const PORT = 3000;

// Middleware for parsing JSON and urlencoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve custom wardrobe assets
app.use('/src/assets/images', express.static(path.join(process.cwd(), 'src/assets/images')));

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface for DB
interface DatabaseSchema {
  users: any[];
  clothes: any[];
  outfits: any[];
  calendar: any[];
}

// Initial/default seed data
const initialDBState: DatabaseSchema = {
  users: [
    {
      id: "demo-user",
      username: "demo",
      email: "demo@outfitplanner.com",
      password: "password123", // Simplified for demo
      name: "Alex Designer",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
      createdAt: new Date().toISOString()
    }
  ],
  clothes: [
    // --- SHIRTS ---
    {
      id: "cloth-shirt-1",
      userId: "demo-user",
      name: "White Formal Shirt",
      category: "Tops",
      color: "White",
      occasion: "Formal",
      imageUrl: "/src/assets/images/white_formal_shirt_1783701961307.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shirt-2",
      userId: "demo-user",
      name: "Black Shirt",
      category: "Tops",
      color: "Black",
      occasion: "Party",
      imageUrl: "/src/assets/images/black_shirt_1783701970742.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shirt-3",
      userId: "demo-user",
      name: "Navy Blue Shirt",
      category: "Tops",
      color: "Navy",
      occasion: "Work",
      imageUrl: "/src/assets/images/navy_blue_shirt_1783701982078.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shirt-4",
      userId: "demo-user",
      name: "Light Blue Shirt",
      category: "Tops",
      color: "Blue",
      occasion: "Casual",
      imageUrl: "/src/assets/images/light_blue_shirt_1783701994914.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shirt-5",
      userId: "demo-user",
      name: "Olive Green Shirt",
      category: "Tops",
      color: "Green",
      occasion: "Casual",
      imageUrl: "/src/assets/images/olive_green_shirt_1783702006151.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shirt-6",
      userId: "demo-user",
      name: "Beige Shirt",
      category: "Tops",
      color: "Beige",
      occasion: "Casual",
      imageUrl: "/src/assets/images/beige_shirt_1783702028962.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shirt-7",
      userId: "demo-user",
      name: "Grey Shirt",
      category: "Tops",
      color: "Grey",
      occasion: "Work",
      imageUrl: "/src/assets/images/grey_shirt_1783702040000.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shirt-8",
      userId: "demo-user",
      name: "Brown Shirt",
      category: "Tops",
      color: "Brown",
      occasion: "Casual",
      imageUrl: "/src/assets/images/brown_shirt_1783702051720.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shirt-9",
      userId: "demo-user",
      name: "Maroon Shirt",
      category: "Tops",
      color: "Maroon",
      occasion: "Party",
      imageUrl: "/src/assets/images/maroon_shirt_1783702063557.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shirt-10",
      userId: "demo-user",
      name: "Sky Blue Shirt",
      category: "Tops",
      color: "Blue",
      occasion: "Casual",
      imageUrl: "/src/assets/images/sky_blue_shirt_1783702075155.jpg",
      createdAt: new Date().toISOString()
    },

    // --- PANTS ---
    {
      id: "cloth-pant-1",
      userId: "demo-user",
      name: "Black Jeans",
      category: "Bottoms",
      color: "Black",
      occasion: "Casual",
      imageUrl: "/src/assets/images/black_jeans_1783702089506.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-pant-2",
      userId: "demo-user",
      name: "Blue Jeans",
      category: "Bottoms",
      color: "Blue",
      occasion: "Casual",
      imageUrl: "/src/assets/images/blue_jeans_1783702101249.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-pant-3",
      userId: "demo-user",
      name: "Grey Formal Trousers",
      category: "Bottoms",
      color: "Grey",
      occasion: "Formal",
      imageUrl: "/src/assets/images/grey_formal_trousers_1783702111031.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-pant-4",
      userId: "demo-user",
      name: "Beige Chinos",
      category: "Bottoms",
      color: "Beige",
      occasion: "Casual",
      imageUrl: "/src/assets/images/beige_chinos_1783702121958.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-pant-5",
      userId: "demo-user",
      name: "Khaki Chinos",
      category: "Bottoms",
      color: "Khaki",
      occasion: "Casual",
      imageUrl: "/src/assets/images/khaki_chinos_1783702132204.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-pant-6",
      userId: "demo-user",
      name: "Navy Blue Trousers",
      category: "Bottoms",
      color: "Navy",
      occasion: "Formal",
      imageUrl: "/src/assets/images/navy_blue_trousers_1783702146790.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-pant-7",
      userId: "demo-user",
      name: "White Trousers",
      category: "Bottoms",
      color: "White",
      occasion: "Casual",
      imageUrl: "/src/assets/images/white_trousers_1783702159054.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-pant-8",
      userId: "demo-user",
      name: "Brown Chinos",
      category: "Bottoms",
      color: "Brown",
      occasion: "Casual",
      imageUrl: "/src/assets/images/brown_chinos_1783702170203.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-pant-9",
      userId: "demo-user",
      name: "Olive Green Pants",
      category: "Bottoms",
      color: "Green",
      occasion: "Casual",
      imageUrl: "/src/assets/images/olive_green_pants_1783702179763.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-pant-10",
      userId: "demo-user",
      name: "Dark Grey Pants",
      category: "Bottoms",
      color: "Grey",
      occasion: "Formal",
      imageUrl: "/src/assets/images/dark_grey_pants_1783702189695.jpg",
      createdAt: new Date().toISOString()
    },

    // --- SHOES ---
    {
      id: "cloth-shoe-1",
      userId: "demo-user",
      name: "White Sneakers",
      category: "Shoes",
      color: "White",
      occasion: "Casual",
      imageUrl: "/src/assets/images/white_sneakers_1783702202604.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shoe-2",
      userId: "demo-user",
      name: "Black Sneakers",
      category: "Shoes",
      color: "Black",
      occasion: "Casual",
      imageUrl: "/src/assets/images/black_sneakers_1783702213566.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shoe-3",
      userId: "demo-user",
      name: "Brown Loafers",
      category: "Shoes",
      color: "Brown",
      occasion: "Formal",
      imageUrl: "/src/assets/images/brown_loafers_1783702225540.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shoe-4",
      userId: "demo-user",
      name: "Black Formal Shoes",
      category: "Shoes",
      color: "Black",
      occasion: "Formal",
      imageUrl: "/src/assets/images/black_formal_shoes_1783702237397.jpg",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-shoe-5",
      userId: "demo-user",
      name: "White Running Shoes",
      category: "Shoes",
      color: "White",
      occasion: "Sporty",
      imageUrl: "/src/assets/images/white_running_shoes_1783702249344.jpg",
      createdAt: new Date().toISOString()
    }
  ],
  outfits: [
    {
      id: "outfit-1",
      userId: "demo-user",
      name: "Smart Casual Chic",
      description: "A timeless, sharp business casual coordination combining navy, khaki, and brown loafers.",
      clothingIds: ["cloth-shirt-3", "cloth-pant-5", "cloth-shoe-3"],
      createdAt: new Date().toISOString()
    },
    {
      id: "outfit-2",
      userId: "demo-user",
      name: "Weekend Comfort",
      description: "Relaxed and clean outfit combination, perfect for brunches or informal weekend hangouts.",
      clothingIds: ["cloth-shirt-4", "cloth-pant-1", "cloth-shoe-1"],
      createdAt: new Date().toISOString()
    }
  ],
  calendar: [
    {
      id: "plan-1",
      userId: "demo-user",
      date: new Date().toISOString().split('T')[0], // Today
      outfitId: "outfit-1",
      clothingIds: ["cloth-shirt-3", "cloth-pant-5", "cloth-shoe-3"],
      note: "Meeting friends and coworkers for coffee",
      createdAt: new Date().toISOString()
    }
  ]
};

// Database helper functions
const getDB = (): DatabaseSchema => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDBState, null, 2));
    return initialDBState;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading database file, resetting to empty:", error);
    return initialDBState;
  }
};

// Seed database on startup if file doesn't exist
getDB();

const saveDB = (db: DatabaseSchema) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

// API ROUTES

// Auth Endpoints
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    if (!username || !email || !password || !name) {
      res.status(400).json({ error: "Missing required registration fields" });
      return;
    }

    const db = getDB();
    const exists = db.users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    
    if (exists) {
      res.status(400).json({ error: "Username or Email is already registered" });
      return;
    }

    const newUser = {
      id: "user-" + Date.now().toString(36),
      username,
      email,
      password, // In a real app we'd hash, but for demo and simplicity we keep plain text
      name,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token: `mock-token-${newUser.id}` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      res.status(400).json({ error: "Missing username/email or password" });
      return;
    }

    const db = getDB();
    const user = db.users.find(u => 
      (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()) && 
      u.password === password
    );

    if (!user) {
      res.status(401).json({ error: "Invalid username, email, or password" });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token: `mock-token-${user.id}` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Helper middleware to extract user from Authorization header
const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: "Unauthorized access, missing token" });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  const userId = token.replace('mock-token-', '');
  
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  
  if (!user) {
    res.status(401).json({ error: "Unauthorized access, invalid token" });
    return;
  }
  
  (req as any).user = user;
  next();
};

// User Profile Endpoint
app.get('/api/auth/me', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.put('/api/auth/profile', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const { name, avatarUrl, email, password } = req.body;
    
    const db = getDB();
    const userIdx = db.users.findIndex(u => u.id === user.id);
    
    if (userIdx === -1) {
       res.status(404).json({ error: "User not found" });
       return;
    }
    
    if (name) db.users[userIdx].name = name;
    if (avatarUrl) db.users[userIdx].avatarUrl = avatarUrl;
    if (email) db.users[userIdx].email = email;
    if (password) db.users[userIdx].password = password;
    
    saveDB(db);
    
    const { password: _, ...updatedUser } = db.users[userIdx];
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Internal server error updating profile" });
  }
});

// Clothes Endpoints
app.get('/api/clothes', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const db = getDB();
    const userClothes = db.clothes.filter(c => c.userId === user.id);
    res.json(userClothes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clothes" });
  }
});

app.post('/api/clothes', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const { name, category, color, occasion, imageUrl } = req.body;
    
    if (!name || !category || !color || !occasion) {
       res.status(400).json({ error: "Name, Category, Color, and Occasion are required" });
       return;
    }
    
    const db = getDB();
    const newItem = {
      id: "cloth-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      userId: user.id,
      name,
      category,
      color,
      occasion,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=400",
      createdAt: new Date().toISOString()
    };
    
    db.clothes.push(newItem);
    saveDB(db);
    
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to add clothing item" });
  }
});

app.put('/api/clothes/:id', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, category, color, occasion, imageUrl } = req.body;
    
    const db = getDB();
    const idx = db.clothes.findIndex(c => c.id === id && c.userId === user.id);
    
    if (idx === -1) {
       res.status(404).json({ error: "Clothing item not found or unauthorized" });
       return;
    }
    
    if (name) db.clothes[idx].name = name;
    if (category) db.clothes[idx].category = category;
    if (color) db.clothes[idx].color = color;
    if (occasion) db.clothes[idx].occasion = occasion;
    if (imageUrl !== undefined) db.clothes[idx].imageUrl = imageUrl;
    
    saveDB(db);
    res.json(db.clothes[idx]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update clothing item" });
  }
});

app.delete('/api/clothes/:id', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const db = getDB();
    const initialLength = db.clothes.length;
    db.clothes = db.clothes.filter(c => !(c.id === id && c.userId === user.id));
    
    if (db.clothes.length === initialLength) {
       res.status(404).json({ error: "Clothing item not found or unauthorized" });
       return;
    }
    
    // Clean up any outfit associations
    db.outfits = db.outfits.map(o => {
      if (o.userId === user.id) {
        return {
          ...o,
          clothingIds: o.clothingIds.filter((cid: string) => cid !== id)
        };
      }
      return o;
    });

    // Clean up calendar directly planned items
    db.calendar = db.calendar.map(p => {
      if (p.userId === user.id && p.clothingIds) {
        return {
          ...p,
          clothingIds: p.clothingIds.filter((cid: string) => cid !== id)
        };
      }
      return p;
    });
    
    saveDB(db);
    res.json({ success: true, message: "Clothing item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete clothing item" });
  }
});

// Outfits Endpoints
app.get('/api/outfits', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const db = getDB();
    const userOutfits = db.outfits.filter(o => o.userId === user.id);
    res.json(userOutfits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch outfits" });
  }
});

app.post('/api/outfits', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const { name, description, clothingIds } = req.body;
    
    if (!name || !clothingIds || !Array.isArray(clothingIds) || clothingIds.length === 0) {
       res.status(400).json({ error: "Name and at least one clothing item are required to create an outfit" });
       return;
    }
    
    const db = getDB();
    const newOutfit = {
      id: "outfit-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      userId: user.id,
      name,
      description: description || "",
      clothingIds,
      createdAt: new Date().toISOString()
    };
    
    db.outfits.push(newOutfit);
    saveDB(db);
    
    res.status(201).json(newOutfit);
  } catch (error) {
    res.status(500).json({ error: "Failed to save outfit" });
  }
});

app.put('/api/outfits/:id', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, description, clothingIds } = req.body;
    
    const db = getDB();
    const idx = db.outfits.findIndex(o => o.id === id && o.userId === user.id);
    
    if (idx === -1) {
       res.status(404).json({ error: "Outfit not found or unauthorized" });
       return;
    }
    
    if (name) db.outfits[idx].name = name;
    if (description !== undefined) db.outfits[idx].description = description;
    if (clothingIds && Array.isArray(clothingIds)) db.outfits[idx].clothingIds = clothingIds;
    
    saveDB(db);
    res.json(db.outfits[idx]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update outfit" });
  }
});

app.delete('/api/outfits/:id', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const db = getDB();
    const initialLength = db.outfits.length;
    db.outfits = db.outfits.filter(o => !(o.id === id && o.userId === user.id));
    
    if (db.outfits.length === initialLength) {
       res.status(404).json({ error: "Outfit not found or unauthorized" });
       return;
    }
    
    // Clean up calendar associations
    db.calendar = db.calendar.map(p => {
      if (p.userId === user.id && p.outfitId === id) {
        return {
          ...p,
          outfitId: undefined
        };
      }
      return p;
    });
    
    saveDB(db);
    res.json({ success: true, message: "Outfit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete outfit" });
  }
});

// Calendar Plans Endpoints
app.get('/api/calendar', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const db = getDB();
    const userCalendar = db.calendar.filter(p => p.userId === user.id);
    res.json(userCalendar);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch calendar plans" });
  }
});

app.post('/api/calendar', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const { date, outfitId, clothingIds, note } = req.body;
    
    if (!date) {
       res.status(400).json({ error: "Date is required" });
       return;
    }
    
    const db = getDB();
    // Check if user already has a plan for this date - if so, update or overwrite
    const existingIndex = db.calendar.findIndex(p => p.date === date && p.userId === user.id);
    
    if (existingIndex !== -1) {
      db.calendar[existingIndex] = {
        ...db.calendar[existingIndex],
        outfitId,
        clothingIds: clothingIds || [],
        note: note || "",
        createdAt: new Date().toISOString()
      };
      saveDB(db);
      res.json(db.calendar[existingIndex]);
    } else {
      const newPlan = {
        id: "plan-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        userId: user.id,
        date,
        outfitId,
        clothingIds: clothingIds || [],
        note: note || "",
        createdAt: new Date().toISOString()
      };
      
      db.calendar.push(newPlan);
      saveDB(db);
      res.status(201).json(newPlan);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to save calendar plan" });
  }
});

app.delete('/api/calendar/:id', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const db = getDB();
    const initialLength = db.calendar.length;
    db.calendar = db.calendar.filter(p => !(p.id === id && p.userId === user.id));
    
    if (db.calendar.length === initialLength) {
       res.status(404).json({ error: "Calendar plan not found or unauthorized" });
       return;
    }
    
    saveDB(db);
    res.json({ success: true, message: "Calendar plan removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove calendar plan" });
  }
});

// WearWise AI Endpoint
app.post('/api/wearwise/analyze', authenticateUser, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: "Missing image data or mimeType" });
      return;
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    };

    const promptText = `You are WearWise AI, an intelligent fashion styling assistant.
Analyze the uploaded photo and complete the following tasks:
1. Detect:
   - Skin tone (e.g., Fair, Light, Medium, Warm Medium, Light Cool, Tan, Olive, Deep). Be respectful and accurate.
   - Shirt: Identify the shirt (or T-shirt/top wear) color and style. If not visible, say "Not Detected".
   - Pant: Identify the pant (or jeans/skirt/bottom wear) color and style. If not visible, say "Not Detected".

2. Based on the detected skin tone, recommend exactly 4 outfit color combinations that naturally complement the user's appearance.
   Ensure these combinations are highly fashionable, practical, and diverse.

3. Provide a general recommendation advising how to choose colors that complement their detected skin tone and avoid colors that create poor contrast.

Keep your response short, simple, and easy to understand. For any clothing item that is not visible, mention "Not Detected".

Return a structured JSON object strictly conforming to the response schema.`;

    let response;
    let lastError: any = null;
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

    for (const modelName of modelsToTry) {
      let attempts = 2;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`Analyzing skin tone and outfit colors using ${modelName} (Attempt ${attempt}/${attempts})...`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: [imagePart, { text: promptText }],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  detected: {
                    type: Type.OBJECT,
                    properties: {
                      skinTone: { type: Type.STRING, description: "Detected skin tone of the person" },
                      shirt: { type: Type.STRING, description: "Detected shirt/top wear color and type, or 'Not Detected'." },
                      pant: { type: Type.STRING, description: "Detected pant/bottom wear color and type, or 'Not Detected'." }
                    },
                    required: ["skinTone", "shirt", "pant"]
                  },
                  recommendedCombinations: {
                    type: Type.ARRAY,
                    description: "Exactly 4 outfit color combinations complementing the detected skin tone",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        shirt: { type: Type.STRING, description: "Recommended shirt color and style" },
                        pant: { type: Type.STRING, description: "Recommended pant color and style" },
                        bestFor: { type: Type.STRING, description: "Best occasions or use cases for this combo" }
                      },
                      required: ["shirt", "pant", "bestFor"]
                    }
                  },
                  overallRecommendation: {
                    type: Type.STRING,
                    description: "General styling recommendation text about complementing skin tone and avoiding poor contrast."
                  }
                },
                required: ["detected", "recommendedCombinations", "overallRecommendation"]
              }
            }
          });
          
          if (response && response.text) {
            break; // Success!
          }
        } catch (err: any) {
          lastError = err;
          console.log(`[WearWise Diagnostic] Model ${modelName} status: busy or unavailable on attempt ${attempt}.`);
          if (attempt < attempts) {
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, attempt * 500));
          }
        }
      }
      if (response && response.text) {
        break; // Success! Break outer loop
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Failed to get response from any Gemini model");
    }

    const resultText = response.text;
    if (!resultText) {
      res.status(500).json({ error: "Empty response from Gemini AI" });
      return;
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in WearWise AI analysis:", error);
    res.status(500).json({ error: error.message || "Failed to analyze outfit image" });
  }
});


// Serve React Frontend
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA catch-all
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Outfit Planner running on port http://localhost:${PORT}`);
  });
}

startServer();
