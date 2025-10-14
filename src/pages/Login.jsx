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
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Estados de validación en tiempo real
  const [usuarioError, setUsuarioError] = useState("");
  const [contrasenaError, setContrasenaError] = useState("");
  const [usuarioValido, setUsuarioValido] = useState(false);
  const [contrasenaValida, setContrasenaValida] = useState(false);

  // Función para mostrar notificaciones tipo toast
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3500);
  };

  // Validación de usuario o correo en tiempo real
  const handleUsuarioChange = (e) => {
    const value = e.target.value.trim();
    setUsuario(value);

    if (!value) {
      setUsuarioError("");
      setUsuarioValido(false);
      return;
    }

    const esCorreo = value.includes("@");
    if (esCorreo) {
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(value)) {
        setUsuarioError("Formato de correo inválido");
        setUsuarioValido(false);
      } else {
        setUsuarioError("");
        setUsuarioValido(true);
      }
    } else {
      const regexUsuario = /^[a-zA-Z0-9]{3,}$/;
      if (!regexUsuario.test(value)) {
        setUsuarioError("El usuario debe tener al menos 3 caracteres y solo letras/números");
        setUsuarioValido(false);
      } else {
        setUsuarioError("");
        setUsuarioValido(true);
      }
    }
  };

  // Validación de contraseña en tiempo real
  const handleContrasenaChange = (e) => {
    const value = e.target.value;
    setContrasena(value);

    if (!value) {
      setContrasenaError("");
      setContrasenaValida(false);
    } else if (value.length < 3) {
      setContrasenaError("La contraseña debe tener al menos 3 caracteres");
      setContrasenaValida(false);
    } else {
      setContrasenaError("");
      setContrasenaValida(true);
    }
  };

  // Manejo del login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!usuario.trim() || !contrasena.trim()) {
      showToast("Por favor, completa todos los campos.", "error");
      return;
    }

    if (!usuarioValido || !contrasenaValida) {
      showToast("Por favor, corrige los errores antes de continuar.", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5149/api/v1/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificador: usuario.trim(),
          contrasenaUsuario: contrasena,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Usuario o contraseña incorrectos.", "error");
        setLoading(false);
        return;
      }

      // Guardar token y nombreUsuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("nombreUsuario", usuario.trim());

      showToast("Inicio de sesión exitoso", "success");
      setTimeout(() => navigate("/inicio"), 1000);
    } catch (err) {
      console.error(err);
      showToast("Ocurrió un error, inténtalo más tarde.", "error");
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
        <h2 className="titulo-derecha">INICIAR SESIÓN</h2>

        {/* Toast notifications */}
        {toast.show && (
          <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
            {toast.message}
          </div>
        )}

        <form className="form-right" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="user" className="label-input">Usuario o Correo</label>
            <input
              id="user"
              type="text"
              className={`form-control input-azul ${usuario && (usuarioValido ? "input-success" : "input-error")}`}
              value={usuario}
              onChange={handleUsuarioChange}
              placeholder="usuario o correo@empresa"
              required
            />
            {usuarioError && <span className="error-text">{usuarioError}</span>}
            {usuarioValido && <span className="success-text">Campo válido</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password" className="label-input">Contraseña</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={mostrarContrasena ? "text" : "password"}
                className={`form-control input-azul ${contrasena && (contrasenaValida ? "input-success" : "input-error")}`}
                value={contrasena}
                onChange={handleContrasenaChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarContrasena ? (
                  // Ojo cerrado
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  // Ojo abierto
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>

            </div>
            {contrasenaError && <span className="error-text">{contrasenaError}</span>}
            {contrasenaValida && <span className="success-text">Campo válido</span>}
          </div>

          <button type="submit" className="btn-iniciar">
            {loading ? "Ingresando..." : "INICIAR SESIÓN"}
          </button>

          <div className="recuperar-pass">
            <button type="button" className="btn-recuperar" onClick={() => navigate("/olvide-password")}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
