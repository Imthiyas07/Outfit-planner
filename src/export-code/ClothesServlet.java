package com.outfitplanner.servlet;

import com.outfitplanner.util.DatabaseConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

/**
 * Servlet managing clothing items (CRUD operations).
 */
@WebServlet("/api/clothes")
public class ClothesServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"error\":\"Unauthorized\"}");
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
                    sb.append(String.format(
                        "{\"id\":\"%s\",\"userId\":\"%s\",\"name\":\"%s\",\"category\":\"%s\",\"color\":\"%s\",\"occasion\":\"%s\",\"imageUrl\":\"%s\",\"createdAt\":\"%s\"}",
                        rs.getString("id"), rs.getString("user_id"), rs.getString("name"),
                        rs.getString("category"), rs.getString("color"), rs.getString("occasion"),
                        rs.getString("image_url"), rs.getTimestamp("created_at")
                    ));
                    first = false;
                }
            }
            sb.append("]");
            out.print(sb.toString());
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Database error: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"error\":\"Unauthorized\"}");
            return;
        }

        String userId = (String) session.getAttribute("userId");
        String name = request.getParameter("name");
        String category = request.getParameter("category");
        String color = request.getParameter("color");
        String occasion = request.getParameter("occasion");
        String imageUrl = request.getParameter("imageUrl");

        if (name == null || category == null || color == null || occasion == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Missing fields\"}");
            return;
        }

        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            imageUrl = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=400";
        }

        String newId = "cloth-" + System.currentTimeMillis();

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "INSERT INTO clothes (id, user_id, name, category, color, occasion, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)")) {
            
            ps.setString(1, newId);
            ps.setString(2, userId);
            ps.setString(3, name);
            ps.setString(4, category);
            ps.setString(5, color);
            ps.setString(6, occasion);
            ps.setString(7, imageUrl);
            ps.executeUpdate();

            out.print(String.format(
                "{\"success\":true,\"clothingItem\":{\"id\":\"%s\",\"name\":\"%s\",\"category\":\"%s\",\"color\":\"%s\",\"occasion\":\"%s\",\"imageUrl\":\"%s\"}}",
                newId, name, category, color, occasion, imageUrl
            ));
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Failed to save item: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"error\":\"Unauthorized\"}");
            return;
        }

        String userId = (String) session.getAttribute("userId");
        String id = request.getParameter("id");

        if (id == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Clothing ID is required\"}");
            return;
        }

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM clothes WHERE id = ? AND user_id = ?")) {
            
            ps.setString(1, id);
            ps.setString(2, userId);
            int rows = ps.executeUpdate();

            if (rows > 0) {
                out.print("{\"success\":true,\"message\":\"Item deleted successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Item not found or unauthorized\"}");
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Database error: " + e.getMessage() + "\"}");
        }
    }
}
