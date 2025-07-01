<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import PostCard from '@/components/PostCard.vue';

const route = useRoute();
const profile = ref(null);
const isLoading = ref(true);
const error = ref(null);
const activeTab = ref('posts'); 

const username = computed(() => route.params.username);

const fetchData = async (user) => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await apiClient.get(`/users/${user}`);
    profile.value = response.data;
  } catch (err) {
    console.error(`Error retrieving profile for ${user}:`, err);
    error.value = 'The user could not be loaded or was not found.';
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
            <div class="mb-8 p-6 bg-base-200 rounded-lg shadow-md">
        <h1 class="text-4xl font-bold">r/{{ profile.user.username }}</h1>
        <p class="text-sm text-base-content/70 mt-1">Member since: {{ new Date(profile.user.created_at).toLocaleDateString() }}</p>
      </div>
     
            <div role="tablist" class="tabs tabs-lifted">
        <a role="tab" class="tab" :class="{'tab-active': activeTab === 'posts'}" @click="activeTab = 'posts'">Posts></a>
        <a role="tab" class="tab" :class="{'tab-active': activeTab === 'comments'}" @click="activeTab = 'comments'">Comments</a>
      </div>

            <div class="bg-base-200 p-4 rounded-b-lg rounded-tr-lg">
                <div v-if="activeTab === 'posts'">
          <div v-if="profile.posts.length > 0">
            <PostCard v-for="post in profile.posts" :key="post.id" :post="post" />
          </div>
          <div v-else class="text-center p-6"><p>This user has no posts.</p></div>
        </div>
       
                <div v-if="activeTab === 'comments'">
            <div v-if="profile.comments.length > 0">
                <div v-for="comment in profile.comments" :key="comment.id" class="p-4 bg-base-100 rounded-lg mb-2 shadow">
                    <p class="text-base-content">{{ comment.content }}</p>
                    <p class="text-xs text-base-content/60 mt-2">
                        commented on <RouterLink :to="`/post/${comment.post_id}`" class="link link-hover">{{ comment.post_title }}</RouterLink>
                    </p>
                </div>
            </div>
          <div v-else class="text-center p-6"><p>This user has no comments.</p></div>
        </div>
      </div>
    </div>
  </div>
</template>