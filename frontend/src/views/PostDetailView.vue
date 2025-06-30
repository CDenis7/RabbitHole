<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import apiClient from '@/services/api';
import CommentItem from '@/components/CommentItem.vue';
import AddCommentForm from '@/components/AddCommentForm.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const post = ref(null);
const isLoading = ref(true);
const error = ref(null);

const carouselContainer = ref(null);

const fetchPost = async (id) => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/posts/${id}`);
    post.value = response.data;
  } catch (err) {
    console.error(`Eroare la preluarea postării ${id}:`, err);
    error.value = 'Postarea nu a putut fi încărcată sau nu a fost găsită.';
    post.value = null;
  } finally {
    isLoading.value = false;
  }
};

const handleCommentAction = () => { fetchPost(route.params.id); };

onMounted(() => { fetchPost(route.params.id); });
watch(() => route.params.id, (newId) => { if (newId) fetchPost(newId); });

// --- LOGICA NOUĂ PENTRU CARUSEL ---
const changeSlide = (direction) => {
    if (!carouselContainer.value) return;
    const scrollAmount = carouselContainer.value.offsetWidth;
    carouselContainer.value.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
};
</script>

<template>
  <div>
    <div v-if="isLoading" class="text-center p-10"><span class="loading loading-lg loading-spinner text-primary"></span></div>
    <div v-else-if="error" class="alert alert-error"><span>{{ error }}</span></div>
    <article v-else-if="post" class="bg-base-200 p-4 sm:p-6 rounded-lg shadow-lg">
      <div class="text-sm text-base-content/70 mb-2">
        <span>Posted by <RouterLink :to="`/user/${post.author}`" class="link link-hover">r/{{ post.author }}</RouterLink> in <RouterLink :to="`/community/${post.community_id}`" class="font-bold text-secondary link link-hover">h/{{ post.community_name }}</RouterLink></span>
      </div>
      <h1 class="text-3xl lg:text-4xl font-bold mb-4">{{ post.title }}</h1>
     
      <div class="prose max-w-none space-y-4">
        <p v-if="post.body" class="text-base lg:text-lg">{{ post.body }}</p>
       
                <div v-if="post.media && post.media.length > 0" class="relative">
          <div ref="carouselContainer" class="carousel w-full h-[70vh] rounded-lg bg-black snap-x snap-mandatory overflow-x-auto">
              <div v-for="(mediaItem, index) in post.media" :key="mediaItem.url" :id="`post-${post.id}-slide-${index}`" class="carousel-item relative w-full h-full flex-shrink-0 snap-center flex justify-center items-center">
                  <img v-if="mediaItem.type === 'image'" :src="`http://localhost:3001${mediaItem.url}`" class="h-full w-auto object-contain" />
                  <video v-else-if="mediaItem.type === 'video'" :src="`http://localhost:3001${mediaItem.url}`" controls class="h-full w-auto"></video>
              </div>
          </div>
          <div v-if="post.media.length > 1" class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <button @click.stop="changeSlide(-1)" class="btn btn-circle">❮</button>
              <button @click.stop="changeSlide(1)" class="btn btn-circle">❯</button>
          </div>
        </div>
      </div>
     
      <div class="divider my-6"></div>
     
      <AddCommentForm v-if="authStore.isAuthenticated" :post-id="post.id" @comment-added="handleCommentAction" />
      <div v-else class="mt-4 p-4 bg-base-300 rounded-md text-center"><p>Trebuie să fii <RouterLink to="/login" class="link link-primary">autentificat</RouterLink> pentru a comenta.</p></div>
      <div class="divider mt-6"></div>
      <h3 class="text-2xl font-bold mb-4">Comentarii</h3>
      <div class="mt-4">
        <CommentItem v-for="comment in post.comments" :key="comment.id" :comment="comment" :post-id="post.id" @comment-deleted="handleCommentAction" @comment-updated="handleCommentAction" @comment-added="handleCommentAction" />
      </div>
    </article>
  </div>
</template>