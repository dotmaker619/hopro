<template>
  <div class="modal-card job-modal">
    <header class="modal-card-head">
      <p class="modal-class-title is-size-5 is-capitalized" style="margin-right: 1rem">{{title}}</p>
      <!-- <img src="@/assets/noun_JSON.svg" width="50px" height="50px"> -->
    </header>
    <section class="modal-card-body">
      <vue-json-pretty :data="jsonData" :deep="1" :showLength="true" :highlightMouseoverNode="true"></vue-json-pretty>
    </section>
    <footer class="modal-card-foot"></footer>
  </div>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";

export default {
  props: ["title", "jsonData"],
  components: {
    VueJsonPretty
  }
};
</script>

<style lang="scss" scoped>
.job-modal {
  padding: 0 0.5rem;
  @include for-size(phone-only) {
    padding-left: 0.5rem !important;
  }
  @include for-size(tablet-portrait-down) {
    padding-left: 4.5rem;
  }
}
img {
  margin-left: auto;
  margin-right: 0;
}

footer {
  margin: 0 !important;
}
</style>
