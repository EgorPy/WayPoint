import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AllSearchResults from "./pages/AllSearchResults";
import MapComponent from "./components/MapComponent";
import SearchResults from "./pages/SearchResults";
import RegisterPage from "./pages/Register";
import RoutesList from "./pages/RoutesList";
import Header from "./components/Header";
import LoginPage from "./pages/Login";
import RoutePage from "./pages/Route";
import AboutPage from "./pages/About";
import React from "react";

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/route/:routeId" element={<RoutePage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/" element={isAuthenticated ? <MapComponent /> : <Navigate to="/login" />} />
        <Route path="/routes" element={<RoutesList />} />
        <Route path="/search_results" element={<SearchResults />} />
        <Route path="/all_search_results" element={<AllSearchResults />} />
      </Routes>
      <Header />
    </Router>
  );
};

export default App;
