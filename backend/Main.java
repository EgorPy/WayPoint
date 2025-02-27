import java.sql.*;

class Auth {
    public static boolean registerUser(String email, String password) {
        if (isExisting(email)) return false;
        String sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        return Database.executeUpdate(sql, email, password);
    }

    public static boolean loginUser(String email, String password) {
        String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
        try (ResultSet rs = Database.executeQuery(sql, email, password)) {
            return rs != null && rs.next();
        } catch (SQLException e) {
            return false;
        }
    }

    private static boolean isExisting(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (ResultSet rs = Database.executeQuery(sql, email)) {
            return rs != null && rs.next();
        } catch (SQLException e) {
            return false;
        }
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Регистрация: " + Auth.registerUser("test@example.com", "123456"));
        System.out.println("Авторизация: " + Auth.loginUser("test@example.com", "123456"));
    }
}
