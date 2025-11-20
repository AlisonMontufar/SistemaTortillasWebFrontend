const API_BASE_URL = "https://sistematortillasbackend-1.onrender.com";

class ApiRegistro {
  // Obtener todas las empresas
  static async obtenerEmpresas() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Empresa`, {
        headers: { accept: "text/plain" },
      });

      if (!response.ok) throw new Error("Error al obtener empresas");

      return await response.json();
    } catch (error) {
      console.error("Error en obtenerEmpresas:", error);
      throw error;
    }
  }

  // Buscar empresa por dominio de correo
  static async obtenerEmpresaPorCorreo(correo) {
    try {
      const empresas = await this.obtenerEmpresas();
      const dominio = correo.split("@")[1]?.toLowerCase() || "";

      const empresaEncontrada = empresas.find((empresa) => {
        const nombre = empresa.nombreEmpresa.toLowerCase();
        return dominio.includes(nombre);
      });

      return empresaEncontrada ? empresaEncontrada.id : null;
    } catch (error) {
      console.error("Error en obtenerEmpresaPorCorreo:", error);
      return null;
    }
  }

  // Registrar nuevo usuario
  static async registrarUsuario(usuarioData) {
    try {
      // Intentar detectar empresa según el correo
      const fkEmpresaDetectada = await this.obtenerEmpresaPorCorreo(
        usuarioData.correoUsuario
      );

      // Si encuentra empresa, la asigna
      const usuarioConEmpresa = {
        ...usuarioData,
        fkEmpresa: fkEmpresaDetectada ?? 0,
      };

      const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioConEmpresa),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar el usuario.");
      }

      return data;
    } catch (error) {
      console.error("Error en registrarUsuario:", error);
      throw error;
    }
  }

  // Verificar si el nombre de usuario está disponible 
  static async verificarUsuarioDisponible(nombreUsuario) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/check-username/${nombreUsuario}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar usuario.");
      }

      return data;
    } catch (error) {
      console.error("Error en verificarUsuarioDisponible:", error);
      throw error;
    }
  }

  // Verificar si el correo está disponible
  static async verificarCorreoDisponible(correo) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/check-email/${correo}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar correo.");
      }

      return data;
    } catch (error) {
      console.error("Error en verificarCorreoDisponible:", error);
      throw error;
    }
  }
}

export default ApiRegistro;
