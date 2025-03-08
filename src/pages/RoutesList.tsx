import React, { useState, useEffect, useRef, useCallback } from "react";
import "./RoutesList.css";

const fetchRoutes = async (offset: number, limit: number) => {
    const email = localStorage.getItem("token");
    if (!email) return [];
    const response = await fetch(`/api/routes?email=${email}&offset=${offset}&limit=${limit}`);
    if (!response.ok) return [];
    return await response.json();
};

const RoutesList: React.FC = () => {
    const [routes, setRoutes] = useState<{ [key: string]: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;
    const offsetRef = useRef(0);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastRouteRef = useRef<HTMLLIElement | null>(null);
    const isFetchingRef = useRef(false);

    const loadRoutes = useCallback(async () => {
        if (isFetchingRef.current || !hasMore) return;
        isFetchingRef.current = true;
        setLoading(true);
        try {
            const newRoutes = await fetchRoutes(offsetRef.current, limit);
            if (newRoutes.length < limit) {
                setHasMore(false);
            }
            setRoutes((prev) => [...prev, ...newRoutes]);
            offsetRef.current += newRoutes.length;
        } catch (error) {
            console.error("Ошибка загрузки маршрутов:", error);
        }
        setLoading(false);
        isFetchingRef.current = false;
    }, [hasMore]);

    useEffect(() => {
        loadRoutes();
    }, []); 

    useEffect(() => {
        if (!lastRouteRef.current || !hasMore || loading) return;

        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isFetchingRef.current) {
                loadRoutes();
            }
        });

        observer.current.observe(lastRouteRef.current);
        return () => observer.current?.disconnect();
    }, [routes, hasMore, loading]);

    return (
        <div className="routes-container">
            <h2 className="routes-title">Мои маршруты</h2>
            <ul className="routes-list">
                {routes.map((route, index) => (
                    <li key={index} ref={index === routes.length - 1 ? lastRouteRef : null} className="route-item">
                        <div className="route-info">
                            <span className="route-city">{route.city_from} → {route.city_to}</span>
                            <span className="route-date">{route.date}</span>
                        </div>
                        <div className="route-transport">{route.transport}</div>
                    </li>
                ))}
            </ul>
            {loading && <p className="loading-text">Загрузка...</p>}
        </div>
    );
};

export default RoutesList;
