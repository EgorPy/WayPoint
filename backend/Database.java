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

    public static boolean executeUpdate(String sql, Object... params) {
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                pstmt.setObject(i + 1, params[i]);
            }
            pstmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public static ResultSet executeQuery(String sql, Object... params) {
        try {
            Connection conn = connect();
            PreparedStatement pstmt = conn.prepareStatement(sql);
            for (int i = 0; i < params.length; i++) {
                pstmt.setObject(i + 1, params[i]);
            }
            return pstmt.executeQuery(); // ! Важно: соединение остается открытым
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static boolean userExists(String email, String password) {
        String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
        try (ResultSet rs = executeQuery(sql, email, password)) {
            return rs != null && rs.next();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public static boolean createUser(String email, String password) {
        String sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        return executeUpdate(sql,  email, password);
    }
}
