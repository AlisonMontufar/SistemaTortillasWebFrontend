// geocodingService.js - Servicio optimizado para Google Maps
class GeocodingService {
  static coordinateCache = new Map();
  static reverseGeocodeCache = new Map();
  static CACHE_DURATION = 1000 * 60 * 60; // 1 hora en milisegundos

  // Convertir dirección en coordenadas
  static async geocodeAddress(address) {
    if (!address || address.trim() === "") {
      return null;
    }

    // Limpiar dirección
    const cleanAddress = address.replace(/\s+/g, ' ').trim();
    
    // Verificar cache con timestamp
    const cached = this.coordinateCache.get(cleanAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 Usando coordenadas en cache para: ${cleanAddress}`);
      return cached.coords;
    }

    try {
      if (process.env.REACT_APP_GOOGLE_MAPS_ENABLED === 'true') {
        return await this.geocodeWithGoogle(cleanAddress);
      } else {
        return await this.geocodeWithOSM(cleanAddress);
      }
    } catch (error) {
      console.error("❌ Error en geocodificación:", error);
      return await this.getSmartMockCoordinates(cleanAddress);
    }
  }

  // Geocodificación con Google Maps - Optimizada
  static async geocodeWithGoogle(address) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Maps API Key no configurada, usando OpenStreetMap');
      return await this.geocodeWithOSM(address);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&region=mx`;
    
    try {
      console.log(`🗺️ Geocodificando con Google Maps: ${address}`);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const coords = {
          lat: location.lat,
          lng: location.lng
        };
        
        // Guardar en cache con timestamp
        this.coordinateCache.set(address, {
          coords,
          timestamp: Date.now()
        });
        
        console.log(`✅ Geocodificación Google exitosa: ${address} -> ${coords.lat}, ${coords.lng}`);
        return coords;
      } else {
        throw new Error(`Google Maps status: ${data.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ Error en Google Geocoding:`, error.message);
      return await this.geocodeWithOSM(address);
    }
  }

  // Geocodificación con OpenStreetMap (fallback) - Optimizada
  static async geocodeWithOSM(address) {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=mx&addressdetails=1`;
      
      console.log(`🗺️ Geocodificando con OSM: ${address}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SucursalesApp/1.0 (soporte@empresa.com)',
          'Accept-Language': 'es'
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const coords = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        
        this.coordinateCache.set(address, {
          coords,
          timestamp: Date.now()
        });
        
        console.log(`✅ Geocodificación OSM exitosa: ${address} -> ${coords.lat}, ${coords.lng}`);
        return coords;
      }
      throw new Error('No results found');
    } catch (error) {
      console.warn(`⚠️ Error en geocodificación OSM:`, error.message);
      return await this.getSmartMockCoordinates(address);
    }
  }

  // REVERSE GEOCODING - Optimizado
  static async reverseGeocode(lat, lng) {
    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    
    // Verificar cache
    const cached = this.reverseGeocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 Usando reverse geocoding en cache para: ${cacheKey}`);
      return cached.address;
    }

    try {
      if (process.env.REACT_APP_GOOGLE_MAPS_ENABLED === 'true') {
        return await this.reverseGeocodeWithGoogle(lat, lng, cacheKey);
      } else {
        return await this.reverseGeocodeWithOSM(lat, lng, cacheKey);
      }
    } catch (error) {
      console.error("❌ Error en reverse geocoding:", error);
      return this.getImprovedMockAddress(lat, lng);
    }
  }

  // Reverse Geocoding con Google Maps - Optimizado
  static async reverseGeocodeWithGoogle(lat, lng, cacheKey) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return await this.reverseGeocodeWithOSM(lat, lng, cacheKey);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es&result_type=street_address`;
    
    try {
      console.log(`🗺️ Reverse geocoding con Google Maps para: ${lat}, ${lng}`);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        const direccionGenerada = {
          calle: this.getGoogleAddressComponent(addressComponents, ['route']),
          numero: this.getGoogleAddressComponent(addressComponents, ['street_number']),
          colonia: this.getGoogleAddressComponent(addressComponents, ['neighborhood', 'sublocality']),
          ciudad: this.getGoogleAddressComponent(addressComponents, ['locality', 'administrative_area_level_2']),
          estado: this.getGoogleAddressComponent(addressComponents, ['administrative_area_level_1']),
          cp: this.getGoogleAddressComponent(addressComponents, ['postal_code']),
          referencias: result.formatted_address || ""
        };

        // Guardar en cache
        this.reverseGeocodeCache.set(cacheKey, {
          address: direccionGenerada,
          timestamp: Date.now()
        });
        
        return direccionGenerada;
      } else {
        throw new Error(`Google Maps status: ${data.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ Error en Google Reverse Geocoding:`, error.message);
      return await this.reverseGeocodeWithOSM(lat, lng, cacheKey);
    }
  }

  // Helper mejorado para componentes de dirección de Google
  static getGoogleAddressComponent(components, types) {
    for (const type of types) {
      const component = components.find(comp => comp.types.includes(type));
      if (component) return component.long_name;
    }
    return "";
  }

  // Reverse Geocoding con OpenStreetMap (fallback) - Optimizado
  static async reverseGeocodeWithOSM(lat, lng, cacheKey) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`;
      
      console.log(`🗺️ Reverse geocoding con OSM para: ${lat}, ${lng}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SucursalesApp/1.0 (soporte@empresa.com)'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const address = data.address || {};
      
      const direccionGenerada = {
        calle: address.road || address.pedestrian || "",
        numero: address.house_number || "",
        colonia: address.suburb || address.neighbourhood || "",
        ciudad: address.city || address.town || address.village || "",
        estado: address.state || address.region || "",
        cp: address.postcode || "",
        referencias: data.display_name || ""
      };

      // Guardar en cache
      this.reverseGeocodeCache.set(cacheKey, {
        address: direccionGenerada,
        timestamp: Date.now()
      });
      
      return direccionGenerada;
    } catch (error) {
      console.warn(`⚠️ Error en reverse geocoding OSM:`, error.message);
      throw error;
    }
  }

  // Método mejorado para obtener coordenadas de sucursal
  static async getCoordinatesForSucursal(sucursal) {
    if (!sucursal.direccion) {
      return null;
    }

    const dir = sucursal.direccion;
    
    // Si ya tiene coordenadas, usarlas
    if (dir.latitud && dir.longitud) {
      const lat = parseFloat(dir.latitud);
      const lng = parseFloat(dir.longitud);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    // Si no tiene coordenadas, geocodificar la dirección
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

  // Limpiar cache expirado
  static clearExpiredCache() {
    const now = Date.now();
    
    // Limpiar coordinateCache
    for (const [key, value] of this.coordinateCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.coordinateCache.delete(key);
      }
    }
    
    // Limpiar reverseGeocodeCache
    for (const [key, value] of this.reverseGeocodeCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.reverseGeocodeCache.delete(key);
      }
    }
  }

  // Mock coordinates mejorado
  static async getSmartMockCoordinates(address) {
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

    this.coordinateCache.set(address, {
      coords,
      timestamp: Date.now()
    });
    
    console.log(`🎯 Coordenadas mock: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    return coords;
  }

  static getImprovedMockAddress(lat, lng) {
    const mexicanCities = [
      { latMin: 20.0, latMax: 20.1, lngMin: -99.3, lngMax: -99.2, city: "Tula de Allende", state: "Hidalgo" },
      { latMin: 19.8, latMax: 19.9, lngMin: -99.4, lngMax: -99.3, city: "Tepeji del Río", state: "Hidalgo" }
    ];

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
      "Calle Morelos", "Calle Zaragoza", "Av. Independencia", "Calle Allende"
    ];

    const coloniasMexicanas = [
      "Centro", "Zona Centro", "Colonia Central", "Barrio Antiguo"
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
      "Hidalgo": "42000-43999",
      "CDMX": "01000-16999",
      "Estado de México": "50000-57999",
      "Puebla": "72000-75999",
      "Querétaro": "76000-76999"
    };

    const range = cpRanges[estado] || "42000-42999";
    const [min, max] = range.split('-').map(num => parseInt(num));
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
}

// Limpiar cache automáticamente cada hora
setInterval(() => {
  GeocodingService.clearExpiredCache();
}, 1000 * 60 * 60); // Cada hora

export default GeocodingService;