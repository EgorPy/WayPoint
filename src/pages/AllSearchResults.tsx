import { useLocation, useNavigate } from "react-router-dom";
import { FaPlane, FaBus, FaTrain } from "react-icons/fa6";
import { useEffect, useState } from "react";
import "./SearchResults.css";

const AllSearchResults = () => {
  const location = useLocation();
  const { from, to, date, transport } = location.state || {};
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const bookRoute = async (route: any) => {
    if (!window.confirm("Забронировать этот маршрут?")) {
      return;
    }

    const formData = new URLSearchParams();
    formData.append("email", localStorage.getItem("token") || "");
    formData.append("city_from", from);
    formData.append("city_to", to);
    formData.append("date", date);
    formData.append("transport", transport);
    formData.append("routes", JSON.stringify(route));
    console.log("Отправляемые данные:", formData.toString());
  
    try {
      const response = await fetch("/api/book_route", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
  
      const data = await response.json();
      if (response.ok && data.routeId) {
        navigate(`/route/${data.routeId}`);
      } else {
        alert(data.error || "Интересная ошибка");
      }
    } catch {
      alert("Ошибка соединения с сервером");
    }
  };

  useEffect(() => {
    if (!from || !to || !date || !transport) {
      setError("Некорректные данные для поиска.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const formData = new URLSearchParams();
        formData.append("city_from", from);
        formData.append("city_to", to);
        formData.append("date", date);
        formData.append("transport", transport);
        formData.append("email", localStorage.getItem("token") || "");

        const response = await fetch("/api/all_routes", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });

        const data = await response.json();
        console.log(data);
        setRoutes(data || []);
      } catch {
        setError("Ошибка загрузки данных.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to, date, transport]);

  const getTransportIcon = (transportType: string) => {
    switch (transportType) {
      case "flights":
        return <FaPlane className="icon" />;
      case "trains":
        return <FaTrain className="icon" />;
      case "buses":
        return <FaBus className="icon" />;
      default:
        return null;
    }
  };

  const getTransportName = (transportType: string) => {
    switch (transportType) {
      case "flights":
        return "Самолёт";
      case "trains":
        return "Поезд";
      case "buses":
        return "Автобус";
      default:
        return null;
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <p className="loading-text">Загрузка...</p>;
  if (error) return <p className="no-routes">{error}</p>;
  if (!routes.length) return <p className="no-routes">Маршруты не найдены.</p>;

  return (
    <div className="routes-container">
      <div className="routes-header">
        <h2 className="routes-title">Результаты поиска</h2>
        <button className="show-all-button" onClick={() => navigate(-1)}>Показать подходящие маршруты</button>
      </div>
      <ul className="routes-list">
        {routes.map((route, index) => (
          <li key={index} className="route-item">
            <div className="route-content">
              {route.map((segment: any, i: number) => (
                <div key={i} className="segment">
                  <div className="route-date-top">
                    <div className="date-from">{formatTime(segment.date_from)}</div>
                    <div className="date-to">{formatTime(segment.date_to)}</div>
                  </div>
                  <div className="route-info">
                    <span className="route-city">{segment.city_from}</span>
                    <span className="route-line"> ——— </span>
                    <span className="route-icon">{getTransportIcon(segment.transport)}</span>
                    <span className="route-line"> ——— </span>
                    <span className="route-city">{segment.city_to}</span>
                  </div>
                  <div className="route-transport">{getTransportName(segment.transport)}</div>
                  {i < route.length - 1 && <div className="transfer">Пересадка</div>}
                </div>
              ))}
              <button className="book-button" onClick={() => bookRoute(route)}>Забронировать</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );  
};

export default AllSearchResults;
