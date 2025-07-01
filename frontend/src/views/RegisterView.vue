<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const username = ref('');
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref(null);

const handleRegister = async () => {
  if (!username.value || !email.value || !password.value) {
    error.value = 'All fields are required.';
    return;
  }
  
  try {
    isLoading.value = true;
    error.value = null;
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });
  } catch (err) {
    error.value = err.response?.data?.error || 'An error occurred while registering.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex justify-center items-center mt-10">
    <div class="card w-full max-w-sm bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center text-2xl">Create an Account</h2>
        
        <form @submit.prevent="handleRegister">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Username</span>
            </label>
            <input 
              v-model="username"
              type="text" 
              placeholder="Your username" 
              class="input input-bordered" 
              required
            />
          </div>
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
          <div v-if="error" class="alert alert-error text-sm mt-4">
            <span>{{ error }}</span>
          </div>
          <div class="form-control mt-6">
            <button class="btn btn-primary" type="submit" :disabled="isLoading">
              <span v-if="isLoading" class="loading loading-spinner"></span>
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
