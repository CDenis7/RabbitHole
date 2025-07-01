<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter(); 
const authStore = useAuthStore();
const members = ref([]);
const community = ref(null);
const isLoading = ref(true);
const error = ref(null);
const deleteError = ref(null);

const communityId = computed(() => route.params.id);

const isOwner = computed(() => {
  return authStore.isAuthenticated && community.value && authStore.user?.id === community.value.owner_id;
});

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const [communityRes, membersRes] = await Promise.all([
      apiClient.get(`/communities/${communityId.value}`),
      apiClient.get(`/communities/${communityId.value}/members`),
    ]);
    community.value = communityRes.data;
    members.value = membersRes.data;
  } catch (err) {
    console.error('Failed to load hole settings:', err);
    error.value = "We were unable to load the hole settings.";
  } finally {
    isLoading.value = false;
  }
};

const handleRemoveMember = async (memberId) => {
  try {
    await apiClient.delete(`/communities/${communityId.value}/members/${memberId}`);
    members.value = members.value.filter(member => member.id !== memberId);
  } catch (err) {
    console.error('Failed to remove member:', err);
  }
};

const handleDeleteCommunity = async () => {
    deleteError.value = null;
    try {
        await apiClient.delete(`/communities/${communityId.value}`);
        router.push('/');
    } catch (err) {
        console.error('Failed to delete hole:', err);
        deleteError.value = err.response?.data?.error || 'An error occurred while deleting the hole.';
        const modal = document.getElementById('delete_community_modal');
        if (modal) modal.close();
    }
};

onMounted(fetchData);
</script>

<template>
  <div>
    <div v-if="isLoading" class="text-center p-10">
      <span class="loading loading-lg loading-spinner text-primary"></span>
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>
    <div v-else-if="community">
      <h1 class="text-3xl font-bold">Settings for h/{{ community.name }}</h1>
      <p class="mb-6 text-base-content/70">Manage hole members and settings.</p>

      <div class="divider"></div>

      <h2 class="text-2xl font-semibold mb-4">Members</h2>
      <div class="overflow-x-auto bg-base-200 p-4 rounded-lg">
        <table class="table w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.id" class="hover">
              <td>
                <span class="font-bold">{{ member.username }}</span>
              </td>
              <td>
                <span class="badge" :class="{ 'badge-primary': member.role === 'owner' }">{{ member.role }}</span>
              </td>
              <td>
                <button
                  v-if="isOwner && member.id !== community.owner_id"
                  @click="handleRemoveMember(member.id)"
                  class="btn btn-error btn-sm"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="isOwner" class="mt-8">
          <div class="divider"></div>
          <h2 class="text-2xl font-semibold mb-4 text-error">Danger Zone</h2>
          <div class="bg-error/10 border border-error/50 p-4 rounded-lg flex justify-between items-center">
              <div>
                  <h3 class="font-bold text-lg">Delete this hole</h3>
                  <p class="text-sm text-error/80">This action is irreversible. All posts, comments, and associated data will be permanently deleted.</p>
              </div>
              <button class="btn btn-error" onclick="delete_community_modal.showModal()">Delete Community</button>
          </div>
          <p v-if="deleteError" class="text-error text-sm mt-2">{{ deleteError }}</p>
      </div>

      <dialog id="delete_community_modal" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Confirm Delete</h3>
            <p class="py-4">Are you absolutely sure you want to delete the hole **h/{{ community.name }}**? This action cannot be undone.</p>
            <div class="modal-action">
                <form method="dialog">
                    <button class="btn">Cancel</button>
                    <button @click="handleDeleteCommunity" class="btn btn-error ml-2">Yes, delete</button>
                </form>
            </div>
        </div>
         <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>

    </div>
  </div>
</template>