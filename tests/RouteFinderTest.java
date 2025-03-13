import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.Test;
import java.util.List;

public class RouteFinderTest {
    private RouteFinder routeFinder;

    @Before
    public void setUp() {
        routeFinder = new RouteFinder();
        routeFinder.addRoute("Москва", "Самарканд", "2025-03-12T10:00", "2025-03-12T16:00", "Самолет");
        routeFinder.addRoute("Самарканд", "Бухара", "2025-03-12T18:00", "2025-03-12T20:00", "Поезд");
        routeFinder.addRoute("Москва", "Бухара", "2025-03-12T09:00", "2025-03-12T17:00", "Самолет");
        routeFinder.addRoute("Бухара", "Ташкент", "2025-03-12T21:00", "2025-03-13T01:00", "Автобус");
    }

    @Test
    public void testFindRoutesDirect() {
        List<List<Route>> routes = routeFinder.findRoutes("Москва", "Бухара", "2025-03-12T08:00");
        assertFalse(routes.isEmpty());
        assertEquals("Москва", routes.get(0).get(0).city_from);
        assertEquals("Бухара", routes.get(0).get(0).city_to);
    }

    @Test
    public void testFindRoutesWithTransfer() {
        List<List<Route>> routes = routeFinder.findRoutes("Москва", "Бухара", "2025-03-12T08:00");
        assertFalse(routes.isEmpty());
        assertEquals(1, routes.get(0).size());
    }

    @Test
    public void testFindRoutesNoResults() {
        List<List<Route>> routes = routeFinder.findRoutes("Москва", "Франкфурт-на-Майне", "2025-03-12T08:00");
        assertTrue(routes.isEmpty());
    }

    @Test
    public void testFindAllRoutes() {
        List<List<Route>> routes = routeFinder.findAllRoutes("Москва", "Бухара");
        assertEquals(2, routes.size());
    }

    @Test
    public void testFindAllRoutesWithMultipleConnections() {
        List<List<Route>> routes = routeFinder.findAllRoutes("Москва", "Ташкент");
        assertFalse(routes.isEmpty());
        assertTrue(routes.get(0).size() == 2 || routes.get(0).size() == 3);
    }
}
