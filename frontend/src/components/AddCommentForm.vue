<!-- src/components/AddCommentForm.vue -->
<script setup>
import { ref } from 'vue';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  postId: {
    type: [Number, String],
    required: true,
  },
  parentCommentId: {
    type: [Number, String],
    default: null,
  },
  communityId: {
    type: [Number, String],
    required: false,
  },
  communityName: {
    type: String,
    required: false,
  }
});

const emit = defineEmits(['comment-added']);
const authStore = useAuthStore();
const commentContent = ref('');
const isLoading = ref(false);
const error = ref(null);

const handleSubmit = async () => {
  // Debug logs to check props - ALWAYS RUNS
  console.log('=== ADDCOMMENTFORM DEBUG START ===');
  console.log('Props received in AddCommentForm:', {
    postId: props.postId,
    parentCommentId: props.parentCommentId,
    communityId: props.communityId,
    communityName: props.communityName
  });
  console.log('=== ADDCOMMENTFORM DEBUG END ===');

  // Validare suplimentară pentru a ne asigura că postId există
  if (!props.postId) {
      error.value = 'Eroare: ID-ul postării lipsește. Reîncărcați pagina.';
      return;
  }
  
  if (!commentContent.value.trim()) {
    error.value = 'Comentariul nu poate fi gol.';
    return;
  }
 
  try {
    isLoading.value = true;
    error.value = null;
   
    const payload = {
      postId: props.postId,
      content: commentContent.value,
      parentCommentId: props.parentCommentId,
    };

    // Add community information if available
    if (props.communityId) {
      payload.communityId = props.communityId;
    }
    if (props.communityName) {
      payload.communityName = props.communityName;
    }

    // Try different field names that backend might expect
    if (props.communityName) {
      payload.community_name = props.communityName; // snake_case version
    }
    if (props.communityId) {
      payload.community_id = props.communityId; // snake_case version
    }

    console.log('Payload being sent:', payload); // Debug log
    
    await apiClient.post('/comments', payload);
   
    emit('comment-added');
    commentContent.value = '';
  } catch (err) {
    console.error('Eroare detaliată la adăugarea comentariului:', err);
    console.error('Response data:', err.response?.data); // Additional debug info
    error.value = err.response?.data?.error || err.response?.data?.message || 'A apărut o eroare. Vă rugăm încercați din nou.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="mt-4 p-4 bg-base-300 rounded-lg">
    <p class="text-sm mb-2">Comentezi ca <span class="font-bold text-primary">{{ authStore.userUsername }}</span></p>
    <form @submit.prevent="handleSubmit">
      <textarea
        v-model="commentContent"
        class="textarea textarea-bordered w-full"
        placeholder="Ce părere ai?"
        rows="3"
      ></textarea>
     
      <div v-if="error" class="text-error text-sm mt-2">
        <span>{{ error }}</span>
      </div>
      <div class="flex justify-end mt-2">
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner"></span>
          Comentează
        </button>
      </div>
    </form>
  </div>
</template>