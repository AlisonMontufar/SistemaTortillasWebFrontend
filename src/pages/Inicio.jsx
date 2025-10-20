import React from "react";
import { useNavigate } from "react-router-dom";
import "./Inicio.css";

const icons = {
  inicio: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
  pedidos: "https://cdn-icons-png.flaticon.com/512/2910/2910762.png",
  sucursales: "https://cdn-icons-png.flaticon.com/512/13159/13159030.png",
  configuracion: "https://cdn-icons-png.flaticon.com/512/2099/2099058.png"
};

function Inicio() {
  const usuario = localStorage.getItem("nombreUsuario") || "Invitado";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nombreUsuario");
    navigate("/");
  };

  return (
    <div className="inicio-container">
      <nav className="navbar">
        <div className="navbar-right">Sistemas de pedidos</div>
        <div className="navbar-left">Hola de Nuevo, {usuario}</div>
      </nav>

      <div className="content-wrapper">
        <aside className="sidebar">
          <div>
            <div className="sidebar-top">Menu</div>
            <div className="sidebar-items">
              
              {/* INICIO */}
              <div className="sidebar-item" onClick={() => navigate("/inicio")}>
                <img src={icons.inicio} alt="Inicio" className="icon" />
                <span>Inicio</span>
              </div>

              {/* PEDIDOS */}
              <div className="sidebar-item" onClick={() => navigate("/pedidos")}>
                <img src={icons.pedidos} alt="Pedidos" className="icon" />
                <span>Pedidos</span>
              </div>

              {/* SUCURSALES */}
              <div className="sidebar-item" onClick={() => navigate("/sucursales")}>
                <img src={icons.sucursales} alt="Sucursales" className="icon" />
                <span>Sucursales</span>
              </div>

              {/* CONFIGURACIÓN */}
              <div className="sidebar-item" onClick={() => navigate("/configuracion")}>
                <img src={icons.configuracion} alt="Configuración" className="icon" />
                <span>Configuración</span>
              </div>

            </div>
          </div>

          <div className="logout" onClick={handleLogout}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1828/1828427.png"
              alt="Cerrar sesión"
              className="icon"
            />
            <span>Cerrar sesión</span>
          </div>
        </aside>

        <main className="main-content">
          <div className="welcome">¡Bienvenido, {usuario}!</div>
        </main>
      </div>
    </div>
  );
}

export default Inicio;
