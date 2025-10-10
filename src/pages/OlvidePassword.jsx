import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OlvidePassword.css";
import logo from "../assets/logo.png";

const eyeIcon = "https://cdn-icons-png.flaticon.com/512/709/709612.png";
const eyeOffIcon = "https://cdn-icons-png.flaticon.com/512/159/159604.png";

function OlvidePassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [correo, setCorreo] = useState("");
  const [token, setToken] = useState("");
  const [nuevaPass, setNuevaPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [notificacion, setNotificacion] = useState("");
  const [tipoNotificacion, setTipoNotificacion] = useState(""); // success o error
  const [mostrarPass, setMostrarPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔔 Hace desaparecer la notificación automáticamente
  useEffect(() => {
    if (notificacion) {
      const timer = setTimeout(() => {
        setNotificacion("");
        setTipoNotificacion("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notificacion]);

  // === 1️⃣ Enviar correo para recuperación ===
  const handleContinuar = async (e) => {
    e.preventDefault();
    if (!correo) {
      setTipoNotificacion("error");
      setNotificacion("Ingresa tu correo electrónico");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5149/api/Auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTipoNotificacion("error");
        setNotificacion(data.message || "Error al enviar el correo.");
        setLoading(false);
        return;
      }

      setTipoNotificacion("success");
      setNotificacion("Correo de recuperación enviado correctamente. Revisa tu bandeja.");
      setStep(2);
    } catch (error) {
      console.error(error);
      setTipoNotificacion("error");
      setNotificacion("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // === 2️⃣ Restablecer contraseña ===
  const handleActualizar = async (e) => {
    e.preventDefault();

    if (!token || !nuevaPass || !confirmPass) {
      setTipoNotificacion("error");
      setNotificacion("Completa todos los campos");
      return;
    }
    if (nuevaPass !== confirmPass) {
      setTipoNotificacion("error");
      setNotificacion("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5149/api/Auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          nuevaContrasena: nuevaPass,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTipoNotificacion("error");
        setNotificacion(data.message || "Error al restablecer la contraseña.");
        setLoading(false);
        return;
      }

      setTipoNotificacion("success");
      setNotificacion("¡Contraseña cambiada correctamente!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error(error);
      setTipoNotificacion("error");
      setNotificacion("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="olvide-page">
      {notificacion && (
        <div className={`notificacion ${tipoNotificacion}`}>
          {notificacion}
        </div>
      )}

      <div className="olvide-card">
        <img src={logo} alt="Logo" className="olvide-logo" />

        {/* Indicador de pasos */}
        <div className="steps-indicator">
          <span className={step === 1 ? "active-step" : ""}>1</span>
          <span className={step === 2 ? "active-step" : ""}>2</span>
        </div>

        {/* Paso 1: Enviar correo */}
        {step === 1 && (
          <form className="olvide-form" onSubmit={handleContinuar}>
            <h2 className="titulo-card">Recuperar contraseña</h2>
            <p className="subtitulo-card">Ingresa tu correo electrónico</p>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <button type="submit" className="btn-olvide" disabled={loading}>
              {loading ? "Enviando..." : "Continuar"}
            </button>
          </form>
        )}

        {/* Paso 2: Restablecer contraseña */}
        {step === 2 && (
          <form className="olvide-form" onSubmit={handleActualizar}>
            <h2 className="titulo-card">Nueva contraseña</h2>
            <p className="subtitulo-card">Ingresa el token y tu nueva contraseña</p>

            <input
              type="text"
              placeholder="Código de verificación"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />

            {/* Nueva contraseña */}
            <div className="input-password">
              <input
                type={mostrarPass ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={nuevaPass}
                onChange={(e) => setNuevaPass(e.target.value)}
                required
              />
              <img
                src={mostrarPass ? eyeOffIcon : eyeIcon}
                alt="Mostrar contraseña"
                className="icon-eye"
                onClick={() => setMostrarPass(!mostrarPass)}
              />
            </div>

            {/* Confirmar contraseña */}
            <div className="input-password">
              <input
                type={mostrarPass ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
              <img
                src={mostrarPass ? eyeOffIcon : eyeIcon}
                alt="Mostrar contraseña"
                className="icon-eye"
                onClick={() => setMostrarPass(!mostrarPass)}
              />
            </div>

            <button type="submit" className="btn-olvide" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
            <button
              type="button"
              className="btn-volver"
              onClick={() => setStep(1)}
            >
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OlvidePassword;
