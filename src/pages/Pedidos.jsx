import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Pedidos.css";

const icons = {
    inicio: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
    pedidos: "https://cdn-icons-png.flaticon.com/512/2910/2910762.png",
    sucursales: "https://cdn-icons-png.flaticon.com/512/13159/13159030.png",
    configuracion: "https://cdn-icons-png.flaticon.com/512/2099/2099058.png",
    search: "https://cdn-icons-png.flaticon.com/512/54/54481.png"
};

function Pedidos() {
    const usuario = localStorage.getItem("nombreUsuario") || "TOKS";
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const pedidosData = [
        { id: 1, empresa: "Vips", producto: "Tortillas De Maíz", cantidad: "500 kg", precio: "$10,000", estatus: "Pendiente" },
        { id: 2, empresa: "Vips", producto: "Tortillas De Maíz", cantidad: "1000 kg", precio: "$20,000", estatus: "Pendiente" },
        { id: 3, empresa: "Vips", producto: "Tortillas De Maíz", cantidad: "400 kg", precio: "$8,400", estatus: "Completado" },
        { id: 4, empresa: "Vips", producto: "Tortillas De Maíz", cantidad: "300 kg", precio: "$6,300", estatus: "Completado" },
        { id: 5, empresa: "Vips", producto: "Tortillas De Maíz", cantidad: "500 kg", precio: "$10,000", estatus: "Completado" },
        { id: 6, empresa: "Vips", producto: "Tortillas De Maíz", cantidad: "500 kg", precio: "$10,000", estatus: "Completado" },
        { id: 7, empresa: "Vips", producto: "Tortillas De Maíz", cantidad: "500 kg", precio: "$10,000", estatus: "Completado" },
        { id: 8, empresa: "Vips", producto: "Tortillas De Maíz", cantidad: "1300 kg", precio: "$27,000", estatus: "Pendiente" },
        { id: 9, empresa: "Vips", producto: "Tortillas De Maíz", cantidad: "500 kg", precio: "$10,000", estatus: "Completado" }
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("nombreUsuario");
        navigate("/");
    };

    const handleVerPedido = (id) => {
        // Aquí puedes navegar a la vista de detalle del pedido
        console.log("Ver pedido:", id);
        // navigate(`/pedidos/${id}`);
    };

    const handleAgregarPedido = () => {
        // Aquí puedes navegar a la vista de agregar pedido
        console.log("Agregar nuevo pedido");
        // navigate("/pedidos/nuevo");
    };

    return (
        <div className="pedidos-container">
            <nav className="navbar">
                <div className="navbar-left">Sistema de Pedidos</div>
                <div className="navbar-right">Hola de nuevo {usuario}</div>
            </nav>

            <div className="content-wrapper">
                <aside className="sidebar">
                    <div>
                        <div className="sidebar-top">Menu</div>
                        <div className="sidebar-items">
                            <div className="sidebar-item" onClick={() => navigate("/inicio")}>
                                <img src={icons.inicio} alt="Inicio" className="icon" />
                                <span>Inicio</span>
                            </div>
                            <div className="sidebar-item active">
                                <img src={icons.pedidos} alt="Pedidos" className="icon" />
                                <span>Pedidos</span>
                            </div>
                            <div className="sidebar-item" onClick={() => navigate("/sucursales")}>
                                <img src={icons.sucursales} alt="Sucursales" className="icon" />
                                <span>Sucursales</span>
                            </div>
                            <div className="sidebar-item">
                                <img src={icons.configuracion} alt="Configuraciones" className="icon" />
                                <span>Configuraciones</span>
                            </div>
                        </div>
                    </div>

                    <div className="logout" onClick={handleLogout}>
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/1828/1828427.png"
                            alt="Salir"
                            className="icon"
                        />
                        <span>Salir</span>
                    </div>
                </aside>

                <main className="main-content">
                    <div className="header">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Buscar por N.Pedido"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <img src={icons.search} alt="Buscar" className="search-icon" />
                        </div>
                        <button className="add-button" onClick={handleAgregarPedido}>
                            + Agregar
                        </button>
                    </div>

                    <h2 className="title">Lista de pedidos</h2>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr className="table-header">
                                    <th>N. Pedido</th>
                                    <th>Empresa</th>
                                    <th>Producto</th>
                                    <th>Cantidad Total</th>
                                    <th>Precio Total</th>
                                    <th>Estatus</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidosData
                                    .filter(pedido =>
                                        searchTerm === "" ||
                                        pedido.id.toString().includes(searchTerm)
                                    )
                                    .map((pedido, index) => (
                                        <tr key={index} className="table-row">
                                            <td>{pedido.id}</td>
                                            <td>{pedido.empresa}</td>
                                            <td>{pedido.producto}</td>
                                            <td>{pedido.cantidad}</td>
                                            <td>{pedido.precio}</td>
                                            <td>
                                                <span className={`status ${pedido.estatus === "Pendiente" ? "status-pending" : "status-completed"}`}>
                                                    {pedido.estatus}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="action-button"
                                                    onClick={() => handleVerPedido(pedido.id)}
                                                >
                                                    Ver Pedido
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Pedidos;




