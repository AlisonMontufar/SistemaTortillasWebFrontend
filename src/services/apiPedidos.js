const API_BASE_URL = "http://localhost:5149";

class ApiPedidos {
    
  // Obtener todos los pedidos
  static async obtenerPedidos() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pedidos`);
      if (!res.ok) throw new Error("Error al cargar pedidos");
      return await res.json();
    } catch (error) {
      console.error("Error en obtenerPedidos:", error);
      throw error;
    }
  }

  // Obtener pedido por ID
  static async obtenerPedidoPorId(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pedidos/${id}`);
      if (!res.ok) throw new Error("Error al cargar pedido");
      return await res.json();
    } catch (error) {
      console.error("Error en obtenerPedidoPorId:", error);
      throw error;
    }
  }

  // Obtener pedidos por empresa
  static async obtenerPedidosPorEmpresa(empresaId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pedidos/Empresa/${empresaId}`);
      if (!res.ok) throw new Error("Error al cargar pedidos de empresa");
      return await res.json();
    } catch (error) {
      console.error("Error en obtenerPedidosPorEmpresa:", error);
      throw error;
    }
  }

  // Obtener todas las sucursales
  static async obtenerSucursales() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Sucursal`);
      if (!res.ok) throw new Error("Error al cargar sucursales");
      return await res.json();
    } catch (error) {
      console.error("Error en obtenerSucursales:", error);
      throw error;
    }
  }

  // Obtener todas las empresas
  static async obtenerEmpresas() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Empresa`);
      if (!res.ok) throw new Error("Error al cargar empresas");
      return await res.json();
    } catch (error) {
      console.error("Error en obtenerEmpresas:", error);
      throw error;
    }
  }

  // Crear un nuevo pedido
  static async crearPedido(pedidoData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pedidos/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al crear pedido: ${res.status} - ${errorText}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Error en crearPedido:", error);
      throw error;
    }
  }

  // Actualizar un pedido
  static async actualizarPedido(id, pedidoData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al actualizar pedido: ${res.status} - ${errorText}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Error en actualizarPedido:", error);
      throw error;
    }
  }

  // Actualizar estatus de detalles por pedido
  static async actualizarEstatusDetallePorPedido(idPedido, estatusDetalle) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pedidos/detalle/estatusporpedido`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idPedido, estatusDetalle })
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al actualizar estatus: ${res.status} - ${errorText}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Error en actualizarEstatusDetallePorPedido:", error);
      throw error;
    }
  }

  // Actualizar firma por pedido
  static async actualizarFirmaPorPedido(idPedido, firmaBase64) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pedidos/detalle/firmaporpedido`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idPedido, firmaBase64 })
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al actualizar firma: ${res.status} - ${errorText}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Error en actualizarFirmaPorPedido:", error);
      throw error;
    }
  }

  // Eliminar un pedido (si existe en tu API)
  static async eliminarPedido(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pedidos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Error al eliminar pedido");
      return true;
    } catch (error) {
      console.error("Error en eliminarPedido:", error);
      throw error;
    }
  }
}

export default ApiPedidos;