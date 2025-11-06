const API_BASE_URL = "http://localhost:5149";

class ApiAuth {
  // Login de usuario
  static async login(identificador, contrasenaUsuario) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificador: identificador.trim(),
          contrasenaUsuario: contrasenaUsuario,
        }),
      });

      // Intentar leer el body, incluso si está vacío
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Si la respuesta no fue exitosa
      if (!response.ok) {
        const errorMsg = data.message || "Usuario o contraseña incorrectos.";
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  }
}

export default ApiAuth;
