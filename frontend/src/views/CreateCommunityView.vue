<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

const router = useRouter();
const name = ref('');
const description = ref('');
const isLoading = ref(false);
const error = ref(null);

const handleSubmit = async () => {
  if (!name.value.trim()) {
    error.value = 'The community name is required.';
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;

    const payload = {
      name: name.value,
      description: description.value,
    };

    const response = await apiClient.post('/communities', payload);
    const newCommunity = response.data;
    router.push({ name: 'community-detail', params: { id: newCommunity.id } });

  } catch (err) {
    console.error('Error creating community:', err);
    error.value = err.response?.data?.error || 'An error occurred while creating the community.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 border-b border-base-300 pb-4">Create a Hole</h1>

    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
                    <div class="form-control">
            <label class="label">
              <span class="label-text">Hole Name</span>
              <span class="label-text-alt">without "h/""</span>
            </label>
            <input
              v-model="name"
              type="text"
              placeholder="ex: programming, ,music, etc."
              class="input input-bordered"
              required
            />
          </div>

                    <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea
              v-model="description"
              class="textarea textarea-bordered h-24"
              placeholder="Briefly describe what it is about in your hole."
            ></textarea>
          </div>
         
                    <div v-if="error" class="alert alert-error text-sm mt-4">
            <span>{{ error }}</span>
          </div>

                    <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="loading loading-spinner"></span>
             Create Hole
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>