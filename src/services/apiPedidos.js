const API_BASE_URL = "http://localhost:5149";

class ApiPedidos {
    
  // Obtener todos los pedidos
  static async obtenerPedidos() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/Pedido`);
      if (!res.ok) throw new Error("Error al cargar pedidos");
      return await res.json();
    } catch (error) {
      console.error("Error en obtenerPedidos:", error);
      throw error;
    }
  }

  // Obtener todas las sucursales
  static async obtenerSucursales() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/Sucursal`);
      if (!res.ok) throw new Error("Error al cargar sucursales");
      return await res.json();
    } catch (error) {
      console.error("Error en obtenerSucursales:", error);
      throw error;
    }
  }

  // Crear un nuevo pedido
  static async crearPedido(pedidoData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/Pedido`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData)
      });

      if (!res.ok) throw new Error("Error al crear pedido");
      return await res.json();
    } catch (error) {
      console.error("Error en crearPedido:", error);
      throw error;
    }
  }

  // Actualizar un pedido
  static async actualizarPedido(id, pedidoData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/Pedido/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData)
      });

      if (!res.ok) throw new Error("Error al actualizar pedido");
      return await res.json();
    } catch (error) {
      console.error("Error en actualizarPedido:", error);
      throw error;
    }
  }

  // Eliminar un pedido 
  static async eliminarPedido(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/Pedido/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar pedido");
      return await res.json();
    } catch (error) {
      console.error("Error en eliminarPedido:", error);
      throw error;
    }
  }
}

export default ApiPedidos;