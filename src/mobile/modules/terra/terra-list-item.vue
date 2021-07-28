<template>
  <router-link :to="{ name: 'terra-viewer' , params: { id: item.uid } }">
    <div class="m-terra-list">
      <div class="is-medium-16-500-19 has-primary-text">{{item.name}}</div>
      <div class="is-flex mt-5 is-between">
        <div class="is-regular-12-00-14 mr-10 has-text-new-grey">{{ item.description || "Not available*" }}</div>
        <div class="is-flex align-center">
          <user-avatar :user="item.owner" :pxsize="20" :avatarfontsize="12" class="mr-5" :custom_class="'tiny-user-avatar'"></user-avatar>
          <p class="is-medium-13-500-16 has-text-blue-grey truncate-text is-width-10" v-username="item.owner"></p>
        </div>
      </div>
    </div>
  </router-link>  
</template>



<script>
export default {
  props: ["item"]
};
</script>

<style lang="scss" scoped>
.m-terra-list {
  background-color: $white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid $blue-tint-border;
}
</style>
