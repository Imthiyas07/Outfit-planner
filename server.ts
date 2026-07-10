/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Initialize express app
const app = express();
const PORT = 3000;

// Middleware for parsing JSON and urlencoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    {
      id: "cloth-1",
      userId: "demo-user",
      name: "Classic White T-Shirt",
      category: "Tops",
      color: "White",
      occasion: "Casual",
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-2",
      userId: "demo-user",
      name: "Dark Blue Slim Jeans",
      category: "Bottoms",
      color: "Blue",
      occasion: "Casual",
      imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-3",
      userId: "demo-user",
      name: "Vintage Black Leather Jacket",
      category: "Outerwear",
      color: "Black",
      occasion: "Party",
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-4",
      userId: "demo-user",
      name: "Air Cushion Sneakers",
      category: "Shoes",
      color: "White",
      occasion: "Sporty",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-5",
      userId: "demo-user",
      name: "Formal Navy Blue Blazer",
      category: "Outerwear",
      color: "Navy",
      occasion: "Work",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-6",
      userId: "demo-user",
      name: "Chic Summer Floral Dress",
      category: "Dresses",
      color: "Yellow",
      occasion: "Casual",
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=400",
      createdAt: new Date().toISOString()
    },
    {
      id: "cloth-7",
      userId: "demo-user",
      name: "Classic Sunglasses",
      category: "Accessories",
      color: "Black",
      occasion: "Casual",
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400",
      createdAt: new Date().toISOString()
    }
  ],
  outfits: [
    {
      id: "outfit-1",
      userId: "demo-user",
      name: "Casual Streetwear",
      description: "Perfect standard combination for daily activities.",
      clothingIds: ["cloth-1", "cloth-2", "cloth-3", "cloth-4"],
      createdAt: new Date().toISOString()
    },
    {
      id: "outfit-2",
      userId: "demo-user",
      name: "Summer Outing",
      description: "Fresh look for warm weekend sunny days.",
      clothingIds: ["cloth-6", "cloth-7", "cloth-4"],
      createdAt: new Date().toISOString()
    }
  ],
  calendar: [
    {
      id: "plan-1",
      userId: "demo-user",
      date: new Date().toISOString().split('T')[0], // Today
      outfitId: "outfit-1",
      clothingIds: ["cloth-1", "cloth-2", "cloth-3", "cloth-4"],
      note: "Meeting friends for dinner",
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
