import api from "./api";

/**
 * Cria uma reserva autenticada (JWT via interceptor do api).
 * @param {{ sala_id: number, data: string, hora_inicio: string, hora_fim: string }} data
 */
export async function createReservation(data) {
  const response = await api.post("/reservas", data);
  return response.data;
}

/**
 * Lista reservas do usuário logado.
 * @returns {Promise<Array>}
 */
export async function getReservations() {
  const response = await api.get("/reservas");
  return response.data?.reservas ?? [];
}
