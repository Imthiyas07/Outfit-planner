package com.outfitplanner.servlet;

import com.outfitplanner.util.DatabaseConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

/**
 * Servlet managing calendar planning for outfits.
 */
@WebServlet("/api/calendar")
public class CalendarServlet extends HttpServlet {

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
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM calendar_plans WHERE user_id = ? ORDER BY plan_date ASC")) {
            
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                boolean first = true;
                while (rs.next()) {
                    if (!first) sb.append(",");
                    sb.append(String.format(
                        "{\"id\":\"%s\",\"userId\":\"%s\",\"date\":\"%s\",\"outfitId\":\"%s\",\"note\":\"%s\"}",
                        rs.getString("id"), rs.getString("user_id"), rs.getString("plan_date"),
                        rs.getString("outfit_id") != null ? rs.getString("outfit_id") : "",
                        rs.getString("note") != null ? rs.getString("note") : ""
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
        String date = request.getParameter("date"); // Format: YYYY-MM-DD
        String outfitId = request.getParameter("outfitId");
        String note = request.getParameter("note");

        if (date == null || date.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Date is required\"}");
            return;
        }

        try (Connection conn = DatabaseConnection.getConnection()) {
            // Check if plan already exists for this user + date
            String checkQuery = "SELECT id FROM calendar_plans WHERE user_id = ? AND plan_date = ?";
            String existingId = null;
            
            try (PreparedStatement checkPs = conn.prepareStatement(checkQuery)) {
                checkPs.setString(1, userId);
                checkPs.setDate(2, Date.valueOf(date));
                try (ResultSet rs = checkPs.executeQuery()) {
                    if (rs.next()) {
                        existingId = rs.getString("id");
                    }
                }
            }

            if (existingId != null) {
                // Update existing plan
                String updateQuery = "UPDATE calendar_plans SET outfit_id = ?, note = ? WHERE id = ?";
                try (PreparedStatement updatePs = conn.prepareStatement(updateQuery)) {
                    if (outfitId != null && !outfitId.trim().isEmpty()) {
                        updatePs.setString(1, outfitId);
                    } else {
                        updatePs.setNull(1, Types.VARCHAR);
                    }
                    updatePs.setString(2, note != null ? note : "");
                    updatePs.setString(3, existingId);
                    updatePs.executeUpdate();
                }
                out.print(String.format("{\"success\":true,\"message\":\"Plan updated\",\"plan\":{\"id\":\"%s\",\"date\":\"%s\",\"outfitId\":\"%s\",\"note\":\"%s\"}}",
                        existingId, date, outfitId != null ? outfitId : "", note != null ? note : ""));
            } else {
                // Create new plan
                String newId = "plan-" + System.currentTimeMillis();
                String insertQuery = "INSERT INTO calendar_plans (id, user_id, plan_date, outfit_id, note) VALUES (?, ?, ?, ?, ?)";
                try (PreparedStatement insertPs = conn.prepareStatement(insertQuery)) {
                    insertPs.setString(1, newId);
                    insertPs.setString(2, userId);
                    insertPs.setDate(3, Date.valueOf(date));
                    if (outfitId != null && !outfitId.trim().isEmpty()) {
                        insertPs.setString(4, outfitId);
                    } else {
                        insertPs.setNull(4, Types.VARCHAR);
                    }
                    insertPs.setString(5, note != null ? note : "");
                    insertPs.executeUpdate();
                }
                out.print(String.format("{\"success\":true,\"message\":\"Plan created\",\"plan\":{\"id\":\"%s\",\"date\":\"%s\",\"outfitId\":\"%s\",\"note\":\"%s\"}}",
                        newId, date, outfitId != null ? outfitId : "", note != null ? note : ""));
            }

        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Database operations failed: " + e.getMessage() + "\"}");
        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Invalid date format. Expected YYYY-MM-DD\"}");
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
            out.print("{\"error\":\"Plan ID is required\"}");
            return;
        }

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM calendar_plans WHERE id = ? AND user_id = ?")) {
            
            ps.setString(1, id);
            ps.setString(2, userId);
            int rows = ps.executeUpdate();

            if (rows > 0) {
                out.print("{\"success\":true,\"message\":\"Plan deleted successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Plan not found or unauthorized\"}");
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Database error: " + e.getMessage() + "\"}");
        }
    }
}
