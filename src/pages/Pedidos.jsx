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
    const [sucursales, setSucursales] = useState([]);

    const [nuevoPedido, setNuevoPedido] = useState({
        fkEmpresa: 0,
        fkUsuario: 1,
        fkDireccion: 0,
        fechaEntrega: "",
        total: 0,
        detalles: [],
        pago: {
            nombreTitular: "",
            metodoPago: "",
            numeroEnmascarado: "",
            marcaTarjeta: "",
            expMes: "",
            expAnio: ""
        }
    });

    const [detalleTemp, setDetalleTemp] = useState({
        productoNombre: "",
        cantidad: "",
        precio: "",
        fkDireccion: 1,
        nombreSucursal: "",
        estatusNombre: "Pendiente"
    });

    useEffect(() => {
        cargarPedidos();
        cargarSucursales();
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

    const cargarSucursales = async () => {
        try {
            const data = await ApiPedidos.obtenerSucursales();
            setSucursales(data);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudieron cargar las sucursales", "error");
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
        const value = e.target.value.replace(/[^0-9.]/g, "");
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
            !detalleTemp.precio ||
            detalleTemp.fkDireccion === 0
        ) {
            Swal.fire("Error", "Completa todos los campos del detalle correctamente.", "error");
            return;
        }

        const totalDetalle = Number(detalleTemp.precio) * Number(detalleTemp.cantidad);

        setNuevoPedido((prev) => ({
            ...prev,
            detalles: [
                ...prev.detalles,
                {
                    ...detalleTemp,
                    id: 0,
                    fkPedido: 0,
                    fechaUltimaModificacion: new Date().toISOString(),
                    fechaHora: new Date().toISOString(),
                    totalDetalle
                }
            ],
            total: prev.total + totalDetalle
        }));

        setDetalleTemp({
            productoNombre: "",
            cantidad: "",
            precio: "",
            fkDireccion: 1,
            nombreSucursal: "",
            estatusNombre: "Pendiente"
        });

        Swal.fire("Detalle agregado", "El detalle se agregó correctamente", "success");
    };

    const handleAgregarPedido = async () => {
        if (nuevoPedido.fkEmpresa === 0) {
            Swal.fire("Error", "Selecciona la sucursal del pedido.", "error");
            return;
        }
        if (nuevoPedido.detalles.length === 0) {
            Swal.fire("Error", "Agrega al menos un detalle al pedido.", "error");
            return;
        }
        const { nombreTitular, metodoPago, numeroEnmascarado, marcaTarjeta, expMes, expAnio } = nuevoPedido.pago;
        if (!nombreTitular || !metodoPago || !numeroEnmascarado || !marcaTarjeta || !expMes || !expAnio) {
            Swal.fire("Error", "Completa toda la información de pago.", "error");
            return;
        }

        try {
            const detallesConDireccion = nuevoPedido.detalles.map(d => ({
                ...d,
                fkDireccion: d.fkDireccion || 1,
                fechaHora: new Date().toISOString(),
                fechaUltimaModificacion: new Date().toISOString()
            }));

            const payload = {
                fkEmpresa: nuevoPedido.fkEmpresa,
                fkUsuario: 1,
                fkDireccion: detallesConDireccion[0]?.fkDireccion || 1,
                fechaEntrega: nuevoPedido.fechaEntrega ? new Date(nuevoPedido.fechaEntrega).toISOString() : new Date().toISOString(),
                total: nuevoPedido.total,
                detalles: detallesConDireccion,
                pago: {
                    ...nuevoPedido.pago,
                    expMes: Number(nuevoPedido.pago.expMes),
                    expAnio: Number(nuevoPedido.pago.expAnio),
                    fechaRegistro: new Date().toISOString()
                }
            };

            await ApiPedidos.crearPedido(payload);

            Swal.fire("Éxito", "Pedido agregado correctamente", "success");
            setModalVisible(false);

            setNuevoPedido({
                fkEmpresa: 0,
                fkUsuario: 1,
                fkDireccion: 0,
                fechaEntrega: "",
                total: 0,
                detalles: [],
                pago: {
                    nombreTitular: "",
                    metodoPago: "",
                    numeroEnmascarado: "",
                    marcaTarjeta: "",
                    expMes: "",
                    expAnio: ""
                }
            });

            cargarPedidos();
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Error al enviar el pedido", "error");
        }
    };

    const handleVerPedido = (pedido) => {
        console.log("Detalle del pedido:", pedido);
        Swal.fire({
            title: `Pedido ${pedido.id}`,
            html: `<pre>${JSON.stringify(pedido, null, 2)}</pre>`,
            width: "600px"
        });
    };

    const handleEliminarDetalle = (index) => {
        const detalleEliminado = nuevoPedido.detalles[index];
        const nuevoTotal = nuevoPedido.total - (detalleEliminado.precio * detalleEliminado.cantidad);

        setNuevoPedido({
            ...nuevoPedido,
            detalles: nuevoPedido.detalles.filter((_, i) => i !== index),
            total: nuevoTotal
        });
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
                        <button className="add-button" onClick={() => setModalVisible(true)}>+ Nuevo Pedido</button>
                    </div>

                    <h2 className="title">Lista de pedidos</h2>
                    <div className="table-container">
                        {loading ? <p>Cargando pedidos...</p> : (
                            <table className="table">
                                <thead>
                                    <tr className="table-header">
                                        <th>N. Pedido</th>
                                        <th>Productos</th>
                                        <th>Total</th>
                                        <th>Fecha Entrega</th>
                                        <th>Estatus</th>
                                        <th>Sucursal</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosData
                                        .filter((p) => searchTerm === "" || p.id.toString().includes(searchTerm))
                                        .map((pedido) => {
                                            const productos = pedido.detalles?.map((d) => `${d.productoNombre} (${d.cantidad})`).join(", ") || "";
                                            const estatus = pedido.detalles?.length > 0 ? pedido.detalles[0].estatusNombre : "Pendiente";
                                            const sucursal = pedido.detalles?.length > 0 ? pedido.detalles[0].nombreSucursal : "";
                                            return (
                                                <tr key={pedido.id} className="table-row">
                                                    <td>{pedido.id}</td>
                                                    <td>{productos || "Sin detalles"}</td>
                                                    <td>${pedido.total.toFixed(2)}</td>
                                                    <td>{new Date(pedido.fechaEntrega).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status ${estatus === "Pendiente" ? "status-pending" : "status-completed"}`}>
                                                            {estatus}
                                                        </span>
                                                    </td>
                                                    <td>{sucursal}</td>
                                                    <td>
                                                        <button className="action-button" onClick={() => handleVerPedido(pedido)}>Ver Pedido</button>
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
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Agregar Pedido</h2>

                        <div className="form-group">
                            <label>Sucursal</label>
                            <select
                                value={nuevoPedido.fkEmpresa}
                                onChange={(e) => setNuevoPedido({ ...nuevoPedido, fkEmpresa: Number(e.target.value) })}
                            >
                                <option value={0}>Selecciona Sucursal</option>
                                {sucursales.map((s) => (
                                    <option key={s.empresaId} value={s.empresaId}>{s.nombreSucursal}</option>
                                ))}
                            </select>
                        </div>

                        <h3>Información de Pago</h3>
                        <div className="form-group">
                            <label>Nombre Titular</label>
                            <input
                                type="text"
                                value={nuevoPedido.pago.nombreTitular}
                                onChange={(e) => handleInputText(e, "nombreTitular", "pago")}
                            />
                        </div>
                        <div className="form-group">
                            <label>Método de Pago</label>
                            <input
                                type="text"
                                value={nuevoPedido.pago.metodoPago}
                                onChange={(e) => handleInputText(e, "metodoPago", "pago")}
                            />
                        </div>
                        <div className="form-group">
                            <label>Número enmascarado</label>
                            <input
                                type="text"
                                value={nuevoPedido.pago.numeroEnmascarado.replace(/(\d{4})/g, "$1 ").trim()}
                                maxLength={19}
                                onChange={(e) => handlePagoNumber(e, "numeroEnmascarado")}
                            />
                        </div>
                        <div className="form-group">
                            <label>Marca Tarjeta</label>
                            <input
                                type="text"
                                value={nuevoPedido.pago.marcaTarjeta}
                                onChange={(e) => handleInputText(e, "marcaTarjeta", "pago")}
                            />
                        </div>
                        <div className="form-group">
                            <label>Exp. Mes</label>
                            <select
                                value={nuevoPedido.pago.expMes}
                                onChange={(e) => setNuevoPedido({ ...nuevoPedido, pago: { ...nuevoPedido.pago, expMes: e.target.value } })}
                            >
                                <option value="">Mes</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                                    const mesFormateado = String(m).padStart(2, "0");
                                    return <option key={m} value={mesFormateado}>{mesFormateado}</option>;
                                })}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Exp. Año</label>
                            <select
                                value={nuevoPedido.pago.expAnio}
                                onChange={(e) => setNuevoPedido({ ...nuevoPedido, pago: { ...nuevoPedido.pago, expAnio: e.target.value } })}
                            >
                                <option value="">Año</option>
                                {Array.from({ length: 11 }, (_, i) => 2025 + i).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <h3>Detalle del Pedido</h3>
                        <div className="form-group">
                            <label>Producto</label>
                            <input
                                type="text"
                                placeholder="Nombre del producto"
                                value={detalleTemp.productoNombre}
                                onChange={(e) => handleInputText(e, "productoNombre")}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cantidad</label>
                            <input
                                type="number"
                                min={1}
                                value={detalleTemp.cantidad}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleInputNumber(e, "cantidad")}
                            />
                        </div>
                        <div className="form-group">
                            <label>Precio por kilo</label>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={detalleTemp.precio}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleInputNumber(e, "precio")}
                            />
                        </div>
                        <div className="form-group">
                            <label>Dirección (Sucursal)</label>
                            <select value={detalleTemp.fkDireccion} onChange={(e) => {
                                const sucursalId = Number(e.target.value);
                                const sucursalSeleccionada = sucursales.find((s) => s.empresaId === sucursalId);
                                setDetalleTemp({
                                    ...detalleTemp,
                                    fkDireccion: sucursalId,
                                    nombreSucursal: sucursalSeleccionada?.nombreSucursal || ""
                                });
                            }}>
                                <option value={1}>Selecciona Dirección</option>
                                {sucursales.map((s) => (
                                    <option key={s.empresaId} value={s.empresaId}>
                                        {s.nombreSucursal} - {s.calle} {s.numeroExterior}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setModalVisible(false)}>Cancelar</button>
                            <button className="btn-submit" onClick={handleAgregarDetalle}>Agregar Detalle</button>
                            <button className="btn-submit" onClick={handleAgregarPedido}>Guardar Pedido</button>
                        </div>

                        {nuevoPedido.detalles.length > 0 && (
                            <table className="details-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio</th>
                                        <th>Sucursal</th>
                                        <th>Total</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nuevoPedido.detalles.map((d, idx) => (
                                        <tr key={idx}>
                                            <td>{d.productoNombre}</td>
                                            <td>{d.cantidad}</td>
                                            <td>${Number(d.precio).toFixed(2)}</td>
                                            <td>{d.nombreSucursal}</td>
                                            <td>${(Number(d.precio) * Number(d.cantidad)).toFixed(2)}</td>
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
                                <tfoot>
                                    <tr>
                                        <td colSpan={5}>Total Pedido</td>
                                        <td>${nuevoPedido.total.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pedidos;