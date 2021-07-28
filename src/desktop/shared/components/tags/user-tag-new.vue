<template>
  <div v-if="users && users.length" class="is-flex align-center">
    <div v-for="(user, i) in users.slice(0, tagsCountToShow)" :key="i">
      <div @click="no_access ? $emit('handle_click') : $router.push({ name: 'user-details', params: { id: user.uid } })">
        <user-avatar :user="user" class="mr-3" :custom_class="custom_class" :show_tooltip="true" :pxsize="custom_size" :not_state="not_state"></user-avatar>
        <div class="user-tag-status" v-if="show_presence"></div>
      </div>
    </div>
    <div v-if="users.length > tagsCountToShow" class="tiny-user-avatar--text" :class="`${custom_class} is-${custom_size}x${custom_size}`" >+{{ users.length - tagsCountToShow }}</div>
  </div>
  <not-assigned v-else-if="!is_precense_component" :type="'user'" class="mt-10" />
</template>

<script>
  import NotAssigned from "@/desktop/shared/components/not-assigned";
  import { userService } from "@/desktop/shared/services/";

  export default {
    components: {
      NotAssigned,
    },
    props: ["users", "tagsCountToShow", "is_precense_component", "show_presence", "no_access", "custom_class", 'custom_size','not_state'],
  };
</script>
<style lang="scss">
  .mr-3 {
    margin-right: 3px;
  }
  .user-style { 
    width: 36px;
    margin-right: 0px;
    display: flex;
    justify-content: center;
    text-transform: uppercase;
    align-items: center;
  }
  .user-tag-status {
    position: absolute;
    right: -0.25rem;
    bottom: 0rem;
    z-index: 1;
    background-color: $is-online;
    border: 2px solid $white;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
  }

  .tiny-user-avatar {
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    font-family: Barlow;
    font-size: 11px;
    font-weight: 600;
    color: $white;
    display: flex;
    justify-content: center;
    text-transform: uppercase;
    align-items: center;
    overflow: hidden;
    &--text {
      border: solid 1px $light-greyish-blue;
      background-color: $white;
      color: $blue-grey;
    }
  }
</style>
