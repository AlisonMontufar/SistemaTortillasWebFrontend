import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../assets/logo.png";

function Login() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        // Validaciones básicas
        if (!usuario.trim() || !contrasena.trim()) {
            setError("Por favor, completa todos los campos.");
            return;
        }

        if (usuario.length < 3 || contrasena.length < 3) {
            setError("Usuario y contraseña deben tener al menos 3 caracteres.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5149/api/Auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombreUsuario: usuario,
                    contrasena: contrasena,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || "Error en la autenticación.");
                return;
            }

            // Si todo OK
            navigate("/inicio");

        } catch (err) {
            console.error(err);
            setError("Error al conectar con el servidor.");
        }
    };

    return (
        <div className="login-container">
            {/* Izquierda */}
            <div className="left-section">
                <div className="left-waves" />
                <div className="left-content">
                    <div className="logo-wrap">
                        <img src={logo} alt="Logo" className="logo" />
                    </div>
                    <h1 className="bienvenido-text">Bienvenido</h1>
                </div>
            </div>

            {/* Derecha */}
            <div className="right-section" role="main">
                <h2 className="titulo-derecha" data-text="INICIAR SESION">INICIAR SESION</h2>

                <form className="form-right" onSubmit={handleLogin}>
                    {error && <p className="error-message">{error}</p>}

                    <div className="input-group">
                        <label htmlFor="user" className="label-input">Usuario</label>
                        <input
                            id="user"
                            name="user"
                            type="text"
                            className="form-control input-azul"
                            placeholder="Ingresa tu usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            aria-label="Usuario"
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
                            placeholder="Ingresa tu contraseña"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            aria-label="Contraseña"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-iniciar">
                        INICIAR SESION
                    </button>

                    {/* Recuperar contraseña */}
                    <div className="recuperar-pass">
                        <button
                            type="button"
                            className="btn-recuperar"
                            onClick={() => navigate("/olvide-password")}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
