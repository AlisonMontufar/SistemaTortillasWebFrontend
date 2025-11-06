// geocodingService.js - Servicio mejorado para todo México
class GeocodingService {
  static coordinateCache = new Map();
  static reverseGeocodeCache = new Map();

  // Convertir dirección en coordenadas
  static async geocodeAddress(address) {
    if (!address || address.trim() === "") {
      return null;
    }

    // Limpiar dirección
    const cleanAddress = address.replace(/\s+/g, ' ').trim();
    
    // Verificar cache
    if (this.coordinateCache.has(cleanAddress)) {
      console.log(`📦 Usando coordenadas en cache para: ${cleanAddress}`);
      return this.coordinateCache.get(cleanAddress);
    }

    try {
      // Usar OpenStreetMap Nominatim con parámetros optimizados para México
      const encodedAddress = encodeURIComponent(cleanAddress);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=mx&addressdetails=1`;
      
      console.log(`🗺️ Geocodificando: ${cleanAddress}`);
      
      // Agregar headers para mejor compatibilidad
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SucursalesApp/1.0',
          'Accept-Language': 'es'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          const coords = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          };
          
          // Guardar en cache
          this.coordinateCache.set(cleanAddress, coords);
          console.log(`✅ Geocodificación exitosa: ${cleanAddress} -> ${coords.lat}, ${coords.lng}`);
          return coords;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error en geocodificación API para ${cleanAddress}:`, error.message);
    }

