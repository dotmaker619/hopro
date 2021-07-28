<template>
  <div style="border-top:1px solid #eee;" v-if="details">
    <router-view :is_grouped="true" :element="details.element"></router-view>
  </div>
</template>

<script>
export default {
  props: ["details"]
};
</script>

<style>
</style>