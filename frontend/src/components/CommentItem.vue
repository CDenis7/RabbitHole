<!-- src/components/CommentItem.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import AddCommentForm from '@/components/AddCommentForm.vue';

const props = defineProps({
  comment: { type: Object, required: true },
  postId: { type: [Number, String], required: true },
  communityId: { type: [Number, String], required: false },
  communityName: { type: String, required: false }
});

const emit = defineEmits(['comment-deleted', 'comment-updated', 'comment-added']);
const authStore = useAuthStore();
const router = useRouter();
const localVoteCount = ref(props.comment.vote_count);
const isEditing = ref(false);
const editedContent = ref(props.comment.content);
const isReplying = ref(false);

const handleVote = async (value) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return; }
  const oldValue = localVoteCount.value;
  localVoteCount.value += value;
  try {
    await apiClient.post('/votes', { voteableId: props.comment.id, voteableType: 'comment', value: value });
  } catch (error) {
    localVoteCount.value = oldValue;
    console.error("Error casting vote:", error);
  }
};

const handleUpdate = async () => {
    if (!editedContent.value.trim()) return;
    try {
        await apiClient.put(`/comments/${props.comment.id}`, { content: editedContent.value });
        isEditing.value = false;
        emit('comment-updated');
    } catch (error) {
        console.error("Eroare la actualizarea comentariului:", error);
    }
};

const handleDelete = async () => {
    try {
        await apiClient.delete(`/comments/${props.comment.id}`);
        emit('comment-deleted');
    } catch (error) {
        console.error("Eroare la ștergerea comentariului:", error);
    }
};

const handleReplyAdded = () => {
    isReplying.value = false;
    emit('comment-added');
};
</script>

<template>
  <div class="p-3 my-2 bg-base-100 rounded-lg">
    <div v-if="!isEditing">
        <p class="text-sm">
            <span class="font-semibold text-secondary">u/{{ comment.author }}</span>
        </p>
        <p class="text-base-content py-1">{{ comment.content }}</p>
        <div class="flex items-center gap-1 mt-1 text-xs">
          <button @click="handleVote(1)" class="btn btn-ghost btn-xs">⬆️</button>
          <span class="font-bold min-w-[1rem] text-center">{{ localVoteCount }}</span>
          <button @click="handleVote(-1)" class="btn btn-ghost btn-xs">⬇️</button>
          <button @click="isReplying = !isReplying" class="btn btn-ghost btn-xs font-bold">Reply</button>
          <template v-if="authStore.isAuthenticated && authStore.user?.id === comment.user_id">
              <button @click="isEditing = true" class="btn btn-ghost btn-xs font-bold">Edit</button>
              <button @click="handleDelete" class="btn btn-ghost btn-xs font-bold text-error">Delete</button>
          </template>
        </div>
    </div>
    <div v-else>
        <textarea v-model="editedContent" class="textarea textarea-bordered w-full"></textarea>
        <div class="flex justify-end gap-2 mt-2">
            <button @click="isEditing = false" class="btn btn-sm btn-ghost">Anulează</button>
            <button @click="handleUpdate" class="btn btn-sm btn-primary">Salvează</button>
        </div>
    </div>
    <div v-if="isReplying" class="mt-2">
        <AddCommentForm
            :post-id="postId"
            :parent-comment-id="comment.id"
            :community-id="communityId"
            :community-name="communityName"
            @comment-added="handleReplyAdded"
        />
    </div>
    <div v-if="comment.children && comment.children.length > 0" class="ml-4 pl-4 border-l-2 border-base-300 mt-3">
      <CommentItem
        v-for="childComment in comment.children"
        :key="childComment.id"
        :comment="childComment"
        :post-id="postId"
        :community-id="communityId"
        :community-name="communityName"
        @comment-deleted="$emit('comment-deleted')"
        @comment-updated="$emit('comment-updated')"
        @comment-added="$emit('comment-added')"
      />
    </div>
  </div>
</template>