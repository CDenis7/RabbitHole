<!-- src/views/LoginView.vue -->
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Email-ul și parola sunt obligatorii.';
    return;
  }
  
  try {
    isLoading.value = true;
    error.value = null;
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    // Redirectarea se face automat în acțiunea din store
  } catch (err) {
    error.value = err.response?.data?.error || 'A apărut o eroare la login.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex justify-center items-center mt-10">
    <div class="card w-full max-w-sm bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center text-2xl">Welcome Back!</h2>
        
        <form @submit.prevent="handleLogin">
          <!-- Câmp pentru Email -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input 
              v-model="email"
              type="email" 
              placeholder="email@example.com" 
              class="input input-bordered" 
              required
            />
          </div>

          <!-- Câmp pentru Parolă -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Password</span>
            </label>
            <input 
              v-model="password"
              type="password" 
              placeholder="••••••••" 
              class="input input-bordered" 
              required
            />
          </div>

          <!-- Afișare eroare -->
          <div v-if="error" class="alert alert-error text-sm mt-4">
            <span>{{ error }}</span>
          </div>

          <!-- Buton de Submit -->
          <div class="form-control mt-6">
            <button class="btn btn-primary" type="submit" :disabled="isLoading">
              <span v-if="isLoading" class="loading loading-spinner"></span>
              Login
            </button>
          </div>
        </form>
        <div class="text-center mt-4 text-sm">
          <p>Don't have an account? 
            <RouterLink to="/register" class="link link-secondary">Register here</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
