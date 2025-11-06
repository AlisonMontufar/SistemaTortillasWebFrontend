// src/pages/Inicio.js
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Inicio.css";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../services/apiInicio";

function Inicio() {
  const usuario = localStorage.getItem("nombreUsuario") || "Usuario";
  const empresaId = localStorage.getItem("empresaId") || 2;
  const navigate = useNavigate();
  
  const [statsData, setStatsData] = useState([]);
  const [systemInfo, setSystemInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quickActions = [
    {
      id: 1,
      title: "Nuevo Pedido",
      description: "Crear un nuevo pedido",
      icon: "➕",
      action: () => navigate("/pedidos"),
      color: "#4CAF50"
    },
    {
      id: 2,
      title: "Ver Sucursales",
      description: "Gestionar sucursales",
      icon: "🏢",
      action: () => navigate("/sucursales"),
      color: "#2196F3"
    },
    {
      id: 3,
      title: "Reportes",
      description: "Ver reportes del sistema",
      icon: "📊",
      action: () => navigate("/configuracion"),
      color: "#FF9800"
    }
  ];

  // Cargar datos del dashboard
  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true);
        const dashboardData = await getDashboardData(empresaId);
        
        setStatsData(dashboardData.statsData);
        setSystemInfo(dashboardData.systemInfo);
        setError(null);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
        setError("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, [empresaId]);

  if (loading) {
    return (
      <div className="inicio-container">
        <Navbar usuario={usuario} />
        <div className="content-wrapper">
          <Sidebar />
          <main className="main-content">
            <div className="loading-section">
              <p>Cargando datos del dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inicio-container">
        <Navbar usuario={usuario} />
        <div className="content-wrapper">
          <Sidebar />
          <main className="main-content">
            <div className="error-section">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="inicio-container">
      <Navbar usuario={usuario} />

      <div className="content-wrapper">
        <Sidebar />

        <main className="main-content">
          <div className="welcome-section">
            <div className="welcome-header">
              <h1>¡Bienvenido de vuelta, {usuario}! 👋</h1>
              <p>
                Estamos encantados de tenerte aquí. Gestiona tus pedidos y
                sucursales de manera eficiente.
              </p>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="stats-grid">
              {statsData.map((stat) => (
                <div
                  key={stat.id}
                  className="stat-card"
                  style={{ borderLeftColor: stat.color }}
                >
                  <div
                    className="stat-icon"
                    style={{ backgroundColor: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                    <span className="stat-description">
                      {stat.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Acciones Rápidas */}
            <div className="quick-actions-section">
              <h2>Acciones Rápidas</h2>
              <div className="actions-grid">
                {quickActions.map((action) => (
                  <div
                    key={action.id}
                    className="action-card"
                    onClick={action.action}
                    style={{ borderTopColor: action.color }}
                  >
                    <div
                      className="action-icon"
                      style={{ color: action.color }}
                    >
                      {action.icon}
                    </div>
                    <div className="action-content">
                      <h3>{action.title}</h3>
                      <p>{action.description}</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="system-info">
              <div className="info-card">
                <h3>📈 Rendimiento del Sistema</h3>
                <div className="info-content">
                  <div className="info-item">
                    <span className="info-label">Uptime:</span>
                    <span className="info-value">{systemInfo.uptime}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Pedidos hoy:</span>
                    <span className="info-value">{systemInfo.pedidosHoy}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Sucursales online:</span>
                    <span className="info-value">{systemInfo.sucursalesOnline}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>🎯 Próximas Metas</h3>
                <div className="info-content">
                  <div className="goal-item">
                    <span className="goal-text">
                      Alcanzar {systemInfo.metaPedidos} pedidos este mes
                    </span>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${systemInfo.progresoPedidos}%` }}
                        ></div>
                      </div>
                      <span>{systemInfo.progresoPedidos}%</span>
                    </div>
                  </div>
                  <div className="goal-item">
                    <span className="goal-text">
                      Alcanzar {systemInfo.metaSucursales} sucursales activas
                    </span>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${systemInfo.progresoSucursales}%` }}
                        ></div>
                      </div>
                      <span>{systemInfo.progresoSucursales}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Inicio;