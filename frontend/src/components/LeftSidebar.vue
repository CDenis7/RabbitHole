<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import apiClient from '@/services/api';

const popularHoles = ref([]);
const recentHoles = ref([]);
const isLoading = ref(true);

const fetchSidebarData = async () => {
  try {
    isLoading.value = true;
    const response = await apiClient.get('/communities/sidebar');
    popularHoles.value = response.data.popular || [];
    recentHoles.value = response.data.recent || [];
  } catch (error) {
    console.error("Error fetching sidebar data:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchSidebarData);
</script>

<template>
  <div class="space-y-6">

    <div class="bg-base-200 rounded-lg shadow p-4">
        <RouterLink to="/communities" class="btn btn-primary w-full">
            Explore Holes
        </RouterLink>
    </div>

    <div v-if="!isLoading" class="bg-base-200 rounded-lg shadow">
      <h3 class="font-bold p-4 pb-2 uppercase text-xs text-base-content/60">Popular Holes</h3>
      <div class="flex flex-col p-2 space-y-1">
        <RouterLink
          v-for="hole in popularHoles"
          :key="hole.id"
          :to="`/community/${hole.id}`"
          class="flex items-center p-2 rounded-md hover:bg-base-300 transition-colors duration-200 w-full"
        >
          <img
            :src="hole.image_url || `https://placehold.co/24x24/3abff8/000000?text=${hole.name.charAt(0).toUpperCase()}`"
            alt="Hole Icon"
            class="w-6 h-6 rounded-full mr-3"
          />
          <span class="font-medium text-sm">h/{{ hole.name }}</span>
        </RouterLink>
      </div>
    </div>

    <div v-if="!isLoading" class="bg-base-200 rounded-lg shadow">
      <h3 class="font-bold p-4 pb-2 uppercase text-xs text-base-content/60">Recent Holes</h3>
      <div class="flex flex-col p-2 space-y-1">
        <RouterLink
          v-for="hole in recentHoles"
          :key="hole.id"
          :to="`/community/${hole.id}`"
          class="flex items-center p-2 rounded-md hover:bg-base-300 transition-colors duration-200 w-full"
        >
          <img
            :src="hole.image_url || `https://placehold.co/24x24/3abff8/000000?text=${hole.name.charAt(0).toUpperCase()}`"
            alt="Hole Icon"
            class="w-6 h-6 rounded-full mr-3"
          />
          <span class="font-medium text-sm">h/{{ hole.name }}</span>
        </RouterLink>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-6">
        <div class="skeleton h-12 w-full"></div>
        <div class="skeleton h-32 w-full"></div>
        <div class="skeleton h-32 w-full"></div>
    </div>

  </div>
</template>