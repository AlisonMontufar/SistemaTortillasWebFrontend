// geocodingService.js - Servicio mejorado para todo México con Google Maps
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

    // Si Google Maps está habilitado, úsalo, si no, usa OpenStreetMap
    if (process.env.REACT_APP_GOOGLE_MAPS_ENABLED === 'true') {
      return await this.geocodeWithGoogle(cleanAddress);
    } else {
      return await this.geocodeWithOSM(cleanAddress);
    }
  }

  // Geocodificación con Google Maps
  static async geocodeWithGoogle(address) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Maps API Key no configurada, usando OpenStreetMap');
      return await this.geocodeWithOSM(address);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    try {
      console.log(`🗺️ Geocodificando con Google Maps: ${address}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const coords = {
          lat: location.lat,
          lng: location.lng
        };
        
        // Guardar en cache
        this.coordinateCache.set(address, coords);
        console.log(`✅ Geocodificación Google exitosa: ${address} -> ${coords.lat}, ${coords.lng}`);
        return coords;
      } else {
        console.warn(`⚠️ Google Maps no pudo geocodificar: ${data.status}`);
        // Fallback a OpenStreetMap
        return await this.geocodeWithOSM(address);
      }
    } catch (error) {
      console.warn(`⚠️ Error en Google Geocoding:`, error.message);
      // Fallback a OpenStreetMap
      return await this.geocodeWithOSM(address);
    }
  }

  // Geocodificación con OpenStreetMap (fallback)
  static async geocodeWithOSM(address) {
    try {
      // Usar OpenStreetMap Nominatim con parámetros optimizados para México
      const encodedAddress = encodeURIComponent(address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=mx&addressdetails=1`;
      
      console.log(`🗺️ Geocodificando con OSM: ${address}`);
      
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
          this.coordinateCache.set(address, coords);
          console.log(`✅ Geocodificación OSM exitosa: ${address} -> ${coords.lat}, ${coords.lng}`);
          return coords;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error en geocodificación OSM:`, error.message);
    }

    // Fallback a coordenadas mock inteligentes
    return await this.getSmartMockCoordinates(address);
  }

  // REVERSE GEOCODING - Mejorado con Google Maps
  static async reverseGeocode(lat, lng) {
    // Verificar cache primero
    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (this.reverseGeocodeCache.has(cacheKey)) {
      console.log(`📦 Usando reverse geocoding en cache para: ${cacheKey}`);
      return this.reverseGeocodeCache.get(cacheKey);
    }

    // Si Google Maps está habilitado, úsalo, si no, usa OpenStreetMap
    if (process.env.REACT_APP_GOOGLE_MAPS_ENABLED === 'true') {
      return await this.reverseGeocodeWithGoogle(lat, lng, cacheKey);
    } else {
      return await this.reverseGeocodeWithOSM(lat, lng, cacheKey);
    }
  }

  // Reverse Geocoding con Google Maps
  static async reverseGeocodeWithGoogle(lat, lng, cacheKey) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Maps API Key no configurada, usando OpenStreetMap');
      return await this.reverseGeocodeWithOSM(lat, lng, cacheKey);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`;
    
    try {
      console.log(`🗺️ Reverse geocoding con Google Maps para: ${lat}, ${lng}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        console.log("📍 Dirección Google detectada:", result.formatted_address);
        
        // Mapeo de componentes de dirección de Google
        const direccionGenerada = {
          calle: this.getGoogleStreetName(addressComponents),
          numero: this.getGoogleHouseNumber(addressComponents),
          colonia: this.getGoogleNeighborhood(addressComponents),
          ciudad: this.getGoogleCity(addressComponents),
          estado: this.getGoogleState(addressComponents),
          cp: this.getGooglePostalCode(addressComponents),
          referencias: result.formatted_address || ""
        };

        console.log("📍 Dirección Google procesada:", direccionGenerada);

        // Guardar en cache
        this.reverseGeocodeCache.set(cacheKey, direccionGenerada);
        return direccionGenerada;
      } else {
        console.warn(`⚠️ Google Maps no pudo hacer reverse geocoding: ${data.status}`);
        // Fallback a OpenStreetMap
        return await this.reverseGeocodeWithOSM(lat, lng, cacheKey);
      }
    } catch (error) {
      console.warn(`⚠️ Error en Google Reverse Geocoding:`, error.message);
      // Fallback a OpenStreetMap
      return await this.reverseGeocodeWithOSM(lat, lng, cacheKey);
    }
  }

  // Reverse Geocoding con OpenStreetMap (fallback)
  static async reverseGeocodeWithOSM(lat, lng, cacheKey) {
    try {
      // Usar OpenStreetMap Nominatim con parámetros optimizados
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=es`;
      
      console.log(`🗺️ Reverse geocoding con OSM para: ${lat}, ${lng}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SucursalesApp/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        console.log("📍 Dirección OSM detectada:", address);
        
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

        console.log("📍 Dirección OSM procesada:", direccionGenerada);

        // Guardar en cache
        this.reverseGeocodeCache.set(cacheKey, direccionGenerada);
        return direccionGenerada;
      }
    } catch (error) {
      console.warn(`⚠️ Error en reverse geocoding OSM:`, error.message);
    }

    // Si falla la API, intentar con geocodificación alternativa
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

  // Helpers para Google Maps address components
  static getGoogleStreetName(components) {
    const route = components.find(comp => comp.types.includes('route'));
    return route ? route.long_name : "";
  }

  static getGoogleHouseNumber(components) {
    const streetNumber = components.find(comp => comp.types.includes('street_number'));
    return streetNumber ? streetNumber.long_name : "";
  }

  static getGoogleNeighborhood(components) {
    const neighborhood = components.find(comp => comp.types.includes('neighborhood') || comp.types.includes('sublocality'));
    return neighborhood ? neighborhood.long_name : "";
  }

  static getGoogleCity(components) {
    const city = components.find(comp => 
      comp.types.includes('locality') || 
      comp.types.includes('administrative_area_level_2')
    );
    return city ? city.long_name : "";
  }

  static getGoogleState(components) {
    const state = components.find(comp => comp.types.includes('administrative_area_level_1'));
    return state ? state.long_name : "";
  }

  static getGooglePostalCode(components) {
    const postalCode = components.find(comp => comp.types.includes('postal_code'));
    return postalCode ? postalCode.long_name : "";
  }

  // Helpers para OpenStreetMap (se mantienen igual)
  static getStreetName(address) {
    return address.road || 
           address.pedestrian || 
           address.footway || 
           address.residential ||
           address.street ||
           "";
  }

  static getNeighborhood(address) {
    return address.suburb || 
           address.neighbourhood || 
           address.quarter || 
           address.city_district ||
           address.residential ||
           "";
  }

  static getCity(address) {
    return address.city || 
           address.town || 
           address.village || 
           address.municipality ||
           address.county ||
           address.state_district ||
           "";
  }

  // Resto de los métodos se mantienen igual...
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

  static getImprovedMockAddress(lat, lng) {
    // ... (tu implementación existente se mantiene igual)
    const mexicanCities = [
      { latMin: 32.5, latMax: 33.0, lngMin: -117.0, lngMax: -115.0, city: "Tijuana", state: "Baja California" },
      // ... resto de ciudades
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

  static async getSmartMockCoordinates(address) {
    // ... (tu implementación existente se mantiene igual)
    console.log(`🔄 Generando coordenadas mock inteligentes para: ${address}`);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const lowerAddress = address.toLowerCase();
    
    const locationCoordinates = {
      'tula de allende': { lat: 20.0539, lng: -99.3095 },
      'tepeji del rio': { lat: 19.9056, lng: -99.3436 },
      'tula': { lat: 20.0539, lng: -99.3095 },
      'tepeji': { lat: 19.9056, lng: -99.3436 },
      'ciudad de méxico': { lat: 19.4326, lng: -99.1332 },
      'cdmx': { lat: 19.4326, lng: -99.1332 },
      'puebla': { lat: 19.0414, lng: -98.2063 },
      'querétaro': { lat: 20.5881, lng: -100.3881 },
      'hidalgo': { lat: 20.0911, lng: -98.7624 }
    };

    let baseCoords = { lat: 20.0539, lng: -99.3095 };

    for (const [location, coords] of Object.entries(locationCoordinates)) {
      if (lowerAddress.includes(location)) {
        baseCoords = coords;
        console.log(`📍 Ubicación detectada: ${location}`);
        break;
      }
    }

    const coords = {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.045,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.045
    };

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