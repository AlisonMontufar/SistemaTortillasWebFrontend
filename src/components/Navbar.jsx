import React from "react";
import "../styles/Navbar.css";


const usuario = localStorage.getItem("nombreUsuario") || "Usuario";
function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-right">Sistemas de Pedidos</div>
      <div className="navbar-left">Hola de Nuevo, {usuario}!</div>
    </nav>
  );
}

export default Navbar;
