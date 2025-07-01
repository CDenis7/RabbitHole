<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';

const route = useRoute();
const router = useRouter();
const postId = route.params.id;

const title = ref('');
const body = ref('');
const existingMedia = ref([]);
const newFiles = ref([]);
const previewUrls = ref([]);
const filesToDelete = ref([]);
const isLoading = ref(false);
const error = ref(null);

const fetchPostData = async () => {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    title.value = response.data.title;
    body.value = response.data.body || '';
    existingMedia.value = response.data.media || [];
  } catch (error) {
    error.value = 'We were unable to load the post data.';
  }
};
onMounted(fetchPostData);

const removeExistingMedia = (index, url) => {
  existingMedia.value.splice(index, 1);
  filesToDelete.value.push(url);
};

const handleFileChange = (event) => {
  newFiles.value = Array.from(event.target.files);
  previewUrls.value = newFiles.value.map(file => URL.createObjectURL(file));
};

const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('body', body.value);
  formData.append('existingMedia', JSON.stringify(existingMedia.value));
  formData.append('filesToDelete', JSON.stringify(filesToDelete.value));
  newFiles.value.forEach(file => formData.append('files', file));
  
  try {
    isLoading.value = true;
    error.value = null;
    await apiClient.put(`/posts/${postId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    router.push({ name: 'post-detail', params: { id: postId } });
  } catch (error) {
    error.value = 'An error occurred while saving.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Edit Post</h1>
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
             <label class="label"><span class="label-text">Title</span></label>
             <input v-model="title" type="text" class="input input-bordered w-full" />
          </div>
          <div>
             <label class="label"><span class="label-text">Text</span></label>
             <textarea v-model="body" class="textarea textarea-bordered h-36 w-full"></textarea>
          </div>
          <div v-if="existingMedia.length > 0">
            <label class="label"><span class="label-text">Existing Media</span></label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div v-for="(media, index) in existingMedia" :key="media.url" class="relative group">
                <img :src="`http://localhost:3001${media.url}`" class="rounded-lg object-cover h-28 w-full"/>
                <button @click.prevent="removeExistingMedia(index, media.url)" class="btn btn-xs btn-circle btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
            </div>
          </div>
          <div>
            <label class="label"><span class="label-text">Add New Media</span></label>
            <input type="file" @change="handleFileChange" multiple class="file-input file-input-bordered w-full" />
          </div>
          <div v-if="previewUrls.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-2">
             <img v-for="url in previewUrls" :key="url" :src="url" class="rounded-lg object-cover h-28 w-full"/>
          </div>
          <div v-if="error" class="alert alert-error text-sm mt-4"><span>{{ error }}</span></div>
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading" class="loading loading-spinner"></span>
                Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
