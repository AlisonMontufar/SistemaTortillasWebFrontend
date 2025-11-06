import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";

const icons = {
  inicio: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
  pedidos: "https://cdn-icons-png.flaticon.com/512/2910/2910762.png",
  sucursales: "https://cdn-icons-png.flaticon.com/512/13159/13159030.png",
  configuraciones: "https://cdn-icons-png.flaticon.com/512/2099/2099058.png",
  salir: "https://cdn-icons-png.flaticon.com/512/4400/4400828.png",
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">Menú Principal</div>

      <div className="sidebar-items">
        <div
          className={`sidebar-item ${
            location.pathname === "/" ? "active" : ""
          }`}
          onClick={() => navigate("/Inicio")}
        >
          <img src={icons.inicio} alt="Inicio" className="icon" />
          <span>Inicio</span>
        </div>

        <div
          className={`sidebar-item ${
            location.pathname === "/pedidos" ? "active" : ""
          }`}
          onClick={() => navigate("/pedidos")}
        >
          <img src={icons.pedidos} alt="Pedidos" className="icon" />
          <span>Pedidos</span>
        </div>

        <div
          className={`sidebar-item ${
            location.pathname === "/sucursales" ? "active" : ""
          }`}
          onClick={() => navigate("/sucursales")}
        >
          <img src={icons.sucursales} alt="Sucursales" className="icon" />
          <span>Sucursales</span>
        </div>

        <div
          className={`sidebar-item ${
            location.pathname === "/configuraciones" ? "active" : ""
          }`}
          onClick={() => navigate("/configuraciones")}
        >
          <img src={icons.configuraciones} alt="Configuraciones" className="icon" />
          <span>Configuraciones</span>
        </div>
      </div>

      <div className="logout" onClick={() => navigate("/")}>
                  <img
              src="https://cdn-icons-png.flaticon.com/512/1828/1828427.png"
              alt="Cerrar sesión"
              className="icon"
            />
        <span>Cerrar sesión</span>
      </div>
    </aside>
  );
}

export default Sidebar;
