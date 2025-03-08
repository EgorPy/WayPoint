import { useNavigate } from "react-router-dom";
import React from "react";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="left-header">
        <a href="/" className="logo">WayPoint</a>
        {isAuthenticated && (
          <button onClick={() => navigate("/routes")} className="routes-button">
            Маршруты
          </button>
        )}
      </div>

      {isAuthenticated ? (
        <button onClick={handleLogout} className="log-button">
          Выйти
        </button>
      ) : (
        <button onClick={() => navigate("/login")} className="log-button">
          Войти
        </button>
      )}
    </header>
  );
};

export default Header;
