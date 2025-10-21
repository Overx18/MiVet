//Instancia de Axios configurada (baseURL, interceptors para JWT)
// frontend/src/api/axios.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Toma la URL del archivo .env
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;