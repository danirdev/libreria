import axios from 'axios';

// Ahora la IP viene del archivo .env
// Si no encuentra el archivo (ej: en otra PC), usa localhost por defecto
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: baseURL
});

export default api;