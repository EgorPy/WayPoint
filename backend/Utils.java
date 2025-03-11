import com.sun.net.httpserver.HttpExchange;
import java.nio.charset.StandardCharsets;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class Utils {
    public static String readRequestBody(HttpExchange exchange) throws IOException {
        InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
        BufferedReader br = new BufferedReader(isr);
        StringBuilder requestBody = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) requestBody.append(line);
        br.close();
        isr.close();
        return requestBody.toString();
    }

    public static Map<String, String> parseFormData(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        Map<String, String> params = new HashMap<>();
        for (String pair : body.split("&")) {
            String[] keyValue = pair.split("=");
            if (keyValue.length == 2) params.put(keyValue[0], keyValue[1]);
        } return params;
    }

    public static Map<String, String> parseQueryParams(String query) {
        Map<String, String> result = new HashMap<>();
        if (query == null || query.isEmpty()) return result;

        for (String param : query.split("&")) {
            String[] pair = param.split("=", 2);
            if (pair.length == 2) {
                result.put(
                    URLDecoder.decode(pair[0], StandardCharsets.UTF_8),
                    URLDecoder.decode(pair[1], StandardCharsets.UTF_8)
                );
            }
        } return result;
    }

    public static String convertUserRoutesToJson(List<Map<String, String>> routes) {
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("[");
        for (int i = 0; i < routes.size(); ++i) {
            Map<String, String> route = routes.get(i);
            jsonBuilder.append("{");
            int j = 0;
            for (Map.Entry<String, String> entry : route.entrySet()) {
                jsonBuilder.append("\"").append(entry.getKey()).append("\":\"")
                           .append(entry.getValue()).append("\"");
                if (j < route.size() - 1) {
                    jsonBuilder.append(",");
                } ++j;
            }
            jsonBuilder.append("}");
            if (i < routes.size() - 1) jsonBuilder.append(",");
        }
        jsonBuilder.append("]");
        return jsonBuilder.toString();
    }

    public static String convertRoutesToJson(List<List<Route>> routes) {
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("[");
        for (int i = 0; i < routes.size(); ++i) {
            jsonBuilder.append("[");
            List<Route> routeList = routes.get(i);
            for (int j = 0; j < routeList.size(); ++j) {
                Route route = routeList.get(j);
                jsonBuilder.append("{")
                    .append("\"city_from\":\"").append(route.city_from).append("\",")
                    .append("\"city_to\":\"").append(route.city_to).append("\",")
                    .append("\"date_from\":\"").append(route.date_from).append("\",")
                    .append("\"date_to\":\"").append(route.date_to).append("\",")
                    .append("\"transport\":\"").append(route.transport).append("\"")
                    .append("}");
                if (j < routeList.size() - 1) jsonBuilder.append(",");
            }
            jsonBuilder.append("]");
            if (i < routes.size() - 1) jsonBuilder.append(",");
        }
        jsonBuilder.append("]");
        return jsonBuilder.toString();
    }

    public static List<List<Route>> parseJsonToRoutes(String json) {
        List<List<Route>> routes = new ArrayList<>();
        int i = 0, length = json.length();
        while (i < length) {
            if (json.charAt(i) == '[') {
                List<Route> routeList = new ArrayList<>();
                ++i;
                while (i < length && json.charAt(i) != ']') {
                    if (json.charAt(i) == '{') {
                        int start = i;
                        while (i < length && json.charAt(i) != '}') ++i;
                        if (i < length) ++i;
    
                        String objectJson = json.substring(start, i);
                        Route route = parseRoute(objectJson);
                        routeList.add(route);
                    } else {
                        ++i;
                    }
                } routes.add(routeList);
            } ++i;
        } return routes;
    }

    private static Route parseRoute(String json) {
        String cityFrom = extractValue(json, "city_from");
        String cityTo = extractValue(json, "city_to");
        String dateFrom = extractValue(json, "date_from");
        String dateTo = extractValue(json, "date_to");
        String transport = extractValue(json, "transport");
        return new Route(cityFrom, cityTo, dateFrom, dateTo, transport);
    }

    private static String extractValue(String json, String key) {
        int keyIndex = json.indexOf("\"" + key + "\"");
        if (keyIndex == -1) return ""; 
    
        int colonIndex = json.indexOf(":", keyIndex);
        int start = json.indexOf("\"", colonIndex) + 1;
        int end = json.indexOf("\"", start);
    
        return (start > 0 && end > start) ? json.substring(start, end) : "";
    }

    public static Map<String, Object> parseJsonToMap(String json) {
        Map<String, Object> result = new HashMap<>();
        int i = 0, length = json.length();
        
        while (i < length) {
            if (json.charAt(++i) == '"') {
                int start = i, end = json.indexOf('"', start);
                String key = json.substring(start, end);
                i = end + 2;
                if (key.equals("email")) {
                    start = i + 1;
                    end = json.indexOf('"', start);
                    result.put("email", json.substring(start, end));
                    i = end + 1;
                } else if (key.equals("routes")) {
                    start = i;
                    int bracketCount = 1;
                    while (bracketCount > 0 && ++i < length) {
                        if (json.charAt(i) == '[') ++bracketCount;
                        else if (json.charAt(i) == ']') --bracketCount;
                    } result.put("routes", json.substring(start, i));
                }
            }
        } return result;
    }
}
