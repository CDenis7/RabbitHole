<!-- src/views/CommunityDetailView.vue -->
<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import apiClient from '@/services/api';
import PostCard from '@/components/PostCard.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const community = ref(null);
const members = ref([]);
const isLoading = ref(true);
const error = ref(null);
const actionError = ref(null);
const isActionLoading = ref(false);

const posts = ref([]);
const page = ref(1);
const hasMore = ref(true);
const isLoadingMore = ref(false);
const observerTarget = ref(null);
const activeSort = ref('new');
let observer = null;

const isOwner = computed(() => authStore.isAuthenticated && community.value && authStore.user?.id === community.value.owner_id);
const isMember = computed(() => {
  if (!authStore.isAuthenticated || !members.value.length) return false;
  return members.value.some(member => member.id === authStore.user?.id);
});

const fetchInitialData = async (id) => {
  try {
    isLoading.value = true;
    error.value = null;
    const [communityRes, membersRes] = await Promise.all([
      apiClient.get(`/communities/${id}`),
      apiClient.get(`/communities/${id}/members`)
    ]);
    community.value = communityRes.data;
    members.value = membersRes.data;
    await fetchMorePosts(id, true);
  } catch (error) {
    error.value = 'Nu am putut încărca pagina comunității.';
  } finally {
    isLoading.value = false;
  }
};

const fetchMorePosts = async (id, reset = false) => {
  if (reset) {
    posts.value = [];
    page.value = 1;
    hasMore.value = true;
  }
  if (!hasMore.value || isLoadingMore.value) return;
  isLoadingMore.value = true;
  try {
    const response = await apiClient.get(`/communities/${id}/posts`, {
      params: { page: page.value, limit: 10, sort: activeSort.value }
    });
    posts.value.push(...response.data.posts);
    page.value++;
    hasMore.value = response.data.page < response.data.totalPages;
  } catch (err) {
    console.error('Eroare la încărcarea postărilor suplimentare:', err);
  } finally {
    isLoadingMore.value = false;
  }
};

const changeSort = (sortType) => {
    if (activeSort.value === sortType) return;
    activeSort.value = sortType;
    fetchMorePosts(route.params.id, true);
};

const handlePostDeleted = (deletedPostId) => {
  posts.value = posts.value.filter(post => post.id !== deletedPostId);
};

const handleJoinCommunity = async () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return; }
  isActionLoading.value = true;
  actionError.value = null;
  try {
    await apiClient.post(`/communities/${community.value.id}/join`);
    members.value.push({ id: authStore.user.id, username: authStore.user.username, role: 'member' });
  } catch (err) {
    actionError.value = err.response?.data?.error || 'A apărut o eroare.';
  } finally {
    isActionLoading.value = false;
  }
};

const handleLeaveCommunity = async () => {
  isActionLoading.value = true;
  actionError.value = null;
  try {
    await apiClient.delete(`/communities/${community.value.id}/leave`);
    members.value = members.value.filter(member => member.id !== authStore.user.id);
  } catch (err) {
    actionError.value = err.response?.data?.error || 'A apărut o eroare.';
  } finally {
    isActionLoading.value = false;
  }
};

onMounted(() => {
  fetchInitialData(route.params.id);
});

watch(() => route.params.id, (newId) => {
  if (newId) fetchInitialData(newId);
});

watch(observerTarget, (target) => {
  if (target) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value) {
          fetchMorePosts(route.params.id);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(target);
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <div>
    <div v-if="isLoading" class="text-center p-10"><span class="loading loading-lg loading-spinner text-primary"></span></div>
    <div v-else-if="error" class="alert alert-error"><span>{{ error }}</span></div>
    <div v-else-if="community">
      <div class="mb-8 p-6 bg-base-200 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold">r/{{ community.name }}</h1>
            <p class="mt-2 text-base-content/80">{{ community.description }}</p>
          </div>
          <RouterLink v-if="isOwner" :to="`/community/${community.id}/settings`" class="btn btn-secondary">Gestionează Membrii</RouterLink>
        </div>
        <div class="mt-4">
          <button v-if="authStore.isAuthenticated && !isMember" @click="handleJoinCommunity" class="btn btn-primary btn-sm" :disabled="isActionLoading">
            <span v-if="isActionLoading" class="loading loading-spinner"></span>
            Intră în comunitate
          </button>
          <button v-else-if="!authStore.isAuthenticated" @click="() => router.push('/login')" class="btn btn-primary btn-sm">
            Intră în comunitate
          </button>
          <button v-if="isMember && !isOwner" @click="handleLeaveCommunity" class="btn btn-outline btn-sm" :disabled="isActionLoading">
             <span v-if="isActionLoading" class="loading loading-spinner"></span>
            ✓ Membru (Părăsește)
          </button>
          <div v-if="isOwner" class="badge badge-primary gap-2 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Proprietar
          </div>
          <p v-if="actionError" class="text-error text-xs mt-2">{{ actionError }}</p>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Postări</h2>
      <div class="bg-base-200 p-2 rounded-lg mb-4 flex items-center gap-2">
        <button @click="changeSort('new')" class="btn btn-sm" :class="{ 'btn-primary': activeSort === 'new', 'btn-ghost': activeSort !== 'new' }">Cele mai noi</button>
        <button @click="changeSort('top')" class="btn btn-sm" :class="{ 'btn-primary': activeSort === 'top', 'btn-ghost': activeSort !== 'top' }">Top</button>
      </div>

      <div v-if="posts.length > 0">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @post-deleted="handlePostDeleted"
        />
      </div>
      <div v-else class="text-center p-10 bg-base-200 rounded-lg">
        <p>Nu există postări în această comunitate.</p>
      </div>

      <div ref="observerTarget" class="h-10 text-center">
        <span v-if="isLoadingMore" class="loading loading-spinner text-primary"></span>
        <p v-if="!hasMore && posts.length > 0" class="text-base-content/60">Ați ajuns la final.</p>
      </div>
    </div>
  </div>
</template>
