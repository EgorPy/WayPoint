import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MapComponent from "./components/MapComponent";
import RoutesList from "./pages/RoutesList";
import RegisterPage from "./pages/Register";
import Header from "./components/Header";
import LoginPage from "./pages/Login";
import RoutePage from "./pages/Route";
import React from "react";

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/route/:routeId" element={<RoutePage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/" element={isAuthenticated ? <MapComponent /> : <Navigate to="/login" />} />
        <Route path="/routes" element={<RoutesList />} />
      </Routes>
      <Header />
    </Router>
  );
};

export default App;
