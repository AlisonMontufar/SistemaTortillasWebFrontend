import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ApiRegistro from "../services/apiRegistro";
import "../styles/Registro.css";

function Registro() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🟢 Obtener token y rol de la URL (si existen)
  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get("token");
  const rolFromUrl = queryParams.get("rol");

  const [formData, setFormData] = useState({
    nombreUsuario: "",
    nombre: "",
    apellidoP: "",
    apellidoM: "",
    correoUsuario: "",
    contrasenaUsuario: "",
    confirmarContrasena: "",
    telefonoUsuario: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  // 🟢 Validación de campos individual
  const validateField = (name, value) => {
    let message = "";
    switch (name) {
      case "nombreUsuario":
        if (!value.trim()) message = "El nombre de usuario es obligatorio.";
        else if (!/^[A-Za-z0-9_]+$/.test(value))
          message = "Solo se permiten letras, números y guiones bajos.";
        break;

      case "nombre":
      case "apellidoP":
      case "apellidoM":
        if (!value.trim()) message = "Este campo es obligatorio.";
        else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value))
          message = "Solo se permiten letras.";
        break;

      case "correoUsuario":
        if (!value.trim()) message = "El correo es obligatorio.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          message = "Correo no válido.";
        break;

      case "telefonoUsuario":
        if (!value.trim()) message = "El teléfono es obligatorio.";
        else if (!/^\d+$/.test(value)) message = "Solo se permiten números.";
        else if (value.length !== 10) message = "Debe tener 10 dígitos.";
        break;

      case "contrasenaUsuario":
        if (value.length < 6)
          message = "Debe tener al menos 6 caracteres.";
        else if (
          !/[A-Z]/.test(value) ||
          !/[a-z]/.test(value) ||
          !/[0-9]/.test(value)
        )
          message = "Debe incluir mayúsculas, minúsculas y números.";
        break;

      case "confirmarContrasena":
        if (value !== formData.contrasenaUsuario)
          message = "Las contraseñas no coinciden.";
        break;

      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  // 🟢 Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    if (["nombre", "apellidoP", "apellidoM"].includes(name)) {
      filteredValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }

    if (name === "telefonoUsuario") {
      filteredValue = value.replace(/[^0-9]/g, "");
    }

    if (name === "nombreUsuario") {
      filteredValue = value.replace(/[^A-Za-z0-9_]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: filteredValue }));
    validateField(name, filteredValue);
  };

  // 🟢 Validar todo el formulario
  const isFormValid = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
      if (!formData[key]) newErrors[key] = "Campo obligatorio.";
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => !msg);
  };

  // 🟢 Enviar datos al backend
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid())
      return showToast("Corrige los errores antes de continuar.", "error");

    const {
      nombreUsuario,
      nombre,
      apellidoP,
      apellidoM,
      correoUsuario,
      contrasenaUsuario,
      telefonoUsuario,
    } = formData;

    // Si no hay token → rol = 2, token = null
    const payload = {
      nombreUsuario,
      nombre,
      apellidoP,
      apellidoM,
      correoUsuario,
      contrasenaUsuario,
      telefonoUsuario,
      placasVehiculo: "",
      empresa: 1,
      rol: rolFromUrl ? Number(rolFromUrl) : 2,
      token: tokenFromUrl || null,
      estatus: 1,
      fechaRegistro: new Date().toISOString(),
    };

    try {
      setLoading(true);
      await ApiRegistro.registrarUsuario(payload);
      showToast("Registro exitoso. Redirigiendo...", "success");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Error:", error);
      showToast(error.message || "Error de conexión con el servidor.", "error");
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
              <div className="form-grid">
                {/* Columna izquierda */}
                <div className="input-group">
                  <label>Nombre</label>
                  <input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    type="text"
                    autoFocus
                  />
                  {errors.nombre && <p className="error">{errors.nombre}</p>}
                </div>

                <div className="input-group">
                  <label>Apellido Paterno</label>
                  <input
                    name="apellidoP"
                    value={formData.apellidoP}
                    onChange={handleChange}
                    type="text"
                  />
                  {errors.apellidoP && <p className="error">{errors.apellidoP}</p>}
                </div>

                <div className="input-group">
                  <label>Apellido Materno</label>
                  <input
                    name="apellidoM"
                    value={formData.apellidoM}
                    onChange={handleChange}
                    type="text"
                  />
                  {errors.apellidoM && <p className="error">{errors.apellidoM}</p>}
                </div>

                <div className="input-group">
                  <label>Teléfono</label>
                  <input
                    name="telefonoUsuario"
                    value={formData.telefonoUsuario}
                    onChange={handleChange}
                    type="text"
                    maxLength="10"
                  />
                  {errors.telefonoUsuario && (
                    <p className="error">{errors.telefonoUsuario}</p>
                  )}
                </div>

                {/* Columna derecha */}
                <div className="input-group">
                  <label>Nombre de usuario</label>
                  <input
                    name="nombreUsuario"
                    value={formData.nombreUsuario}
                    onChange={handleChange}
                    type="text"
                  />
                  {errors.nombreUsuario && (
                    <p className="error">{errors.nombreUsuario}</p>
                  )}
                </div>

                <div className="input-group">
                  <label>Correo electrónico</label>
                  <input
                    name="correoUsuario"
                    value={formData.correoUsuario}
                    onChange={handleChange}
                    type="email"
                    placeholder="usuario@empresa.com"
                  />
                  {errors.correoUsuario && (
                    <p className="error">{errors.correoUsuario}</p>
                  )}
                </div>

                <div className="input-group password-group">
                  <label>Contraseña</label>
                  <div className="password-wrapper">
                    <input
                      name="contrasenaUsuario"
                      value={formData.contrasenaUsuario}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.contrasenaUsuario && (
                    <p className="error">{errors.contrasenaUsuario}</p>
                  )}
                </div>

                <div className="input-group password-group">
                  <label>Confirmar contraseña</label>
                  <div className="password-wrapper">
                    <input
                      name="confirmarContrasena"
                      value={formData.confirmarContrasena}
                      onChange={handleChange}
                      type={showConfirmPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmarContrasena && (
                    <p className="error">{errors.confirmarContrasena}</p>
                  )}
                </div>
              </div>

              <div className="actions">
                <button type="button" className="link-skip" onClick={() => navigate("/")}>
                  Regresar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Registrando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Registro;
