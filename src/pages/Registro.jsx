import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ Import correcto para versiones nuevas
import "./Registro.css";

function Registro() {
const navigate = useNavigate();
const location = useLocation();

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

const [roleId, setRoleId] = useState(null);
const [token, setToken] = useState(null);
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
const [toast, setToast] = useState({ message: "", type: "" });

// 🟢 Leer token del query params y decodificar
useEffect(() => {
const queryParams = new URLSearchParams(location.search);
const urlToken = queryParams.get("token");

if (urlToken) {
  setToken(urlToken);
  try {
    const decoded = jwtDecode(urlToken);
    console.log("Token decodificado:", decoded);
    setFormData((prev) => ({ ...prev, correoUsuario: decoded.email }));
    setRoleId(Number(decoded.roleId));
  } catch (error) {
    console.error("Token inválido:", error);
    setToast({ message: "Token inválido o expirado.", type: "error" });
  }
}

}, [location.search]);

const showToast = (message, type = "success") => {
setToast({ message, type });
setTimeout(() => setToast({ message: "", type: "" }), 4000);
};

const validateField = (name, value) => {
let message = "";
switch (name) {
case "nombreUsuario":
if (!value.trim()) message = "El nombre de usuario es obligatorio.";
else if (!/^[A-Za-z0-9_]+$/.test(value))
message = "Solo letras, números y guiones bajos.";
break;
case "nombre":
case "apellidoP":
case "apellidoM":
if (!value.trim()) message = "Este campo es obligatorio.";
else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value))
message = "Solo letras.";
break;
case "correoUsuario":
if (!value.trim()) message = "El correo es obligatorio.";
else if (!/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(value))
message = "Correo no válido.";
break;
case "telefonoUsuario":
if (!value.trim()) message = "El teléfono es obligatorio.";
else if (!/^\d+$/.test(value)) message = "Solo números.";
else if (value.length !== 10) message = "Debe tener 10 dígitos.";
break;
case "contrasenaUsuario":
if (value.length < 6) message = "Mínimo 6 caracteres.";
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

const handleChange = (e) => {
const { name, value } = e.target;
let filteredValue = value;

if (["nombre", "apellidoP", "apellidoM"].includes(name))
  filteredValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
if (name === "telefonoUsuario")
  filteredValue = value.replace(/[^0-9]/g, "");
if (name === "nombreUsuario")
  filteredValue = value.replace(/[^A-Za-z0-9_]/g, "");

setFormData((prev) => ({ ...prev, [name]: filteredValue }));
validateField(name, filteredValue);


};

const isFormValid = () => {
const newErrors = {};
Object.keys(formData).forEach((key) => {
validateField(key, formData[key]);
if (!formData[key]) newErrors[key] = "Campo obligatorio.";
});
setErrors(newErrors);
return Object.values(newErrors).every((msg) => !msg);
};

const handleRegister = async (e) => {
e.preventDefault();
if (!isFormValid()) return showToast("Corrige los errores.", "error");

const payload = {
  ...formData,
  rol: roleId || 3,
  estatus: 1,
  fechaRegistro: new Date().toISOString(),
  token: token,
};

try {
  setLoading(true);
  const response = await fetch(
    "http://localhost:5149/api/v1/Auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    showToast(errorData.message || "Error al registrar.", "error");
    setLoading(false);
    return;
  }

  showToast("Registro exitoso. Redirigiendo...", "success");
  setTimeout(() => navigate("/"), 1500);
} catch (error) {
  console.error("Error:", error);
  showToast("Error de conexión con el servidor.", "error");
} finally {
  setLoading(false);
}

};

return ( <div className="reg-root">
{toast.message && (
<div className={`toast ${toast.type}`}>{toast.message}</div>
)} <main className="reg-main"> <section className="reg-form"> <div className="form-inner"> <h1 className="title">Crea tu cuenta</h1> <p className="subtitle">Ingresa tus datos para comenzar</p>
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
                />
                {errors.nombreUsuario && (
                  <p className="error">{errors.nombreUsuario}</p>
                )}
              </div>

              <div className="input-group">
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  type="text"
                />
                {errors.nombre && (
                  <p className="error">{errors.nombre}</p>
                )}
              </div>

              <div className="input-group">
                <label>Apellido Paterno</label>
                <input
                  name="apellidoP"
                  value={formData.apellidoP}
                  onChange={handleChange}
                  type="text"
                />
                {errors.apellidoP && (
                  <p className="error">{errors.apellidoP}</p>
                )}
              </div>

              <div className="input-group">
                <label>Apellido Materno</label>
                <input
                  name="apellidoM"
                  value={formData.apellidoM}
                  onChange={handleChange}
                  type="text"
                />
                {errors.apellidoM && (
                  <p className="error">{errors.apellidoM}</p>
                )}
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
                />
                {errors.telefonoUsuario && (
                  <p className="error">{errors.telefonoUsuario}</p>
                )}
              </div>

              <div className="input-group">
                <label>Correo electrónico</label>
                <input
                  name="correoUsuario"
                  value={formData.correoUsuario}
                  onChange={handleChange}
                  type="email"
                  readOnly={!!token}
                />
                {errors.correoUsuario && (
                  <p className="error">{errors.correoUsuario}</p>
                )}
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <input
                  name="contrasenaUsuario"
                  value={formData.contrasenaUsuario}
                  onChange={handleChange}
                  type="password"
                />
                {errors.contrasenaUsuario && (
                  <p className="error">{errors.contrasenaUsuario}</p>
                )}
              </div>

              <div className="input-group">
                <label>Confirmar contraseña</label>
                <input
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  type="password"
                />
                {errors.confirmarContrasena && (
                  <p className="error">{errors.confirmarContrasena}</p>
                )}
              </div>
            </div>
          </div>

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
  </main>
</div>
);
}

export default Registro;
