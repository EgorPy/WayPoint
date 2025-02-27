import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.io.*;
import java.util.Map;

public class Api {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/api/hello", new HelloHandler());
        server.createContext("/api/register", new RegisterHandler());
        server.createContext("/api/login", new LoginHandler());

        server.setExecutor(null);
        server.start();
        System.out.println("Сервер запущен на http://localhost:8080");
    }

    static class HelloHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            sendResponse(exchange, 200, "{\"message\": \"Привет, мир!\"}");
        }
    }

    static class RegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
                BufferedReader br = new BufferedReader(isr);
                StringBuilder requestBody = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    requestBody.append(line);
                }
                br.close();
                isr.close();
    
                System.out.println("RAW REQUEST BODY: " + requestBody);
    
                Map<String, String> params = Utils.parseQueryParams(requestBody.toString());
                String email = params.get("email");
                String password = params.get("password");
    
                System.out.println("Parsed email: " + email);
                System.out.println("Parsed password: " + password);
    
                boolean userExists = Database.userExists(email, password);
                if (userExists) {
                    sendResponse(exchange, 409, "User already exists");
                    return;
                }
    
                boolean success = Database.createUser(email, password);
                sendResponse(exchange, success ? 201 : 500, success ? "Registration successful" : "Error");
            }
        }
    }    

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
                BufferedReader br = new BufferedReader(isr);
                StringBuilder requestBody = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    requestBody.append(line);
                }
                br.close();
                isr.close();
    
                System.out.println("RAW REQUEST BODY: " + requestBody);
    
                Map<String, String> params = Utils.parseQueryParams(requestBody.toString());
                String email = params.get("email");
                String password = params.get("password");
    
                System.out.println("Parsed email: " + email);
                System.out.println("Parsed password: " + password);
    
                boolean userExists = Database.userExists(email, password);
                System.out.println(userExists);
    
                String response = userExists ? "Success" : "Invalid data";
                int statusCode = userExists ? 200 : 401;
    
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
                exchange.sendResponseHeaders(statusCode, response.length());
    
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
        }
    }
    

    private static void sendResponse(HttpExchange exchange, int status, String response) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().set("Access-Control-Expose-Headers", "*");
    
        byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }    
}
