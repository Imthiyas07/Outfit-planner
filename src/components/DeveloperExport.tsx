/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileCode, Database, Code, Copy, Check, Terminal } from 'lucide-react';

interface CodeFile {
  name: string;
  type: 'sql' | 'java';
  icon: React.ReactNode;
  path: string;
  content: string;
}

export default function DeveloperExport() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const codeFiles: CodeFile[] = [
    {
      name: "schema.sql",
      type: "sql",
      icon: <Database className="w-4 h-4 text-blue-500" />,
      path: "/src/export-code/schema.sql",
      content: `-- Outfit Planner Database Schema
-- SQL Database Setup (MySQL compatible)

CREATE DATABASE IF NOT EXISTS outfit_planner;
USE outfit_planner;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clothes Table
CREATE TABLE IF NOT EXISTS clothes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    occasion VARCHAR(50) NOT NULL,
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

-- 4. Outfit Clothes Association (Many-to-Many mapping)
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
    outfit_id VARCHAR(50),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_date (user_id, plan_date)
);`
    },
    {
      name: "DatabaseConnection.java",
      type: "java",
      icon: <Code className="w-4 h-4 text-emerald-500" />,
      path: "/src/export-code/DatabaseConnection.java",
      content: `package com.outfitplanner.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static final String URL = "jdbc:mysql://localhost:3306/outfit_planner?useSSL=false&serverTimezone=UTC";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "yourpassword";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver not found!");
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USERNAME, PASSWORD);
    }
}`
    },
    {
      name: "UserServlet.java",
      type: "java",
      icon: <FileCode className="w-4 h-4 text-purple-500" />,
      path: "/src/export-code/UserServlet.java",
      content: `package com.outfitplanner.servlet;

import com.outfitplanner.util.DatabaseConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/api/user")
public class UserServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401);
            out.print("{\\"error\\":\\"Not logged in\\"}");
            return;
        }
        String userId = (String) session.getAttribute("userId");
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT id, username, email, name, avatar_url FROM users WHERE id = ?")) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    out.print(String.format("{\\"user\\":{\\"id\\":\\"%s\\",\\"username\\":\\"%s\\",\\"email\\":\\"%s\\",\\"name\\":\\"%s\\"}}\\", rs.getString("id"), rs.getString("username"), rs.getString("email"), rs.getString("name")));
                }
            }
        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\\"error\\":\\"" + e.getMessage() + "\\"}");
        }
    }
}`
    },
    {
      name: "ClothesServlet.java",
      type: "java",
      icon: <FileCode className="w-4 h-4 text-pink-500" />,
      path: "/src/export-code/ClothesServlet.java",
      content: `package com.outfitplanner.servlet;

import com.outfitplanner.util.DatabaseConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/api/clothes")
public class ClothesServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401);
            out.print("{\\"error\\":\\"Unauthorized\\"}");
            return;
        }
        String userId = (String) session.getAttribute("userId");
        StringBuilder sb = new StringBuilder("[");
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM clothes WHERE user_id = ? ORDER BY created_at DESC")) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                boolean first = true;
                while (rs.next()) {
                    if (!first) sb.append(",");
                    sb.append(String.format("{\\"id\\":\\"%s\\",\\"name\\":\\"%s\\",\\"category\\":\\"%s\\",\\"color\\":\\"%s\\",\\"occasion\\":\\"%s\\",\\"imageUrl\\":\\"%s\\"}",
                        rs.getString("id"), rs.getString("name"), rs.getString("category"), rs.getString("color"), rs.getString("occasion"), rs.getString("image_url")));
                    first = false;
                }
            }
            sb.append("]");
            out.print(sb.toString());
        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\\"error\\":\\"" + e.getMessage() + "\\"}");
        }
    }
}`
    },
    {
      name: "OutfitServlet.java",
      type: "java",
      icon: <FileCode className="w-4 h-4 text-violet-500" />,
      path: "/src/export-code/OutfitServlet.java",
      content: `package com.outfitplanner.servlet;

import com.outfitplanner.util.DatabaseConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.ArrayList;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/api/outfits")
public class OutfitServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401);
            out.print("{\\"error\\":\\"Unauthorized\\"}");
            return;
        }
        String userId = (String) session.getAttribute("userId");
        String name = req.getParameter("name");
        String description = req.getParameter("description");
        String[] clothingIds = req.getParameterValues("clothingIds");

        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            String outfitId = "outfit-" + System.currentTimeMillis();
            
            try (PreparedStatement ps = conn.prepareStatement("INSERT INTO outfits (id, user_id, name, description) VALUES (?, ?, ?, ?)")) {
                ps.setString(1, outfitId);
                ps.setString(2, userId);
                ps.setString(3, name);
                ps.setString(4, description != null ? description : "");
                ps.executeUpdate();
            }

            try (PreparedStatement psR = conn.prepareStatement("INSERT INTO outfit_clothes (outfit_id, clothing_id) VALUES (?, ?)")) {
                for (String cid : clothingIds) {
                    psR.setString(1, outfitId);
                    psR.setString(2, cid);
                    psR.addBatch();
                }
                psR.executeBatch();
            }
            conn.commit();
            out.print("{\\"success\\":true,\\"outfitId\\":\\"" + outfitId + "\\"}");
        } catch (Exception e) {
            if (conn != null) { try { conn.rollback(); } catch (SQLException ex) {} }
            resp.setStatus(500);
            out.print("{\\"error\\":\\"" + e.getMessage() + "\\"}");
        } finally {
            if (conn != null) { try { conn.close(); } catch (SQLException ex) {} }
        }
    }
}`
    },
    {
      name: "CalendarServlet.java",
      type: "java",
      icon: <FileCode className="w-4 h-4 text-cyan-500" />,
      path: "/src/export-code/CalendarServlet.java",
      content: `package com.outfitplanner.servlet;

import com.outfitplanner.util.DatabaseConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/api/calendar")
public class CalendarServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401);
            out.print("{\\"error\\":\\"Unauthorized\\"}");
            return;
        }
        String userId = (String) session.getAttribute("userId");
        String date = req.getParameter("date");
        String outfitId = req.getParameter("outfitId");
        String note = req.getParameter("note");

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "INSERT INTO calendar_plans (id, user_id, plan_date, outfit_id, note) " +
                 "VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE outfit_id = ?, note = ?")) {
            String id = "plan-" + System.currentTimeMillis();
            ps.setString(1, id);
            ps.setString(2, userId);
            ps.setDate(3, Date.valueOf(date));
            ps.setString(4, outfitId);
            ps.setString(5, note);
            ps.setString(6, outfitId);
            ps.setString(7, note);
            ps.executeUpdate();
            out.print("{\\"success\\":true}");
        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\\"error\\":\\"" + e.getMessage() + "\\"}");
        }
    }
}`
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(codeFiles[activeTab].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="developer-export-container" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            Java Servlets & MySQL Codebase
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            We generated the complete, standard production-ready backend code requested for local development outside the sandbox.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-sm transition-all duration-200"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Active File"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation panel */}
        <div className="lg:col-span-1 space-y-1 bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100 h-fit">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Relational Database</p>
          {codeFiles.filter(f => f.type === 'sql').map((file, idx) => {
            const actualIdx = codeFiles.indexOf(file);
            return (
              <button
                key={file.name}
                onClick={() => setActiveTab(actualIdx)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium transition-all duration-150 ${
                  activeTab === actualIdx
                    ? 'bg-white text-blue-700 shadow-sm border border-gray-100'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {file.icon}
                <span className="truncate">{file.name}</span>
              </button>
            );
          })}

          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mt-4 mb-2">Java Servlets</p>
          {codeFiles.filter(f => f.type === 'java').map((file, idx) => {
            const actualIdx = codeFiles.indexOf(file);
            return (
              <button
                key={file.name}
                onClick={() => setActiveTab(actualIdx)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium transition-all duration-150 ${
                  activeTab === actualIdx
                    ? 'bg-white text-blue-700 shadow-sm border border-gray-100'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {file.icon}
                <span className="truncate">{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content Panel */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg min-h-[450px]">
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              <span className="ml-2 font-semibold text-slate-300">{codeFiles[activeTab].path}</span>
            </span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
              {codeFiles[activeTab].type.toUpperCase()}
            </span>
          </div>
          <div className="p-4 overflow-auto flex-1 max-h-[500px]">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre select-all">
              <code>{codeFiles[activeTab].content}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl mt-0.5">
          <Database className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-blue-900">How to Setup the Java Backend Locally</h4>
          <p className="text-xs text-blue-800/80 leading-relaxed">
            1. Create a MySQL database named <code className="font-mono bg-blue-100/50 px-1 rounded text-blue-900">outfit_planner</code> and execute the <code className="font-mono bg-blue-100/50 px-1 rounded text-blue-900">schema.sql</code> script.<br />
            2. Add the MySQL JDBC Driver (<code className="font-mono bg-blue-100/50 px-1 rounded text-blue-900">mysql-connector-j</code>) to your web app project's WEB-INF/lib or build dependencies.<br />
            3. Deploy these Java Servlet files inside your Tomcat Server or servlet container.<br />
            4. Make sure to update the credentials inside <code className="font-mono bg-blue-100/50 px-1 rounded text-blue-900">DatabaseConnection.java</code> to match your MySQL server password.
          </p>
        </div>
      </div>
    </div>
  );
}
