package com.outfitplanner.servlet;

import com.outfitplanner.util.DatabaseConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Servlet handling User Authentication (Register, Login, and Session checks).
 */
@WebServlet("/api/user")
public class UserServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"error\":\"Not logged in\"}");
            return;
        }

        String userId = (String) session.getAttribute("userId");
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT id, username, email, name, avatar_url FROM users WHERE id = ?")) {
            
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String json = String.format(
                        "{\"id\":\"%s\",\"username\":\"%s\",\"email\":\"%s\",\"name\":\"%s\",\"avatarUrl\":\"%s\"}",
                        rs.getString("id"), rs.getString("username"), rs.getString("email"), 
                        rs.getString("name"), rs.getString("avatar_url")
                    );
                    out.print("{\"user\":" + json + "}");
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.print("{\"error\":\"User not found\"}");
                }
            }
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

        String action = request.getParameter("action");
        if (action == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Action parameter is required (register or login)\"}");
            return;
        }

        if ("register".equals(action)) {
            String username = request.getParameter("username");
            String email = request.getParameter("email");
            String password = request.getParameter("password");
            String name = request.getParameter("name");

            if (username == null || email == null || password == null || name == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"Missing required fields\"}");
                return;
            }

            try (Connection conn = DatabaseConnection.getConnection()) {
                // Check if user exists
                try (PreparedStatement check = conn.prepareStatement("SELECT id FROM users WHERE username = ? OR email = ?")) {
                    check.setString(1, username);
                    check.setString(2, email);
                    try (ResultSet rs = check.executeQuery()) {
                        if (rs.next()) {
                            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                            out.print("{\"error\":\"Username or Email already exists\"}");
                            return;
                        }
                    }
                }

                // Insert user
                String newId = "user-" + System.currentTimeMillis();
                String avatarUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=" + username;
                try (PreparedStatement insert = conn.prepareStatement(
                        "INSERT INTO users (id, username, email, password, name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)")) {
                    insert.setString(1, newId);
                    insert.setString(2, username);
                    insert.setString(3, email);
                    insert.setString(4, password); // Standard practice recommends password hashing
                    insert.setString(5, name);
                    insert.setString(6, avatarUrl);
                    insert.executeUpdate();

                    HttpSession session = request.getSession(true);
                    session.setAttribute("userId", newId);

                    out.print(String.format("{\"success\":true,\"user\":{\"id\":\"%s\",\"username\":\"%s\",\"name\":\"%s\"}}", newId, username, name));
                }
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"error\":\"Registration failed: " + e.getMessage() + "\"}");
            }

        } else if ("login".equals(action)) {
            String usernameOrEmail = request.getParameter("usernameOrEmail");
            String password = request.getParameter("password");

            if (usernameOrEmail == null || password == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"Username/Email and Password are required\"}");
                return;
            }

            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                         "SELECT id, username, email, name, avatar_url FROM users WHERE (username = ? OR email = ?) AND password = ?")) {
                
                ps.setString(1, usernameOrEmail);
                ps.setString(2, usernameOrEmail);
                ps.setString(3, password);

                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        String userId = rs.getString("id");
                        HttpSession session = request.getSession(true);
                        session.setAttribute("userId", userId);

                        String json = String.format(
                            "{\"id\":\"%s\",\"username\":\"%s\",\"email\":\"%s\",\"name\":\"%s\",\"avatarUrl\":\"%s\"}",
                            userId, rs.getString("username"), rs.getString("email"), 
                            rs.getString("name"), rs.getString("avatar_url")
                        );
                        out.print("{\"success\":true,\"user\":" + json + "}");
                    } else {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        out.print("{\"error\":\"Invalid username/email or password\"}");
                    }
                }
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"error\":\"Login failed: " + e.getMessage() + "\"}");
            }
        } else if ("logout".equals(action)) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            out.print("{\"success\":true,\"message\":\"Logged out successfully\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Invalid action\"}");
        }
    }
}
