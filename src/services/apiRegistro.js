const API_BASE_URL = "http://localhost:5149";

class ApiRegistro {
  // Registrar nuevo usuario
  static async registrarUsuario(usuarioData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioData),
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
      const response = await fetch(`${API_BASE_URL}/api/v1/Auth/check-username/${nombreUsuario}`);
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
      const response = await fetch(`${API_BASE_URL}/api/v1/Auth/check-email/${correo}`);
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