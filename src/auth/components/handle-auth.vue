<template>
  <div style></div>
</template>

<script>
import AuthMixin from "@/auth/shared/auth.mixin";
export default {
  mixins: [AuthMixin],
  created() {
    if (!window.$cookies.get("access_token")) this.handle_auth();
  },
};
</script>

<style>
</style>