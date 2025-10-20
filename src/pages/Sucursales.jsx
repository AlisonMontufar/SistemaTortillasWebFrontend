import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Sucursales.css";
import Swal from "sweetalert2";

const icons = {
    inicio: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
    pedidos: "https://cdn-icons-png.flaticon.com/512/2910/2910762.png",
    sucursales: "https://cdn-icons-png.flaticon.com/512/13159/13159030.png",
    configuracion: "https://cdn-icons-png.flaticon.com/512/2099/2099058.png",
    search: "https://cdn-icons-png.flaticon.com/512/54/54481.png",
    edit: "https://cdn-icons-png.flaticon.com/512/1827/1827933.png",
    delete: "https://cdn-icons-png.flaticon.com/512/3221/3221897.png",
    map: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    close: "https://cdn-icons-png.flaticon.com/512/1828/1828778.png"
};

// Configuración de la API
const API_BASE_URL = "http://localhost:5149";

// Icono personalizado para los marcadores
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Sucursales() {
    const usuario = localStorage.getItem("nombreUsuario") || "TOKS";
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [modalMode, setModalMode] = useState("crear");
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [sucursalesData, setSucursalesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [coordinates, setCoordinates] = useState({ lat: 20.0539, lng: -99.3095 }); // Coordenadas de Tula como default

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const allMapRef = useRef(null);
    const allMapInstanceRef = useRef(null);

    // Estado del formulario
    const [formData, setFormData] = useState({
        emailEncargado: "",
        nombreSucursal: "",
        estado: "",
        municipio: "",
        colonia: "",
        calle: "",
        codigoPostal: "",
        numeroInterior: "",
        numeroExterior: "",
        referencias: ""
    });

    // Cargar sucursales al montar el componente
    useEffect(() => {
        fetchSucursales();
    }, []);

    // Función para geocodificar dirección usando Nominatim (OpenStreetMap)
    const geocodeAddress = async (address) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error("Error geocodificando:", error);
            return null;
        }
    };

    // Inicializar mapa y marcador al abrir modal
    useEffect(() => {
        if (!showModal || !mapRef.current || mapInstanceRef.current) return;

        // Crear mapa
        mapInstanceRef.current = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        // Crear marcador
        markerRef.current = L.marker([coordinates.lat, coordinates.lng], { draggable: true }).addTo(mapInstanceRef.current);

        // Eventos del marcador
        markerRef.current.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            setCoordinates({ lat: pos.lat, lng: pos.lng });
            reverseGeocode(pos.lat, pos.lng); // <-- llenar campos
        });

        // Eventos del mapa
        mapInstanceRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setCoordinates({ lat, lng });
            if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
            reverseGeocode(lat, lng); // <-- llenar campos
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [showModal, coordinates.lat, coordinates.lng]);

    // Actualizar marcador si coordinates cambian desde fuera
    useEffect(() => {
        if (markerRef.current && mapInstanceRef.current) {
            markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
            mapInstanceRef.current.setView([coordinates.lat, coordinates.lng]);
        }
    }, [coordinates]);

    // Actualizar mapa cuando cambian las coordenadas o la dirección
    useEffect(() => {
        if (mapInstanceRef.current && coordinates) {
            mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 16);
            if (markerRef.current) {
                markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
            }
        }
    }, [coordinates]);

    // Geocodificar dirección cuando cambian los campos
    useEffect(() => {
        const updateCoordinates = async () => {
            if (formData.calle && formData.municipio && formData.estado) {
                const address = `${formData.calle} ${formData.numeroExterior}, ${formData.colonia}, ${formData.municipio}, ${formData.estado}, México`;
                const coords = await geocodeAddress(address);
                if (coords) {
                    setCoordinates(coords);
                }
            }
        };

        const timeoutId = setTimeout(updateCoordinates, 1000);
        return () => clearTimeout(timeoutId);
    }, [formData.calle, formData.municipio, formData.estado, formData.colonia, formData.numeroExterior]);

    // GET: Obtener todas las sucursales
    const fetchSucursales = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/Sucursal`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener sucursales: ${response.status}`);
            }

            const data = await response.json();
            setSucursalesData(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching sucursales:", err);
        } finally {
            setLoading(false);
        }
    };

    // POST: Crear nueva sucursal
    const createSucursal = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/Sucursal`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    emailEncargado: data.emailEncargado,
                    nombreSucursal: data.nombreSucursal,
                    nombreEmpresa: data.nombreEmpresa,
                    estado: data.estado,
                    municipio: data.municipio,
                    colonia: data.colonia,
                    calle: data.calle,
                    codigoPostal: data.codigoPostal,
                    numeroInterior: data.numeroInterior,
                    numeroExterior: data.numeroExterior,
                    referencias: data.referencias
                })
            });

            if (!response.ok) {
                throw new Error(`Error al crear sucursal: ${response.status}`);
            }

            const result = await response.json();
            await fetchSucursales();
            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error creating sucursal:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // PUT: Actualizar sucursal existente
    const updateSucursal = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/Sucursal`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    empresaId: selectedSucursal.empresaId || selectedSucursal.id,
                    nombreSucursal: data.nombreSucursal,
                    emailEncargado: data.emailEncargado,
                    estado: data.estado,
                    municipio: data.municipio,
                    colonia: data.colonia,
                    calle: data.calle,
                    codigoPostal: data.codigoPostal,
                    numeroInterior: data.numeroInterior,
                    numeroExterior: data.numeroExterior,
                    referencias: data.referencias
                })
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar sucursal: ${response.status}`);
            }

            const result = await response.json();
            await fetchSucursales();
            return result;
        } catch (err) {
            setError(err.message);
            console.error("Error updating sucursal:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // DELETE: Eliminar sucursal
    const deleteSucursal = async (empresaId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/Sucursal/${empresaId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar sucursal: ${response.status}`);
            }

            await fetchSucursales();
        } catch (err) {
            setError(err.message);
            console.error("Error deleting sucursal:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("nombreUsuario");
        navigate("/");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        const soloLetras = ["estado", "municipio", "colonia", "nombreSucursal", "nombreEmpresa"];
        const soloNumeros = ["codigoPostal", "numeroInterior", "numeroExterior"];

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
            emailEncargado: "",
            nombreSucursal: "",
            estado: "",
            municipio: "",
            colonia: "",
            calle: "",
            codigoPostal: "",
            numeroInterior: "",
            numeroExterior: "",
            referencias: ""
        });
        setCoordinates({ lat: 20.0539, lng: -99.3095 });
    };

    const handleEditSucursal = async (sucursal) => {
        setModalMode("editar");
        setSelectedSucursal(sucursal);
        setFormData({
            emailEncargado: sucursal.emailEncargado || "",
            nombreSucursal: sucursal.nombreSucursal || "",
            estado: sucursal.estado || "",
            municipio: sucursal.municipio || "",
            colonia: sucursal.colonia || "",
            calle: sucursal.calle || "",
            codigoPostal: sucursal.codigoPostal || "",
            numeroInterior: sucursal.numeroInterior || "",
            numeroExterior: sucursal.numeroExterior || "",
            referencias: sucursal.referencias || ""
        });

        // Geocodificar la dirección de la sucursal
        const address = `${sucursal.calle} ${sucursal.numeroExterior}, ${sucursal.colonia}, ${sucursal.municipio}, ${sucursal.estado}, México`;
        const coords = await geocodeAddress(address);
        if (coords) {
            setCoordinates(coords);
        }

        setShowModal(true);
    };

    const handleDeleteSucursal = async (sucursalId) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción eliminará la sucursal permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteSucursal(sucursalId);

                await Swal.fire({
                    title: 'Eliminado',
                    text: 'La sucursal se eliminó correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Si tienes una función para recargar la lista:
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

    // Función para abrir el modal con todas las sucursales en el mapa
    const handleVerMapa = async () => {
        setShowMapModal(true);

        const initMap = async () => {
            if (!allMapRef.current) {
                // Esperar un frame y volver a intentar
                requestAnimationFrame(initMap);
                return;
            }

            if (!allMapInstanceRef.current) {
                allMapInstanceRef.current = L.map(allMapRef.current).setView([20.0539, -99.3095], 6);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(allMapInstanceRef.current);

                // Geocodificar todas las sucursales en paralelo
                const coordsArray = await Promise.all(
                    sucursalesData.map(async (sucursal) => {
                        const address = `${sucursal.calle} ${sucursal.numeroExterior}, ${sucursal.colonia}, ${sucursal.municipio}, ${sucursal.estado}, México`;
                        const coords = await geocodeAddress(address);
                        return { sucursal, coords };
                    })
                );

                // Agregar marcadores válidos
                coordsArray.forEach(({ sucursal, coords }) => {
                    if (coords) {
                        const marker = L.marker([coords.lat, coords.lng]).addTo(allMapInstanceRef.current);
                        marker.bindPopup(`
                        <div style="text-align: center;">
                            <strong>${sucursal.nombreSucursal}</strong><br/>
                            ${sucursal.calle} ${sucursal.numeroExterior}<br/>
                            ${sucursal.colonia}, ${sucursal.municipio}<br/>
                            ${sucursal.estado}<br/>
                            <small>${sucursal.emailEncargado}</small>
                        </div>
                    `);
                    }
                });
            }
        };

        initMap();
    };

    // Función para cerrar el modal y limpiar el mapa
    const handleCloseMapModal = () => {
        setShowMapModal(false);
        if (allMapInstanceRef.current) {
            allMapInstanceRef.current.remove();
            allMapInstanceRef.current = null;
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data && data.address) {
                const addr = data.address;
                setFormData((prev) => ({
                    ...prev,
                    calle: addr.road || "",
                    colonia: addr.suburb || addr.neighbourhood || "",
                    municipio: addr.city || addr.town || addr.village || "",
                    estado: addr.state || "",
                    codigoPostal: addr.postcode || "",
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

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            await Swal.fire({
                title: "Errores de validación",
                html: validationErrors.join("<br/>"),
                icon: "error",
                confirmButtonColor: "#d33"
            });
            return;
        }

        try {
            if (modalMode === "crear") {
                await createSucursal(formData);
                await Swal.fire({
                    title: "¡Éxito!",
                    text: "La sucursal se creó correctamente.",
                    icon: "success",
                    confirmButtonColor: "#3085d6"
                });
            } else {
                await updateSucursal(formData);
                await Swal.fire({
                    title: "¡Actualizado!",
                    text: "La sucursal se actualizó correctamente.",
                    icon: "success",
                    confirmButtonColor: "#3085d6"
                });
            }

            handleCloseModal();
        } catch (err) {
            await Swal.fire({
                title: "Error",
                text: `Ocurrió un error al ${modalMode === "crear" ? "crear" : "actualizar"} la sucursal: ${err.message || err}`,
                icon: "error",
                confirmButtonColor: "#d33"
            });
        }
    };

    const filteredSucursales = sucursalesData.filter(sucursal =>
        searchTerm === "" ||
        (sucursal.nombreSucursal && sucursal.nombreSucursal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sucursal.empresaId && sucursal.empresaId.toString().includes(searchTerm)) ||
        (sucursal.emailEncargado && sucursal.emailEncargado.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sucursal.municipio && sucursal.municipio.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const validateForm = () => {
        const errors = [];

        // Campos obligatorios
        if (!formData.nombreSucursal) errors.push("El nombre de la sucursal es obligatorio.");
        if (modalMode === "crear" && !formData.nombreEmpresa) errors.push("El nombre de la empresa es obligatorio.");
        if (!formData.estado) errors.push("El estado es obligatorio.");
        if (!formData.municipio) errors.push("El municipio es obligatorio.");
        if (!formData.colonia) errors.push("La colonia es obligatoria.");
        if (!formData.calle) errors.push("La calle es obligatoria.");
        if (!formData.codigoPostal) errors.push("El código postal es obligatorio.");

        // Validación de formato de CP (5 dígitos)
        const cpRegex = /^\d{5}$/;
        if (formData.codigoPostal && !cpRegex.test(formData.codigoPostal)) {
            errors.push("El código postal debe tener 5 dígitos.");
        }

        // Validación de consistencia: ejemplo simple que CP y Municipio coincidan
        const cpMunicipioMap = {
            "42800": "Tula de Allende",
            "42000": "Pachuca",
            // agregar más combinaciones según tus datos
        };

        if (formData.codigoPostal && formData.municipio) {
            const expectedMunicipio = cpMunicipioMap[formData.codigoPostal];
            if (expectedMunicipio && expectedMunicipio !== formData.municipio) {
                errors.push(`El código postal ${formData.codigoPostal} no coincide con el municipio ${formData.municipio}.`);
            }
        }

        return errors;
    };

    return (
        <div className="sucursales-container">
            <nav className="navbar">
                <div className="navbar-left">Sistema de Pedidos</div>
                <div className="navbar-right">Hola de nuevo {usuario}!</div>
            </nav>

            <div className="content-wrapper">
                <aside className="sidebar">
                    <div>
                        <div className="sidebar-top">Menú</div>
                        <div className="sidebar-items">
                            <div className="sidebar-item" onClick={() => navigate("/inicio")}>
                                <img src={icons.inicio} alt="Inicio" className="icon" />
                                <span>Inicio</span>
                            </div>
                            <div className="sidebar-item" onClick={() => navigate("/pedidos")}>
                                <img src={icons.pedidos} alt="Pedidos" className="icon" />
                                <span>Pedidos</span>
                            </div>
                            <div className="sidebar-item active">
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
                    <h2 className="page-title">Mis Sucursales</h2>

                    {error && (
                        <div style={{
                            backgroundColor: '#fee',
                            border: '1px solid #fcc',
                            color: '#c33',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '4px'
                        }}>
                            Error: {error}
                        </div>
                    )}

                    <div className="header">
                        <div className="search-container">
                            <img src={icons.search} alt="Buscar" className="search-icon-left" />
                            <input
                                type="text"
                                placeholder="Buscar sucursal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="header-buttons">
                            <button className="map-button" onClick={handleVerMapa}>
                                Ver Sucursales en Mapa
                            </button>

                            <button className="add-button" onClick={handleAgregarSucursal}>
                                + Agregar
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                Cargando sucursales...
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr className="table-header">
                                        <th>ID</th>
                                        <th>Nombre Sucursal</th>
                                        <th>Dirección</th>
                                        <th>Municipio</th>
                                        <th>CP</th>
                                        <th>Email Encargado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSucursales.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                                No hay sucursales disponibles
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSucursales.map((sucursal, index) => (
                                            <tr key={index} className="table-row">
                                                <td>{sucursal.empresaId || sucursal.id}</td>
                                                <td>{sucursal.nombreSucursal}</td>
                                                <td>
                                                    {`${sucursal.calle || ''} ${sucursal.numeroExterior || ''}, ${sucursal.colonia || ''}`}
                                                </td>
                                                <td>{sucursal.municipio}</td>
                                                <td>{sucursal.codigoPostal}</td>
                                                <td>{sucursal.emailEncargado}</td>
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
                                                            onClick={() => handleDeleteSucursal(sucursal.empresaId || sucursal.id)}
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
                            <div className="modal-header-icon">🗺️</div>
                            <h3>Todas las Sucursales</h3>
                            <button className="modal-close" onClick={handleCloseMapModal}>
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-icon">🏢</div>
                            <h3>{modalMode === "crear" ? "Nueva Sucursal" : `Editar Sucursal`}</h3>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <img src={icons.close} alt="Cerrar" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email del Encargado *</label>
                                        <input
                                            type="email"
                                            name="emailEncargado"
                                            value={formData.emailEncargado}
                                            onChange={handleInputChange}
                                            placeholder="encargado@empresa.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nombre de la Sucursal *</label>
                                        <input
                                            type="text"
                                            name="nombreSucursal"
                                            value={formData.nombreSucursal}
                                            onChange={handleInputChange}
                                            placeholder="Centro"
                                            required
                                        />
                                    </div>

                                    {modalMode === "crear" && (
                                        <div className="form-group">
                                            <label>Nombre de la Empresa *</label>
                                            <input
                                                type="text"
                                                name="nombreEmpresa"
                                                value={formData.nombreEmpresa || ""}
                                                onChange={handleInputChange}
                                                placeholder="Ingrese el nombre de la empresa"
                                                required
                                            />
                                        </div>
                                    )}

                                </div>
                            </div>

                            <div className="form-section-with-map">
                                <div className="form-fields">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Estado *</label>
                                            <input
                                                type="text"
                                                name="estado"
                                                value={formData.estado}
                                                onChange={handleInputChange}
                                                placeholder="Hidalgo"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Municipio *</label>
                                            <input
                                                type="text"
                                                name="municipio"
                                                value={formData.municipio}
                                                onChange={handleInputChange}
                                                placeholder="Tula de Allende"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Colonia *</label>
                                            <input
                                                type="text"
                                                name="colonia"
                                                value={formData.colonia}
                                                onChange={handleInputChange}
                                                placeholder="Centro"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Calle *</label>
                                            <input
                                                type="text"
                                                name="calle"
                                                value={formData.calle}
                                                onChange={handleInputChange}
                                                placeholder="5 de Mayo"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Código Postal *</label>
                                            <input
                                                type="text"
                                                name="codigoPostal"
                                                value={formData.codigoPostal}
                                                onChange={handleInputChange}
                                                placeholder="42800"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>N. Interior</label>
                                            <input
                                                type="text"
                                                name="numeroInterior"
                                                value={formData.numeroInterior}
                                                onChange={handleInputChange}
                                                placeholder="6"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>N. Exterior</label>
                                            <input
                                                type="text"
                                                name="numeroExterior"
                                                value={formData.numeroExterior}
                                                onChange={handleInputChange}
                                                placeholder="123"
                                            />
                                        </div>
                                    </div>

                                    <div className="map-section">
                                        <label>Ubicación en el Mapa (click para ajustar)</label>
                                        <div ref={mapRef} style={{ width: '100%', height: '250px', borderRadius: '8px' }}></div>
                                        <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                            Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
                                        </small>
                                    </div>
                                </div>

                                <div className="referencias-section">
                                    <label>Referencias</label>
                                    <textarea
                                        name="referencias"
                                        value={formData.referencias}
                                        onChange={handleInputChange}
                                        rows="8"
                                        placeholder="Ingrese referencias de ubicación..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="modal-footer">
                                {modalMode === "editar" && (
                                    <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                        Cancelar
                                    </button>
                                )}
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
