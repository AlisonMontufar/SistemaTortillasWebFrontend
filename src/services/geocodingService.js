class GeocodingService {
  // Geocodificar dirección a coordenadas
  static async geocodeAddress(address) {
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
      console.error("Error en geocodeAddress:", error);
      throw error;
    }
  }

  // Reverse geocoding: coordenadas a dirección
  static async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        return {
          calle: addr.road || "",
          colonia: addr.suburb || addr.neighbourhood || "",
          ciudad: addr.city || addr.town || addr.village || "",
          estado: addr.state || "",
          cp: addr.postcode || "",
        };
      }
      return null;
    } catch (error) {
      console.error("Error en reverseGeocode:", error);
      throw error;
    }
  }
}

export default GeocodingService;