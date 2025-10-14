import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  
  const [loading, setLoading] = useState(false);

  // Mostrar notificaciones tipo toast
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!usuario.trim() || !contrasena.trim()) {
      showToast("Por favor, completa todos los campos.", "error");
      return;
    }

    if (usuario.length < 3 || contrasena.length < 3) {
      showToast("Usuario y contraseña deben tener al menos 3 caracteres.", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreUsuario: usuario.trim(),
          contrasena: contrasena,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Usuario o contraseña incorrectos.", "error");
        return;
      }

      // Guardar token y nombreUsuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("nombreUsuario", usuario.trim()); // <-- Guardamos el nombre del usuario

      showToast("Inicio de sesión exitoso", "success");
      setTimeout(() => navigate("/inicio"), 1000);

    } catch (err) {
      console.error(err);
      showToast("Error al conectar con el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      {/* SECCIÓN IZQUIERDA CON TRES ONDAS */}
      <div className="left-section">
        <div className="top-wave">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none">
            <path d="M0,50 C150,150 350,0 500,50 L500,0 L0,0 Z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>

        <div className="content-left">
          <div className="logo-wrap">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <h1 className="bienvenido-text">Bienvenido</h1>
        </div>

        <div className="bottom-wave">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none">
            <path d="M1,-10 C100,100 350,-80 500,150 L500,150 L0,150 Z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>

        <div className="bottom-wave second-wave">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none">
            <path
              d="M500,0 C300,150 100,10 0,100 C1,130 0,0 0,170 L0,500 L900,0 Z"
              fill="rgba(243, 241, 241, 0.73)"
            />
          </svg>
        </div>
      </div>

      {/* SECCIÓN DERECHA */}
      <div className="right-section" role="main">
        <h2 className="titulo-derecha" data-text="INICIAR SESION">INICIAR SESIÓN</h2>

        {/* Toast notifications */}
        {toast.show && (
          <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
            {toast.message}
          </div>
        )}

        <form className="form-right" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="user" className="label-input">Usuario</label>
            <input
              id="user"
              name="user"
              type="text"
              className="form-control input-azul"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="label-input">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control input-azul"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-iniciar" disabled={loading}>
            {loading ? "Ingresando..." : "INICIAR SESIÓN"}
          </button>

          <div className="recuperar-pass">
            <button
              type="button"
              className="btn-recuperar"
              onClick={() => navigate("/olvide-password")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="registrarse">
            <span className="texto-gris">¿No tienes una cuenta?</span>{" "}
            <button
              type="button"
              className="btn-registrate"
              onClick={() => navigate("/registro")}
            >
              Regístrate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
