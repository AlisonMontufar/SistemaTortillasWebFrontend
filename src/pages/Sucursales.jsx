import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ApiSucursales from "../services/apiSucursales";
import GeocodingService from "../services/geocodingService";
import "../styles/Sucursales.css";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// Configuración de iconos de Leaflet
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

    // Estado del formulario
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

    // Inicializar mapa del modal
    useEffect(() => {
        if (!showModal || !mapRef.current || mapInstanceRef.current) return;

        mapInstanceRef.current = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        markerRef.current = L.marker([coordinates.lat, coordinates.lng], { draggable: true }).addTo(mapInstanceRef.current);

        markerRef.current.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            setCoordinates({ lat: pos.lat, lng: pos.lng });
            reverseGeocode(pos.lat, pos.lng);
        });

        mapInstanceRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setCoordinates({ lat, lng });
            if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
            reverseGeocode(lat, lng);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [showModal, coordinates.lat, coordinates.lng]);

    // Actualizar marcador cuando cambian las coordenadas
    useEffect(() => {
        if (!mapInstanceRef.current || !markerRef.current) return;
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
        mapInstanceRef.current.setView([coordinates.lat, coordinates.lng]);
    }, [coordinates]);

    // Geocodificar dirección cuando cambian los campos
    useEffect(() => {
        const updateCoordinates = async () => {
            if (formData.calle && formData.ciudad && formData.estado) {
                const address = `${formData.calle} ${formData.numero}, ${formData.colonia}, ${formData.ciudad}, ${formData.estado}, México`;
                const coords = await GeocodingService.geocodeAddress(address);
                if (coords) {
                    setCoordinates(coords);
                }
            }
        };

        const timeoutId = setTimeout(updateCoordinates, 1000);
        return () => clearTimeout(timeoutId);
    }, [formData.calle, formData.ciudad, formData.estado, formData.colonia, formData.numero]);

    // Funciones de API
    const fetchSucursales = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiSucursales.obtenerSucursales();
            setSucursalesData(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching sucursales:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpresas = async () => {
        try {
            const data = await ApiSucursales.obtenerEmpresas();
            setEmpresas(data);
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
                fkEmpresa: data.fkEmpresa
            };

            const direccionData = {
                calle: data.calle,
                numero: data.numero,
                colonia: data.colonia,
                ciudad: data.ciudad,
                estado: data.estado,
                cp: data.cp,
                referencias: data.referencias
            };

            await ApiSucursales.crearSucursal(sucursalData, direccionData);
            await fetchSucursales();
        } catch (err) {
            setError(err.message);
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
            const sucursalId = selectedSucursal.sucursalId || selectedSucursal.id;

            const sucursalData = {
                nombreSucursal: data.nombreSucursal,
                telefono: data.telefono,
                correoElectronico: data.correoElectronico,
                nombreEncargado: data.nombreEncargado,
                fkEmpresa: data.fkEmpresa,
                estatus: selectedSucursal.estatus || 1
            };

            const direccionData = {
                calle: data.calle,
                numero: data.numero,
                colonia: data.colonia,
                ciudad: data.ciudad,
                estado: data.estado,
                cp: data.cp,
                referencias: data.referencias
            };

            await ApiSucursales.actualizarSucursal(sucursalId, sucursalData, direccionData);
            await fetchSucursales();
        } catch (err) {
            setError(err.message);
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
            setError(err.message);
            console.error("Error deleting sucursal:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Funciones de UI
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        const soloLetras = ["estado", "ciudad", "colonia", "nombreSucursal", "nombreEncargado"];
        const soloNumeros = ["cp", "telefono"];

        if (soloLetras.includes(name)) {
            newValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
        } else if (soloNumeros.includes(name)) {
            newValue = value.replace(/[^0-9]/g, "");
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue
        }));
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

    const handleEditSucursal = (sucursal) => {
        setModalMode("editar");
        setSelectedSucursal(sucursal);
        setFormData({
            nombreSucursal: sucursal.nombreSucursal || "",
            telefono: sucursal.telefono || "",
            correoElectronico: sucursal.correoElectronico || "",
            nombreEncargado: sucursal.nombreEncargado || "",
            fkEmpresa: sucursal.fkEmpresa || 1,
            calle: "",
            numero: "",
            colonia: "",
            ciudad: "",
            estado: "",
            cp: "",
            referencias: ""
        });
        setShowModal(true);

        setTimeout(() => {
            if (formData.lat && formData.lng) {
                setCoordinates({ lat: formData.lat, lng: formData.lng });
            }
        }, 100);
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
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchSucursales();
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

        const initMap = async () => {
            if (!allMapRef.current) {
                requestAnimationFrame(initMap);
                return;
            }

            if (!allMapInstanceRef.current) {
                allMapInstanceRef.current = L.map(allMapRef.current).setView([20.0539, -99.3095], 6);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(allMapInstanceRef.current);

                const coordsArray = await Promise.all(
                    sucursalesData.map(async (sucursal) => {
                        const address = `${sucursal.nombreSucursal}, México`;
                        const coords = await GeocodingService.geocodeAddress(address);
                        return { sucursal, coords };
                    })
                );

                coordsArray.forEach(({ sucursal, coords }) => {
                    if (coords) {
                        const marker = L.marker([coords.lat, coords.lng]).addTo(allMapInstanceRef.current);
                        marker.bindPopup(`
                        <div style="text-align: center;">
                            <strong>${sucursal.nombreSucursal}</strong><br/>
                            <small>${sucursal.correoElectronico}</small><br/>
                            <small>${sucursal.telefono}</small>
                        </div>
                    `);
                    }
                });
            }
        };

        initMap();
    };

    const handleCloseMapModal = () => {
        setShowMapModal(false);
        if (allMapInstanceRef.current) {
            allMapInstanceRef.current.remove();
            allMapInstanceRef.current = null;
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const addressData = await GeocodingService.reverseGeocode(lat, lng);
            if (addressData) {
                setFormData((prev) => ({
                    ...prev,
                    ...addressData
                }));
            }
        } catch (error) {
            console.error("Error en reverse geocoding:", error);
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

        const coords = await GeocodingService.geocodeAddress(`${formData.calle} ${formData.numero}, ${formData.colonia}, ${formData.ciudad}, ${formData.estado}, México`);
        if (coords) setCoordinates(coords);

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
                await Swal.fire({
                    title: "¡Éxito!",
                    text: "La sucursal se creó correctamente.",
                    icon: "success",
                    confirmButtonColor: "#27ae60"
                });
            } else {
                await handleUpdateSucursal(formData);
                await Swal.fire({
                    title: "¡Actualizado!",
                    text: "La sucursal se actualizó correctamente.",
                    icon: "success",
                    confirmButtonColor: "#27ae60"
                });
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

    // Definir los íconos que se usan en el JSX
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
                        <h2 className="page-title">
                            <span className="title-icon">🏪</span>
                            Gestión de Sucursales
                        </h2>
                        <p className="page-subtitle">Administra todas las sucursales de tu empresa</p>
                    </div>

                    {error && (
                        <div className="error-banner">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <div className="header">
                        <div className="search-container">
                            <img src={icons.search} alt="Buscar" className="search-icon-left" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, correo o encargado..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="header-buttons">
                            <button className="map-button" onClick={handleVerMapa}>
                                <img src={icons.map} alt="Mapa" className="button-icon" />
                                Ver en Mapa
                            </button>
                            <button className="add-button" onClick={handleAgregarSucursal}>
                                <span className="plus-icon">+</span>
                                Nueva Sucursal
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando sucursales...</p>
                            </div>
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
                                        <tr>
                                            <td colSpan="6" className="empty-state">
                                                <div className="empty-icon">📭</div>
                                                <p>No hay sucursales disponibles</p>
                                                <small>Comienza agregando una nueva sucursal</small>
                                            </td>
                                        </tr>
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
                                                        <button
                                                            className="icon-button edit-button"
                                                            onClick={() => handleEditSucursal(sucursal)}
                                                            title="Editar"
                                                        >
                                                            <img src={icons.edit} alt="Editar" className="action-icon" />
                                                        </button>
                                                        <button
                                                            className="icon-button delete-button"
                                                            onClick={() => handleDeleteSucursalConfirm(sucursal.sucursalId || sucursal.id)}
                                                            title="Eliminar"
                                                        >
                                                            <img src={icons.delete} alt="Eliminar" className="action-icon" />
                                                        </button>
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

            {/* Modal para Ver Todas las Sucursales en el Mapa */}
            {showMapModal && (
                <div className="modal-overlay" onClick={handleCloseMapModal}>
                    <div className="modal-content modal-map-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-icon"></div>
                            <h3>Mapa de Sucursales</h3>
                            <button className="modal-close" onClick={handleCloseMapModal} type="button">
                                <img src={icons.close} alt="Cerrar" />
                            </button>
                        </div>
                        <div
                            ref={allMapRef}
                            style={{ width: '100%', height: '70vh', borderRadius: '8px' }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Modal para Crear/Editar Sucursal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-icon">
                                {modalMode === "crear"}
                            </div>
                            <h3>{modalMode === "crear" ? "Nueva Sucursal" : "Editar Sucursal"}</h3>
                            <button className="modal-close" onClick={handleCloseModal} type="button">
                                <img src={icons.close} alt="Cerrar" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h4 className="section-title">Información General</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre de la Sucursal *</label>
                                        <input
                                            type="text"
                                            name="nombreSucursal"
                                            value={formData.nombreSucursal}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Sucursal Centro"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nombre del Encargado *</label>
                                        <input
                                            type="text"
                                            name="nombreEncargado"
                                            value={formData.nombreEncargado}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Juan Pérez"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Correo Electrónico *</label>
                                        <input
                                            type="email"
                                            name="correoElectronico"
                                            value={formData.correoElectronico}
                                            onChange={handleInputChange}
                                            placeholder="correo@empresa.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono *</label>
                                        <input
                                            type="text"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            placeholder="7731234567"
                                            maxLength="10"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Empresa *</label>
                                        <select
                                            name="fkEmpresa"
                                            value={formData.fkEmpresa}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Selecciona una empresa</option>
                                            {empresas.map((empresa) => (
                                                <option key={empresa.id} value={empresa.id}>
                                                    {empresa.nombreEmpresa}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4 className="section-title">Dirección</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Calle</label>
                                        <input
                                            type="text"
                                            name="calle"
                                            value={formData.calle}
                                            onChange={handleInputChange}
                                            placeholder="5 de Mayo"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Número</label>
                                        <input
                                            type="text"
                                            name="numero"
                                            value={formData.numero}
                                            onChange={handleInputChange}
                                            placeholder="123"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Colonia</label>
                                        <input
                                            type="text"
                                            name="colonia"
                                            value={formData.colonia}
                                            onChange={handleInputChange}
                                            placeholder="Centro"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ciudad</label>
                                        <input
                                            type="text"
                                            name="ciudad"
                                            value={formData.ciudad}
                                            onChange={handleInputChange}
                                            placeholder="Tula de Allende"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado</label>
                                        <input
                                            type="text"
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleInputChange}
                                            placeholder="Hidalgo"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Código Postal</label>
                                        <input
                                            type="text"
                                            name="cp"
                                            value={formData.cp}
                                            onChange={handleInputChange}
                                            placeholder="42800"
                                            maxLength="5"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label>Referencias</label>
                                        <textarea
                                            name="referencias"
                                            value={formData.referencias}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="Ingrese referencias adicionales..."
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="map-section">
                                    <label>Ubicación en el Mapa</label>
                                    <small className="map-instructions">
                                        Haz clic en el mapa o arrastra el marcador para ajustar la ubicación
                                    </small>
                                    <div
                                        ref={mapRef}
                                        style={{ width: '100%', height: '300px', borderRadius: '8px', marginTop: '10px' }}
                                    ></div>
                                    <small className="coordinates-info">
                                        Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
                                    </small>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="submit"
                                    className={modalMode === "crear" ? "btn-guardar" : "btn-actualizar"}
                                    disabled={loading}
                                >
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