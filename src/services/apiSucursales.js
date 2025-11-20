const API_BASE_URL = "https://sistematortillasbackend-1.onrender.com";

class ApiSucursales {
  // GET: Obtener todas las sucursales
  static async obtenerSucursales() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Sucursal`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`Error al obtener sucursales: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en obtenerSucursales:", error);
      throw error;
    }
  }

  // GET: Obtener una sucursal por ID
  static async obtenerSucursalPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Sucursal/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`Error al obtener sucursal: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en obtenerSucursalPorId:", error);
      throw error;
    }
  }

  // GET: Obtener sucursales por empresa
  static async obtenerSucursalesPorEmpresa(fkEmpresa) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Sucursal/empresa/${fkEmpresa}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`Error al obtener sucursales por empresa: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en obtenerSucursalesPorEmpresa:", error);
      throw error;
    }
  }

  // POST: Crear nueva sucursal (incluyendo dirección anidada)
  static async crearSucursal(sucursalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Sucursal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sucursalData)
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error al crear sucursal: ${response.status} - ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error en crearSucursal:", error);
      throw error;
    }
  }

  // PUT: Actualizar sucursal (incluyendo dirección anidada)
  static async actualizarSucursal(sucursalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Sucursal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sucursalData)
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error al actualizar sucursal: ${response.status} - ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error en actualizarSucursal:", error);
      throw error;
    }
  }

  // DELETE: Eliminar sucursal
  static async eliminarSucursal(sucursalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Sucursal/${sucursalId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`Error al eliminar sucursal: ${response.status}`);
      return true; // DELETE puede no retornar JSON
    } catch (error) {
      console.error("Error en eliminarSucursal:", error);
      throw error;
    }
  }

  // GET: Obtener todas las empresas
  static async obtenerEmpresas() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Empresa`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`Error al obtener empresas: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en obtenerEmpresas:", error);
      throw error;
    }
  }

  // GET: Obtener una empresa por ID
  static async obtenerEmpresaPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Empresa/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`Error al obtener empresa: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en obtenerEmpresaPorId:", error);
      throw error;
    }
  }

  // POST: Crear nueva empresa
  static async crearEmpresa(empresaData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Empresa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresaData)
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error al crear empresa: ${response.status} - ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error en crearEmpresa:", error);
      throw error;
    }
  }

  // PUT: Actualizar empresa
  static async actualizarEmpresa(empresaData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Empresa/${empresaData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresaData)
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error al actualizar empresa: ${response.status} - ${errorData}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error en actualizarEmpresa:", error);
      throw error;
    }
  }

  // DELETE: Eliminar empresa
  static async eliminarEmpresa(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Empresa/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`Error al eliminar empresa: ${response.status}`);
      return true;
    } catch (error) {
      console.error("Error en eliminarEmpresa:", error);
      throw error;
    }
  }
}

export default ApiSucursales;