import { FaPlane, FaBus, FaTrain } from "react-icons/fa6";
import { FaExchangeAlt } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Route.css";

const Route = () => {
  const { routeId } = useParams();
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/route/${routeId}`);
        if (!response.ok) throw new Error("Ошибка загрузки заказа");
        const data = await response.json();
        setRoute(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [routeId]);

  const copyToClipboard = () => {
    if (!routeId) return;
  
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(routeId)
        .then(() => showCopiedMessage())
        .catch(() => fallbackCopy(routeId));
    } else {
      fallbackCopy(routeId);
    }
  };
  
  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showCopiedMessage();
  };
  
  const showCopiedMessage = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) return <p>Загрузка...</p>;
  if (!route) return <p>Заказ не найден</p>;

  const getTransportIcon = (transportType: string) => {
    switch (transportType) {
      case "Самолёт":
        return <FaPlane className="icon" />;
      case "Поезд":
        return <FaTrain className="icon" />;
      case "Автобус":
        return <FaBus className="icon" />;
      case "Микс":
        return <FaExchangeAlt className="icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="order-page">
      <div className="order-container">
        <h1>
          Заказ <br />
          <div className="route-id" onClick={copyToClipboard}>
            {routeId}
            {copied && <p className="copy-notification">Скопировано!</p>}
          </div>
        </h1>
        <div className="route-visual">
          <span className="route-city">{route.city_from}</span>
          <div className="route-line"></div>
          <div className="transport-icon">{getTransportIcon(route.transport)}</div>
          <div className="route-line"></div>
          <span className="route-city">{route.city_to}</span>
        </div>
        <p className="order-details"><strong>Дата:</strong> {route.date}</p>
        <p className="order-details"><strong>Транспорт:</strong> {route.transport}</p>
        <p className="order-details"><strong>Email:</strong> {route.email}</p>
      </div>
    </div>
  );
};

export default Route;
