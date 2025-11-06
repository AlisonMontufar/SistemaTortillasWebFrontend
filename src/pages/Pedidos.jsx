import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ApiPedidos from "../services/apiPedidos";
import "../styles/Pedidos.css";
import "../styles/PedidosModal.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const icons = {
    search: "https://cdn-icons-png.flaticon.com/512/54/54481.png"
};

function Pedidos() {
    const [searchTerm, setSearchTerm] = useState("");
    const [pedidosData, setPedidosData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [empresas, setEmpresas] = useState([]);

    const [nuevoPedido, setNuevoPedido] = useState({
        fkEmpresa: 0,
        fkUsuario: 1,
        total: 0,
        estatusGeneral: "Pendiente",
        detalles: [],
        pago: {
            nombreTitular: "",
            metodoPago: "",
            numeroEnmascarado: "",
            marcaTarjeta: "",
            expMes: "",
            expAnio: "",
            tokenPago: ""
        }
    });

    const [detalleTemp, setDetalleTemp] = useState({
        productoNombre: "",
        cantidad: "",
        estatusNombre: "Pendiente",
        sucursalesAsignadas: [],
        estatusDetalle: "Pendiente"
    });

    useEffect(() => {
        cargarPedidos();
        cargarEmpresas();
    }, []);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await ApiPedidos.obtenerPedidos();
            setPedidosData(data);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudieron cargar los pedidos", "error");
        }
        setLoading(false);
    };

    const cargarEmpresas = async () => {
        try {
            const data = await ApiPedidos.obtenerEmpresas();
            setEmpresas(data);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudieron cargar las empresas", "error");
        }
    };

    const handleInputText = (e, field, target = "detalle") => {
        const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
        if (target === "detalle") {
            setDetalleTemp({ ...detalleTemp, [field]: value });
        } else if (target === "pago") {
            setNuevoPedido({
                ...nuevoPedido,
                pago: { ...nuevoPedido.pago, [field]: value }
            });
        } else {
            setNuevoPedido({ ...nuevoPedido, [field]: value });
        }
    };

    const handleInputNumber = (e, field, target = "detalle") => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (target === "detalle") {
            setDetalleTemp({ ...detalleTemp, [field]: value });
        } else {
            setNuevoPedido({ ...nuevoPedido, [field]: value });
        }
    };

    const handlePagoNumber = (e, field) => {
        let value = e.target.value.replace(/[^0-9]/g, "");
        if (field === "numeroEnmascarado") value = value.slice(0, 16);
        setNuevoPedido({
            ...nuevoPedido,
            pago: { ...nuevoPedido.pago, [field]: value }
        });
    };

    const handleAgregarDetalle = () => {
        if (
            detalleTemp.productoNombre.trim() === "" ||
            !detalleTemp.cantidad ||
            detalleTemp.sucursalesAsignadas.length === 0
        ) {
            Swal.fire("Error", "Completa todos los campos del detalle correctamente.", "error");
            return;
        }

        setNuevoPedido((prev) => ({
            ...prev,
            detalles: [
                ...prev.detalles,
                {
                    ...detalleTemp,
                    cantidad: Number(detalleTemp.cantidad)
                }
            ]
        }));

        setDetalleTemp({
            productoNombre: "",
            cantidad: "",
            estatusNombre: "Pendiente",
            sucursalesAsignadas: [],
            estatusDetalle: "Pendiente"
        });

        Swal.fire("Detalle agregado", "El detalle se agregó correctamente", "success");
    };

    const handleAgregarPedido = async () => {
        if (nuevoPedido.fkEmpresa === 0) {
            Swal.fire("Error", "Selecciona la empresa del pedido.", "error");
            return;
        }
        if (nuevoPedido.detalles.length === 0) {
            Swal.fire("Error", "Agrega al menos un detalle al pedido.", "error");
            return;
        }
        if (nuevoPedido.total <= 0) {
            Swal.fire("Error", "El total del pedido debe ser mayor a 0.", "error");
            return;
        }

        const { nombreTitular, metodoPago, numeroEnmascarado, marcaTarjeta, expMes, expAnio } = nuevoPedido.pago;
        if (!nombreTitular || !metodoPago || !numeroEnmascarado || !marcaTarjeta || !expMes || !expAnio) {
            Swal.fire("Error", "Completa toda la información de pago.", "error");
            return;
        }

        try {
            const payload = {
                fkEmpresa: Number(nuevoPedido.fkEmpresa),
                fkUsuario: Number(nuevoPedido.fkUsuario),
                total: Number(nuevoPedido.total),
                estatusGeneral: nuevoPedido.estatusGeneral,
                detalles: nuevoPedido.detalles.map(d => ({
                    productoNombre: d.productoNombre,
                    cantidad: Number(d.cantidad),
                    estatusNombre: d.estatusNombre,
                    sucursalesAsignadas: d.sucursalesAsignadas.map(s => Number(s)),
                    estatusDetalle: d.estatusDetalle
                })),
                pago: {
                    metodoPago: nuevoPedido.pago.metodoPago,
                    numeroEnmascarado: nuevoPedido.pago.numeroEnmascarado,
                    marcaTarjeta: nuevoPedido.pago.marcaTarjeta,
                    expMes: Number(nuevoPedido.pago.expMes),
                    expAnio: Number(nuevoPedido.pago.expAnio),
                    nombreTitular: nuevoPedido.pago.nombreTitular,
                    tokenPago: nuevoPedido.pago.tokenPago || `TOKEN_${Date.now()}`
                }
            };

            console.log("Enviando pedido:", payload);
            await ApiPedidos.crearPedido(payload);

            Swal.fire("Éxito", "Pedido agregado correctamente", "success");
            setModalVisible(false);

            // Reset form
            setNuevoPedido({
                fkEmpresa: 0,
                fkUsuario: 1,
                total: 0,
                estatusGeneral: "Pendiente",
                detalles: [],
                pago: {
                    nombreTitular: "",
                    metodoPago: "",
                    numeroEnmascarado: "",
                    marcaTarjeta: "",
                    expMes: "",
                    expAnio: "",
                    tokenPago: ""
                }
            });

            cargarPedidos();
        } catch (error) {
            console.error("Error completo:", error);
            Swal.fire("Error", error.message || "Error al enviar el pedido", "error");
        }
    };

    const handleVerPedido = (pedido) => {
        console.log("Detalle del pedido:", pedido);
        
        let detallesHTML = "<div style='text-align: left;'>";
        detallesHTML += `<p><strong>ID Pedido:</strong> ${pedido.id}</p>`;
        detallesHTML += `<p><strong>Total:</strong> $${pedido.total.toFixed(2)}</p>`;
        detallesHTML += `<p><strong>Estatus:</strong> ${pedido.estatusGeneral || 'Pendiente'}</p>`;
        detallesHTML += `<p><strong>Fecha:</strong> ${new Date(pedido.fechaRegistro).toLocaleDateString()}</p>`;
        
        if (pedido.detalles && pedido.detalles.length > 0) {
            detallesHTML += "<h4>Detalles:</h4><ul>";
            pedido.detalles.forEach(d => {
                detallesHTML += `<li>${d.productoNombre} - Cantidad: ${d.cantidad} - Estatus: ${d.estatusDetalle}</li>`;
            });
            detallesHTML += "</ul>";
        }
        
        if (pedido.pago) {
            detallesHTML += "<h4>Información de Pago:</h4>";
            detallesHTML += `<p><strong>Titular:</strong> ${pedido.pago.nombreTitular}</p>`;
            detallesHTML += `<p><strong>Método:</strong> ${pedido.pago.metodoPago}</p>`;
            detallesHTML += `<p><strong>Tarjeta:</strong> ${pedido.pago.marcaTarjeta} **** ${pedido.pago.numeroEnmascarado.slice(-4)}</p>`;
        }
        
        detallesHTML += "</div>";

        Swal.fire({
            title: `Pedido #${pedido.id}`,
            html: detallesHTML,
            width: "600px",
            confirmButtonText: "Cerrar"
        });
    };

    const handleEliminarDetalle = (index) => {
        setNuevoPedido({
            ...nuevoPedido,
            detalles: nuevoPedido.detalles.filter((_, i) => i !== index)
        });
    };

    const handleSucursalChange = (sucursalId) => {
        const sucursalesActuales = detalleTemp.sucursalesAsignadas;
        const idNumerico = Number(sucursalId);
        
        if (sucursalesActuales.includes(idNumerico)) {
            setDetalleTemp({
                ...detalleTemp,
                sucursalesAsignadas: sucursalesActuales.filter(s => s !== idNumerico)
            });
        } else {
            setDetalleTemp({
                ...detalleTemp,
                sucursalesAsignadas: [...sucursalesActuales, idNumerico]
            });
        }
    };

    return (
        <div className="pedidos-container">
            <Navbar />
            
            <div className="content-wrapper">
                <Sidebar />

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
                        <button className="add-button" onClick={() => setModalVisible(true)}>
                            + Nuevo Pedido
                        </button>
                    </div>

                    <h2 className="title">Lista de pedidos</h2>
                    <div className="table-container">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <p>Cargando pedidos...</p>
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr className="table-header">
                                        <th>N. Pedido</th>
                                        <th>Productos</th>
                                        <th>Total</th>
                                        <th>Fecha</th>
                                        <th>Estatus</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosData
                                        .filter((p) => searchTerm === "" || p.id.toString().includes(searchTerm))
                                        .map((pedido) => {
                                            const productos = pedido.detalles?.map((d) => `${d.productoNombre} (${d.cantidad})`).join(", ") || "Sin detalles";
                                            const estatus = pedido.estatusGeneral || "Pendiente";
                                            return (
                                                <tr key={pedido.id} className="table-row">
                                                    <td>{pedido.id}</td>
                                                    <td>{productos}</td>
                                                    <td>${pedido.total.toFixed(2)}</td>
                                                    <td>{new Date(pedido.fechaRegistro).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status ${estatus === "Pendiente" ? "status-pending" : "status-completed"}`}>
                                                            {estatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="action-button" onClick={() => handleVerPedido(pedido)}>
                                                            Ver Pedido
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>

            {/* MODAL */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Agregar Pedido</h2>

                        <div className="form-group">
                            <label>Empresa *</label>
                            <select
                                value={nuevoPedido.fkEmpresa}
                                onChange={(e) => setNuevoPedido({ ...nuevoPedido, fkEmpresa: Number(e.target.value) })}
                            >
                                <option value={0}>Selecciona Empresa</option>
                                {empresas.map((empresa) => (
                                    <option key={empresa.id} value={empresa.id}>
                                        {empresa.nombreEmpresa}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Total del Pedido *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={nuevoPedido.total}
                                onChange={(e) => setNuevoPedido({ ...nuevoPedido, total: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>

                        <h3>Información de Pago</h3>
                        <div className="form-group">
                            <label>Nombre Titular *</label>
                            <input
                                type="text"
                                value={nuevoPedido.pago.nombreTitular}
                                onChange={(e) => handleInputText(e, "nombreTitular", "pago")}
                                placeholder="Juan Pérez"
                            />
                        </div>
                        <div className="form-group">
                            <label>Método de Pago *</label>
                            <select
                                value={nuevoPedido.pago.metodoPago}
                                onChange={(e) => setNuevoPedido({ 
                                    ...nuevoPedido, 
                                    pago: { ...nuevoPedido.pago, metodoPago: e.target.value } 
                                })}
                            >
                                <option value="">Seleccionar</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Número de Tarjeta *</label>
                            <input
                                type="text"
                                value={nuevoPedido.pago.numeroEnmascarado.replace(/(\d{4})/g, "$1 ").trim()}
                                maxLength={19}
                                onChange={(e) => handlePagoNumber(e, "numeroEnmascarado")}
                                placeholder="1234 5678 9012 3456"
                            />
                        </div>
                        <div className="form-group">
                            <label>Marca Tarjeta *</label>
                            <select
                                value={nuevoPedido.pago.marcaTarjeta}
                                onChange={(e) => setNuevoPedido({ 
                                    ...nuevoPedido, 
                                    pago: { ...nuevoPedido.pago, marcaTarjeta: e.target.value } 
                                })}
                            >
                                <option value="">Seleccionar</option>
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="American Express">American Express</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Mes de Expiración *</label>
                            <select
                                value={nuevoPedido.pago.expMes}
                                onChange={(e) => setNuevoPedido({ 
                                    ...nuevoPedido, 
                                    pago: { ...nuevoPedido.pago, expMes: e.target.value } 
                                })}
                            >
                                <option value="">Mes</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                                    const mesFormateado = String(m).padStart(2, "0");
                                    return <option key={m} value={mesFormateado}>{mesFormateado}</option>;
                                })}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Año de Expiración *</label>
                            <select
                                value={nuevoPedido.pago.expAnio}
                                onChange={(e) => setNuevoPedido({ 
                                    ...nuevoPedido, 
                                    pago: { ...nuevoPedido.pago, expAnio: e.target.value } 
                                })}
                            >
                                <option value="">Año</option>
                                {Array.from({ length: 11 }, (_, i) => 2025 + i).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <h3>Detalle del Pedido</h3>
                        <div className="form-group">
                            <label>Producto *</label>
                            <input
                                type="text"
                                placeholder="Nombre del producto"
                                value={detalleTemp.productoNombre}
                                onChange={(e) => handleInputText(e, "productoNombre")}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cantidad (kg) *</label>
                            <input
                                type="number"
                                min={1}
                                value={detalleTemp.cantidad}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleInputNumber(e, "cantidad")}
                                placeholder="1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Sucursales Asignadas *</label>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                                {empresas.map((empresa) => (
                                    <div key={empresa.id} style={{ marginBottom: '8px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={detalleTemp.sucursalesAsignadas.includes(empresa.id)}
                                                onChange={() => handleSucursalChange(empresa.id)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            {empresa.nombreEmpresa}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                Seleccionadas: {detalleTemp.sucursalesAsignadas.length}
                            </small>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setModalVisible(false)}>
                                Cancelar
                            </button>
                            <button className="btn-submit" onClick={handleAgregarDetalle}>
                                Agregar Detalle
                            </button>
                            <button className="btn-submit" onClick={handleAgregarPedido} style={{ backgroundColor: '#27ae60' }}>
                                Guardar Pedido
                            </button>
                        </div>

                        {nuevoPedido.detalles.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h3>Detalles Agregados ({nuevoPedido.detalles.length})</h3>
                                <table className="details-table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Sucursales</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nuevoPedido.detalles.map((d, idx) => (
                                            <tr key={idx}>
                                                <td>{d.productoNombre}</td>
                                                <td>{d.cantidad} kg</td>
                                                <td>{d.sucursalesAsignadas.length} sucursal(es)</td>
                                                <td>
                                                    <button
                                                        className="btn-cancel"
                                                        onClick={() => handleEliminarDetalle(idx)}
                                                        style={{ padding: '5px 10px', fontSize: '12px' }}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pedidos;