<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({ post: { type: Object, required: true } });
const emit = defineEmits(['post-deleted']);
const authStore = useAuthStore();
const router = useRouter();
const localVoteCount = ref(props.post.vote_count);
const userVote = ref(0);
const isVoting = ref(false);

const deleteModal = ref(null);
const carouselContainer = ref(null);

const handleVote = async (value) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return; }
  if (isVoting.value) return;
  isVoting.value = true;
  const oldValue = userVote.value;
  let voteToSend;
  let voteDifference;
  if (value === oldValue) {
    voteToSend = 0;
    voteDifference = -value;
    userVote.value = 0;
  }
  else {
    voteToSend = value;
    voteDifference = value - oldValue;
    userVote.value = value;
  }
  localVoteCount.value += voteDifference;
  try {
    await apiClient.post('/votes', { voteableId: props.post.id, voteableType: 'post', value: voteToSend });
  } catch (error) {
    console.error("Error casting vote:", error);
    localVoteCount.value -= voteDifference;
    userVote.value = oldValue;
  } finally {
    isVoting.value = false;
  }
};

const handleDelete = () => {
  deleteModal.value.showModal();
};

const confirmDelete = async () => {
  try {
    await apiClient.delete(`/posts/${props.post.id}`);
    emit('post-deleted', props.post.id);
  } catch (error) {
    console.error("Eroare la ștergerea postării:", error);
  }
};

const goToPostDetail = () => {
  router.push({ name: 'post-detail', params: { id: props.post.id } });
};

const changeSlide = (direction) => {
    if (!carouselContainer.value) return;
    const scrollAmount = carouselContainer.value.offsetWidth;
    carouselContainer.value.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
};
</script>

<template>
    <div class="card card-compact bg-base-200 shadow-sm mb-4 transition-all duration-300 border border-transparent hover:border-gray-700">
    <div class="flex">
           <div class="flex flex-col items-center p-2 bg-base-300/50 rounded-l-lg">
  <button 
    @click="handleVote(1)" 
    class="btn btn-ghost btn-sm p-1 transition-all duration-200" 
    :class="{ 
      'text-primary hover:text-primary/80': userVote === 1,
      'hover:text-primary/60': userVote !== 1 
    }" 
    :disabled="isVoting"
  >
    ⬆️
  </button>
  <span 
    class="font-bold text-xs transition-colors duration-200" 
    :class="{ 
      'text-primary': userVote === 1, 
      'text-error': userVote === -1,
      'text-base-content': userVote === 0
    }"
  >
    {{ localVoteCount }}
  </span>
  <button 
    @click="handleVote(-1)" 
    class="btn btn-ghost btn-sm p-1 transition-all duration-200" 
    :class="{ 
      'text-error hover:text-error/80': userVote === -1,
      'hover:text-error/60': userVote !== -1 
    }" 
    :disabled="isVoting"
  >
    ⬇️
  </button>
</div>
     
            <div class="card-body">
                <div class="text-xs text-base-content/70">
          <span>Posted by <RouterLink :to="`/user/${post.author}`" class="link link-hover">r/{{ post.author }}</RouterLink> in <RouterLink :to="`/community/${post.community_id}`" class="font-bold text-secondary link link-hover">h/{{ post.community_name }}</RouterLink></span>
        </div>
       
                <h2 class="card-title text-lg cursor-pointer" @click="goToPostDetail">
            {{ post.title }}
        </h2>
       
                <div class="mt-2 space-y-4 cursor-pointer" @click="goToPostDetail">
          <p v-if="post.body" class="text-sm text-base-content/90 line-clamp-3">{{ post.body }}</p>
         
                    <div v-if="post.media && post.media.length > 0" class="relative">
              <div ref="carouselContainer" class="carousel w-full h-96 rounded-lg bg-black snap-x snap-mandatory overflow-x-auto">
                  <div v-for="(mediaItem, index) in post.media" :key="mediaItem.url" :id="`card-${post.id}-slide-${index}`" class="carousel-item relative w-full h-full flex-shrink-0 snap-center flex justify-center items-center">
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
       
                <div class="card-actions justify-start items-center mt-3">
          <RouterLink :to="{ name: 'post-detail', params: { id: post.id } }" class="btn btn-ghost btn-xs">💬 {{ post.comment_count }} Comentarii</RouterLink>
          <div v-if="authStore.isAuthenticated && (authStore.user?.id === post.user_id || authStore.user?.id === post.community_owner_id)" class="dropdown dropdown-end">
                        <button @click.stop tabindex="0" role="button" class="btn btn-ghost btn-xs">...</button>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-32">
              <li v-if="authStore.user?.id === post.user_id"><RouterLink :to="{ name: 'post-edit', params: { id: post.id } }">✏️ Edit</RouterLink></li>
              <li><a @click.stop="handleDelete" class="text-error">🗑️ Delete</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
   
        <dialog ref="deleteModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Confirmare Ștergere</h3>
        <p class="py-4">Sunteți sigur?</p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Anulează</button>
            <button @click="confirmDelete" class="btn btn-error ml-2">Șterge</button>
          </form>
        </div>
      </div>
       <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>