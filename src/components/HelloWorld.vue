<script setup>
defineProps({
  msg: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="p-4 bg-gray-100 rounded-lg shadow">
    <h1 class="text-3xl font-bold text-green-500 mb-4">{{ msg }}</h1>
    <h3 class="text-lg text-gray-700">
      <div class="text-xl text-red-500">You've successfully created a project with</div>
      <a href="https://vite.dev/" target="_blank" rel="noopener" class="text-blue-500 hover:text-blue-700 underline">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener" class="text-blue-500 hover:text-blue-700 underline">Vue 3</a>.
    </h3>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .p-4 h1,
  .p-4 h3 {
    text-align: left;
  }
}
</style>
