const API_BASE_URL = "https://sistematortillasbackend-1.onrender.com";

class ApiSucursales {
  static async makeRequest(url, options = {}) {
    try {
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      };

      console.log(`🌐 API Call: ${url}`, options.body ? JSON.parse(options.body) : '');

      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      // Para DELETE que puede no retornar contenido
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return true;
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API Error [${url}]:`, error);
      throw error;
    }
  }

  // GET: Obtener todas las sucursales
  static async obtenerSucursales() {
    return this.makeRequest(`${API_BASE_URL}/api/Sucursal`);
  }

  // GET: Obtener una sucursal por ID
  static async obtenerSucursalPorId(id) {
    if (!id) throw new Error('ID de sucursal es requerido');
    return this.makeRequest(`${API_BASE_URL}/api/Sucursal/${id}`);
  }

  // GET: Obtener sucursales por empresa
  static async obtenerSucursalesPorEmpresa(fkEmpresa) {
    if (!fkEmpresa) throw new Error('fkEmpresa es requerido');
    return this.makeRequest(`${API_BASE_URL}/api/Sucursal/empresa/${fkEmpresa}`);
  }

  // POST: Crear nueva sucursal
  static async crearSucursal(sucursalData) {
    if (!sucursalData) throw new Error('Datos de sucursal son requeridos');
    
    // Validar formato básico
    if (!sucursalData.nombreSucursal || !sucursalData.fkEmpresa) {
      throw new Error('Nombre de sucursal y fkEmpresa son requeridos');
    }

    return this.makeRequest(`${API_BASE_URL}/api/Sucursal`, {
      method: 'POST',
      body: JSON.stringify(sucursalData)
    });
  }

  // PUT: Actualizar sucursal
  static async actualizarSucursal(sucursalData) {
    if (!sucursalData || !sucursalData.sucursalId) {
      throw new Error('Datos de sucursal y sucursalId son requeridos');
    }

    return this.makeRequest(`${API_BASE_URL}/api/Sucursal`, {
      method: 'PUT',
      body: JSON.stringify(sucursalData)
    });
  }

  // DELETE: Eliminar sucursal
  static async eliminarSucursal(sucursalId) {
    if (!sucursalId) throw new Error('ID de sucursal es requerido');
    return this.makeRequest(`${API_BASE_URL}/api/Sucursal/${sucursalId}`, {
      method: 'DELETE'
    });
  }

  // GET: Obtener todas las empresas
  static async obtenerEmpresas() {
    return this.makeRequest(`${API_BASE_URL}/api/Empresa`);
  }

  // GET: Obtener una empresa por ID
  static async obtenerEmpresaPorId(id) {
    if (!id) throw new Error('ID de empresa es requerido');
    return this.makeRequest(`${API_BASE_URL}/api/Empresa/${id}`);
  }

  // POST: Crear nueva empresa
  static async crearEmpresa(empresaData) {
    if (!empresaData) throw new Error('Datos de empresa son requeridos');
    return this.makeRequest(`${API_BASE_URL}/api/Empresa`, {
      method: 'POST',
      body: JSON.stringify(empresaData)
    });
  }

  // PUT: Actualizar empresa
  static async actualizarEmpresa(empresaData) {
    if (!empresaData || !empresaData.id) {
      throw new Error('Datos de empresa y ID son requeridos');
    }
    return this.makeRequest(`${API_BASE_URL}/api/Empresa/${empresaData.id}`, {
      method: 'PUT',
      body: JSON.stringify(empresaData)
    });
  }

  // DELETE: Eliminar empresa
  static async eliminarEmpresa(id) {
    if (!id) throw new Error('ID de empresa es requerido');
    return this.makeRequest(`${API_BASE_URL}/api/Empresa/${id}`, {
      method: 'DELETE'
    });
  }
}

export default ApiSucursales;