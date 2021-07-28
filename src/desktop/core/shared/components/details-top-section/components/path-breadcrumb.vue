<template>
  <div
    class="pin-text is-pointer"
    @click.stop="go_back()"
    v-tooltip="details && details.name.length > 30 ? details.name : null"
  >
    <i class="fas fa-chevron-left mr-10"></i>
    {{ details && details.name }}
  </div>
</template>

<script>
export default {
  props: ["details", "page"],
  methods: {
    go_back() {
      if (this.page && this.page !== "project") {
        if (this.$route.path.includes("application")) {
          this.$router.push({
            name: this.page + "-details",
            params: { id: this.$route.params.id }
          });
        } else {
          this.$router.push({ name: this.page + "-list" });
        }
      } else {
        this.$router.go(-1);
      }
    }
  }
};
</script>

<style>
</style>