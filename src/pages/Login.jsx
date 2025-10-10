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

            navigate("/inicio");
        } catch (err) {
            console.error(err);
            setError("Error al conectar con el servidor.");
        }
    };

    return (
        <div className="login-container">
            {/* SECCIÓN IZQUIERDA */}
            <div className="left-section">
                <div className="top-wave">
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none">
                        <path
                            d="M0,50 C150,150 350,0 500,50 L500,0 L0,0 Z"
                            fill="rgba(255,255,255,0.3)"
                        />
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
                        <path
                            d="M1,-10 C100,100 350,-80 500,150 L500,150 L0,150 Z"
                            fill="rgba(255,255,255,0.3)"
                        />
                    </svg>
                </div>

                <div className="bottom-wave second-wave">
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none">
                        <path
                            d="M500,0 
                                C300,150 100,10 0,100 
                                C1,130 0,0 0,170 
                                L0,500 L900,0 Z"
                            fill="rgba(243, 241, 241, 0.73)"
                        />
                    </svg>
                </div>
            </div>

            {/* SECCIÓN DERECHA */}
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
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
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

                    <button type="submit" className="btn-iniciar">
                        INICIAR SESION
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

                    {/* NUEVA SECCIÓN: REGISTRARSE */}
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
