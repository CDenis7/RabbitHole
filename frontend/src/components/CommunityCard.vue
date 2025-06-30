<!-- src/components/CommunityCard.vue -->
<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  community: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <RouterLink 
    :to="`/community/${community.id}`" 
    class="card bg-base-200 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
  >
    <figure class="px-10 pt-10">
      <!-- Placeholder image, or use community.image_url if available -->
      <img 
        :src="community.image_url || 'https://placehold.co/400x225/1d232a/3abff8?text=r/' + community.name" 
        alt="Community Image" 
        class="rounded-xl h-40 w-full object-cover" 
      />
    </figure>
    <div class="card-body items-center text-center">
      <h2 class="card-title font-bold">r/{{ community.name }}</h2>
      <p class="text-sm text-base-content/70">{{ community.description || 'No description available.' }}</p>
      <div class="card-actions mt-2">
        <!-- Placeholder for member count -->
        <div class="badge badge-outline">1,234 members</div>
      </div>
    </div>
  </RouterLink>
</template>
