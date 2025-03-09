import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.sql.*;

public class Database {
    static {
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Не найден драйвер SQLite!", e);
        }
    }

    private static Connection connect() throws SQLException {
        return DriverManager.getConnection("jdbc:sqlite:database.db");
    }

    public static int executeUpdate(String sql, Object... params) {
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                pstmt.setObject(i + 1, params[i]);
            }
            return pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            return 0;
        }
    }

    public static boolean userExists(String email, String password) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ? AND password = ?";
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, email);
            pstmt.setString(2, password);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next() && rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static List<Map<String, String>> getRoutes(String email, int offset, int limit) {
        String sql = "SELECT id, city_from, city_to, date, transport FROM routes WHERE email = ? ORDER BY date DESC LIMIT ? OFFSET ?";
        List<Map<String, String>> routes = new ArrayList<>();
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, email);
            pstmt.setInt(2, limit);
            pstmt.setInt(3, offset);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, String> route = new HashMap<>();
                    route.put("id", rs.getString("id")); // UUID как строка
                    route.put("city_from", rs.getString("city_from"));
                    route.put("city_to", rs.getString("city_to"));
                    route.put("date", rs.getString("date"));
                    route.put("transport", rs.getString("transport"));
                    routes.add(route);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return routes;
    }    

    public static Map<String, String> getRouteById(String orderId) {
        String sql = "SELECT city_from, city_to, date, transport, email FROM routes WHERE id = ?";
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, orderId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, String> order = new HashMap<>();
                    order.put("city_from", rs.getString("city_from"));
                    order.put("city_to", rs.getString("city_to"));
                    order.put("date", rs.getString("date"));
                    order.put("transport", rs.getString("transport"));
                    order.put("email", rs.getString("email"));
                    return order;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static boolean createUser(String email, String password) {
        String sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        return executeUpdate(sql, email, password) > 0;
    }

    public static String createRoute(String email, String cityFrom, String cityTo, String date, String transport) {
        String routeId = UUID.randomUUID().toString();
        String sql = "INSERT INTO routes (id, email, city_from, city_to, date, transport) VALUES (?, ?, ?, ?, ?, ?)";
        executeUpdate(sql, routeId, email, cityFrom, cityTo, date, transport);
        return routeId;
    }

    public static boolean cancelRoute(String email, String routeId) {
        String sql = "DELETE FROM routes WHERE id = ? AND email = ?";
        return executeUpdate(sql, routeId, email) > 0;
    }
}
