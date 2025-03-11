import java.util.*;

class Route {
    String city_from, city_to;
    String date_from, date_to;
    String transport;

    Route(String city_from, String city_to, String date_from, String date_to, String transport) {
        this.city_from = city_from;
        this.city_to = city_to;
        this.date_from = date_from;
        this.date_to = date_to;
        this.transport = transport;
    }

    @Override
    public String toString() {
        return "Route{" +
               "city_from='" + city_from + '\'' +
               ", city_to='" + city_to + '\'' +
               ", date_from='" + date_from + '\'' +
               ", date_to='" + date_to + '\'' +
               ", transport='" + transport + '\'' +
               '}';
    }
}

class RouteFinder {
    private Map<String, List<Route>> graph = new HashMap<>();
    private List<List<Route>> results = new ArrayList<>();

    void addRoute(String city_from, String city_to, String date_from, String date_to, String transport) {
        graph.computeIfAbsent(city_from, k -> new ArrayList<>()).add(new Route(city_from, city_to, date_from, date_to, transport));
    }

    List<List<Route>> findRoutes(String start, String end, String desiredTime) {
        results.clear();
        dfs(start, end, new ArrayList<>(), desiredTime, 0);
        results.sort(Comparator.comparing(list -> list.get(0).date_from));
        return results;
    }

    List<List<Route>> findAllRoutes(String start, String end) {
        results.clear();
        dfsWithoutTime(start, end, new ArrayList<>(), 0);
        results.sort(Comparator.comparing(list -> list.get(0).date_from));
        return results;
    }

    private void dfs(String current, String end, List<Route> path, String earliestTime, int depth) {
        if (depth > 3) return;
        if (current.equals(end)) {
            results.add(new ArrayList<>(path));
            return;
        }
        for (Route route : graph.getOrDefault(current, Collections.emptyList())) {
            if (route.date_from.compareTo(earliestTime) >= 0) {
                path.add(route);
                dfs(route.city_to, end, path, route.date_to, depth + 1);
                path.remove(path.size() - 1);
            }
        }
    }

    private void dfsWithoutTime(String current, String end, List<Route> path, int depth) {
        if (depth > 3) return;
        if (current.equals(end)) {
            results.add(new ArrayList<>(path));
            return;
        }
        for (Route route : graph.getOrDefault(current, Collections.emptyList())) {
            path.add(route);
            dfsWithoutTime(route.city_to, end, path, depth + 1);
            path.remove(path.size() - 1);
        }
    }
}
