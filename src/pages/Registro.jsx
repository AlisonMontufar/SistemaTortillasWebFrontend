import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registro.css";

function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    nombre: "",
    apellidoP: "",
    apellidoM: "",
    correoUsuario: "",
    contrasenaUsuario: "",
    telefonoUsuario: "",
    fkEmpresa: "",
    fkRol: "",
    fkVehiculo: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  // Manejo de cambios bloqueando caracteres incorrectos
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Bloquear números en nombres/apellidos
    if (["nombre", "apellidoP", "apellidoM"].includes(name)) {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) return;
    }

    // Bloquear letras en teléfono e IDs
    if (["telefonoUsuario", "fkEmpresa", "fkRol", "fkVehiculo"].includes(name)) {
      if (/[^0-9]/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async (e) => {
    e.preventDefault();
    const {
      nombreUsuario,
      nombre,
      apellidoP,
      apellidoM,
      correoUsuario,
      contrasenaUsuario,
      telefonoUsuario,
      fkEmpresa,
      fkRol,
      fkVehiculo,
    } = formData;

    // Validaciones
    if (!nombreUsuario || !nombre || !apellidoP || !apellidoM || !correoUsuario || !contrasenaUsuario || !telefonoUsuario) {
      return showToast("Completa todos los campos obligatorios.", "error");
    }

    if (nombreUsuario.length < 3) return showToast("El nombre de usuario debe tener al menos 3 caracteres.", "error");
    if (contrasenaUsuario.length < 6) return showToast("La contraseña debe tener al menos 6 caracteres.", "error");
    if (!validarEmail(correoUsuario)) return showToast("Correo electrónico no válido.", "error");
    if (telefonoUsuario.length !== 10) return showToast("El teléfono debe tener exactamente 10 dígitos.", "error");

    // Validar IDs opcionales
    const ids = { fkEmpresa, fkRol, fkVehiculo };
    for (const key in ids) {
      if (ids[key] && parseInt(ids[key]) <= 0) return showToast(`ID ${key} debe ser un número positivo.`, "error");
    }

    const payload = {
      ...formData,
      fkEmpresa: fkEmpresa ? parseInt(fkEmpresa, 10) : null,
      fkRol: fkRol ? parseInt(fkRol, 10) : null,
      fkVehiculo: fkVehiculo ? parseInt(fkVehiculo, 10) : null,
    };

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Mostrar mensaje si correo ya existe u otro error
      if (!response.ok) return showToast(data.message || "Error al registrar.", "error");

      showToast("Registro exitoso. Redirigiendo...", "success");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      showToast("Error al conectar con el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-root">
      {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <main className="reg-main">
        <section className="reg-form">
          <div className="form-inner">
            <h1 className="title">Crea tu cuenta</h1>
            <p className="subtitle">Ingresa tus datos para comenzar</p>

            <form onSubmit={handleRegister} className="form" autoComplete="on">
              <div className="form-row">
                <div className="col">
                  <label>Nombre de usuario</label>
                  <input name="nombreUsuario" value={formData.nombreUsuario} onChange={handleChange} type="text" autoFocus />
                  <label>Nombre</label>
                  <input name="nombre" value={formData.nombre} onChange={handleChange} type="text" />
                  <label>Apellido Paterno</label>
                  <input name="apellidoP" value={formData.apellidoP} onChange={handleChange} type="text" />
                  <label>Apellido Materno</label>
                  <input name="apellidoM" value={formData.apellidoM} onChange={handleChange} type="text" />
                </div>

                <div className="col">
                  <label>Teléfono</label>
                  <input name="telefonoUsuario" value={formData.telefonoUsuario} onChange={handleChange} type="text" maxLength="10" />
                  <label>Correo electrónico</label>
                  <input name="correoUsuario" value={formData.correoUsuario} onChange={handleChange} type="email" />
                  <label>Contraseña</label>
                  <input name="contrasenaUsuario" value={formData.contrasenaUsuario} onChange={handleChange} type="password" />
                  <label>ID Empresa (opcional)</label>
                  <input name="fkEmpresa" value={formData.fkEmpresa} onChange={handleChange} type="number" />
                  <label>ID Rol (opcional)</label>
                  <input name="fkRol" value={formData.fkRol} onChange={handleChange} type="number" />
                  <label>ID Vehículo (opcional)</label>
                  <input name="fkVehiculo" value={formData.fkVehiculo} onChange={handleChange} type="number" />
                </div>
              </div>

              <div className="actions">
                <button type="button" className="link-skip" onClick={() => navigate("/")}>Regresar</button>
                <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Registrando..." : "Registrar"}</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Registro;
