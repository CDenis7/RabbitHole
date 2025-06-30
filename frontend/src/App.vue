<!-- src/App.vue -->
<script setup>
import { RouterView } from 'vue-router';
import TheNavbar from './components/TheNavbar.vue';
import LeftSidebar from './components/LeftSidebar.vue';
import RightSidebar from './components/RightSidebar.vue';
</script>

<template>
  <div class="bg-base-100 min-h-screen">
    <TheNavbar />
    <main class="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div class="grid grid-cols-12 gap-4 lg:gap-6">
        
        <!-- Left Sidebar: Hidden on small screens -->
        <div class="hidden lg:block col-span-3">
          <div class="sticky top-20">
             <LeftSidebar />
          </div>
        </div>

        <!-- Main Content: Takes full width on small screens -->
        <div class="col-span-12 lg:col-span-9 xl:col-span-6">
          <RouterView />
        </div>

        <!-- Right Sidebar: Hidden on small and medium screens -->
        <div class="hidden xl:block col-span-3">
          <div class="sticky top-20">
            <RightSidebar />
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
