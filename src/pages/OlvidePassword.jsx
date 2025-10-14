import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OlvidePassword.css";
import logo from "../assets/logo.png";

function OlvidePassword() {
  const navigate = useNavigate();

  // Estados generales
  const [step, setStep] = useState(1);
  const [correo, setCorreo] = useState("");
  const [token, setToken] = useState("");
  const [nuevaPass, setNuevaPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [notificacion, setNotificacion] = useState("");
  const [tipoNotificacion, setTipoNotificacion] = useState("");
  const [loading, setLoading] = useState(false);

  const [mostrarNuevaPass, setMostrarNuevaPass] = useState(false);
  const [mostrarConfirmPass, setMostrarConfirmPass] = useState(false);

  // Estados de validación
  const [correoError, setCorreoError] = useState("");
  const [correoValido, setCorreoValido] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [tokenValido, setTokenValido] = useState(false);
  const [nuevaPassError, setNuevaPassError] = useState("");
  const [nuevaPassValida, setNuevaPassValida] = useState(false);
  const [confirmPassError, setConfirmPassError] = useState("");
  const [confirmPassValida, setConfirmPassValida] = useState(false);

  // Mostrar notificaciones automáticamente
  useEffect(() => {
    if (notificacion) {
      const timer = setTimeout(() => {
        setNotificacion("");
        setTipoNotificacion("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacion]);

  const showToast = (message, type) => {
    setNotificacion(message);
    setTipoNotificacion(type);
  };

  // Validaciones
  const validarCorreo = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validarContrasena = (pass) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{8,}$/.test(pass);

  // Handlers de inputs
  const handleCorreoChange = (e) => {
    const value = e.target.value;
    setCorreo(value);
    if (!value) {
      setCorreoError("");
      setCorreoValido(false);
    } else if (!validarCorreo(value)) {
      setCorreoError("Correo no válido");
      setCorreoValido(false);
    } else {
      setCorreoError("");
      setCorreoValido(true);
    }
  };

  const handleTokenChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setToken(value);
    if (!value) {
      setTokenError("");
      setTokenValido(false);
    } else if (value.length !== 6) {
      setTokenError("El código debe tener 6 dígitos");
      setTokenValido(false);
    } else {
      setTokenError("");
      setTokenValido(true);
    }
  };

  const handleNuevaPassChange = (e) => {
    const value = e.target.value;
    setNuevaPass(value);
    if (!value) {
      setNuevaPassError("");
      setNuevaPassValida(false);
    } else if (!validarContrasena(value)) {
      setNuevaPassError("La contraseña no cumple los requisitos");
      setNuevaPassValida(false);
    } else {
      setNuevaPassError("");
      setNuevaPassValida(true);
    }

    if (confirmPass) {
      if (value !== confirmPass) {
        setConfirmPassError("Las contraseñas no coinciden");
        setConfirmPassValida(false);
      } else {
        setConfirmPassError("");
        setConfirmPassValida(true);
      }
    }
  };

  const handleConfirmPassChange = (e) => {
    const value = e.target.value;
    setConfirmPass(value);
    if (!value) {
      setConfirmPassError("");
      setConfirmPassValida(false);
    } else if (value !== nuevaPass) {
      setConfirmPassError("Las contraseñas no coinciden");
      setConfirmPassValida(false);
    } else {
      setConfirmPassError("");
      setConfirmPassValida(true);
    }
  };

  // === Paso 1: Enviar notificación ===
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!correo.trim()) {
      showToast("Ingresa tu correo electrónico", "error");
      return;
    }
    if (!correoValido) {
      showToast("Ingresa un correo válido", "error");
      return;
    }

    try {
      setLoading(true);

      const notifResp = await fetch("http://localhost:5149/api/v1/Notification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo.trim(), type: 1 }),
      });

      if (!notifResp.ok) {
        const data = await notifResp.json();
        showToast(data.message || "Error al enviar notificación", "error");
        setLoading(false);
        return;
      }

      showToast("Código enviado a tu correo", "success");
      setStep(2);
    } catch (error) {
      console.error(error);
      showToast("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  // === Paso 2: Verificar código y restablecer contraseña ===
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token.trim() || !nuevaPass.trim() || !confirmPass.trim()) {
      showToast("Completa todos los campos", "error");
      return;
    }

    if (!tokenValido || !nuevaPassValida || !confirmPassValida) {
      showToast("Corrige los errores antes de continuar", "error");
      return;
    }

    try {
      setLoading(true);

      const verifyResp = await fetch("http://localhost:5149/api/v1/Auth/verify-recovery-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo.trim(), code: token }),
      });

      if (!verifyResp.ok) {
        const data = await verifyResp.json();
        showToast(data.message || "Código incorrecto", "error");
        setLoading(false);
        return;
      }

      const resetResp = await fetch(`http://localhost:5149/api/v1/Auth/reset-password?email=${correo.trim()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: nuevaPass, confirmPassword: confirmPass }),
      });

      if (!resetResp.ok) {
        const data = await resetResp.json();
        showToast(data.message || "Error al restablecer contraseña", "error");
        setLoading(false);
        return;
      }

      showToast("Contraseña actualizada correctamente", "success");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      showToast("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="olvide-page">
      {notificacion && <div className={`notificacion ${tipoNotificacion}`}>{notificacion}</div>}

      <div className="olvide-card">
        <img src={logo} alt="Logo" className="olvide-logo" />

        <div className="steps-indicator">
          <span className={step === 1 ? "active-step" : ""}>1</span>
          <span className={step === 2 ? "active-step" : ""}>2</span>
        </div>

        {/* Paso 1 */}
        {step === 1 && (
          <form className="olvide-form" onSubmit={handleSendNotification}>
            <h2 className="titulo-card">Recuperar contraseña</h2>
            <p className="subtitulo-card">Te enviaremos un código de verificación</p>

            <div className="input-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={handleCorreoChange}
                className={correo && (correoValido ? "input-success" : "input-error")}
                required
              />
              {correoError && <span className="error-text">{correoError}</span>}
              {correoValido && <span className="success-text">Correo válido</span>}
            </div>

            <button type="submit" className="btn-olvide" disabled={loading}>
              {loading ? "Enviando..." : "Enviar código"}
            </button>

            <button type="button" className="btn-volver" onClick={() => navigate("/")} disabled={loading}>
              Regresar al inicio
            </button>
          </form>
        )}

        {/* Paso 2 */}
        {step === 2 && (
          <form className="olvide-form paso-dos" onSubmit={handleResetPassword}>
            <h2 className="titulo-card-dos">Nueva contraseña</h2>
            <p className="subtitulo-card-dos">Ingresa el código y tu nueva contraseña</p>

            <div className="input-group-dos">
              <label>Código de verificación</label>
              <input
                type="text"
                placeholder="000000"
                value={token}
                onChange={handleTokenChange}
                maxLength="6"
                className={`token-input-dos ${token && (tokenValido ? "input-success-dos" : "input-error-dos")}`}
                required
              />
              {tokenError && <span className="error-text-dos">{tokenError}</span>}
              {tokenValido && <span className="success-text-dos">Código válido</span>}
            </div>

            {/* Nueva contraseña con SVG */}
            <div className="input-group-dos password-group-dos">
              <label>Nueva contraseña</label>
              <input
                type={mostrarNuevaPass ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={nuevaPass}
                onChange={handleNuevaPassChange}
                className={nuevaPass && (nuevaPassValida ? "input-success-dos" : "input-error-dos")}
                required
              />
              <button
                type="button"
                className="toggle-pass-dos"
                onClick={() => setMostrarNuevaPass(!mostrarNuevaPass)}
              >
                {mostrarNuevaPass ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {nuevaPassError && <span className="error-text-dos">{nuevaPassError}</span>}
            </div>

            {/* Confirmar contraseña con SVG */}
            <div className="input-group-dos password-group-dos">
              <label>Confirmar contraseña</label>
              <input
                type={mostrarConfirmPass ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPass}
                onChange={handleConfirmPassChange}
                className={confirmPass && (confirmPassValida ? "input-success-dos" : "input-error-dos")}
                required
              />
              <button
                type="button"
                className="toggle-pass-dos"
                onClick={() => setMostrarConfirmPass(!mostrarConfirmPass)}
              >
                {mostrarConfirmPass ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {confirmPassError && <span className="error-text-dos">{confirmPassError}</span>}
            </div>

            <button type="submit" className="btn-olvide-dos" disabled={loading}>
              {loading ? "Procesando..." : "Restablecer contraseña"}
            </button>

            <button type="button" className="btn-volver-dos" onClick={() => setStep(1)} disabled={loading}>
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OlvidePassword;
