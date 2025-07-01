import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/services/api';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const router = useRouter();
  const isAuthenticated = computed(() => !!token.value);
  const userUsername = computed(() => user.value?.username || 'Guest');
  async function register(credentials) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token.value = null;
    user.value = null;

    const response = await apiClient.post('/auth/register', credentials);
    const responseData = response.data;
    
    token.value = responseData.token;
    user.value = responseData.user;
    localStorage.setItem('token', responseData.token);
    localStorage.setItem('user', JSON.stringify(responseData.user));

    router.push('/');
  }
  async function login(credentials) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token.value = null;
    user.value = null;
    
    const response = await apiClient.post('/auth/login', credentials);
    const responseData = response.data;

    token.value = responseData.token;
    user.value = responseData.user;
    localStorage.setItem('token', responseData.token);
    localStorage.setItem('user', JSON.stringify(responseData.user));

    router.push('/');
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    router.push('/login');
  }

  return {
    token,
    user,
    isAuthenticated,
    userUsername,
    register,
    login, 
    logout,
  };
});
