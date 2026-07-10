package com.outfitplanner.servlet;

import com.outfitplanner.util.DatabaseConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

/**
 * Servlet managing outfits (Many-to-Many mapping with clothes).
 */
@WebServlet("/api/outfits")
public class OutfitServlet extends HttpServlet {

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

        try (Connection conn = DatabaseConnection.getConnection()) {
            // Fetch outfits
            String outfitQuery = "SELECT * FROM outfits WHERE user_id = ? ORDER BY created_at DESC";
            try (PreparedStatement ps = conn.prepareStatement(outfitQuery)) {
                ps.setString(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    boolean firstOutfit = true;
                    while (rs.next()) {
                        if (!firstOutfit) sb.append(",");
                        String outfitId = rs.getString("id");
                        String name = rs.getString("name");
                        String description = rs.getString("description");
                        String createdAt = rs.getTimestamp("created_at").toString();

                        // Fetch clothes for this outfit
                        List<String> clothingIds = new ArrayList<>();
                        String clothesQuery = "SELECT clothing_id FROM outfit_clothes WHERE outfit_id = ?";
                        try (PreparedStatement psClothes = conn.prepareStatement(clothesQuery)) {
                            psClothes.setString(1, outfitId);
                            try (ResultSet rsClothes = psClothes.executeQuery()) {
                                while (rsClothes.next()) {
                                    clothingIds.add(rsClothes.getString("clothing_id"));
                                }
                            }
                        }

                        // Build clothing IDs list JSON
                        StringBuilder idsJson = new StringBuilder("[");
                        for (int i = 0; i < clothingIds.size(); i++) {
                            if (i > 0) idsJson.append(",");
                            idsJson.append("\"").append(clothingIds.get(i)).append("\"");
                        }
                        idsJson.append("]");

                        sb.append(String.format(
                            "{\"id\":\"%s\",\"userId\":\"%s\",\"name\":\"%s\",\"description\":\"%s\",\"clothingIds\":%s,\"createdAt\":\"%s\"}",
                            outfitId, userId, name, description != null ? description : "", idsJson.toString(), createdAt
                        ));
                        firstOutfit = false;
                    }
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
        String description = request.getParameter("description");
        String[] clothingIds = request.getParameterValues("clothingIds"); // expects multiple items

        if (name == null || clothingIds == null || clothingIds.length == 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Outfit name and clothing items are required\"}");
            return;
        }

        String outfitId = "outfit-" + System.currentTimeMillis();

        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Enable Transaction

            // 1. Insert into outfits table
            String insertOutfit = "INSERT INTO outfits (id, user_id, name, description) VALUES (?, ?, ?, ?)";
            try (PreparedStatement psOutfit = conn.prepareStatement(insertOutfit)) {
                psOutfit.setString(1, outfitId);
                psOutfit.setString(2, userId);
                psOutfit.setString(3, name);
                psOutfit.setString(4, description != null ? description : "");
                psOutfit.executeUpdate();
            }

            // 2. Insert associations into outfit_clothes table
            String insertRelation = "INSERT INTO outfit_clothes (outfit_id, clothing_id) VALUES (?, ?)";
            try (PreparedStatement psRelation = conn.prepareStatement(insertRelation)) {
                for (String cid : clothingIds) {
                    psRelation.setString(1, outfitId);
                    psRelation.setString(2, cid);
                    psRelation.addBatch();
                }
                psRelation.executeBatch();
            }

            conn.commit(); // Commit Transaction

            // Build response clothing IDs
            StringBuilder idsJson = new StringBuilder("[");
            for (int i = 0; i < clothingIds.length; i++) {
                if (i > 0) idsJson.append(",");
                idsJson.append("\"").append(clothingIds[i]).append("\"");
            }
            idsJson.append("]");

            out.print(String.format(
                "{\"success\":true,\"outfit\":{\"id\":\"%s\",\"name\":\"%s\",\"description\":\"%s\",\"clothingIds\":%s}}",
                outfitId, name, description != null ? description : "", idsJson.toString()
            ));

        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Failed to create outfit: " + e.getMessage() + "\"}");
        } finally {
            if (conn != null) {
                try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
            }
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
            out.print("{\"error\":\"Outfit ID is required\"}");
            return;
        }

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM outfits WHERE id = ? AND user_id = ?")) {
            
            ps.setString(1, id);
            ps.setString(2, userId);
            int rows = ps.executeUpdate(); // MySQL cascade delete handles deleting relations from outfit_clothes

            if (rows > 0) {
                out.print("{\"success\":true,\"message\":\"Outfit deleted successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Outfit not found or unauthorized\"}");
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Database error: " + e.getMessage() + "\"}");
        }
    }
}
