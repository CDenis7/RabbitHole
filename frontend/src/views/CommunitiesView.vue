<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import apiClient from '@/services/api';
import CommunityCard from '@/components/CommunityCard.vue';
import { useAuthStore } from '@/stores/auth';

const communities = ref([]);
const isLoading = ref(true);
const error = ref(null);
const authStore = useAuthStore();

const fetchCommunities = async () => {
  try {
    isLoading.value = true;
    const response = await apiClient.get('/communities');
    communities.value = response.data;
  } catch (err) {
    console.error('Error fetching communities:', err);
    error.value = 'Could not load communities. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchCommunities);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Discover Communities</h1>
      <RouterLink
        v-if="authStore.isAuthenticated"
        to="/communities/create"
        class="btn btn-primary"
      >
        Create a Hole
      </RouterLink>
    </div>
    <div v-if="isLoading" class="text-center p-10">
      <span class="loading loading-lg loading-spinner text-primary"></span>
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>
    <div v-else-if="communities.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CommunityCard
        v-for="community in communities"
        :key="community.id"
        :community="community"
      />
    </div>
    
    <div v-else class="text-center p-10 bg-base-200 rounded-lg">
        <p>There is no community yet.</p>
        <p class="text-sm mt-2">Be the first to create one!</p>
    </div>
  </div>
</template>
