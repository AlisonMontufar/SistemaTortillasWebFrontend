import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ApiSucursales from "../services/apiSucursales";
import GeocodingService from "../services/geocodingService";
import "../styles/Sucursales.css";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "leaflet-control-geocoder";

// Configuración de iconos de Leaflet (evita problemas con bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Sucursales() {
    const [empresas, setEmpresas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [modalMode, setModalMode] = useState("crear");
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [sucursalesData, setSucursalesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [coordinates, setCoordinates] = useState({ lat: 20.0539, lng: -99.3095 });

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const allMapRef = useRef(null);
    const allMapInstanceRef = useRef(null);

    // Form data sin fechaUltimaModificacion
    const [formData, setFormData] = useState({
        nombreSucursal: "",
        telefono: "",
        correoElectronico: "",
        nombreEncargado: "",
        fkEmpresa: 1,
        calle: "",
        numero: "",
        colonia: "",
        ciudad: "",
        estado: "",
        cp: "",
        referencias: ""
    });

    // Cargar datos iniciales
    useEffect(() => {
        fetchSucursales();
        fetchEmpresas();
    }, []);

    // Inicializar mapa del modal (mapRef) - CORREGIDO
    useEffect(() => {
        if (!showModal || !mapRef.current) return;

        if (mapInstanceRef.current) {
            try {
                mapInstanceRef.current.remove();
            } catch (e) { }
            mapInstanceRef.current = null;
            markerRef.current = null;
        }

        // Crear mapa con coordenadas iniciales
        const latInicial = coordinates.lat || 19.4326;
        const lngInicial = coordinates.lng || -99.1332;
        const map = L.map(mapRef.current).setView([latInicial, lngInicial], 14);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // Crear marcador draggable
        const marker = L.marker([latInicial, lngInicial], { draggable: true }).addTo(map);
        markerRef.current = marker;

        // Evento: cuando sueltas el marcador - CORREGIDO
        marker.on("dragend", async function () {
            const { lat, lng } = marker.getLatLng();
            setCoordinates({ lat, lng });

            try {
                const direccionGenerada = await GeocodingService.reverseGeocode(lat, lng);

                console.log("📦 Dirección detectada:", direccionGenerada);

                // ✅ Actualizar formData directamente - esto hará re-render de los inputs
                setFormData(prev => ({
                    ...prev,
                    calle: direccionGenerada.calle || prev.calle,
                    numero: direccionGenerada.numero || prev.numero,
                    colonia: direccionGenerada.colonia || prev.colonia,
                    ciudad: direccionGenerada.ciudad || prev.ciudad,
                    estado: direccionGenerada.estado || prev.estado,
                    cp: direccionGenerada.cp || prev.cp,
                    referencias: direccionGenerada.referencias || prev.referencias,
                }));

            } catch (error) {
                console.warn("⚠️ Error al obtener dirección inversa:", error);
            }
        });

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (e) { }
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [showModal,coordinates]);

    // Mantener marcador y vista sincronizados si cambian coordinates
    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
            mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 15);
        }
    }, [coordinates.lat, coordinates.lng]);

    // Geocodificar dirección cuando cambian los campos relevantes del formulario
    useEffect(() => {
        let timeout = null;

        const updateCoordinates = async () => {
            if (formData.calle && formData.ciudad && formData.estado) {
                const address = `${formData.calle} ${formData.numero || ''}, ${formData.colonia || ''}, ${formData.ciudad}, ${formData.estado}, México`;
                try {
                    const coords = await GeocodingService.geocodeAddress(address);
                    if (coords) setCoordinates(coords);
                } catch (error) {
                    console.warn("Error en geocodificación automática:", error);
                }
            }
        };

        timeout = setTimeout(updateCoordinates, 1000);
        return () => clearTimeout(timeout);
    }, [formData.calle, formData.numero, formData.colonia, formData.ciudad, formData.estado]);

    // ---------- Funciones API ----------
    const fetchSucursales = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiSucursales.obtenerSucursales();
            setSucursalesData(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Error al obtener sucursales");
            console.error("Error fetching sucursales:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpresas = async () => {
        try {
            const data = await ApiSucursales.obtenerEmpresas();
            setEmpresas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching empresas:", err);
        }
    };

    const handleCreateSucursal = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const sucursalData = {
                nombreSucursal: data.nombreSucursal,
                telefono: data.telefono,
                correoElectronico: data.correoElectronico,
                nombreEncargado: data.nombreEncargado,
                fkEmpresa: Number(data.fkEmpresa) || 1,
                direccion: {
                    calle: data.calle,
                    numero: data.numero,
                    colonia: data.colonia,
                    ciudad: data.ciudad,
                    estado: data.estado,
                    cp: data.cp,
                    referencias: data.referencias || "",
                    lat: coordinates.lat,
                    lng: coordinates.lng
                }
            };

            await ApiSucursales.crearSucursal(sucursalData);
            await fetchSucursales();
        } catch (err) {
            setError(err.message || "Error creando sucursal");
            console.error("Error creating sucursal:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSucursal = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const sucursalId = selectedSucursal?.sucursalId ?? selectedSucursal?.id;

            const sucursalData = {
                sucursalId: sucursalId,
                nombreSucursal: data.nombreSucursal,
                telefono: data.telefono,
                correoElectronico: data.correoElectronico,
                nombreEncargado: data.nombreEncargado,
                fkEmpresa: Number(data.fkEmpresa) || 1,
                estatus: selectedSucursal?.estatus ?? 1,
                direccion: {
                    calle: data.calle,
                    numero: data.numero,
                    colonia: data.colonia,
                    ciudad: data.ciudad,
                    estado: data.estado,
                    cp: data.cp,
                    referencias: data.referencias || "",
                    lat: coordinates.lat,
                    lng: coordinates.lng
                }
            };

            await ApiSucursales.actualizarSucursal(sucursalData);
            await fetchSucursales();
        } catch (err) {
            setError(err.message || "Error actualizando sucursal");
            console.error("Error updating sucursal:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSucursal = async (sucursalId) => {
        setLoading(true);
        setError(null);
        try {
            await ApiSucursales.eliminarSucursal(sucursalId);
            await fetchSucursales();
        } catch (err) {
            setError(err.message || "Error eliminando sucursal");
            console.error("Error deleting sucursal:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // ---------- UI helpers ----------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        const soloLetras = ["estado", "ciudad", "colonia", "nombreSucursal", "nombreEncargado"];
        const soloNumeros = ["cp", "telefono", "numero"];

        if (soloLetras.includes(name)) {
            newValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
        } else if (soloNumeros.includes(name)) {
            newValue = value.replace(/[^0-9\s]/g, "");
        }

        if (name === "fkEmpresa") {
            newValue = value;
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const resetForm = () => {
        setFormData({
            nombreSucursal: "",
            telefono: "",
            correoElectronico: "",
            nombreEncargado: "",
            fkEmpresa: 1,
            calle: "",
            numero: "",
            colonia: "",
            ciudad: "",
            estado: "",
            cp: "",
            referencias: ""
        });
        setCoordinates({ lat: 20.0539, lng: -99.3095 });
    };

    const handleEditSucursal = async (sucursal) => {
        setModalMode("editar");
        setSelectedSucursal(sucursal);

        const direccion = sucursal.direccion || {
            calle: sucursal.calle ?? "",
            numero: sucursal.numero ?? "",
            colonia: sucursal.colonia ?? "",
            ciudad: sucursal.ciudad ?? "",
            estado: sucursal.estado ?? "",
            cp: sucursal.cp ?? "",
            referencias: sucursal.referencias ?? ""
        };

        setFormData({
            nombreSucursal: sucursal.nombreSucursal || sucursal.nombre || "",
            telefono: sucursal.telefono || "",
            correoElectronico: sucursal.correoElectronico || "",
            nombreEncargado: sucursal.nombreEncargado || "",
            fkEmpresa: sucursal.fkEmpresa || sucursal.fkEmpresaId || 1,
            calle: direccion.calle || "",
            numero: direccion.numero || "",
            colonia: direccion.colonia || "",
            ciudad: direccion.ciudad || "",
            estado: direccion.estado || "",
            cp: direccion.cp || "",
            referencias: direccion.referencias || ""
        });

        setShowModal(true);

        setTimeout(async () => {
            const lat = Number(sucursal.direccion?.lat ?? sucursal.lat ?? 0) || 0;
            const lng = Number(sucursal.direccion?.lng ?? sucursal.lng ?? 0) || 0;

            if (lat && lng) {
                setCoordinates({ lat, lng });
            } else {
                const address = `${direccion.calle || ''} ${direccion.numero || ''}, ${direccion.colonia || ''}, ${direccion.ciudad || ''}, ${direccion.estado || ''}, México`.trim();
                if (address.length > 10) {
                    try {
                        const coords = await GeocodingService.getCoordinatesForSucursal({ direccion });
                        if (coords) setCoordinates(coords);
                    } catch (error) {
                        console.warn("Error geocodificando dirección existente:", error);
                    }
                }
            }
        }, 120);
    };

    const handleDeleteSucursalConfirm = async (sucursalId) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción eliminará la sucursal permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await handleDeleteSucursal(sucursalId);
                await Swal.fire({
                    title: 'Eliminado',
                    text: 'La sucursal se eliminó correctamente.',
                    icon: 'success',
                    timer: 1800,
                    showConfirmButton: false
                });
            } catch (err) {
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la sucursal: ' + (err.message || err),
                    icon: 'error'
                });
            }
        }
    };

    const handleVerMapa = async () => {
        setShowMapModal(true);

        setTimeout(async () => {
            if (!allMapRef.current) {
                console.error('❌ Map ref no disponible');
                return;
            }

            if (allMapInstanceRef.current) {
                try {
                    allMapInstanceRef.current.remove();
                } catch (e) { }
                allMapInstanceRef.current = null;
            }

            try {
                const map = L.map(allMapRef.current).setView([20.0539, -99.3095], 6);
                allMapInstanceRef.current = map;

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                const markers = [];
                const geocodingPromises = [];

                const sucursalesValidas = sucursalesData.filter(sucursal => {
                    const dir = sucursal.direccion || {
                        calle: sucursal.calle, numero: sucursal.numero, ciudad: sucursal.ciudad, estado: sucursal.estado
                    };
                    if (!dir) return false;
                    const values = [dir.calle, dir.ciudad, dir.estado, sucursal.nombreSucursal];
                    if (values.some(v => !v || v === "" || v === "string")) return false;

                    const direccionCompleta = `${dir.calle || ''} ${dir.numero || ''}, ${dir.colonia || ''}, ${dir.ciudad || ''}, ${dir.estado || ''}`.toLowerCase();
                    if (direccionCompleta.includes('prueba') || direccionCompleta.includes('temporal') || direccionCompleta.includes('conocida')) return false;

                    return true;
                });

                sucursalesValidas.forEach((sucursal) => {
                    const promise = GeocodingService.getCoordinatesForSucursal(sucursal)
                        .then(coords => {
                            if (coords) {
                                const marker = L.marker([coords.lat, coords.lng]).addTo(map);
                                const dir = sucursal.direccion || {
                                    calle: sucursal.calle, numero: sucursal.numero, colonia: sucursal.colonia, ciudad: sucursal.ciudad, estado: sucursal.estado, cp: sucursal.cp
                                };
                                const direccionHTML = `
                  <small>${dir.calle || ''} ${dir.numero || ''}<br/>
                  ${dir.colonia || ''}, ${dir.ciudad || ''}<br/>
                  ${dir.estado || ''} ${dir.cp || ''}</small>`;

                                marker.bindPopup(`
                  <div style="text-align:center; min-width:220px;">
                    <strong style="font-size:14px; color:#2c3e50;">${sucursal.nombreSucursal}</strong><br/>
                    ${direccionHTML}<br/>
                    <small style="color:#7f8c8d;">${sucursal.correoElectronico || ''}</small><br/>
                    <small style="color:#7f8c8d;">📞 ${sucursal.telefono || 'Sin teléfono'}</small>
                  </div>
                `);

                                markers.push(marker);
                            } else {
                                console.warn(`❌ No coords para ${sucursal.nombreSucursal}`);
                            }
                        })
                        .catch(err => console.warn('⚠️ Error geocoding sucursal:', err));

                    geocodingPromises.push(promise);
                });

                await Promise.all(geocodingPromises);

                if (markers.length > 0) {
                    const group = L.featureGroup(markers);
                    map.fitBounds(group.getBounds().pad(0.1));
                    L.popup().setLatLng(map.getCenter()).setContent(`<div style="text-align:center;"><strong>${markers.length} sucursales mostradas</strong></div>`).openOn(map);
                } else {
                    L.popup().setLatLng([20.0539, -99.3095]).setContent('<div style="text-align:center;"><strong>No se encontraron sucursales válidas</strong><br/>Agrega sucursales con direcciones completas.</div>').openOn(map);
                }

            } catch (error) {
                console.error('💥 Error inicializando mapa general:', error);
            }
        }, 100);
    };

    const handleCloseMapModal = () => {
        setShowMapModal(false);
        if (allMapInstanceRef.current) {
            try {
                allMapInstanceRef.current.remove();
            } catch (e) { }
            allMapInstanceRef.current = null;
        }
    };

    const handleAgregarSucursal = () => {
        setModalMode("crear");
        resetForm();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSucursal(null);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const address = `${formData.calle} ${formData.numero || ''}, ${formData.colonia || ''}, ${formData.ciudad || ''}, ${formData.estado || ''}, México`;
        try {
            const coords = await GeocodingService.geocodeAddress(address);
            if (coords) setCoordinates(coords);
        } catch (error) {
            console.warn("Error geocodificando dirección:", error);
        }

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            await Swal.fire({
                title: "Errores de validación",
                html: validationErrors.join("<br/>"),
                icon: "error",
                confirmButtonColor: "#e74c3c"
            });
            return;
        }

        try {
            if (modalMode === "crear") {
                await handleCreateSucursal(formData);
                await Swal.fire({ title: "¡Éxito!", text: "La sucursal se creó correctamente.", icon: "success", confirmButtonColor: "#27ae60" });
            } else {
                await handleUpdateSucursal(formData);
                await Swal.fire({ title: "¡Actualizado!", text: "La sucursal se actualizó correctamente.", icon: "success", confirmButtonColor: "#27ae60" });
            }
            handleCloseModal();
        } catch (err) {
            await Swal.fire({
                title: "Error",
                text: `Ocurrió un error al ${modalMode === "crear" ? "crear" : "actualizar"} la sucursal: ${err.message || err}`,
                icon: "error",
                confirmButtonColor: "#e74c3c"
            });
        }
    };

    const filteredSucursales = sucursalesData.filter(sucursal =>
        searchTerm === "" ||
        (sucursal.nombreSucursal && sucursal.nombreSucursal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sucursal.correoElectronico && sucursal.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sucursal.nombreEncargado && sucursal.nombreEncargado.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const validateForm = () => {
        const errors = [];
        if (!formData.nombreSucursal) errors.push("El nombre de la sucursal es obligatorio.");
        if (!formData.correoElectronico) errors.push("El correo electrónico es obligatorio.");
        if (!formData.nombreEncargado) errors.push("El nombre del encargado es obligatorio.");
        if (!formData.telefono) errors.push("El teléfono es obligatorio.");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.correoElectronico && !emailRegex.test(formData.correoElectronico)) {
            errors.push("El correo electrónico no es válido.");
        }

        if (formData.telefono && !/^\d{10}$/.test(formData.telefono)) {
            errors.push("El teléfono debe tener 10 dígitos numéricos.");
        }

        return errors;
    };

    const icons = {
        search: "https://cdn-icons-png.flaticon.com/512/54/54481.png",
        edit: "https://cdn-icons-png.flaticon.com/512/1827/1827933.png",
        delete: "https://cdn-icons-png.flaticon.com/512/3221/3221897.png",
        map: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
        close: "https://cdn-icons-png.flaticon.com/512/1828/1828778.png"
    };

    return (
        <div className="sucursales-container">
            <Navbar />
            <div className="content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <div className="page-header">
                        <h2 className="page-title"><span className="title-icon">🏪</span> Gestión de Sucursales</h2>
                        <p className="page-subtitle">Administra todas las sucursales de tu empresa</p>
                    </div>

                    {error && <div className="error-banner"><strong>Error:</strong> {error}</div>}

                    <div className="header">
                        <div className="search-container">
                            <img src={icons.search} alt="Buscar" className="search-icon-left" />
                            <input type="text" placeholder="Buscar por nombre, correo o encargado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                        </div>
                        <div className="header-buttons">
                            <button className="map-button" onClick={handleVerMapa}><img src={icons.map} alt="Mapa" className="button-icon" /> Ver en Mapa</button>
                            <button className="add-button" onClick={handleAgregarSucursal}><span className="plus-icon">+</span> Nueva Sucursal</button>
                        </div>
                    </div>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-state"><div className="spinner"></div><p>Cargando sucursales...</p></div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr className="table-header">
                                        <th>ID</th>
                                        <th>Nombre Sucursal</th>
                                        <th>Encargado</th>
                                        <th>Correo</th>
                                        <th>Teléfono</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSucursales.length === 0 ? (
                                        <tr><td colSpan="6" className="empty-state"><div className="empty-icon">📭</div><p>No hay sucursales disponibles</p><small>Comienza agregando una nueva sucursal</small></td></tr>
                                    ) : (
                                        filteredSucursales.map((sucursal, index) => (
                                            <tr key={index} className="table-row">
                                                <td><span className="table-badge">{sucursal.sucursalId || sucursal.id}</span></td>
                                                <td><strong>{sucursal.nombreSucursal}</strong></td>
                                                <td>{sucursal.nombreEncargado}</td>
                                                <td>{sucursal.correoElectronico}</td>
                                                <td>{sucursal.telefono}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="icon-button edit-button" onClick={() => handleEditSucursal(sucursal)} title="Editar"><img src={icons.edit} alt="Editar" className="action-icon" /></button>
                                                        <button className="icon-button delete-button" onClick={() => handleDeleteSucursalConfirm(sucursal.sucursalId || sucursal.id)} title="Eliminar"><img src={icons.delete} alt="Eliminar" className="action-icon" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal: Ver Todas las Sucursales en Mapa */}
            {showMapModal && (
                <div className="modal-overlay" onClick={handleCloseMapModal}>
                    <div className="modal-content modal-map-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-icon"></div>
                            <h3>Mapa de Sucursales</h3>
                            <button className="modal-close" onClick={handleCloseMapModal} type="button"><img src={icons.close} alt="Cerrar" /></button>
                        </div>
                        <div ref={allMapRef} style={{ width: '100%', height: '70vh', borderRadius: '8px' }}></div>
                    </div>
                </div>
            )}

            {/* Modal: Crear / Editar Sucursal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-icon">{modalMode === "crear"}</div>
                            <h3>{modalMode === "crear" ? "Nueva Sucursal" : "Editar Sucursal"}</h3>
                            <button className="modal-close" onClick={handleCloseModal} type="button"><img src={icons.close} alt="Cerrar" /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h4 className="section-title">Información General</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre de la Sucursal *</label>
                                        <input type="text" name="nombreSucursal" value={formData.nombreSucursal} onChange={handleInputChange} placeholder="Ej: Sucursal Centro" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Nombre del Encargado *</label>
                                        <input type="text" name="nombreEncargado" value={formData.nombreEncargado} onChange={handleInputChange} placeholder="Ej: Juan Pérez" required />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Correo Electrónico *</label>
                                        <input type="email" name="correoElectronico" value={formData.correoElectronico} onChange={handleInputChange} placeholder="correo@empresa.com" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono *</label>
                                        <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="7731234567" maxLength="10" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Empresa *</label>
                                        <select name="fkEmpresa" value={formData.fkEmpresa} onChange={handleInputChange} required>
                                            <option value="">Selecciona una empresa</option>
                                            {empresas.map(empresa => <option key={empresa.id} value={empresa.id}>{empresa.nombreEmpresa}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4 className="section-title">Dirección</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Calle</label>
                                        <input type="text" name="calle" value={formData.calle} onChange={handleInputChange} placeholder="5 de Mayo" />
                                    </div>
                                    <div className="form-group">
                                        <label>Número</label>
                                        <input type="text" name="numero" value={formData.numero} onChange={handleInputChange} placeholder="123" />
                                    </div>
                                    <div className="form-group">
                                        <label>Colonia</label>
                                        <input type="text" name="colonia" value={formData.colonia} onChange={handleInputChange} placeholder="Centro" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ciudad</label>
                                        <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} placeholder="Tula de Allende" />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado</label>
                                        <input type="text" name="estado" value={formData.estado} onChange={handleInputChange} placeholder="Hidalgo" />
                                    </div>
                                    <div className="form-group">
                                        <label>Código Postal</label>
                                        <input type="text" name="cp" value={formData.cp} onChange={handleInputChange} placeholder="42800" maxLength="5" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label>Referencias</label>
                                        <textarea name="referencias" value={formData.referencias} onChange={handleInputChange} rows="3" placeholder="Ingrese referencias adicionales..."></textarea>
                                    </div>
                                </div>

                                <div className="map-section">
                                    <label>Ubicación en el Mapa</label>
                                    <small className="map-instructions">Haz clic en el mapa o arrastra el marcador para ajustar la ubicación</small>
                                    <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '8px', marginTop: '10px' }}></div>
                                    <small className="coordinates-info">Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}</small>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="submit" className={modalMode === "crear" ? "btn-guardar" : "btn-actualizar"} disabled={loading}>
                                    {loading ? "Procesando..." : (modalMode === "crear" ? "Guardar" : "Actualizar")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sucursales;