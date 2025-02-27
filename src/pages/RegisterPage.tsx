import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });

    if (response.ok) {
      navigate("/login");
      window.location.reload();
    } else {
      setError("Ошибка регистрации. Email уже используется.");
    }
  };

  return (
    <div style={{ padding: "20px", marginTop: "8vh" }}>
      <h2>Регистрация</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p>
        Уже есть аккаунт? <a href="/login">Войти</a>
      </p>
    </div>
  );
};

export default RegisterPage;
