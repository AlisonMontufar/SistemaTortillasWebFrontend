import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import OlvidePassword from "./pages/OlvidePassword";
import Registro from "./pages/Registro";
import Pedidos from "./pages/Pedidos";
import Sucursales from "./pages/Sucursales";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // si no hay token → regresar al login
  if (!token) return <Navigate to="/" replace />;

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* LOGIN (si ya tiene token lo mandamos a Inicio) */}
        <Route
          path="/"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/inicio" replace />
              : <Login />
          }
        />

        {/* RUTAS PROTEGIDAS */}
        <Route
          path="/inicio"
          element={
            <ProtectedRoute>
              <Inicio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <Pedidos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sucursales"
          element={
            <ProtectedRoute>
              <Sucursales />
            </ProtectedRoute>
          }
        />

        {/* RUTAS LIBRES */}
        <Route path="/olvide-password" element={<OlvidePassword />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </Router>
  );
}

export default App;
