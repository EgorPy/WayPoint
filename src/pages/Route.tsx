import { FaPlane, FaBus, FaTrain, FaArrowLeft } from "react-icons/fa6";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaRoute } from "react-icons/fa";
import "./Route.css";

const Route = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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

  const cancelOrder = async () => {
    if (cancelling) return;
  
    const confirmCancel = window.confirm("Вы точно хотите отменить заказ?");
    if (!confirmCancel) return;
  
    setCancelling(true);
  
    try {
      const formData = new URLSearchParams();
      formData.append("routeId", routeId || "");
      formData.append("email", localStorage.getItem("token") || "");
  
      const response = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
  
      if (!response.ok) throw new Error("Ошибка отмены заказа");
  
      alert("Заказ успешно отменён");
      navigate(-1);
    } catch (error) {
      console.error(error);
      setCancelling(false);
    }
  };

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

  if (loading) return <p style={{color: "#fff", fontSize: "30px"}}>Загрузка...</p>;
  if (!route) return <p style={{color: "#fff", fontSize: "30px"}}>Заказ не найден</p>;

  const getTransportIcon = (transportType: string) => {
    switch (transportType) {
      case "Самолёт":
        return <FaPlane className="icon" />;
      case "Поезд":
        return <FaTrain className="icon" />;
      case "Автобус":
        return <FaBus className="icon" />;
      case "Микс":
        return <FaRoute className="icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="order-page">
      <div className="order-container">
        <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
        <h1>Заказ</h1>
        <div className="route-id" onClick={copyToClipboard}>
          {routeId}
          {copied && <p className="copy-notification">Скопировано!</p>}
        </div>
        <div className="route-visual">
          <span className="route-city">{route.city_from}</span>
          <div className="route-line"> ——— </div>
          <div className="transport-icon">{getTransportIcon(route.transport)}</div>
          <div className="route-line"> ——— </div>
          <span className="route-city">{route.city_to}</span>
        </div>
        <p className="order-details"><strong>Дата:</strong> {route.date}</p>
        <p className="order-details"><strong>Транспорт:</strong> {route.transport}</p>
        <p className="order-details"><strong>Email:</strong> {route.email}</p>
        <button className="cancel-button" onClick={cancelOrder} disabled={cancelling}>
          {cancelling ? "Отмена..." : "Отменить заказ"}
        </button>
      </div>
    </div>
  );
};

export default Route;
