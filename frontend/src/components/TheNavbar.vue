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
  <div class="navbar bg-base-300 shadow sticky top-0 z-50">
    <div class="navbar-start">
      <RouterLink to="/" class="btn btn-ghost text-sm sm:text-xl font-bold">
       <img 
         src="../assets/logo.png" 
         alt="RabbitHole Logo" 
         class="h-6 w-auto sm:h-8 md:h-10 lg:h-12" 
       />
      </RouterLink>
    </div>
    <div class="navbar-center hidden sm:flex sm:w-1/2 lg:w-1/3">
      <form @submit.prevent="handleSearch" class="form-control w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search the RabbitHole"
          class="input input-bordered w-full"
        />
      </form>
    </div>

    <div class="navbar-end gap-1 sm:gap-2">
      <div class="dropdown dropdown-end sm:hidden">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div tabindex="0" class="dropdown-content mt-3 z-[1] p-4 shadow bg-base-200 rounded-box w-80">
          <form @submit.prevent="handleSearch" class="form-control w-full">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search the RabbitHole"
              class="input input-bordered w-full"
            />
          </form>
        </div>
      </div>
      <template v-if="!authStore.isAuthenticated">
        <RouterLink to="/login" class="btn btn-outline btn-sm sm:btn-md">Login</RouterLink>
        <RouterLink to="/register" class="btn btn-primary btn-sm sm:btn-md">Register</RouterLink>
      </template>
      <template v-else>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
             <div class="w-8 sm:w-10 rounded-full">
                <img alt="User Avatar" src="https://placehold.co/40x40/3abff8/000000?text=U" />
              </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
            <li><RouterLink :to="`/user/${authStore.user.username}`">Profile</RouterLink></li>
            <li><a @click.prevent="handleLogout">Logout</a></li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>