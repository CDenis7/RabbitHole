// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import PostDetailView from '../views/PostDetailView.vue';
import CommunitiesView from '../views/CommunitiesView.vue';
import CommunityDetailView from '../views/CommunityDetailView.vue';
import CreatePostView from '../views/CreatePostView.vue';
import SearchView from '../views/SearchView.vue';
import CreateCommunityView from '../views/CreateCommunityView.vue';
import CommunitySettingsView from '../views/CommunitySettingsView.vue';
import EditPostView from '../views/EditPostView.vue';
import UserProfileView from '../views/UserProfileView.vue'; // Am importat noul view

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/post/:id', name: 'post-detail', component: PostDetailView },
    { path: '/post/:id/edit', name: 'post-edit', component: EditPostView },
    { path: '/communities', name: 'communities', component: CommunitiesView },
    { path: '/communities/create', name: 'create-community', component: CreateCommunityView },
    { path: '/community/:id', name: 'community-detail', component: CommunityDetailView },
    { path: '/community/:id/settings', name: 'community-settings', component: CommunitySettingsView },
    { path: '/submit', name: 'create-post', component: CreatePostView },
    { path: '/search', name: 'search', component: SearchView },
    // --- RUTA NOUĂ PENTRU PROFIL ---
    { path: '/user/:username', name: 'user-profile', component: UserProfileView },
  ]
});

export default router;
