<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>

<style lang="scss">
html {
  min-height: 100vh;
  min-width: 100vw;
}

body {
  margin: 0;
  min-height: 100vh;
  min-width: 100vw;
}

#app {
  background-color: white;
  min-height: 100vh;
  min-width: 100vw;
  position: relative;
}
</style>
