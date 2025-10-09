import React from "react";
import { useNavigate } from "react-router-dom"; // <-- importamos useNavigate
import "./Inicio.css"; // crea este archivo también en src/pages

// Iconos de Flaticon
const icons = {
    inicio: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
    pedidos: "https://cdn-icons-png.flaticon.com/512/2910/2910762.png",
    sucursales: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    configuracion: "https://cdn-icons-png.flaticon.com/512/2099/2099058.png"
};

function Inicio() {
    const usuario = "Javi";
    const navigate = useNavigate(); // <-- hook de navegación

    const handleLogout = () => {
        // Aquí puedes limpiar localStorage, cookies o estados si lo deseas
        navigate("/"); // Redirige al login
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
                            <div className="sidebar-item active">
                                <img src={icons.inicio} alt="Inicio" className="icon" />
                                <span>Inicio</span>
                            </div>
                            <div className="sidebar-item">
                                <img src={icons.pedidos} alt="Pedidos" className="icon" />
                                <span>Pedidos</span>
                            </div>
                            <div className="sidebar-item">
                                <img src={icons.sucursales} alt="Sucursales" className="icon" />
                                <span>Sucursales</span>
                            </div>
                            <div className="sidebar-item">
                                <img src={icons.configuracion} alt="Configuración" className="icon" />
                                <span>Configuración</span>
                            </div>
                        </div>
                    </div>

                    {/* Botón Cerrar sesión */}
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
                    {/* Mensaje de bienvenida */}
                    <div className="welcome">¡Bienvenido, {usuario}!</div>

                    {/* Aquí irá el contenido principal */}
                </main>
            </div>
        </div>
    );
}

export default Inicio;
