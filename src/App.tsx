import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MapComponent from "./components/MapComponent";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Header from "./components/Header";
// import BookingForm from "./components/MapComponent";

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/" element={isAuthenticated ? <MapComponent /> : <Navigate to="/login" />} />
      </Routes>
      <Header />
      {/* <Routes>
        <Route path="/" element={isAuthenticated ? <BookingForm />: <Navigate to="/login" />} />
      </Routes> */}
    </Router>
  );
};

export default App;
