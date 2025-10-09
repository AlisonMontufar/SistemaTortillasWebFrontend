import React, { useState } from "react";
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
  const [notificacion, setNotificacion] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const handleContinuar = (e) => {
    e.preventDefault();
    if (!correo) return alert("Ingresa tu correo electrónico");
    setStep(2);
  };

  const handleActualizar = (e) => {
    e.preventDefault();
    if (!token || !nuevaPass || !confirmPass) return alert("Completa todos los campos");
    if (nuevaPass !== confirmPass) return alert("Las contraseñas no coinciden");

    setNotificacion(true);
    setTimeout(() => {
      setNotificacion(false);
      navigate("/"); // Regresa al login
    }, 1000);
  };

  return (
    <div className="olvide-page">
      {notificacion && <div className="notificacion">¡Contraseña cambiada correctamente!</div>}

      <div className="olvide-card">
        <img src={logo} alt="Logo" className="olvide-logo" />

        {/* Indicador de pasos */}
        <div className="steps-indicator">
          <span className={step === 1 ? "active-step" : ""}>1</span>
          <span className={step === 2 ? "active-step" : ""}>2</span>
        </div>

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
            <button type="submit" className="btn-olvide">Continuar</button>
          </form>
        )}

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

            {/* Nueva contraseña con icono de ojo */}
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

            {/* Confirmar contraseña con icono de ojo */}
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

            <button type="submit" className="btn-olvide">Actualizar</button>
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
