-- Outfit Planner Database Schema
-- SQL Database Setup (MySQL compatible)

CREATE DATABASE IF NOT EXISTS outfit_planner;
USE outfit_planner;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed password recommended
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clothes Table
CREATE TABLE IF NOT EXISTS clothes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Tops', 'Bottoms', 'Shoes', etc.
    color VARCHAR(50) NOT NULL,
    occasion VARCHAR(50) NOT NULL, -- 'Casual', 'Formal', etc.
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Outfits Table
CREATE TABLE IF NOT EXISTS outfits (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Outfit Clothes Association Table (Many-to-Many mapping)
CREATE TABLE IF NOT EXISTS outfit_clothes (
    outfit_id VARCHAR(50) NOT NULL,
    clothing_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (outfit_id, clothing_id),
    FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
    FOREIGN KEY (clothing_id) REFERENCES clothes(id) ON DELETE CASCADE
);

-- 5. Calendar Plans Table
CREATE TABLE IF NOT EXISTS calendar_plans (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    plan_date DATE NOT NULL,
    outfit_id VARCHAR(50), -- Optional: references Outfit.id
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_date (user_id, plan_date)
);

-- Seed basic demo data for testing
INSERT IGNORE INTO users (id, username, email, password, name, avatar_url) VALUES 
('demo-user', 'demo', 'demo@outfitplanner.com', 'password123', 'Alex Designer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256');

INSERT IGNORE INTO clothes (id, user_id, name, category, color, occasion, image_url) VALUES
('cloth-1', 'demo-user', 'Classic White T-Shirt', 'Tops', 'White', 'Casual', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400'),
('cloth-2', 'demo-user', 'Dark Blue Slim Jeans', 'Bottoms', 'Blue', 'Casual', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400'),
('cloth-3', 'demo-user', 'Vintage Black Leather Jacket', 'Outerwear', 'Black', 'Party', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400'),
('cloth-4', 'demo-user', 'Air Cushion Sneakers', 'Shoes', 'White', 'Sporty', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400');

INSERT IGNORE INTO outfits (id, user_id, name, description) VALUES
('outfit-1', 'demo-user', 'Casual Streetwear', 'Perfect standard combination for daily activities.');

INSERT IGNORE INTO outfit_clothes (outfit_id, clothing_id) VALUES
('outfit-1', 'cloth-1'),
('outfit-1', 'cloth-2'),
('outfit-1', 'cloth-3'),
('outfit-1', 'cloth-4');

INSERT IGNORE INTO calendar_plans (id, user_id, plan_date, outfit_id, note) VALUES
('plan-1', 'demo-user', CURDATE(), 'outfit-1', 'Meeting friends for dinner');
