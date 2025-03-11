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
            for (int i = 0; i < params.length; ++i) {
                pstmt.setObject(i + 1, params[i]);
            }
            return pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            return 0;
        }
    }

    public static int executeQuery(String sql, Object... params) {
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; ++i) {
                pstmt.setObject(i + 1, params[i]);
            }
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
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

    public static List<Route> getFlights() {
        String sql = "SELECT city_from, city_to, date_from, date_to, 'flights' AS transport FROM flights";
        List<Route> routes = new ArrayList<>();
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                routes.add(new Route(
                    rs.getString("city_from"),
                    rs.getString("city_to"),
                    rs.getString("date_from"),
                    rs.getString("date_to"),
                    rs.getString("transport")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return routes;
    }

    public static List<Route> getTrains() {
        String sql = "SELECT city_from, city_to, date_from, date_to, 'trains' AS transport FROM trains";
        List<Route> routes = new ArrayList<>();
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                routes.add(new Route(
                    rs.getString("city_from"),
                    rs.getString("city_to"),
                    rs.getString("date_from"),
                    rs.getString("date_to"),
                    rs.getString("transport")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return routes;
    }

    public static List<Route> getBuses() {
        String sql = "SELECT city_from, city_to, date_from, date_to, 'buses' AS transport FROM buses";
        List<Route> routes = new ArrayList<>();
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                routes.add(new Route(
                    rs.getString("city_from"),
                    rs.getString("city_to"),
                    rs.getString("date_from"),
                    rs.getString("date_to"),
                    rs.getString("transport")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return routes;
    }

    public static List<Route> getRoutes() {
        String sql = "SELECT city_from, city_to, date_from, date_to, 'buses' AS transport FROM buses " +
                     "UNION ALL " +
                     "SELECT city_from, city_to, date_from, date_to, 'flights' FROM flights " +
                     "UNION ALL " +
                     "SELECT city_from, city_to, date_from, date_to, 'trains' FROM trains";
        List<Route> routes = new ArrayList<>();
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                routes.add(new Route(
                    rs.getString("city_from"),
                    rs.getString("city_to"),
                    rs.getString("date_from"),
                    rs.getString("date_to"),
                    rs.getString("transport")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return routes;
    }

    public static List<Map<String, String>> getUserRoutes(String email, int offset, int limit) {
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

    public static boolean routeBooked(String email, String city_from, String city_to, String date, String transport) {
        String sql = "SELECT COUNT(*) FROM routes WHERE email = ? AND city_from = ? AND city_to = ? AND SUBSTR(date, 1, 10) = ? AND transport = ?";
        return executeQuery(sql, email, city_from, city_to, date.substring(0, 10), transport) > 0;
    }

    public static boolean bookRoute(String email, String city_from, String city_to, String date, String transport, String routeId, List<List<Route>> selectedRoutes) {
        String sqlBooking = "INSERT INTO routes (id, city_from, city_to, date, transport, email) VALUES (?, ?, ?, ?, ?, ?)";
        String sqlSegment = "INSERT INTO route_segments (route_id, city_from, city_to, date_from, date_to, transport, segment_no) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
        if (executeUpdate(sqlBooking, routeId, city_from, city_to, date, transport, email) == 0) return false;
    
        int segment_no = 1;
        for (List<Route> routeList : selectedRoutes) {
            for (Route route : routeList) {
                if (executeUpdate(sqlSegment, routeId, route.city_from, route.city_to, route.date_from, route.date_to, route.transport, segment_no) == 0) {
                    return false;
                } ++segment_no;
            }
        } return true;
    }    

    public static String findRoutes(String cityFrom, String cityTo, String date, String transport) {
        StringBuilder json = new StringBuilder("[");
        boolean first = true;

        final Map<String, String[]> transports = Map.of(
            "Микс", new String[]{"flights", "trains", "buses"},
            "Самолёт", new String[]{"flights"},
            "Автобус", new String[]{"buses"},
            "Поезд", new String[]{"trains"}
        );
        String[] tables = transports.get(transport);

        try (Connection conn = connect()) {
            for (String table : tables) {
                String sql = "SELECT id, city_from, city_to, date_from, date_to FROM " + table + " " +
                               "WHERE city_from = ? AND city_to = ? " +
                               "ORDER BY ABS(strftime('%s', date_from) - strftime('%s', ?)) ASC LIMIT 5";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, cityFrom);
                    stmt.setString(2, cityTo);
                    stmt.setString(3, date);
    
                    ResultSet rs = stmt.executeQuery();
                    while (rs.next()) {
                        if (!first) json.append(",");
                        json.append("{")
                            .append("\"id\":\"").append(UUID.randomUUID()).append("\",")
                            .append("\"city_from\":\"").append(rs.getString("city_from")).append("\",")
                            .append("\"city_to\":\"").append(rs.getString("city_to")).append("\",")
                            .append("\"date_from\":\"").append(rs.getString("date_from")).append("\",")
                            .append("\"date_to\":\"").append(rs.getString("date_to")).append("\",")
                            .append("\"transport\":\"").append(table).append("\"")
                            .append("}");
                        first = false;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    
        json.append("]");
        return json.toString();
    }

    public static boolean cancelRoute(String email, String routeId) {
        String sql = "DELETE FROM route_segments WHERE route_id = ?";
        String sql2 = "DELETE FROM routes WHERE id = ? AND email = ?";
        executeUpdate(sql, routeId);
        return executeUpdate(sql2, routeId, email) > 0;
    }
}
