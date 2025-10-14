import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Registro.css";

function Registro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Obtener token de la URL

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

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Estados de validación
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({});

  // Verificar token al cargar
  useEffect(() => {
    if (token) {
      console.log("Token recibido:", token);
    }
  }, [token]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  // Extraer empresa del correo
  const extraerEmpresaDeCorreo = (correo) => {
    if (!correo || !correo.includes("@")) return null;
    const dominio = correo.split("@")[1];
    return dominio.split(".")[0];
  };

  // Validaciones individuales
  const validateField = (name, value) => {
    switch (name) {
      case "nombreUsuario":
        if (!value) return "";
        if (value.length < 3) return "El nombre de usuario debe tener al menos 3 caracteres";
        if (!/^[a-zA-Z0-9]+$/.test(value)) return "Solo letras y números";
        return "valid";

      case "nombre":
      case "apellidoP":
      case "apellidoM":
        if (!value) return "";
        if (value.length < 2) return "Debe tener al menos 2 caracteres";
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return "Solo letras";
        return "valid";

      case "correoUsuario":
        if (!value) return "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Correo no válido";
        const empresa = extraerEmpresaDeCorreo(value);
        if (!empresa) return "Debe ser un correo empresarial válido";
        return "valid";

      case "contrasenaUsuario":
        if (!value) return "";
        if (value.length < 6) return "Mínimo 6 caracteres";
        return "valid";

      case "confirmarContrasena":
        if (!value) return "";
        if (value !== formData.contrasenaUsuario) return "Las contraseñas no coinciden";
        return "valid";

      case "telefonoUsuario":
        if (!value) return "";
        if (!/^[0-9]+$/.test(value)) return "Solo números";
        if (value.length !== 10) return "Debe tener 10 dígitos";
        return "valid";

      default:
        return "";
    }
  };

  // Manejo de cambios con validación en tiempo real
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Bloquear caracteres incorrectos
    if (["nombre", "apellidoP", "apellidoM"].includes(name)) {
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) return;
    }

    if (["telefonoUsuario"].includes(name)) {
      if (/[^0-9]/.test(value)) return;
    }

    if (name === "nombreUsuario") {
      if (/[^a-zA-Z0-9]/.test(value)) return;
    }

    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Validar campo en tiempo real
    let validation;
    if (name === "confirmarContrasena") {
      validation = value !== newFormData.contrasenaUsuario && value ? "Las contraseñas no coinciden" : 
                   value === newFormData.contrasenaUsuario && value ? "valid" : "";
    } else {
      validation = validateField(name, value);
    }
    
    const newErrors = { ...errors };
    const newValidFields = { ...validFields };

    if (validation === "valid") {
      newErrors[name] = "";
      newValidFields[name] = true;
    } else if (validation) {
      newErrors[name] = validation;
      newValidFields[name] = false;
    } else {
      newErrors[name] = "";
      newValidFields[name] = false;
    }

    // Revalidar confirmar contraseña si cambia la contraseña
    if (name === "contrasenaUsuario" && formData.confirmarContrasena) {
      if (formData.confirmarContrasena === value && value) {
        newErrors.confirmarContrasena = "";
        newValidFields.confirmarContrasena = true;
      } else if (formData.confirmarContrasena && value) {
        newErrors.confirmarContrasena = "Las contraseñas no coinciden";
        newValidFields.confirmarContrasena = false;
      }
    }

    setErrors(newErrors);
    setValidFields(newValidFields);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const {
      nombreUsuario,
      nombre,
      apellidoP,
      apellidoM,
      correoUsuario,
      contrasenaUsuario,
      confirmarContrasena,
      telefonoUsuario,
    } = formData;

    // Validaciones
    if (!nombreUsuario || !nombre || !apellidoP || !apellidoM || !correoUsuario || !contrasenaUsuario || !confirmarContrasena || !telefonoUsuario) {
      return showToast("Completa todos los campos obligatorios.", "error");
    }

    // Verificar que las contraseñas coincidan
    if (contrasenaUsuario !== confirmarContrasena) {
      return showToast("Las contraseñas no coinciden.", "error");
    }

    // Verificar si hay errores
    const hasErrors = Object.values(errors).some(error => error !== "");
    const requiredFields = ["nombreUsuario", "nombre", "apellidoP", "apellidoM", "correoUsuario", "contrasenaUsuario", "telefonoUsuario"];
    const allValid = requiredFields.every(key => validFields[key]);

    if (hasErrors || !allValid || !validFields.confirmarContrasena) {
      return showToast("Por favor, corrige los errores antes de continuar.", "error");
    }

    // Verificar que exista el token
    if (!token) {
      return showToast("Token de registro no válido.", "error");
    }

    // Extraer empresa del correo
    const empresaFromEmail = extraerEmpresaDeCorreo(correoUsuario);

    const payload = {
      nombreUsuario,
      nombre,
      apellidoP,
      apellidoM,
      correoUsuario,
      contrasenaUsuario,
      telefonoUsuario,
      token,
      empresa: empresaFromEmail,
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
        setLoading(false);
        return showToast(data.message || "Error al registrar.", "error");
      }

      showToast("Registro exitoso. Redirigiendo...", "success");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      showToast("Ocurrio un error, Regrese mas tarde.", "error");
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
                  <div className="input-group">
                    <label>Nombre de usuario</label>
                    <input
                      name="nombreUsuario"
                      value={formData.nombreUsuario}
                      onChange={handleChange}
                      type="text"
                      autoFocus
                      className={formData.nombreUsuario && (validFields.nombreUsuario ? "input-success" : "input-error")}
                    />
                    {errors.nombreUsuario && <span className="error-text">{errors.nombreUsuario}</span>}
                    {validFields.nombreUsuario && <span className="success-text">Campo válido</span>}
                  </div>

                  <div className="input-group">
                    <label>Nombre</label>
                    <input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      type="text"
                      className={formData.nombre && (validFields.nombre ? "input-success" : "input-error")}
                    />
                    {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                    {validFields.nombre && <span className="success-text">Campo válido</span>}
                  </div>

                  <div className="input-group">
                    <label>Apellido Paterno</label>
                    <input
                      name="apellidoP"
                      value={formData.apellidoP}
                      onChange={handleChange}
                      type="text"
                      className={formData.apellidoP && (validFields.apellidoP ? "input-success" : "input-error")}
                    />
                    {errors.apellidoP && <span className="error-text">{errors.apellidoP}</span>}
                    {validFields.apellidoP && <span className="success-text">Campo válido</span>}
                  </div>

                  <div className="input-group">
                    <label>Apellido Materno</label>
                    <input
                      name="apellidoM"
                      value={formData.apellidoM}
                      onChange={handleChange}
                      type="text"
                      className={formData.apellidoM && (validFields.apellidoM ? "input-success" : "input-error")}
                    />
                    {errors.apellidoM && <span className="error-text">{errors.apellidoM}</span>}
                    {validFields.apellidoM && <span className="success-text">Campo válido</span>}
                  </div>
                </div>

                <div className="col">
                  <div className="input-group">
                    <label>Teléfono</label>
                    <input
                      name="telefonoUsuario"
                      value={formData.telefonoUsuario}
                      onChange={handleChange}
                      type="text"
                      maxLength="10"
                      className={formData.telefonoUsuario && (validFields.telefonoUsuario ? "input-success" : "input-error")}
                    />
                    {errors.telefonoUsuario && <span className="error-text">{errors.telefonoUsuario}</span>}
                    {validFields.telefonoUsuario && <span className="success-text">Campo válido</span>}
                  </div>

                  <div className="input-group">
                    <label>Correo empresarial</label>
                    <input
                      name="correoUsuario"
                      value={formData.correoUsuario}
                      onChange={handleChange}
                      type="email"
                      placeholder="usuario@empresa.com"
                      className={formData.correoUsuario && (validFields.correoUsuario ? "input-success" : "input-error")}
                    />
                    {errors.correoUsuario && <span className="error-text">{errors.correoUsuario}</span>}
                    {validFields.correoUsuario && <span className="success-text">Campo válido</span>}
                  </div>

                  <div className="input-group">
                    <label>Contraseña</label>
                    <div className="password-wrapper">
                      <input
                        name="contrasenaUsuario"
                        value={formData.contrasenaUsuario}
                        onChange={handleChange}
                        type={mostrarContrasena ? "text" : "password"}
                        className={formData.contrasenaUsuario && (validFields.contrasenaUsuario ? "input-success" : "input-error")}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setMostrarContrasena(!mostrarContrasena)}
                        aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {mostrarContrasena ? (
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
                    </div>
                    {errors.contrasenaUsuario && <span className="error-text">{errors.contrasenaUsuario}</span>}
                    {validFields.contrasenaUsuario && <span className="success-text">Campo válido</span>}
                  </div>

                  <div className="input-group">
                    <label>Confirmar contraseña</label>
                    <div className="password-wrapper">
                      <input
                        name="confirmarContrasena"
                        value={formData.confirmarContrasena}
                        onChange={handleChange}
                        type={mostrarConfirmar ? "text" : "password"}
                        className={formData.confirmarContrasena && (validFields.confirmarContrasena ? "input-success" : "input-error")}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                        aria-label={mostrarConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {mostrarConfirmar ? (
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
                    </div>
                    {errors.confirmarContrasena && <span className="error-text">{errors.confirmarContrasena}</span>}
                    {validFields.confirmarContrasena && <span className="success-text">Las contraseñas coinciden</span>}
                  </div>
                </div>
              </div>

              <div className="actions">
                <button type="button" className="link-skip" onClick={() => navigate("/")}>
                  Regresar
                </button>
                <button type="submit" className="btn-submit">
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