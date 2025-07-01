<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import apiClient from '@/services/api';
import PostCard from '@/components/PostCard.vue';

const route = useRoute();
const posts = ref([]);
const holes = ref([]);
const users = ref([]);
const isLoading = ref(true);
const error = ref(null);
const activeTab = ref('posts'); 

const query = computed(() => route.query.q || '');

const performSearch = async (searchQuery) => {
  if (!searchQuery) {
    posts.value = [];
    holes.value = [];
    users.value = [];
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    const response = await apiClient.get('/search', {
      params: { q: searchQuery }
    });
    posts.value = response.data.posts || [];
    holes.value = response.data.holes || [];
    users.value = response.data.users || [];
  } catch (err) {
    console.error('Error performing search:', err);
    error.value = 'An error occurred during the search.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  performSearch(query.value);
});

watch(query, (newQuery) => {
  performSearch(newQuery);
});
</script>

<template>
  <div>
    <div class="border-b border-base-300 mb-6">
        <p class="text-sm">Search results for</p>
        <h1 class="text-2xl font-bold">"{{ query }}"</h1>
       
                <div role="tablist" class="tabs tabs-bordered mt-4">
            <a role="tab" class="tab" :class="{'tab-active': activeTab === 'posts'}" @click="activeTab = 'posts'">Posts</a>
            <a role="tab" class="tab" :class="{'tab-active': activeTab === 'holes'}" @click="activeTab = 'holes'">Holes</a>
            <a role="tab" class="tab" :class="{'tab-active': activeTab === 'users'}" @click="activeTab = 'users'">Users</a>
        </div>
    </div>

        <div v-if="isLoading" class="text-center p-10">
      <span class="loading loading-lg loading-spinner text-primary"></span>
    </div>
        <div v-else-if="error" class="alert alert-error"><span>{{ error }}</span></div>
   
        <div v-show="activeTab === 'posts'">
        <div v-if="posts.length > 0">
            <PostCard v-for="post in posts" :key="post.id" :post="post" />
        </div>
        <div v-else class="text-center p-6 bg-base-200 rounded-lg"><p>No posts found for this query.</p></div>
    </div>

        <div v-show="activeTab === 'holes'">
        <div v-if="holes.length > 0" class="space-y-2">
            <div v-for="hole in holes" :key="hole.id" class="p-4 bg-base-200 rounded-lg flex items-center justify-between">
                <RouterLink :to="`/community/${hole.id}`" class="flex items-center gap-4">
                    <img :src="hole.image_url || `https://placehold.co/40x40/3abff8/000000?text=${hole.name.charAt(0).toUpperCase()}`" class="w-10 h-10 rounded-full"/>
                    <span class="font-bold">h/{{ hole.name }}</span>
                </RouterLink>
                <button class="btn btn-primary btn-sm">Join</button>
            </div>
        </div>
        <div v-else class="text-center p-6 bg-base-200 rounded-lg"><p>No holes found for this query.</p></div>
    </div>
   
        <div v-show="activeTab === 'users'">
        <div v-if="users.length > 0" class="space-y-2">
            <div v-for="user in users" :key="user.id" class="p-4 bg-base-200 rounded-lg">
                <RouterLink :to="`/user/${user.username}`" class="flex items-center gap-4">
                    <div class="avatar placeholder">
                        <div class="bg-neutral-focus text-neutral-content rounded-full w-10">
                            <span>{{ user.username.charAt(0).toUpperCase() }}</span>
                        </div>
                    </div>
                    <span class="font-bold">r/{{ user.username }}</span>
                </RouterLink>
            </div>
        </div>
        <div v-else class="text-center p-6 bg-base-200 rounded-lg"><p>No users found for this query.</p></div>
    </div>
  </div>
</template>