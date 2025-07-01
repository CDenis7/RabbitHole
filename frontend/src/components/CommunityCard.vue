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
            <img
        :src="community.image_url || 'https://placehold.co/400x225/1d232a/3abff8?text=h/' + community.name"
        alt="Community Image"
        class="rounded-xl h-40 w-full object-cover"
      />
    </figure>
    <div class="card-body items-center text-center">
      <h2 class="card-title font-bold">h/{{ community.name }}</h2>
      <p class="text-sm text-base-content/70">{{ community.description || 'No description available.' }}</p>
      <div class="card-actions mt-2">
      </div>
    </div>
  </RouterLink>
</template>