import React, { useState, useEffect, useRef, useCallback } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import ApiSucursales from "../services/apiSucursales";
import GeocodingService from "../services/geocodingService";
import "../styles/Sucursales.css";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { usePagination } from "../hooks/usePagination";

// Definir constantes para el estado del mapa
const MAP_STATUS = {
  LOADING: 'LOADING',
  FAILURE: 'FAILURE',
  SUCCESS: 'SUCCESS'
};

function Sucursales() {
    const [empresa, setEmpresa] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [modalMode, setModalMode] = useState("crear");
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [sucursalesData, setSucursalesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [coordinates, setCoordinates] = useState({ lat: 20.0539, lng: -99.3095 });
    const [userLocation, setUserLocation] = useState(null);
    const [mapLoading, setMapLoading] = useState(false);

    // Referencias para Google Maps
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const allMapRef = useRef(null);
    const allMapInstanceRef = useRef(null);

    // Usar el hook de paginación
    const {
        currentPage,
        totalPages,
        paginatedData,
        handlePageChange,
    } = usePagination(sucursalesData, 10, searchTerm);

    // Obtener fkEmpresa del localStorage
    const getFkEmpresaFromStorage = useCallback(() => {
        try {
            const fkEmpresaDirecto = localStorage.getItem("fkEmpresa");
            if (fkEmpresaDirecto) {
                return parseInt(fkEmpresaDirecto);
            }

            const userDataString = localStorage.getItem("userData");
            if (userDataString) {
                try {
                    const userData = JSON.parse(userDataString);
                    if (userData && userData.fkEmpresa !== undefined && userData.fkEmpresa !== null) {
                        return userData.fkEmpresa;
                    }
                } catch (parseError) {
                    console.warn("⚠️ Error parseando userData:", parseError);
                }
            }
            return null;
        } catch (error) {
            console.error("❌ Error obteniendo fkEmpresa:", error);
            return null;
        }
    }, []);

    // Form data
    const [formData, setFormData] = useState({
        nombreSucursal: "",
        telefono: "",
        correoElectronico: "",
        nombreEncargado: "",
        fkEmpresa: "",
        calle: "",
        numero: "",
        colonia: "",
        ciudad: "",
        estado: "",
        cp: "",
        referencias: ""
    });

    // ---------- Obtener ubicación automática del usuario ----------
    const getUserLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.warn("📍 Geolocalización no soportada");
                resolve({ lat: 20.0539, lng: -99.3095 });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log("📍 Ubicación del usuario obtenida:", location);
                    setUserLocation(location);
                    setCoordinates(location);
                    resolve(location);
                },
                (error) => {
                    console.warn("⚠️ Error obteniendo ubicación:", error);
                    const defaultLocation = { lat: 20.0539, lng: -99.3095 };
                    setUserLocation(defaultLocation);
                    setCoordinates(defaultLocation);
                    resolve(defaultLocation);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }, []);

    // ---------- Funciones API ----------
    const fetchSucursales = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fkEmpresa = getFkEmpresaFromStorage();
            if (!fkEmpresa) {
                setError("No se pudo obtener la empresa del usuario");
                return;
            }

            const data = await ApiSucursales.obtenerSucursalesPorEmpresa(fkEmpresa);
            const sucursalesActivas = Array.isArray(data)
                ? data.filter(sucursal => sucursal.estatus === 1)
                : [];

            setSucursalesData(sucursalesActivas);
        } catch (err) {
            console.error("❌ Error en fetchSucursales:", err);
            setError(err.message || "Error al obtener sucursales");
        } finally {
            setLoading(false);
        }
    }, [getFkEmpresaFromStorage]);

    // Obtener solo la empresa específica
    const fetchEmpresa = useCallback(async () => {
        try {
            const fkEmpresa = getFkEmpresaFromStorage();
            if (!fkEmpresa) {
                console.warn("⚠️ No hay fkEmpresa para obtener la empresa");
                return;
            }

            const data = await ApiSucursales.obtenerEmpresaPorId(fkEmpresa);
            setEmpresa(data);
            setFormData(prev => ({
                ...prev,
                fkEmpresa: data.id
            }));
        } catch (err) {
            console.error("Error fetching empresa:", err);
        }
    }, [getFkEmpresaFromStorage]);

    // Cargar datos iniciales y ubicación
    useEffect(() => {
        console.log("🎯 Iniciando carga de datos...");
        fetchSucursales();
        fetchEmpresa();
        getUserLocation();
    }, [fetchSucursales, fetchEmpresa, getUserLocation]);

    // ---------- Funciones para Google Maps ----------

    // Inicializar mapa del modal
    const initMap = useCallback(async () => {
        if (!mapRef.current || !window.google) {
            console.log("🔄 Esperando Google Maps...");
            return;
        }

        setMapLoading(true);
        
        try {
            const map = new window.google.maps.Map(mapRef.current, {
                center: coordinates,
                zoom: 15,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
            });

            mapInstanceRef.current = map;

            // Crear marcador
            const marker = new window.google.maps.Marker({
                position: coordinates,
                map: map,
                draggable: true,
                title: "Arrastra para ajustar la ubicación"
            });

            markerRef.current = marker;

            // Evento cuando se arrastra el marcador
            marker.addListener("dragend", async () => {
                const newPosition = marker.getPosition();
                const newCoords = {
                    lat: newPosition.lat(),
                    lng: newPosition.lng()
                };
                
                setCoordinates(newCoords);
                console.log("📍 Marcador movido a:", newCoords);

                // Obtener dirección automáticamente
                try {
                    const direccionGenerada = await GeocodingService.reverseGeocode(newCoords.lat, newCoords.lng);
                    if (direccionGenerada) {
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
                        console.log("📝 Dirección actualizada automáticamente desde el mapa");
                    }
                } catch (error) {
                    console.warn("⚠️ Error al obtener dirección inversa:", error);
                }
            });

            // Evento cuando se hace clic en el mapa
            map.addListener("click", async (event) => {
                const newCoords = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                };

                marker.setPosition(newCoords);
                setCoordinates(newCoords);
                console.log("📍 Mapa clickeado en:", newCoords);

                // Obtener dirección automáticamente
                try {
                    const direccionGenerada = await GeocodingService.reverseGeocode(newCoords.lat, newCoords.lng);
                    if (direccionGenerada) {
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
                    }
                } catch (error) {
                    console.warn("⚠️ Error al obtener dirección inversa:", error);
                }
            });

            console.log("✅ Mapa inicializado correctamente");
        } catch (error) {
            console.error("❌ Error inicializando mapa:", error);
        } finally {
            setMapLoading(false);
        }
    }, [coordinates]);

    // Inicializar mapa cuando se muestre el modal
    useEffect(() => {
        if (showModal) {
            const timer = setTimeout(() => {
                if (window.google) {
                    initMap();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [showModal, initMap]);

    // Inicializar mapa general de todas las sucursales
    const initAllSucursalesMap = useCallback(async () => {
        if (!allMapRef.current || !window.google || sucursalesData.length === 0) return;

        try {
            const map = new window.google.maps.Map(allMapRef.current, {
                center: { lat: 20.0539, lng: -99.3095 },
                zoom: 6,
                mapTypeControl: true,
                streetViewControl: false,
            });

            allMapInstanceRef.current = map;

            const bounds = new window.google.maps.LatLngBounds();
            const markers = [];

            for (const sucursal of sucursalesData) {
                try {
                    let coords;
                    
                    // Intentar obtener coordenadas de la sucursal
                    if (sucursal.direccion && sucursal.direccion.latitud && sucursal.direccion.longitud) {
                        coords = {
                            lat: parseFloat(sucursal.direccion.latitud),
                            lng: parseFloat(sucursal.direccion.longitud)
                        };
                    } else {
                        coords = await GeocodingService.getCoordinatesForSucursal(sucursal);
                    }

                    if (coords) {
                        const marker = new window.google.maps.Marker({
                            position: coords,
                            map: map,
                            title: sucursal.nombreSucursal
                        });

                        const dir = sucursal.direccion || {
                            calle: sucursal.calle, 
                            numero: sucursal.numero, 
                            colonia: sucursal.colonia, 
                            ciudad: sucursal.ciudad, 
                            estado: sucursal.estado, 
                            cp: sucursal.cp
                        };

                        const infoWindow = new window.google.maps.InfoWindow({
                            content: `
                                <div style="text-align:center; min-width:220px; padding: 10px;">
                                    <strong style="font-size:14px; color:#2c3e50;">${sucursal.nombreSucursal}</strong><br/>
                                    <small>${dir.calle || ''} ${dir.numero || ''}<br/>
                                    ${dir.colonia || ''}, ${dir.ciudad || ''}<br/>
                                    ${dir.estado || ''} ${dir.cp || ''}</small><br/>
                                    <small style="color:#7f8c8d;">${sucursal.correoElectronico || ''}</small><br/>
                                    <small style="color:#7f8c8d;">📞 ${sucursal.telefono || 'Sin teléfono'}</small>
                                </div>
                            `
                        });

                        marker.addListener("click", () => {
                            infoWindow.open(map, marker);
                        });

                        markers.push(marker);
                        bounds.extend(coords);
                    }
                } catch (error) {
                    console.warn(`⚠️ Error agregando sucursal al mapa: ${sucursal.nombreSucursal}`, error);
                }
            }

            if (markers.length > 0) {
                map.fitBounds(bounds);
                if (markers.length === 1) {
                    map.setZoom(15);
                }
            }
        } catch (error) {
            console.error("❌ Error inicializando mapa general:", error);
        }
    }, [sucursalesData]);

    // Inicializar mapa general cuando se muestre el modal
    useEffect(() => {
        if (showMapModal && window.google) {
            const timer = setTimeout(() => {
                initAllSucursalesMap();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [showMapModal, initAllSucursalesMap]);

    // Geocodificar dirección cuando cambien los campos
    useEffect(() => {
        let timeout = null;

        const updateCoordinates = async () => {
            if (formData.calle && formData.ciudad && formData.estado) {
                const address = `${formData.calle} ${formData.numero || ''}, ${formData.colonia || ''}, ${formData.ciudad}, ${formData.estado}, México`;
                try {
                    const coords = await GeocodingService.geocodeAddress(address);
                    if (coords) {
                        setCoordinates(coords);
                        // Mover marcador si existe
                        if (markerRef.current && mapInstanceRef.current) {
                            markerRef.current.setPosition(coords);
                            mapInstanceRef.current.setCenter(coords);
                        }
                    }
                } catch (error) {
                    console.warn("Error en geocodificación automática:", error);
                }
            }
        };

        timeout = setTimeout(updateCoordinates, 1500);
        return () => clearTimeout(timeout);
    }, [formData.calle, formData.numero, formData.colonia, formData.ciudad, formData.estado]);

    // ---------- Funciones CRUD Corregidas para el formato de la API ----------

    const handleCreateSucursal = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const fkEmpresa = getFkEmpresaFromStorage();
            
            // FORMATO EXACTO QUE ESPERA LA API
            const sucursalData = {
                nombreSucursal: data.nombreSucursal,
                telefono: data.telefono,
                correoElectronico: data.correoElectronico,
                nombreEncargado: data.nombreEncargado,
                fkEmpresa: Number(data.fkEmpresa) || fkEmpresa,
                direccion: {
                    calle: data.calle || "",
                    numero: data.numero || "",
                    colonia: data.colonia || "",
                    ciudad: data.ciudad || "",
                    estado: data.estado || "",
                    cp: data.cp || "",
                    latitud: coordinates.lat.toString(),
                    longitud: coordinates.lng.toString(),
                    referencias: data.referencias || ""
                }
            };

            console.log("📤 Enviando datos a la API:", sucursalData);
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
            const fkEmpresa = getFkEmpresaFromStorage();

            // FORMATO EXACTO QUE ESPERA LA API
            const sucursalData = {
                sucursalId: sucursalId,
                nombreSucursal: data.nombreSucursal,
                telefono: data.telefono,
                correoElectronico: data.correoElectronico,
                nombreEncargado: data.nombreEncargado,
                fkEmpresa: Number(data.fkEmpresa) || fkEmpresa,
                estatus: 1,
                direccion: {
                    calle: data.calle || "",
                    numero: data.numero || "",
                    colonia: data.colonia || "",
                    ciudad: data.ciudad || "",
                    estado: data.estado || "",
                    cp: data.cp || "",
                    latitud: coordinates.lat.toString(),
                    longitud: coordinates.lng.toString(),
                    referencias: data.referencias || ""
                }
            };

            console.log("📤 Actualizando datos en la API:", sucursalData);
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
        const fkEmpresa = getFkEmpresaFromStorage();
        setFormData({
            nombreSucursal: "",
            telefono: "",
            correoElectronico: "",
            nombreEncargado: "",
            fkEmpresa: fkEmpresa || "",
            calle: "",
            numero: "",
            colonia: "",
            ciudad: "",
            estado: "",
            cp: "",
            referencias: ""
        });
        // Usar ubicación del usuario por defecto
        setCoordinates(userLocation || { lat: 20.0539, lng: -99.3095 });
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
            referencias: sucursal.referencias ?? "",
            latitud: sucursal.latitud ?? "",
            longitud: sucursal.longitud ?? ""
        };

        setFormData({
            nombreSucursal: sucursal.nombreSucursal || sucursal.nombre || "",
            telefono: sucursal.telefono || "",
            correoElectronico: sucursal.correoElectronico || "",
            nombreEncargado: sucursal.nombreEncargado || "",
            fkEmpresa: sucursal.fkEmpresa || sucursal.fkEmpresaId || getFkEmpresaFromStorage(),
            calle: direccion.calle || "",
            numero: direccion.numero || "",
            colonia: direccion.colonia || "",
            ciudad: direccion.ciudad || "",
            estado: direccion.estado || "",
            cp: direccion.cp || "",
            referencias: direccion.referencias || ""
        });

        setShowModal(true);

        // Establecer coordenadas después de un breve delay
        setTimeout(() => {
            const lat = parseFloat(direccion.latitud) || 0;
            const lng = parseFloat(direccion.longitud) || 0;

            if (lat !== 0 && lng !== 0) {
                setCoordinates({ lat, lng });
            } else {
                // Si no hay coordenadas, geocodificar la dirección
                const address = `${direccion.calle || ''} ${direccion.numero || ''}, ${direccion.colonia || ''}, ${direccion.ciudad || ''}, ${direccion.estado || ''}, México`.trim();
                if (address.length > 10) {
                    GeocodingService.geocodeAddress(address)
                        .then(coords => {
                            if (coords) setCoordinates(coords);
                        })
                        .catch(error => {
                            console.warn("Error geocodificando dirección existente:", error);
                        });
                }
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
    };

    const handleCloseMapModal = () => {
        setShowMapModal(false);
        allMapInstanceRef.current = null;
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
        mapInstanceRef.current = null;
        markerRef.current = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Primero validar el formulario
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

        // Si no hay coordenadas específicas, intentar geocodificar la dirección
        if ((!coordinates.lat || !coordinates.lng) && formData.calle && formData.ciudad) {
            const address = `${formData.calle} ${formData.numero || ''}, ${formData.colonia || ''}, ${formData.ciudad}, ${formData.estado}, México`;
            try {
                const coords = await GeocodingService.geocodeAddress(address);
                if (coords) {
                    setCoordinates(coords);
                    console.log("📍 Coordenadas obtenidas de la dirección:", coords);
                }
            } catch (error) {
                console.warn("Error geocodificando dirección:", error);
            }
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

    // Componente para renderizar el mapa
    const MapComponent = ({ isMainMap = false }) => (
        <div 
            ref={isMainMap ? mapRef : allMapRef} 
            style={{ 
                width: '100%', 
                height: isMainMap ? '300px' : '70vh', 
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd'
            }}
        >
            {mapLoading && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    color: '#666',
                    fontSize: '14px',
                    background: 'rgba(255,255,255,0.8)'
                }}>
                    Cargando mapa...
                </div>
            )}
        </div>
    );

    // Render function para el wrapper de Google Maps - CORREGIDO
    const renderMap = (status) => {
        if (status === MAP_STATUS.LOADING) return <div className="map-loading">Cargando mapa...</div>;
        if (status === MAP_STATUS.FAILURE) return <div className="map-error">Error cargando Google Maps</div>;
        return <MapComponent isMainMap={true} />;
    };

    const renderAllMap = (status) => {
        if (status === MAP_STATUS.LOADING) return <div className="map-loading">Cargando mapa...</div>;
        if (status === MAP_STATUS.FAILURE) return <div className="map-error">Error cargando Google Maps</div>;
        return <MapComponent isMainMap={false} />;
    };

    return (
        <div className="sucursales-container">
            <Navbar />
            <div className="content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <div className="page-header">
                        <h2 className="page-title"><span className="title-icon">🏪</span> Gestión de Sucursales</h2>
                        <p className="page-subtitle">
                            {empresa ? `Administra las sucursales activas de ${empresa.nombreEmpresa}` : "Administra las sucursales activas de tu empresa"}
                        </p>
                    </div>

                    {error && <div className="error-banner"><strong>Error:</strong> {error}</div>}

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
                                <img src={icons.map} alt="Mapa" className="button-icon" /> Ver en Mapa
                            </button>
                            <button className="add-button" onClick={handleAgregarSucursal}>
                                <span className="plus-icon">+</span> Nueva Sucursal
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando sucursales activas...</p>
                            </div>
                        ) : (
                            <>
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
                                        {paginatedData.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="empty-state">
                                                    <div className="empty-icon">📭</div>
                                                    <p>No hay sucursales activas disponibles</p>
                                                    <small>Comienza agregando una nueva sucursal</small>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedData.map((sucursal, index) => (
                                                <tr key={sucursal.sucursalId || index} className="table-row">
                                                    <td><span className="table-badge">{sucursal.sucursalId}</span></td>
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
                                                                onClick={() => handleDeleteSucursalConfirm(sucursal.sucursalId)} 
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
                                
                                {paginatedData.length > 0 && (
                                    <div className="pagination">
                                        <button 
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            ←
                                        </button>
                                        <span>
                                            Página {currentPage} de {totalPages}
                                        </span>
                                        <button 
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            →
                                        </button>
                                    </div>
                                )}
                            </>
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
                            <h3>Mapa de Sucursales Activas {empresa && `- ${empresa.nombreEmpresa}`}</h3>
                            <button className="modal-close" onClick={handleCloseMapModal} type="button">
                                <img src={icons.close} alt="Cerrar" />
                            </button>
                        </div>
                        <Wrapper 
                            apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
                            version="beta"
                            libraries={['places']}
                            render={renderAllMap}
                        />
                    </div>
                </div>
            )}

            {/* Modal: Crear / Editar Sucursal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-icon">{modalMode === "crear" ? "➕" : "✏️"}</div>
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
                                            disabled={modalMode === "crear"}
                                        >
                                            {empresa ? (
                                                <option value={empresa.id}>{empresa.nombreEmpresa}</option>
                                            ) : (
                                                <option value="">Cargando empresa...</option>
                                            )}
                                        </select>
                                        <small style={{ color: '#666', fontStyle: 'italic' }}>
                                            {modalMode === "crear" ? "La sucursal se asignará automáticamente a tu empresa" : "Empresa asignada a esta sucursal"}
                                        </small>
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
                                        Haz clic en el mapa o arrastra el marcador para ajustar la ubicación. 
                                        La dirección se completará automáticamente.
                                    </small>
                                    <Wrapper 
                                        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
                                        version="beta"
                                        libraries={['places']}
                                        render={renderMap}
                                    />
                                    <small className="coordinates-info">
                                        Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
                                        {userLocation && (
                                            <span style={{ marginLeft: '10px', color: '#27ae60' }}>
                                                📍 Usando ubicación automática
                                            </span>
                                        )}
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