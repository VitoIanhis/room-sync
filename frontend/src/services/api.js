import axios from 'axios';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

/**
 * Instância central da API do RoomSync.
 * Usa axios para falar com o backend da AC1.
 */
const api = axios.create({
  baseURL,
});

// Adiciona automaticamente o token JWT (se existir) em todas as requisições.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('roomsync_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

