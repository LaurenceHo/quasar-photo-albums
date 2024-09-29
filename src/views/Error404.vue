<template>
  <div class="flex flex-col items-center justify-center min-h-[90vh]">
    <h1 class="font-bold text-[30vh]">404</h1>

    <h2 class="text-xl text-slate-400">Oops. Nothing here...</h2>

    <Button as="router-link" class="mt-8" label="Go Home" to="/" />
  </div>
</template>
<script lang="ts" setup>
import Button from 'primevue/button';
</script>
