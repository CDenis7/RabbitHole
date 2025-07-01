<script setup>
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import TheNavbar from './components/TheNavbar.vue';
import LeftSidebar from './components/LeftSidebar.vue';
import RightSidebar from './components/RightSidebar.vue';

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'rabbithole');
  document.documentElement.style.colorScheme = 'dark';
  document.body.style.backgroundColor = '#18181b';
  document.body.style.color = '#f4f4f5';
});
</script>

<template>
  <div class="bg-base-100 min-h-screen" data-theme="rabbithole">
    <TheNavbar />
    <main class="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div class="grid grid-cols-12 gap-4 lg:gap-6">
  
        <div class="hidden lg:block col-span-3">
          <div class="sticky top-20">
             <LeftSidebar />
          </div>
        </div>

        <div class="col-span-12 lg:col-span-9 xl:col-span-6">
          <RouterView />
        </div>

        <div class="hidden xl:block col-span-3">
          <div class="sticky top-20">
            <RightSidebar />
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>

div {
  background-color: hsl(240 4% 10%); 
  color: hsl(240 5% 96%); 
}
</style>