    // Fallback a coordenadas mock inteligentes
    return await this.getSmartMockCoordinates(cleanAddress);
  }

  // REVERSE GEOCODING - Mejorado para todo México
  static async reverseGeocode(lat, lng) {
    // Verificar cache primero
    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (this.reverseGeocodeCache.has(cacheKey)) {
      console.log(`📦 Usando reverse geocoding en cache para: ${cacheKey}`);
      return this.reverseGeocodeCache.get(cacheKey);
    }

    try {
      // Usar OpenStreetMap Nominatim con parámetros optimizados
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=es`;
      
      console.log(`🗺️ Reverse geocoding para: ${lat}, ${lng}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SucursalesApp/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        console.log("📍 Dirección detectada:", address);
        
        // Mapeo mejorado de campos para México
        const direccionGenerada = {
          calle: this.getStreetName(address),
          numero: address.house_number || "",
          colonia: this.getNeighborhood(address),
          ciudad: this.getCity(address),
          estado: address.state || address.region || "",
          cp: address.postcode || "",
          referencias: ""
        };

        console.log("📍 Dirección procesada:", direccionGenerada);

        // Guardar en cache
        this.reverseGeocodeCache.set(cacheKey, direccionGenerada);
        return direccionGenerada;
      }
    } catch (error) {
      console.warn(`⚠️ Error en reverse geocoding API:`, error.message);
    }

    // Si falla la API, intentar con Google Maps Geocoding como alternativa
    try {
      console.log("🔄 Intentando con geocodificación directa como alternativa...");
      const alternativeAddress = await this.alternativeReverseGeocode(lat, lng);
      if (alternativeAddress) {
        this.reverseGeocodeCache.set(cacheKey, alternativeAddress);
        return alternativeAddress;
      }
    } catch (error) {
      console.warn("⚠️ Error en geocodificación alternativa:", error);
    }

    // Solo como último recurso usar mock mejorado
    console.warn("⚠️ Usando dirección mock como fallback");
    const direccionMock = this.getImprovedMockAddress(lat, lng);
    this.reverseGeocodeCache.set(cacheKey, direccionMock);
    return direccionMock;
  }

  // Geocodificación alternativa usando una API diferente
  static async alternativeReverseGeocode(lat, lng) {
    // Usar una API de geolocalización alternativa sin key
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=&limit=1`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          return {
            calle: result.street || "",
            numero: result.housenumber || "",
            colonia: result.suburb || result.district || "",
            ciudad: result.city || "",
            estado: result.state || "",
            cp: result.postcode || "",
            referencias: ""
          };
        }
      }
    } catch (error) {
      throw error;
    }
    return null;
  }

  // Helper para obtener nombre de calle
  static getStreetName(address) {
    return address.road || 
           address.pedestrian || 
           address.footway || 
           address.residential ||
           address.street ||
           "";
  }

  // Helper para obtener colonia/barrio
  static getNeighborhood(address) {
    return address.suburb || 
           address.neighbourhood || 
           address.quarter || 
           address.city_district ||
           address.residential ||
           "";
  }

  // Helper para obtener ciudad
  static getCity(address) {
    return address.city || 
           address.town || 
           address.village || 
           address.municipality ||
           address.county ||
           address.state_district ||
           "";
  }

  // Mock address mejorado para México
  static getImprovedMockAddress(lat, lng) {
    // Base de datos extendida de ciudades mexicanas por coordenadas
    const mexicanCities = [
      { latMin: 32.5, latMax: 33.0, lngMin: -117.0, lngMax: -115.0, city: "Tijuana", state: "Baja California" },
      { latMin: 31.7, latMax: 32.0, lngMin: -116.5, lngMax: -115.5, city: "Mexicali", state: "Baja California" },
      { latMin: 29.0, latMax: 29.2, lngMin: -111.0, lngMax: -110.5, city: "Hermosillo", state: "Sonora" },
      { latMin: 25.6, latMax: 26.0, lngMin: -103.5, lngMax: -103.0, city: "Torreón", state: "Coahuila" },
      { latMin: 25.4, latMax: 25.8, lngMin: -101.0, lngMax: -100.4, city: "Saltillo", state: "Coahuila" },
      { latMin: 31.3, latMax: 31.8, lngMin: -106.5, lngMax: -106.0, city: "Ciudad Juárez", state: "Chihuahua" },
      { latMin: 28.6, latMax: 29.0, lngMin: -106.1, lngMax: -105.5, city: "Chihuahua", state: "Chihuahua" },
      { latMin: 26.9, latMax: 27.1, lngMin: -101.4, lngMax: -101.2, city: "Monclova", state: "Coahuila" },
      { latMin: 27.4, latMax: 27.6, lngMin: -99.5, lngMax: -99.3, city: "Nuevo Laredo", state: "Tamaulipas" },
      { latMin: 25.4, latMax: 25.8, lngMin: -100.3, lngMax: -100.1, city: "Monterrey", state: "Nuevo León" },
      { latMin: 23.7, latMax: 24.0, lngMin: -99.2, lngMax: -98.9, city: "Ciudad Victoria", state: "Tamaulipas" },
      { latMin: 22.2, latMax: 22.3, lngMin: -101.0, lngMax: -100.8, city: "San Luis Potosí", state: "San Luis Potosí" },
      { latMin: 21.8, latMax: 22.0, lngMin: -102.3, lngMax: -102.1, city: "Aguascalientes", state: "Aguascalientes" },
      { latMin: 20.6, latMax: 20.7, lngMin: -103.4, lngMax: -103.2, city: "Guadalajara", state: "Jalisco" },
      { latMin: 21.1, latMax: 21.2, lngMin: -101.7, lngMax: -101.5, city: "León", state: "Guanajuato" },
      { latMin: 21.0, latMax: 21.1, lngMin: -101.3, lngMax: -101.1, city: "Guanajuato", state: "Guanajuato" },
      { latMin: 20.9, latMax: 21.0, lngMin: -102.3, lngMax: -102.1, city: "Lagos de Moreno", state: "Jalisco" },
      { latMin: 19.4, latMax: 19.5, lngMin: -99.2, lngMax: -99.1, city: "Ciudad de México", state: "CDMX" },
      { latMin: 19.3, latMax: 19.4, lngMin: -99.2, lngMax: -99.0, city: "Toluca", state: "Estado de México" },
      { latMin: 19.0, latMax: 19.1, lngMin: -98.2, lngMax: -98.1, city: "Puebla", state: "Puebla" },
      { latMin: 18.9, latMax: 19.0, lngMin: -99.2, lngMax: -99.0, city: "Cuernavaca", state: "Morelos" },
      { latMin: 18.5, latMax: 18.6, lngMin: -99.5, lngMax: -99.4, city: "Taxco", state: "Guerrero" },
      { latMin: 17.6, latMax: 17.7, lngMin: -101.5, lngMax: -101.4, city: "Zihuatanejo", state: "Guerrero" },
      { latMin: 16.8, latMax: 17.0, lngMin: -99.9, lngMax: -99.7, city: "Acapulco", state: "Guerrero" },
      { latMin: 19.2, latMax: 19.3, lngMin: -96.1, lngMax: -96.0, city: "Veracruz", state: "Veracruz" },
      { latMin: 17.0, latMax: 17.1, lngMin: -96.7, lngMax: -96.6, city: "Oaxaca", state: "Oaxaca" },
      { latMin: 16.7, latMax: 16.8, lngMin: -93.1, lngMax: -93.0, city: "Tuxtla Gutiérrez", state: "Chiapas" },
      { latMin: 14.6, latMax: 14.7, lngMin: -92.3, lngMax: -92.2, city: "Tapachula", state: "Chiapas" },
      { latMin: 21.0, latMax: 21.1, lngMin: -89.6, lngMax: -89.5, city: "Mérida", state: "Yucatán" },
      { latMin: 20.8, latMax: 20.9, lngMin: -86.9, lngMax: -86.8, city: "Cancún", state: "Quintana Roo" },
      { latMin: 20.0, latMax: 20.1, lngMin: -99.3, lngMax: -99.2, city: "Tula de Allende", state: "Hidalgo" },
      { latMin: 19.8, latMax: 19.9, lngMin: -99.4, lngMax: -99.3, city: "Tepeji del Río", state: "Hidalgo" }
    ];

    // Buscar ciudad más cercana
    let ciudad = "Tula de Allende";
    let estado = "Hidalgo";

    for (const city of mexicanCities) {
      if (lat >= city.latMin && lat <= city.latMax && 
          lng >= city.lngMin && lng <= city.lngMax) {
        ciudad = city.city;
        estado = city.state;
        break;
      }
    }

    // Nombres de calles más variados para México
    const callesMexicanas = [
      "Av. Principal", "Calle Juárez", "Calle Hidalgo", "Av. Reforma", 
      "Calle Morelos", "Calle Zaragoza", "Av. Independencia", "Calle Allende",
      "Calle Aldama", "Av. Revolución", "Calle Matamoros", "Av. México",
      "Calle Guerrero", "Av. Insurgentes", "Calle Corregidora", "Av. Patria"
    ];

    const coloniasMexicanas = [
      "Centro", "Zona Centro", "Colonia Central", "Barrio Antiguo",
      "Colonia Moderna", "Zona Urbana", "Área Central", "Núcleo Urbano"
    ];

    const calle = callesMexicanas[Math.floor(Math.random() * callesMexicanas.length)];
    const colonia = coloniasMexicanas[Math.floor(Math.random() * coloniasMexicanas.length)];

    return {
      calle: calle,
      numero: (Math.floor(Math.random() * 500) + 1).toString(),
      colonia: colonia,
      ciudad: ciudad,
      estado: estado,
      cp: this.generateCP(estado),
      referencias: ""
    };
  }

  // Generar código postal basado en el estado
  static generateCP(estado) {
    const cpRanges = {
      "Baja California": "21000-22999",
      "Baja California Sur": "23000-23999", 
      "Sonora": "83000-85999",
      "Chihuahua": "31000-33999",
      "Coahuila": "25000-27999",
      "Nuevo León": "64000-67999",
      "Tamaulipas": "87000-89999",
      "Durango": "34000-35999",
      "Zacatecas": "98000-99999",
      "San Luis Potosí": "78000-79999",
      "Aguascalientes": "20000-20999",
      "Jalisco": "44000-49999",
      "Guanajuato": "36000-38999",
      "Querétaro": "76000-76999",
      "Hidalgo": "42000-43999",
      "CDMX": "01000-16999",
      "Estado de México": "50000-57999",
      "Morelos": "62000-62999",
      "Puebla": "72000-75999",
      "Tlaxcala": "90000-90999",
      "Veracruz": "91000-95999",
      "Guerrero": "39000-41999",
      "Oaxaca": "68000-71999",
      "Chiapas": "29000-30999",
      "Tabasco": "86000-86999",
      "Campeche": "24000-24999",
      "Yucatán": "97000-97999",
      "Quintana Roo": "77000-77999"
    };

    const range = cpRanges[estado] || "42000-42999";
    const [min, max] = range.split('-').map(num => parseInt(num));
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  // Resto de los métodos se mantienen igual...
  static async getSmartMockCoordinates(address) {
    console.log(`🔄 Generando coordenadas mock inteligentes para: ${address}`);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const lowerAddress = address.toLowerCase();
    
    // Base de datos de coordenadas por municipio/ciudad en México
    const locationCoordinates = {
      // Hidalgo
      'tula de allende': { lat: 20.0539, lng: -99.3095 },
      'tepeji del rio': { lat: 19.9056, lng: -99.3436 },
      'san ildefonso': { lat: 20.0754, lng: -98.3694 },
      'san marcos': { lat: 20.0833, lng: -99.3333 },
      'tula': { lat: 20.0539, lng: -99.3095 },
      'tepeji': { lat: 19.9056, lng: -99.3436 },
      
      // CDMX y alrededores
      'ciudad de méxico': { lat: 19.4326, lng: -99.1332 },
      'cdmx': { lat: 19.4326, lng: -99.1332 },
      'puebla': { lat: 19.0414, lng: -98.2063 },
      'querétaro': { lat: 20.5881, lng: -100.3881 },
      
      // Estados principales
      'hidalgo': { lat: 20.0911, lng: -98.7624 },
      'estado de méxico': { lat: 19.2869, lng: -99.6542 },
      'jalisco': { lat: 20.6597, lng: -103.3496 },
      'nuevo león': { lat: 25.6866, lng: -100.3161 },
      'veracruz': { lat: 19.1738, lng: -96.1342 },
      'guerrero': { lat: 17.5736, lng: -99.4750 },
      'oaxaca': { lat: 17.0732, lng: -96.7266 },
      'chiapas': { lat: 16.7569, lng: -93.1292 },
      'yucatán': { lat: 20.9801, lng: -89.6232 },
      'quintana roo': { lat: 19.1817, lng: -88.4881 }
    };

    // Buscar ubicación específica
    let baseCoords = { lat: 20.0539, lng: -99.3095 }; // Tula por defecto

    for (const [location, coords] of Object.entries(locationCoordinates)) {
      if (lowerAddress.includes(location)) {
        baseCoords = coords;
        console.log(`📍 Ubicación detectada: ${location}`);
        break;
      }
    }

    // Agregar variación aleatoria pequeña (máximo 5km)
    const coords = {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.045,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.045
    };

    // Guardar en cache
    this.coordinateCache.set(address, coords);
    
    console.log(`🎯 Coordenadas mock: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    return coords;
  }

  static getMockAddressFromCoords(lat, lng) {
    return this.getImprovedMockAddress(lat, lng);
  }

  static async getCoordinatesForSucursal(sucursal) {
    if (!sucursal.direccion) {
      return null;
    }

    const dir = sucursal.direccion;
    
    // Construir dirección completa
    const addressParts = [
      dir.calle,
      dir.numero,
      dir.colonia,
      dir.ciudad,
      dir.estado,
      'México'
    ].filter(part => part && part.trim() !== '' && part !== 'string');
    
    const address = addressParts.join(', ').replace(/\s+/g, ' ').trim();
    
    if (address.length < 10) {
      return null;
    }

    return await this.geocodeAddress(address);
  }
}

export default GeocodingService;