<template>
  <div class="terra-viewer">
    <div class="viewer-loader" v-if="!is_loaded">
      <i class="fas fa-circle-notch fa-spin fa-2x mr-5"></i>
    </div>
    <iframe id="terra-viewer" v-show="is_loaded" :src="viewer_url" frameborder="0" class="viewer" @load="loaded()"></iframe>
  </div>
</template>
<script>
export default {
  data: function() {
    return {
      viewer_url: "",
      is_loaded: false
    };
  },
  created() {
    this.viewer_url =
      process.env.VUE_APP_TERRA_VIEWER + 
      "/#/" + this.$route.params.id;
  },
  methods: {
    loaded() {
      this.is_loaded = true;
    }
  }
};
</script>
<style lang="scss">
.viewer-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 64px;
  right: 0;
  bottom: 0;
  background: white;
}
.viewer {
  position: fixed;
  width: calc(100% - 5rem);
  height: 100vh;
  top: 0;
  left: 5rem;
  right: 0;
  bottom: 0;
}
</style>

