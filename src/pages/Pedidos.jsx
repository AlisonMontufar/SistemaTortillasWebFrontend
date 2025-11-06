import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import ApiPedidos from "../services/apiPedidos";
import "../styles/Pedidos.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const icons = {
    search: "https://cdn-icons-png.flaticon.com/512/54/54481.png",
    close: "https://cdn-icons-png.flaticon.com/512/61/61155.png",
    view: "https://cdn-icons-png.flaticon.com/512/709/709612.png",
    edit: "https://cdn-icons-png.flaticon.com/512/1828/1828270.png",
};

function Pedidos() {
    const [searchTerm, setSearchTerm] = useState("");
    const [pedidosData, setPedidosData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [sucursales, setSucursales] = useState([]);
    const [empresaActual, setEmpresaActual] = useState(null);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [nuevoPedido, setNuevoPedido] = useState({
        fkEmpresa: 0,
        fkUsuario: 1,
        total: 0,
        estatusGeneral: "Pagado",
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
    const [pedidoEdit, setPedidoEdit] = useState({
        id: 0,
        estatusGeneral: "",
        total: 0
    });
    const [detalleTemp, setDetalleTemp] = useState({
        productoNombre: "Tortilla",
        cantidad: "",
        estatusNombre: "Pendiente",
        sucursalesAsignadas: [],
        estatusDetalle: "Pendiente"
    });

    const PRECIO_TORTILLA = 22;

    // Función para cargar pedidos por empresa
    const cargarPedidosPorEmpresa = useCallback(async (empresaId) => {
        setLoading(true);
        try {
            const data = await ApiPedidos.obtenerPedidosPorEmpresa(empresaId);
            console.log('Datos recibidos:', data);
            
            // La API ya devuelve los datos en el formato correcto
            // Cada objeto ya tiene: idPedido, producto, cantidad, total, sucursal, estatusGeneral, etc.
            const pedidosTransformados = data.map(pedido => ({
                id: pedido.idPedido,
                producto: pedido.producto || "Sin producto",
                cantidad: pedido.cantidad || 0,
                total: pedido.total || 0,
                sucursal: pedido.sucursal || "Sin sucursal",
                estatusGeneral: pedido.estatusGeneral || "Pagado",
                estatusDetalle: pedido.estatusDetalle || "Pendiente",
                fechaRegistro: pedido.fechaHora,
                empresa: pedido.empresa,
                nombreEncargado: pedido.nombreEncargado,
                // Información de dirección
                calle: pedido.calle,
                numero: pedido.numero,
                colonia: pedido.colonia,
                codigoPostal: pedido.codigoPostal,
                ciudad: pedido.ciudad,
                estado: pedido.estado
            }));
            
            setPedidosData(pedidosTransformados);
        } catch (error) {
            console.error('Error completo:', error);
            Swal.fire("Error", "No se pudieron cargar los pedidos de la empresa", "error");
        }
        setLoading(false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Función para cargar sucursales por empresa
    const cargarSucursalesPorEmpresa = useCallback(async (empresaId) => {
        try {
            const data = await ApiPedidos.obtenerSucursalesPorEmpresa(empresaId);
            console.log('Sucursales recibidas:', data);
            
            // Filtrar solo sucursales activas (estatus = 1)
            const sucursalesActivas = data.filter(sucursal => sucursal.estatus === 1);
            console.log('Sucursales activas filtradas:', sucursalesActivas);
            
            setSucursales(sucursalesActivas);
        } catch (error) {
            console.error('Error al cargar sucursales:', error);
            Swal.fire("Error", "No se pudieron cargar las sucursales", "error");
        }
    }, []);

    // Función para cargar nombre de empresa
    const cargarNombreEmpresa = useCallback(async (empresaId) => {
        try {
            const empresas = await ApiPedidos.obtenerEmpresas();
            const empresaEncontrada = empresas.find(emp => emp.id === empresaId);
            if (empresaEncontrada) {
                setEmpresaActual(empresaEncontrada);
            } else {
                setEmpresaActual({ id: empresaId, nombreEmpresa: `Empresa ${empresaId}` });
            }
        } catch (error) {
            console.error('Error al cargar nombre de empresa:', error);
            setEmpresaActual({ id: empresaId, nombreEmpresa: `Empresa ${empresaId}` });
        }
    }, []);

    // Effect principal al cargar el componente - EJECUTAR SOLO UNA VEZ
    useEffect(() => {
        const fkEmpresa = localStorage.getItem("fkEmpresa");
        if (fkEmpresa) {
            const empresaId = Number(fkEmpresa);
            setNuevoPedido(prev => ({ ...prev, fkEmpresa: empresaId }));
            
            // Cargar todos los datos necesarios
            const cargarDatos = async () => {
                await cargarSucursalesPorEmpresa(empresaId);
                await cargarNombreEmpresa(empresaId);
                await cargarPedidosPorEmpresa(empresaId);
            };
            
            cargarDatos();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Calcular total automáticamente cuando cambian los detalles
    useEffect(() => {
        const calcularTotal = () => {
            let total = 0;
            nuevoPedido.detalles.forEach(detalle => {
                total += detalle.cantidad * PRECIO_TORTILLA;
            });
            setNuevoPedido(prev => ({ ...prev, total: total }));
        };
        calcularTotal();
    }, [nuevoPedido.detalles]);

    // Handlers para inputs de texto
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

    // Handlers para inputs numéricos
    const handleInputNumber = (e, field, target = "detalle") => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (target === "detalle") {
            setDetalleTemp({ ...detalleTemp, [field]: value });
        } else {
            setNuevoPedido({ ...nuevoPedido, [field]: value });
        }
    };

    // Handler específico para números de pago
    const handlePagoNumber = (e, field) => {
        let value = e.target.value.replace(/[^0-9]/g, "");
        if (field === "numeroEnmascarado") value = value.slice(0, 16);
        setNuevoPedido({
            ...nuevoPedido,
            pago: { ...nuevoPedido.pago, [field]: value }
        });
    };

    // Agregar detalle al pedido
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
        // Limpiar solo cantidad, mantener sucursales seleccionadas
        setDetalleTemp({
            ...detalleTemp,
            cantidad: "",
        });
        Swal.fire("Éxito", "Detalle agregado correctamente", "success");
    };

    // Crear nuevo pedido
    const handleAgregarPedido = async () => {
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
                estatusGeneral: "Pagado",
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
            const pedidoCreado = await ApiPedidos.crearPedido(payload);
            Swal.fire("Éxito", `Pedido #${pedidoCreado.id} agregado correctamente`, "success");
            setModalVisible(false);

            // Reset form completamente
            setNuevoPedido({
                fkEmpresa: Number(localStorage.getItem("fkEmpresa")),
                fkUsuario: 1,
                total: 0,
                estatusGeneral: "Pagado",
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

            // Limpiar también el detalle temporal
            setDetalleTemp({
                productoNombre: "Tortilla",
                cantidad: "",
                estatusNombre: "Pendiente",
                sucursalesAsignadas: [],
                estatusDetalle: "Pendiente"
            });

            // Recargar pedidos de la empresa actual
            const fkEmpresa = localStorage.getItem("fkEmpresa");
            if (fkEmpresa) {
                cargarPedidosPorEmpresa(Number(fkEmpresa));
            }
        } catch (error) {
            console.error("Error completo:", error);
            Swal.fire("Error", error.message || "Error al enviar el pedido", "error");
        }
    };

    // Ver detalles del pedido
    const handleVerPedido = async (pedido) => {
        try {
            // Intentar obtener detalles completos de la API
            const pedidoCompleto = await ApiPedidos.obtenerPedidoPorId(pedido.id);
            console.log("Detalle completo del pedido:", pedidoCompleto);

            let detallesHTML = "<div style='text-align: left;'>";
            detallesHTML += `<p><strong>ID Pedido:</strong> ${pedidoCompleto.id || pedido.id}</p>`;
            detallesHTML += `<p><strong>Empresa:</strong> ${pedido.empresa || 'N/A'}</p>`;
            detallesHTML += `<p><strong>Encargado:</strong> ${pedido.nombreEncargado || 'N/A'}</p>`;
            detallesHTML += `<p><strong>Total:</strong> ${pedidoCompleto.total?.toFixed(2) || pedido.total?.toFixed(2) || '0.00'}</p>`;
            detallesHTML += `<p><strong>Estatus General:</strong> ${pedidoCompleto.estatusGeneral || pedido.estatusGeneral || 'Pagado'}</p>`;
            detallesHTML += `<p><strong>Estatus Detalle:</strong> ${pedido.estatusDetalle || 'Pendiente'}</p>`;
            detallesHTML += `<p><strong>Fecha:</strong> ${
                pedido.fechaRegistro && !isNaN(new Date(pedido.fechaRegistro)) 
                    ? new Date(pedido.fechaRegistro).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    : 'Fecha no disponible'
            }</p>`;

            // Información del producto
            detallesHTML += "<h4>Producto:</h4>";
            detallesHTML += `<p>${pedido.producto} - ${pedido.cantidad} kg - ${pedido.total?.toFixed(2)}</p>`;

            // Información de la sucursal
            detallesHTML += "<h4>Sucursal:</h4>";
            detallesHTML += `<p><strong>${pedido.sucursal}</strong></p>`;
            if (pedido.calle) {
                detallesHTML += `<p>${pedido.calle} ${pedido.numero || ''}, ${pedido.colonia || ''}</p>`;
                detallesHTML += `<p>${pedido.ciudad || ''}, ${pedido.estado || ''} - CP: ${pedido.codigoPostal || ''}</p>`;
            }

            // Si la API devuelve información de pago
            if (pedidoCompleto.pago) {
                detallesHTML += "<h4>Información de Pago:</h4>";
                detallesHTML += `<p><strong>Titular:</strong> ${pedidoCompleto.pago.nombreTitular}</p>`;
                detallesHTML += `<p><strong>Método:</strong> ${pedidoCompleto.pago.metodoPago}</p>`;
                detallesHTML += `<p><strong>Tarjeta:</strong> ${pedidoCompleto.pago.marcaTarjeta} **** ${pedidoCompleto.pago.numeroEnmascarado?.slice(-4) || ''}</p>`;
            }

            detallesHTML += "</div>";

            Swal.fire({
                title: `Pedido #${pedido.id}`,
                html: detallesHTML,
                width: "600px",
                confirmButtonText: "Cerrar"
            });
        } catch (error) {
            console.error("Error al cargar detalles del pedido:", error);
            
            // Mostrar información básica del pedido si falla la API
            let detallesHTML = "<div style='text-align: left;'>";
            detallesHTML += `<p><strong>ID Pedido:</strong> ${pedido.id}</p>`;
            detallesHTML += `<p><strong>Empresa:</strong> ${pedido.empresa || 'N/A'}</p>`;
            detallesHTML += `<p><strong>Producto:</strong> ${pedido.producto}</p>`;
            detallesHTML += `<p><strong>Cantidad:</strong> ${pedido.cantidad} kg</p>`;
            detallesHTML += `<p><strong>Total:</strong> ${pedido.total?.toFixed(2) || '0.00'}</p>`;
            detallesHTML += `<p><strong>Sucursal:</strong> ${pedido.sucursal}</p>`;
            detallesHTML += `<p><strong>Estatus:</strong> ${pedido.estatusGeneral || 'Pagado'}</p>`;
            detallesHTML += `<p><strong>Fecha:</strong> ${
                pedido.fechaRegistro && !isNaN(new Date(pedido.fechaRegistro)) 
                    ? new Date(pedido.fechaRegistro).toLocaleDateString('es-MX')
                    : 'Fecha no disponible'
            }</p>`;
            detallesHTML += "</div>";

            Swal.fire({
                title: `Pedido #${pedido.id}`,
                html: detallesHTML,
                width: "500px",
                confirmButtonText: "Cerrar"
            });
        }
    };

    // Editar pedido
    const handleEditarPedido = (pedido) => {
        setPedidoSeleccionado(pedido);
        setPedidoEdit({
            id: pedido.id,
            estatusGeneral: pedido.estatusGeneral || "Pagado",
            total: pedido.total || 0
        });
        setEditModalVisible(true);
    };

    // Actualizar pedido
    const handleActualizarPedido = async () => {
        if (!pedidoEdit.estatusGeneral.trim()) {
            Swal.fire("Error", "El estatus general es requerido", "error");
            return;
        }
        if (pedidoEdit.total <= 0) {
            Swal.fire("Error", "El total debe ser mayor a 0", "error");
            return;
        }

        try {
            const payload = {
                id: pedidoEdit.id,
                estatusGeneral: pedidoEdit.estatusGeneral,
                total: Number(pedidoEdit.total)
            };
            console.log("Actualizando pedido:", payload);
            await ApiPedidos.actualizarPedido(pedidoEdit.id, payload);
            Swal.fire("Éxito", "Pedido actualizado correctamente", "success");
            setEditModalVisible(false);

            // Recargar pedidos
            const fkEmpresa = localStorage.getItem("fkEmpresa");
            if (fkEmpresa) {
                cargarPedidosPorEmpresa(Number(fkEmpresa));
            }
        } catch (error) {
            console.error("Error al actualizar pedido:", error);
            Swal.fire("Error", error.message || "Error al actualizar el pedido", "error");
        }
    };

    // Eliminar detalle
    const handleEliminarDetalle = (index) => {
        setNuevoPedido({
            ...nuevoPedido,
            detalles: nuevoPedido.detalles.filter((_, i) => i !== index)
        });
    };

    // Manejar cambio de sucursales
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

                    <h2 className="title">
                        {empresaActual
                            ? `Pedidos de ${empresaActual.nombreEmpresa}`
                            : 'Lista de pedidos'}
                    </h2>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando pedidos...</p>
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr className="table-header">
                                        <th>N. Pedido</th>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Total</th>
                                        <th>Sucursal</th>
                                        <th>Estatus</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosData.length > 0 ? (
                                        pedidosData
                                            .filter((p) => searchTerm === "" || p.id.toString().includes(searchTerm))
                                            .map((pedido) => {
                                                const estatus = pedido.estatusGeneral || "Pagado";
                                                const statusClass = estatus === "Pagado" ? "status-paid" : 
                                                                  estatus === "Completado" ? "status-completed" : "status-pending";
                                                
                                                return (
                                                    <tr key={pedido.id} className="table-row">
                                                        <td>{pedido.id}</td>
                                                        <td>{pedido.producto}</td>
                                                        <td>{pedido.cantidad} kg</td>
                                                        <td>${pedido.total?.toFixed(2) || '0.00'}</td>
                                                        <td>{pedido.sucursal}</td>
                                                        <td>
                                                            <span className={`status ${statusClass}`}>
                                                                {estatus}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button 
                                                                    className="action-button view" 
                                                                    onClick={() => handleVerPedido(pedido)}
                                                                    title="Ver detalles"
                                                                >
                                                                    <img src={icons.view} alt="Ver" className="action-icon" />
                                                                </button>
                                                                <button 
                                                                    className="action-button edit" 
                                                                    onClick={() => handleEditarPedido(pedido)}
                                                                    title="Editar pedido"
                                                                >
                                                                    <img src={icons.edit} alt="Editar" className="action-icon" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="empty-state">
                                                <div className="empty-icon">📦</div>
                                                <p>No hay pedidos para esta empresa</p>
                                                <small>Haz clic en "Nuevo Pedido" para comenzar</small>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>

            {/* MODAL CREAR PEDIDO */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content modal-pedidos" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Agregar Pedido</h2>
                            <button className="modal-close" onClick={() => setModalVisible(false)}>
                                <img src={icons.close} alt="Cerrar" />
                            </button>
                        </div>
                        <div className="form-container">
                            {/* Sección Información General */}
                            <div className="form-section">
                                <h3 className="section-title">Información General</h3>
                                <div className="form-row">
                                    {empresaActual && (
                                        <div className="form-group empresa-asignada">
                                            <label className="required">Empresa</label>
                                            <input
                                                type="text"
                                                value={empresaActual.nombreEmpresa}
                                                disabled
                                            />
                                            <div className="info-text">
                                                Esta empresa está asignada desde el sistema
                                            </div>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="required">Total del Pedido</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={nuevoPedido.total}
                                            disabled
                                            className="total-disabled"
                                            placeholder="0.00"
                                        />
                                        <div className="info-text">
                                            Total calculado automáticamente: ${nuevoPedido.total.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección Información de Pago */}
                            <div className="form-section payment-section">
                                <h3 className="section-title">Información de Pago</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="required">Nombre Titular</label>
                                        <input
                                            type="text"
                                            value={nuevoPedido.pago.nombreTitular}
                                            onChange={(e) => handleInputText(e, "nombreTitular", "pago")}
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="required">Método de Pago</label>
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
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="required">Número de Tarjeta</label>
                                        <input
                                            type="text"
                                            value={nuevoPedido.pago.numeroEnmascarado.replace(/(\d{4})/g, "$1 ").trim()}
                                            maxLength={19}
                                            onChange={(e) => handlePagoNumber(e, "numeroEnmascarado")}
                                            placeholder="1234 5678 9012 3456"
                                            className="card-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="required">Marca Tarjeta</label>
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
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="required">Mes de Expiración</label>
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
                                        <label className="required">Año de Expiración</label>
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
                                </div>
                            </div>

                            {/* Sección Detalle del Pedido */}
                            <div className="form-section details-section">
                                <h3 className="section-title">Detalle del Pedido</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="required">Producto</label>
                                        <input
                                            type="text"
                                            value={detalleTemp.productoNombre}
                                            disabled
                                            className="producto-disabled"
                                        />
                                        <div className="info-text">
                                            Precio por kilo: ${PRECIO_TORTILLA}.00
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="required">Cantidad (kg)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={detalleTemp.cantidad}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => handleInputNumber(e, "cantidad")}
                                            placeholder="1"
                                        />
                                        <div className="info-text">
                                            Subtotal: ${detalleTemp.cantidad ? (detalleTemp.cantidad * PRECIO_TORTILLA).toFixed(2) : '0.00'}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="required">Sucursales Asignadas</label>
                                    <div className="checkbox-group">
                                        {sucursales.map((sucursal) => (
                                            <div key={sucursal.sucursalId} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    checked={detalleTemp.sucursalesAsignadas.includes(sucursal.sucursalId)}
                                                    onChange={() => handleSucursalChange(sucursal.sucursalId)}
                                                />
                                                <label>{sucursal.nombreSucursal}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="selection-counter">
                                        Seleccionadas: {detalleTemp.sucursalesAsignadas.length}
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="btn-add-detail" onClick={handleAgregarDetalle}>
                                        Agregar Detalle
                                    </button>
                                </div>
                            </div>

                            {/* Detalles Agregados */}
                            {nuevoPedido.detalles.length > 0 ? (
                                <div className="form-section">
                                    <h3 className="section-title">
                                        Detalles Agregados
                                        <span className="details-count">{nuevoPedido.detalles.length}</span>
                                    </h3>
                                    <div className="details-table-wrapper">
                                        <table className="details-table">
                                            <thead>
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Cantidad (kg)</th>
                                                    <th>Subtotal</th>
                                                    <th>Sucursales</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {nuevoPedido.detalles.map((d, idx) => (
                                                    <tr key={idx}>
                                                        <td>{d.productoNombre}</td>
                                                        <td>{d.cantidad} kg</td>
                                                        <td>${(d.cantidad * PRECIO_TORTILLA).toFixed(2)}</td>
                                                        <td>{d.sucursalesAsignadas.length} sucursal(es)</td>
                                                        <td>
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() => handleEliminarDetalle(idx)}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-details">
                                    No hay detalles agregados
                                </div>
                            )}

                            {/* Acciones Finales */}
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setModalVisible(false)}>
                                    Cancelar
                                </button>
                                <button className="btn-submit" onClick={handleAgregarPedido}>
                                    Guardar Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR PEDIDO */}
            {editModalVisible && (
                <div className="modal-overlay" onClick={() => setEditModalVisible(false)}>
                    <div className="modal-content modal-pedidos" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Pedido #{pedidoSeleccionado?.id}</h2>
                            <button className="modal-close" onClick={() => setEditModalVisible(false)}>
                                <img src={icons.close} alt="Cerrar" />
                            </button>
                        </div>
                        <div className="form-container">
                            <div className="form-section">
                                <h3 className="section-title">Información del Pedido</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="required">Estatus General</label>
                                        <select
                                            value={pedidoEdit.estatusGeneral}
                                            onChange={(e) => setPedidoEdit({...pedidoEdit, estatusGeneral: e.target.value})}
                                        >
                                            <option value="Pagado">Pagado</option>
                                            <option value="En proceso">En proceso</option>
                                            <option value="Completado">Completado</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="required">Total</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={pedidoEdit.total}
                                            onChange={(e) => setPedidoEdit({...pedidoEdit, total: e.target.value})}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setEditModalVisible(false)}>
                                    Cancelar
                                </button>
                                <button className="btn-submit" onClick={handleActualizarPedido}>
                                    Actualizar Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pedidos;