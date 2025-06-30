<!-- src/components/TheNavbar.vue -->
<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';


const authStore = useAuthStore();
const router = useRouter();
const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value } });
    searchQuery.value = '';
  }
};

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <!-- --- MODIFICARE: Am adăugat clasele 'sticky top-0 z-50' --- -->
  <div class="navbar bg-base-300 shadow sticky top-0 z-50">
    <!-- Stânga: Logo și Nume -->
    <div class="navbar-start">
      <RouterLink to="/" class="btn btn-ghost text-xl font-bold">
         <img src="../assets/logo.png" alt="RabbitHole Logo" class="h-11 w-100 mr-23" />
      </RouterLink>
    </div>

    <!-- Centru: Bara de Căutare -->
    <div class="navbar-center w-1/2 lg:w-1/3">
      <form @submit.prevent="handleSearch" class="form-control w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Caută pe RabbitHole"
          class="input input-bordered w-full"
        />
      </form>
    </div>

    <!-- Dreapta: Acțiuni Utilizator -->
    <div class="navbar-end gap-2">
      <template v-if="!authStore.isAuthenticated">
        <RouterLink to="/login" class="btn btn-outline">Login</RouterLink>
        <RouterLink to="/register" class="btn btn-primary">Register</RouterLink>
      </template>
      <template v-else>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
             <div class="w-10 rounded-full">
                <img alt="User Avatar" src="https://placehold.co/40x40/3abff8/000000?text=U" />
              </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
            <li><RouterLink :to="`/user/${authStore.user.username}`">Profil</RouterLink></li>
            <li><a @click.prevent="handleLogout">Logout</a></li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>
