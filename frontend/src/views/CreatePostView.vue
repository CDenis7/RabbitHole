<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

const router = useRouter();
const communities = ref([]);
const selectedCommunity = ref(null);
const title = ref('');
const body = ref('');
const files = ref([]);
const previewUrls = ref([]);
const isLoading = ref(false);
const error = ref(null);

const fetchCommunities = async () => {
  try {
    const response = await apiClient.get('/communities');
    communities.value = response.data;
  } catch (error) {
    error.value = "I couldn't load the holes.";
  }
};

onMounted(fetchCommunities);

const handleFileChange = (event) => {
  files.value = Array.from(event.target.files);
  previewUrls.value = files.value.map(file => URL.createObjectURL(file));
};

const handleSubmit = async () => {
  if (!selectedCommunity.value || !title.value.trim()) {
    error.value = 'Hole and title are required.';
    return;
  }
 
  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('communityId', selectedCommunity.value);
  if (body.value.trim()) {
    formData.append('body', body.value);
  }
  if (files.value.length > 0) {
    files.value.forEach(file => {
      formData.append('files', file);
    });
  }

  try {
    isLoading.value = true;
    error.value = null;
    
    const response = await apiClient.post('/posts', formData);
    
    router.push({ name: 'post-detail', params: { id: response.data.id } });
  } catch (err) {
    console.error('Error creating post:', err);
    error.value = err.response?.data?.error || 'An error occurred.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Create a Post</h1>
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label"><span class="label-text">Hole</span></label>
            <select v-model="selectedCommunity" class="select select-bordered w-full" required>
              <option disabled :value="null">Select a Hole</option>
              <option v-for="community in communities" :key="community.id" :value="community.id">
                h/{{ community.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label"><span class="label-text">Title</span></label>
            <input v-model="title" type="text" placeholder="Un titlu interesant" class="input input-bordered w-full" required />
          </div>
          <div>
            <label class="label"><span class="label-text">Text (Optional)</span></label>
            <textarea v-model="body" class="textarea textarea-bordered h-36 w-full" placeholder="Scrie ceva aici..."></textarea>
          </div>
          <div>
            <label class="label"><span class="label-text">Images/Videos (Optional)</span></label>
            <input type="file" @change="handleFileChange" multiple class="file-input file-input-bordered w-full" accept="image/*,video/*"/>
          </div>
          <div v-if="previewUrls.length" class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            <img v-for="url in previewUrls" :key="url" :src="url" class="rounded-lg object-cover h-28 w-full"/>
          </div>
          <div v-if="error" class="alert alert-error text-sm mt-4"><span>{{ error }}</span></div>
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="loading loading-spinner"></span>
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>