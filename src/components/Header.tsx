import React from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    background: "rgba(255, 255, 255, 0.05)",
    position: "absolute",
    color: "#4aaaff",
    width: "100%",
    alignItems: "center",
    top: 0,
    height: "fit-content",
    backdropFilter: "blur(5px)",
    borderBottomLeftRadius: "30px",
    borderBottomRightRadius: "30px",
  };
  
  const buttonStyle: React.CSSProperties = {
    marginRight: "40px",
    background: "#0000003d",
    color: "white",
    border: "none",
    padding: "16px 32px",
    borderRadius: "20px",
    cursor: "pointer",
    height: "fit-content",
    fontSize: "20px",
  }

  return (
    <header style={headerStyle}>
      <h1 style={{ marginLeft: "40px"}}>WayPoint</h1>
      {isAuthenticated ? (
        <button onClick={handleLogout} style={buttonStyle}>
          Выйти
        </button>
      ) : (
        <button onClick={() => navigate("/login")} style={ buttonStyle }>
          Войти
        </button>
      )}
    </header>
  );
};

export default Header;
