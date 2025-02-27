import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
  
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
  
      const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
      });
  
      if (response.ok) {
          const text = await response.text();
          localStorage.setItem("token", text);
          console.log("Response status:", response.status);
          console.log("Response body:", text);
          navigate("/");
          window.location.reload();
      } else {
          setError("Неверный email или пароль");
      }
  };

  return (
    <div style={{ padding: "20px", marginTop: "8vh" }}>
      <h2>Вход</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Войти</button>
      </form>
      <p>
        Нет аккаунта? <a href="/register">Регистрация</a>
      </p>
    </div>
  );
};

export default LoginPage;
