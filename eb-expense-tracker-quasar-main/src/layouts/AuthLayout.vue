<template>
  <q-layout view="lHh lpr lFf" class="auth-layout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Simple auth layout for login/register pages
</script>

<style lang="scss" scoped>
.auth-layout {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  // background: linear-gradient(135deg, #1f1f1f 0%, #2c2c2c 40%, #d8d8d8 100%);
  min-height: 100vh;
  // color: #fff; /* Optional: For better contrast */
}
</style>