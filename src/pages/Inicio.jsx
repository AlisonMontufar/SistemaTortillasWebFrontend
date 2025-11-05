import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Inicio.css";
import { useNavigate } from "react-router-dom";

function Inicio() {
  const usuario = localStorage.getItem("nombreUsuario") || "Usuario";
  const navigate = useNavigate();

  // Datos de ejemplo para las cards
  const statsData = [
    {
      id: 1,
      title: "Pedidos del Mes",
      value: "24",
      icon: "📦",
      color: "#4CAF50",
      description: "+5% vs mes anterior"
    },
    {
      id: 2,
      title: "Sucursales Activas",
      value: "8",
      icon: "🏪",
      color: "#2196F3",
      description: "Todas operativas"
    },
    {
      id: 3,
      title: "Clientes Satisfechos",
      value: "95%",
      icon: "⭐",
      color: "#FF9800",
      description: "Rating promedio 4.8/5"
    },
    {
      id: 4,
      title: "Entregas a Tiempo",
      value: "98%",
      icon: "⏱️",
      color: "#9C27B0",
      description: "Excelente desempeño"
    }
  ];

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

  return (
    <div className="inicio-container">
      {/* Navbar común */}
      <Navbar usuario={usuario} />

      <div className="content-wrapper">
        {/* Sidebar común */}
        <Sidebar />

        <main className="main-content">
          {/* Sección de Bienvenida */}
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
                    <span className="info-value">99.9%</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Pedidos hoy:</span>
                    <span className="info-value">12</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Sucursales online:</span>
                    <span className="info-value">8/8</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>🎯 Próximas Metas</h3>
                <div className="info-content">
                  <div className="goal-item">
                    <span className="goal-text">
                      Alcanzar 100 pedidos este mes
                    </span>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                      <span>75%</span>
                    </div>
                  </div>
                  <div className="goal-item">
                    <span className="goal-text">Abrir 2 nuevas sucursales</span>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                      <span>40%</span>
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
