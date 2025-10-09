import React from "react";
import { useNavigate } from "react-router-dom";
import "./OlvidePassword.css";
import logo from "../assets/logo.png";

function OlvidePassword() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí puedes agregar tu lógica de recuperación
        alert("Se ha enviado el correo de recuperación (simulado)");
        navigate("/"); // Regresa al login
    };

    return (
        <div className="olvide-container">
            {/* Izquierda decorativa */}
            <div className="left-section">
                <div className="left-waves" />
                <div className="left-content">
                    <div className="logo-wrap">
                        <img src={logo} alt="Logo" className="logo" />
                    </div>
                    <h1 className="bienvenido-text">Recuperar contraseña</h1>
                    <p>Ingresa tu correo electrónico para restablecer tu contraseña.</p>
                </div>
            </div>

            {/* Derecha formulario */}
            <div className="right-section" role="main">
                <form className="form-right" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email" className="label-input">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control input-azul"
                            placeholder="Ingresa tu correo"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-iniciar">
                        Enviar
                    </button>

                    <div className="volver-login">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="btn-volver"
                        >
                            Volver al inicio de sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OlvidePassword;
