<template>
  <div>
  </div>
</template>
<script>
export default {
  created() {
    if (this.$route.query.redirect)
      this.$router.push({ name: this.$route.query.redirect });
    this.$router.push({name:'dashboard'});
  }
};
</script>
<style lang="stylus" scoped></style>