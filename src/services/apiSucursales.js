const API_BASE_URL = "http://localhost:5149";

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

  // POST: Crear nueva sucursal
  static async crearSucursal(sucursalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Sucursal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sucursalData)
      });
      if (!response.ok) throw new Error(`Error al crear sucursal: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en crearSucursal:", error);
      throw error;
    }
  }

  // PUT: Actualizar sucursal
  static async actualizarSucursal(sucursalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Sucursal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sucursalData)
      });
      if (!response.ok) throw new Error(`Error al actualizar sucursal: ${response.status}`);
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
      return await response.json();
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

  // POST: Crear dirección
  static async crearDireccion(direccionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Direccion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(direccionData)
      });
      if (!response.ok) throw new Error(`Error al crear dirección: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en crearDireccion:", error);
      throw error;
    }
  }

  // PUT: Actualizar dirección
  static async actualizarDireccion(id, direccionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Direccion/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(direccionData)
      });
      if (!response.ok) throw new Error(`Error al actualizar dirección: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en actualizarDireccion:", error);
      throw error;
    }
  }

  // DELETE: Eliminar dirección
  static async eliminarDireccion(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Direccion/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`Error al eliminar dirección: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en eliminarDireccion:", error);
      throw error;
    }
  }
}

export default ApiSucursales;