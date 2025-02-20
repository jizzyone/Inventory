<script setup>
import InventoryList from "@/components/InventoryList.vue";


</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-indigo-600 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold">Спортивный инвентарь</router-link>
        <nav>
          <router-link
              to="/create"
              class="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-indigo-100"
          >
            + Добавить товар
          </router-link>
        </nav>
      </div>
    </header>

    <main class="container mx-auto py-6">
      <router-view></router-view>
    </main>

    <footer class="bg-gray-800 text-white p-4 mt-8">
      <div class="container mx-auto text-center">
        <p>© 2025 Магазин спортивного инвентаря</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>

</style>
