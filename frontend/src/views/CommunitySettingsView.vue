<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore(); // Acum va fi folosit
const members = ref([]);
const community = ref(null);
const isLoading = ref(true);
const error = ref(null);

const communityId = computed(() => route.params.id);

// Verificăm dacă utilizatorul logat este proprietarul comunității
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
    console.error('Failed to load community settings:', err);
    error.value = "Nu am putut încărca setările comunității.";
  } finally {
    isLoading.value = false;
  }
};

const handleRemoveMember = async (memberId) => {
  // if (!window.confirm('Sunteți sigur că doriți să eliminați acest membru?')) return;
  try {
    await apiClient.delete(`/communities/${communityId.value}/members/${memberId}`);
    // Eliminăm membrul din lista locală pentru o actualizare instantanee
    members.value = members.value.filter(member => member.id !== memberId);
  } catch (err) {
    console.error('Failed to remove member:', err);
    // Aici se poate afișa o notificare de eroare
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
      <h1 class="text-3xl font-bold">Setări pentru h/{{ community.name }}</h1>
      <p class="mb-6">Gestionează membrii comunității.</p>

      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Utilizator</th>
              <th>Rol</th>
              <th>Acțiuni</th>
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
                  Elimină
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>