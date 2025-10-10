import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registro.css";
import logo from "../assets/logo.png";
import hero from "../assets/hero.png";

function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    correoUsuario: "",
    contrasenaUsuario: "",
    telefonoUsuario: "",
    fkEmpresa: "",
    fkRol: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { nombreUsuario, correoUsuario, contrasenaUsuario, telefonoUsuario, fkEmpresa, fkRol } = formData;

    // Validaciones
    if (!nombreUsuario || !correoUsuario || !contrasenaUsuario || !telefonoUsuario) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (nombreUsuario.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (contrasenaUsuario.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!validarEmail(correoUsuario)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!/^\d{10,}$/.test(telefonoUsuario)) {
      setError("Ingresa un teléfono válido de al menos 10 dígitos.");
      return;
    }

    if (fkEmpresa && (!/^\d+$/.test(fkEmpresa) || parseInt(fkEmpresa) <= 0)) {
      setError("ID Empresa debe ser un número positivo.");
      return;
    }

    if (fkRol && (!/^\d+$/.test(fkRol) || parseInt(fkRol) <= 0)) {
      setError("ID Rol debe ser un número positivo.");
      return;
    }

    // Preparar payload
    const payload = {
      ...formData,
      fkEmpresa: fkEmpresa ? parseInt(fkEmpresa, 10) : null,
      fkRol: fkRol ? parseInt(fkRol, 10) : null,
    };

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5149/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Error al registrar.");
        return;
      }

      setSuccess("Registro exitoso. Redirigiendo al inicio...");
      setTimeout(() => navigate("/"), 1100);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-root">
      <header className="reg-navbar">
        <img src={logo} alt="Logo" className="nav-logo" />
      </header>

      <main className="reg-main">
        <section className="reg-form">
          <div className="form-inner">
            <h1 className="title">Crea tu cuenta</h1>
            <p className="subtitle">Ingresa tus datos para comenzar</p>

            {error && <div className="msg error">{error}</div>}
            {success && <div className="msg success">{success}</div>}

            <form onSubmit={handleRegister} className="form" autoComplete="on">
              <label>Nombre de usuario</label>
              <input
                name="nombreUsuario"
                value={formData.nombreUsuario}
                onChange={handleChange}
                type="text"
                autoFocus
              />

              <label>Teléfono</label>
              <input
                name="telefonoUsuario"
                value={formData.telefonoUsuario}
                onChange={handleChange}
                type="text"
              />

              <label>Correo electrónico</label>
              <input
                name="correoUsuario"
                value={formData.correoUsuario}
                onChange={handleChange}
                type="email"
              />

              <label>Contraseña</label>
              <input
                name="contrasenaUsuario"
                value={formData.contrasenaUsuario}
                onChange={handleChange}
                type="password"
              />

              <label>ID Empresa (opcional)</label>
              <input
                name="fkEmpresa"
                value={formData.fkEmpresa}
                onChange={handleChange}
                type="number"
              />

              <label>ID Rol (opcional)</label>
              <input
                name="fkRol"
                value={formData.fkRol}
                onChange={handleChange}
                type="number"
              />

              <div className="actions">
                <button
                  type="button"
                  className="link-skip"
                  onClick={() => navigate("/")}
                >
                  Regresar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Registrando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="reg-hero">
          <img src={hero} alt="Hero" />
        </aside>
      </main>
    </div>
  );
}

export default Registro;
