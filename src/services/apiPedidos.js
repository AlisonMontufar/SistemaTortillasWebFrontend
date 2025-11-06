const API_BASE_URL = 'https://sistematortilla.onrender.com';

class ApiPedidos {
    // Obtener pedidos por empresa
    static async obtenerPedidosPorEmpresa(empresaId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Pedidos/Empresa/${empresaId}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener pedidos por empresa:', error);
            throw error;
        }
    }

    // Obtener pedido por ID
    static async obtenerPedidoPorId(pedidoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Pedido no encontrado');
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener pedido por ID:', error);
            throw error;
        }
    }

    // Crear nuevo pedido
    static async crearPedido(pedidoData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Pedidos/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedidoData)
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al crear pedido:', error);
            throw error;
        }
    }

    // Actualizar pedido
    static async actualizarPedido(pedidoId, pedidoData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedidoData)
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar pedido:', error);
            throw error;
        }
    }

    // Actualizar estatus de detalle por pedido
    static async actualizarEstatusDetalle(idPedido, estatusDetalle) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Pedidos/detalle/estatusporpedido`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idPedido: idPedido,
                    estatusDetalle: estatusDetalle
                })
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar estatus de detalle:', error);
            throw error;
        }
    }

    // Agregar firma al pedido
    static async agregarFirmaPedido(idPedido, firmaBase64) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Pedidos/detalle/firmaporpedido`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idPedido: idPedido,
                    firmaBase64: firmaBase64
                })
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al agregar firma:', error);
            throw error;
        }
    }

    // Obtener todas las empresas
    static async obtenerEmpresas() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Empresa`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener empresas:', error);
            throw error;
        }
    }

    // Obtener sucursales por empresa
    static async obtenerSucursalesPorEmpresa(empresaId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Sucursal/empresa/${empresaId}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener sucursales por empresa:', error);
            throw error;
        }
    }
}

export default ApiPedidos;