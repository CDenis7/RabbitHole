<!-- src/views/HomeView.vue -->
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import apiClient from '../services/api.js';
import PostCard from '../components/PostCard.vue';

const posts = ref([]);
const page = ref(1);
const hasMore = ref(true);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const error = ref(null);
const observerTarget = ref(null);
const activeSort = ref('new'); // Starea pentru sortarea activă
let observer = null;

const fetchPosts = async (reset = false) => {
  if (reset) {
    posts.value = [];
    page.value = 1;
    hasMore.value = true;
  }
  if (!hasMore.value || isLoadingMore.value) return;

  if (page.value === 1) {
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }
  error.value = null;

  try {
    const response = await apiClient.get('/posts/feed', {
      params: { page: page.value, limit: 10, sort: activeSort.value }
    });
    
    posts.value.push(...response.data.posts);
    page.value++;
    hasMore.value = response.data.page < response.data.totalPages;

  } catch (err) {
    console.error('Eroare la preluarea postărilor:', err);
    error.value = 'Nu am putut încărca postările. Vă rugăm încercați mai târziu.';
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const changeSort = (sortType) => {
    if (activeSort.value === sortType) return;
    activeSort.value = sortType;
    fetchPosts(true); // Resetăm și reîncărcăm postările
};

const handlePostDeleted = (deletedPostId) => {
  posts.value = posts.value.filter(post => post.id !== deletedPostId);
};

// --- FIX: The observer logic has been corrected ---

// 1. Fetch the initial posts when the component mounts.
onMounted(() => {
  fetchPosts();
});

// 2. Use 'watch' to wait for the 'observerTarget' element to appear in the DOM.
watch(observerTarget, (target) => {
  if (target) {
    // 3. Once the element exists, create and attach the observer.
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value) {
          fetchPosts();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(target);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<template>
  <main>
    <!-- Bara de sortare -->
    <div class="bg-base-200 p-2 rounded-lg mb-4 flex items-center gap-2">
        <button 
            @click="changeSort('new')" 
            class="btn btn-sm" 
            :class="{ 'btn-primary': activeSort === 'new', 'btn-ghost': activeSort !== 'new' }"
        >
            Cele mai noi
        </button>
        <button 
            @click="changeSort('top')" 
            class="btn btn-sm"
            :class="{ 'btn-primary': activeSort === 'top', 'btn-ghost': activeSort !== 'top' }"
        >
            Top
        </button>
    </div>

    <!-- Restul template-ului -->
    <div v-if="isLoading" class="text-center p-10">
      <span class="loading loading-lg loading-spinner text-primary"></span>
    </div>
    <div v-else-if="error && posts.length === 0" class="alert alert-error">
      <span>{{ error }}</span>
    </div>
    <div v-else>
      <div v-if="posts.length > 0">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @post-deleted="handlePostDeleted"
        />
      </div>
      <div v-else class="text-center p-10 bg-base-200 rounded-lg">
        <p>Nu sunt postări de afișat.</p>
      </div>
      <div ref="observerTarget" class="h-10 text-center">
        <span v-if="isLoadingMore" class="loading loading-spinner text-primary"></span>
        <p v-if="!hasMore && posts.length > 0" class="text-base-content/60">Ați ajuns la final.</p>
      </div>
    </div>
  </main>
</template>
