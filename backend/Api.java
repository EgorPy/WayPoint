import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.nio.charset.StandardCharsets;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.util.regex.Pattern;
import java.io.OutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public class Api {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/api/hello", new HelloHandler());
        server.createContext("/api/register", new RegisterHandler());
        server.createContext("/api/login", new LoginHandler());
        server.createContext("/api/create_route", new CreateRouteHandler());
        server.createContext("/api/route", new RouteHandler());
        server.createContext("/api/routes", new RoutesHandler());
        server.createContext("/api/cancel", new CancelHandler());

        server.setExecutor(null);
        server.start();
        System.out.println("Сервер запущен на http://localhost:8080");
    }

    static class HelloHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            sendResponse(exchange, 200, "{\"message\": \"Привет, мир!\"}");
        }
    }

    static class RoutesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\": \"Метод не поддерживается\"}");
                return;
            }
    
            Map<String, String> params = Utils.parseQueryParams(exchange.getRequestURI().getQuery());
            String email = params.get("email");
            int offset = Integer.parseInt(params.getOrDefault("offset", "0"));
            int limit = Integer.parseInt(params.getOrDefault("limit", "10"));
    
            if (email == null || email.isEmpty()) {
                sendResponse(exchange, 400, "{\"error\": \"Не указан email\"}");
                return;
            }
    
            List<Map<String, String>> routes = Database.getRoutes(email, offset, limit);
            String jsonResponse = convertRoutesToJson(routes);
            sendResponse(exchange, 200, jsonResponse);
        }
    }

    public static String convertRoutesToJson(List<Map<String, String>> routes) {
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("[");
    
        for (int i = 0; i < routes.size(); i++) {
            Map<String, String> route = routes.get(i);
            jsonBuilder.append("{");
    
            int j = 0;
            for (Map.Entry<String, String> entry : route.entrySet()) {
                jsonBuilder.append("\"").append(entry.getKey()).append("\":\"")
                           .append(entry.getValue()).append("\"");
                if (j < route.size() - 1) {
                    jsonBuilder.append(",");
                }
                j++;
            }
    
            jsonBuilder.append("}");
            if (i < routes.size() - 1) {
                jsonBuilder.append(",");
            }
        }
    
        jsonBuilder.append("]");
        return jsonBuilder.toString();
    }

    static class RouteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\": \"Метод не поддерживается\"}");
                return;
            }
    
            String path = exchange.getRequestURI().getPath();
            String[] parts = path.split("/");
            if (parts.length < 3) {
                sendResponse(exchange, 400, "{\"error\": \"Некорректный запрос\"}");
                return;
            }
    
            String routeId = parts[3];
            Map<String, String> route = Database.getRouteById(routeId);
            if (route == null) {
                sendResponse(exchange, 404, "{\"error\": \"Заказ не найден\"}");
                return;
            }
    
            String jsonResponse = "{"
                    + "\"city_from\": \"" + route.get("city_from") + "\","
                    + "\"city_to\": \"" + route.get("city_to") + "\","
                    + "\"date\": \"" + route.get("date") + "\","
                    + "\"transport\": \"" + route.get("transport") + "\","
                    + "\"email\": \"" + route.get("email") + "\""
                    + "}";
    
            sendResponse(exchange, 200, jsonResponse);
        }
    }

    static class CreateRouteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\": \"Метод не поддерживается\"}");
                return;
            }
    
            Map<String, String> params = Utils.parseQueryParams(Utils.readRequestBody(exchange));
            String city_from = params.get("city_from");
            String city_to = params.get("city_to");
            String date = params.get("date");
            String transport = params.get("transport");
            String email = params.get("email");
    
            if (city_from == null || city_to == null || date == null || transport == null) {
                sendResponse(exchange, 400, "{\"error\": \"Все поля должны быть заполнены\"}");
                return;
            }
    
            String routeId = Database.createRoute(email, city_from, city_to, date, transport);
            boolean success = routeId != null;
    
            sendResponse(exchange, success ? 201 : 500, success 
                ? "{\"message\": \"Заказ успешно создан\", \"routeId\": \"" + routeId + "\"}" 
                : "{\"error\": \"Ошибка бронирования\"}");
        }
    }

    static class CancelHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\": \"Метод не поддерживается\"}");
                return;
            }

            Map<String, String> params = Utils.parseQueryParams(Utils.readRequestBody(exchange));
            String email = params.get("email");
            String routeId = params.get("routeId");

            if (email == null || routeId == null) {
                sendResponse(exchange, 400, "{\"error\": \"Требуется email и routeId\"}");
                return;
            }

            boolean success = Database.cancelRoute(email, routeId);
            sendResponse(exchange, success ? 200 : 404, success ? "{\"message\": \"Заказ отменен\"}" : "{\"error\": \"Заказ не найден\"}");
        }
    }

    static class RegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\": \"Метод не поддерживается\"}");
                return;
            }
    
            Map<String, String> params = Utils.parseQueryParams(Utils.readRequestBody(exchange));
            String email = params.get("email");
            String password = params.get("password");

            if (!InputValidator.isValidEmail(email)) {
                sendResponse(exchange, 400, "{\"error\": \"Некорректный email\"}");
                return;
            }
            if (!InputValidator.isValidPassword(password)) {
                sendResponse(exchange, 400, "{\"error\": \"Пароль должен быть от 8 до 64 символов\"}");
                return;
            }
    
            if (Database.userExists(email, password)) {
                sendResponse(exchange, 409, "{\"error\": \"Пользователь уже существует\"}");
                return;
            }
    
            boolean success = Database.createUser(email, password);
            sendResponse(exchange, success ? 201 : 500, success ? "{\"message\": \"Регистрация успешна\"}" : "{\"error\": \"Ошибка регистрации\"}");
        }
    }    

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\": \"Метод не поддерживается\"}");
                return;
            }

            Map<String, String> params = Utils.parseQueryParams(Utils.readRequestBody(exchange));
            String email = params.get("email");
            String password = params.get("password");

            if (!InputValidator.isValidEmail(email) || !InputValidator.isValidPassword(password)) {
                sendResponse(exchange, 400, "{\"error\": \"Некорректные данные\"}");
                return;
            }

            boolean userExists = Database.userExists(email, password);
            sendResponse(exchange, userExists ? 200 : 401, userExists ? "{\"message\": \"Успешный вход\"}" : "{\"error\": \"Неверные учетные данные\"}");
        }
    }

    private static boolean handleCors(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().set("Access-Control-Expose-Headers", "*");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }

    private static void sendResponse(HttpExchange exchange, int status, String response) throws IOException {
        byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }
}

class InputValidator {
    /* Forbid idiots to send garbage to my site */
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches() && email.length() <= 64;
    }

    public static boolean isValidPassword(String password) {
        return password != null && password.length() >= 3 && password.length() <= 64;
    }
}
