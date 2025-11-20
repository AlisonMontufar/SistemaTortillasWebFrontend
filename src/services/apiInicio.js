// src/services/apiInicio.js

const API_BASE_URL = 'https://sistematortillasbackend-1.onrender.com/api';

// Función genérica para hacer requests
const fetchData = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Obtener sucursales por empresa
export const getSucursalesByEmpresa = async (empresaId) => {
  return await fetchData(`/Sucursal/empresa/${empresaId}`);
};

// Obtener pedidos por empresa
export const getPedidosByEmpresa = async (empresaId) => {
  return await fetchData(`/Pedidos/Empresa/${empresaId}`);
};

// Obtener pedido por ID
export const getPedidoById = async (pedidoId) => {
  return await fetchData(`/Pedidos/${pedidoId}`);
};

// Función para calcular estadísticas del dashboard
export const calcularEstadisticasDashboard = (sucursales, pedidos) => {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  
  // Pedidos del mes actual
  const pedidosMes = pedidos.filter(pedido => 
    new Date(pedido.fechaHora) >= inicioMes
  );

  // Sucursales activas (estatus = 0)
  const sucursalesActivas = sucursales.filter(sucursal => 
    sucursal.estatus === 0
  );

  // Pedidos de hoy
  const pedidosHoy = pedidos.filter(pedido => {
    const fechaPedido = new Date(pedido.fechaHora);
    return fechaPedido.toDateString() === ahora.toDateString();
  });

  // Calcular porcentaje de entregas a tiempo (asumiendo que "Pagado" significa entregado a tiempo)
  const entregasATiempo = pedidos.filter(pedido => 
    pedido.estatusGeneral === "Pagado"
  ).length;
  
  const porcentajeEntregas = pedidos.length > 0 
    ? Math.round((entregasATiempo / pedidos.length) * 100)
    : 100;

  return {
    pedidosMes: pedidosMes.length,
    sucursalesActivas: sucursalesActivas.length,
    totalSucursales: sucursales.length,
    pedidosHoy: pedidosHoy.length,
    porcentajeEntregas: `${porcentajeEntregas}%`,
    totalPedidos: pedidos.length
  };
};

// Función para preparar datos del dashboard
export const getDashboardData = async (empresaId) => {
  try {
    const [sucursales, pedidos] = await Promise.all([
      getSucursalesByEmpresa(empresaId),
      getPedidosByEmpresa(empresaId)
    ]);

    const estadisticas = calcularEstadisticasDashboard(sucursales, pedidos);

    // Preparar statsData para el componente
    const statsData = [
      {
        id: 1,
        title: "Pedidos del Mes",
        value: estadisticas.pedidosMes.toString(),
        icon: "📦",
        color: "#4CAF50",
        description: `${estadisticas.pedidosHoy} pedidos hoy`
      },
      {
        id: 2,
        title: "Sucursales Activas",
        value: `${estadisticas.sucursalesActivas}/${estadisticas.totalSucursales}`,
        icon: "🏪",
        color: "#2196F3",
        description: estadisticas.sucursalesActivas === estadisticas.totalSucursales 
          ? "Todas operativas" 
          : `${estadisticas.totalSucursales - estadisticas.sucursalesActivas} inactivas`
      },
      {
        id: 3,
        title: "Clientes Satisfechos",
        value: "95%", // Puedes conectar con API de ratings si la tienes
        icon: "⭐",
        color: "#FF9800",
        description: "Rating promedio 4.8/5"
      },
      {
        id: 4,
        title: "Entregas a Tiempo",
        value: estadisticas.porcentajeEntregas,
        icon: "⏱️",
        color: "#9C27B0",
        description: "Excelente desempeño"
      }
    ];

    // Preparar systemInfo para el componente
    const systemInfo = {
      uptime: "99.9%",
      pedidosHoy: estadisticas.pedidosHoy,
      sucursalesOnline: `${estadisticas.sucursalesActivas}/${estadisticas.totalSucursales}`,
      totalPedidosMes: estadisticas.pedidosMes,
      metaPedidos: 100,
      progresoPedidos: Math.min(Math.round((estadisticas.pedidosMes / 100) * 100), 100),
      metaSucursales: estadisticas.totalSucursales + 2,
      progresoSucursales: Math.min(Math.round((estadisticas.totalSucursales / (estadisticas.totalSucursales + 2)) * 100), 100)
    };

    return {
      statsData,
      systemInfo,
      sucursales,
      pedidos,
      success: true
    };

  } catch (error) {
    console.error('Error en getDashboardData:', error);
    throw error;
  }
};