import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import OlvidePassword from "./pages/OlvidePassword";
import Registro from "./pages/Registro";
import Pedidos from "./pages/Pedidos";
import Sucursales from "./pages/Sucursales";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/olvide-password" element={<OlvidePassword />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/sucursales" element={<Sucursales />} />
      </Routes>
    </Router>
  );
}

export default App;
