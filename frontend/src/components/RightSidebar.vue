<script setup>
import { ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import apiClient from '@/services/api';

const route = useRoute();
const communityData = ref(null);
const isLoading = ref(false);

const fetchCommunityDetails = async (id) => {
  if (!id) {
    communityData.value = null;
    return;
  }
  isLoading.value = true;
  try {
    const response = await apiClient.get(`/communities/${id}`);
    communityData.value = response.data;
  } catch (error) {
    console.error("Failed to fetch community details for sidebar", error);
    communityData.value = null;
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => route.params.id,
  (newId) => {
    if (route.name === 'community-detail') {
      fetchCommunityDetails(newId);
    } else {
      communityData.value = null;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="space-y-6">
        <div v-if="communityData" class="bg-base-200 p-4 rounded-lg shadow">
      <h3 class="font-bold mb-2 text-base">Despre h/{{ communityData.name }}</h3>
      <p class="text-sm text-base-content/80 mb-4">{{ communityData.description }}</p>
      <div class="divider my-2"></div>
      <div class="flex items-center space-x-4">
        <div class="text-center">
          <p class="font-bold text-lg">{{ communityData.member_count }}</p>
          <p class="text-xs uppercase">Members</p>
        </div>
      </div>
      <div class="divider my-2"></div>
      <p class="text-xs text-base-content/60">Created {{ new Date(communityData.created_at).toLocaleDateString() }}</p>
      <RouterLink to="/submit" class="btn btn-primary w-full mt-4">Create Post</RouterLink>
    </div>

        <div v-else class="bg-base-200 p-4 rounded-lg shadow">
      <h3 class="font-bold mb-2 text-base">Home</h3>
      <p class="text-sm text-base-content/80 mb-4">Your personal RabbitHole frontpage. Come here to check in with your favorite communities.</p>
       <div class="divider my-2"></div>
      <RouterLink to="/submit" class="btn btn-primary w-full">Create Post</RouterLink>
      <div class="mt-2"></div>
      <RouterLink to="/communities/create" class="btn btn-outline w-full">Create a Hole</RouterLink>
    </div>
   
         <div class="bg-base-200 p-4 rounded-lg shadow text-xs text-base-content/60">
        <p>User Agreement</p>
        <p>Privacy Policy</p>
        <p>Content Policy</p>
        <p>Moderator Code of Conduct</p>
        <div class="divider my-2"></div>
        <p>RabbitHole Inc. © 2025. All rights reserved.</p>
    </div>
  </div>
</template>