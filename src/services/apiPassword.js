const BASE_URL = "https://sistematortilla.onrender.com/api";

const ApiPassword = {
  // Paso 1: Enviar correo (usa Notification/send)
  solicitarRecuperacion: async (email) => {
    const response = await fetch(`${BASE_URL}/Notification/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        type: 1,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al enviar el correo de recuperación.");
    }

    const data = await response.json();
    return data;
  },

  // Paso 2: Verificar código
  verificarCodigo: async (email, code) => {
    const response = await fetch(`${BASE_URL}/Auth/verify-recovery-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      throw new Error("Código inválido o expirado.");
    }

    const data = await response.json().catch(() => ({})); // evita error si no hay JSON
    return data;
  },

  // Paso 3: Restablecer contraseña
  restablecerPassword: async (email, newPassword, confirmPassword) => {
    const response = await fetch(
      `${BASE_URL}/Auth/reset-password?email=${encodeURIComponent(email)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al restablecer la contraseña.");
    }

    const data = await response.json().catch(() => ({}));
    return data;
  },
};

export default ApiPassword;
