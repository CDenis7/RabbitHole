// src/services/api.js
import axios from 'axios';
// Importăm store-ul de autentificare pentru a putea apela acțiunea de logout
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pentru cereri (adaugă token-ul)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- INTERCEPTOR NOU PENTRU RĂSPUNSURI ---
// Acest interceptor verifică fiecare răspuns de la backend.
apiClient.interceptors.response.use(
  // Dacă răspunsul este OK (ex: status 200), îl lasă să treacă
  (response) => {
    return response;
  },
  // Dacă răspunsul este o eroare, o procesează
  (error) => {
    // Verificăm dacă eroarea este un status 403 (Forbidden)
    if (error.response && error.response.status === 403) {
      // Dacă da, înseamnă că sesiunea este invalidă
      const authStore = useAuthStore();
      console.log('Sesiune invalidă. Se efectuează logout...');
      // Apelăm acțiunea de logout pentru a curăța datele și a redirecționa utilizatorul
      authStore.logout();
    }
    // Returnăm eroarea pentru a putea fi gestionată și în componenta care a făcut cererea
    return Promise.reject(error);
  }
);


export default apiClient;
