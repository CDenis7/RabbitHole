<!-- src/views/UserProfileView.vue -->
<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import PostCard from '@/components/PostCard.vue';

const route = useRoute();
const profile = ref(null);
const isLoading = ref(true);
const error = ref(null);
const activeTab = ref('posts'); // Tab-ul activ implicit

const username = computed(() => route.params.username);

const fetchData = async (user) => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await apiClient.get(`/users/${user}`);
    profile.value = response.data;
  } catch (err) {
    console.error(`Eroare la preluarea profilului pentru ${user}:`, err);
    error.value = 'Utilizatorul nu a putut fi încărcat sau nu a fost găsit.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData(username.value);
});

watch(username, (newUsername) => {
  if (newUsername) {
    fetchData(newUsername);
  }
});
</script>

<template>
  <div>
    <div v-if="isLoading" class="text-center p-10"><span class="loading loading-lg loading-spinner text-primary"></span></div>
    <div v-else-if="error" class="alert alert-error"><span>{{ error }}</span></div>
    <div v-else-if="profile">
      <!-- Header-ul Profilului -->
      <div class="mb-8 p-6 bg-base-200 rounded-lg shadow-md">
        <h1 class="text-4xl font-bold">u/{{ profile.user.username }}</h1>
        <p class="text-sm text-base-content/70 mt-1">Membru din: {{ new Date(profile.user.created_at).toLocaleDateString() }}</p>
      </div>
      
      <!-- Tab-uri pentru Postări și Comentarii -->
      <div role="tablist" class="tabs tabs-lifted">
        <a role="tab" class="tab" :class="{'tab-active': activeTab === 'posts'}" @click="activeTab = 'posts'">Postări</a>
        <a role="tab" class="tab" :class="{'tab-active': activeTab === 'comments'}" @click="activeTab = 'comments'">Comentarii</a>
      </div>

      <!-- Conținutul Tab-urilor -->
      <div class="bg-base-200 p-4 rounded-b-lg rounded-tr-lg">
        <!-- Secțiunea de Postări -->
        <div v-if="activeTab === 'posts'">
          <div v-if="profile.posts.length > 0">
            <PostCard v-for="post in profile.posts" :key="post.id" :post="post" />
          </div>
          <div v-else class="text-center p-6"><p>Acest utilizator nu are nicio postare.</p></div>
        </div>
        
        <!-- Secțiunea de Comentarii -->
        <div v-if="activeTab === 'comments'">
            <div v-if="profile.comments.length > 0">
                <div v-for="comment in profile.comments" :key="comment.id" class="p-4 bg-base-100 rounded-lg mb-2 shadow">
                    <p class="text-base-content">{{ comment.content }}</p>
                    <p class="text-xs text-base-content/60 mt-2">
                        comentat la <RouterLink :to="`/post/${comment.post_id}`" class="link link-hover">{{ comment.post_title }}</RouterLink>
                    </p>
                </div>
            </div>
          <div v-else class="text-center p-6"><p>Acest utilizator nu are niciun comentariu.</p></div>
        </div>
      </div>
    </div>
  </div>
</template>
