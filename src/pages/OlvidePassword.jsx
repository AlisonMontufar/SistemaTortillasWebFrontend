import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiPassword from "../services/apiPassword";
import "../styles/OlvidePassword.css";
import logo from "../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👁️ Íconos iguales a login

function OlvidePassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaPass, setNuevaPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [notificacion, setNotificacion] = useState("");
  const [tipoNotificacion, setTipoNotificacion] = useState("");
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (notificacion) {
      const timer = setTimeout(() => {
        setNotificacion("");
        setTipoNotificacion("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacion]);

  const validarContrasena = (pass) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{8,}$/;
    return regex.test(pass);
  };

  // Paso 1: Solicitar correo
  const handleEnviarCorreo = async (e) => {
    e.preventDefault();
    if (!correo.trim()) {
      setTipoNotificacion("error");
      setNotificacion("Ingresa tu correo electrónico.");
      return;
    }

    try {
      setLoading(true);
      await ApiPassword.solicitarRecuperacion(correo);
      setTipoNotificacion("success");
      setNotificacion("Correo de verificación enviado correctamente.");
      setStep(2);
    } catch (error) {
      setTipoNotificacion("error");
      setNotificacion(error.message || "Error al enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar código
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setTipoNotificacion("error");
      setNotificacion("Ingresa el código enviado a tu correo.");
      return;
    }

    try {
      setLoading(true);
      await ApiPassword.verificarCodigo(correo, codigo);
      setTipoNotificacion("success");
      setNotificacion("Código verificado correctamente.");
      setStep(3);
    } catch (error) {
      setTipoNotificacion("error");
      setNotificacion(error.message || "Código inválido o expirado.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Cambiar contraseña
  const handleActualizarPassword = async (e) => {
    e.preventDefault();

    if (!nuevaPass.trim() || !confirmPass.trim()) {
      setTipoNotificacion("error");
      setNotificacion("Completa todos los campos.");
      return;
    }

    if (nuevaPass !== confirmPass) {
      setTipoNotificacion("error");
      setNotificacion("Las contraseñas no coinciden.");
      return;
    }

    if (!validarContrasena(nuevaPass)) {
      setTipoNotificacion("error");
      setNotificacion(
        "Debe tener 8 caracteres, mayúscula, minúscula, número y símbolo."
      );
      return;
    }

    try {
      setLoading(true);
      await ApiPassword.restablecerPassword(correo, nuevaPass, confirmPass);
      setTipoNotificacion("success");
      setNotificacion("¡Contraseña actualizada correctamente!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setTipoNotificacion("error");
      setNotificacion(error.message || "Error al restablecer la contraseña.");
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

        <div className="steps-indicator">
          <span className={step >= 1 ? "active-step" : ""}>1</span>
          <span className={step >= 2 ? "active-step" : ""}>2</span>
          <span className={step >= 3 ? "active-step" : ""}>3</span>
        </div>

        {/* Paso 1 */}
        {step === 1 && (
          <form onSubmit={handleEnviarCorreo}>
            <h2>Recuperar contraseña</h2>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        )}

        {/* Paso 2 */}
        {step === 2 && (
          <form onSubmit={handleVerificarCodigo}>
            <h2>Verificar código</h2>
            <input
              type="text"
              placeholder="Código de verificación"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </form>
        )}

        {/* Paso 3 */}
        {step === 3 && (
          <form onSubmit={handleActualizarPassword}>
            <h2>Nueva contraseña</h2>

            {/* Campo nueva contraseña */}
            <div className="input-password">
              <input
                type={mostrarNueva ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={nuevaPass}
                onChange={(e) => setNuevaPass(e.target.value)}
              />
              <span
                className="toggle-eye"
                onClick={() => setMostrarNueva(!mostrarNueva)}
              >
                {mostrarNueva ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Campo confirmar contraseña */}
            <div className="input-password">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              <span
                className="toggle-eye"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              >
                {mostrarConfirmar ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </form>
        )}

        <button
          type="button"
          className="btn-volver"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Regresar al inicio
        </button>
      </div>
    </div>
  );
}

export default OlvidePassword;
