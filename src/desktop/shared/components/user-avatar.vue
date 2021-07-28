<template>
  <div
    class="is-flex align-center"
    v-if="user && person"
    v-tooltip="{
      content: show_tooltip ? (person.first_name ? person.first_name + ' ' + person.last_name : person.email) : null, html: false 
    }"
  >
    <div
      :class="[[custom_class ? custom_class : 'user-style'], [pxsize ? `is-${pxsize}x${pxsize}` : 'is-40x40']]"
      v-if="person.display_picture || person.profile_picture"
    >
      <img class="image is-rounded" style="height:100%;width:100%" :src="person.display_picture || person.profile_picture" />
    </div>
    <div
      class=" is-icon"
      :class="[[custom_class ? custom_class : 'user-style'], [pxsize ? `is-${pxsize}x${pxsize}` : 'is-40x40']]"
      v-else
      :style="`background-color: ${hashed_color(person.first_name ? person.first_name + ' ' + person.last_name : person.email, 'userManagement')};`"
    >
      {{ person.first_name ? person.first_name.charAt(0) : person.email.charAt(0) }}
    </div>
    <span v-if="not_state" class="is-medium-14-500-17 mx-5">{{
      $store.state.claims.user_id == person.uid ? "You" : person.first_name ? person.first_name + " " + person.last_name : person.email
    }}</span>
  </div>
  <div v-else-if="user && !not_state && !$store.getters.state_users[user.uid]">
    <div :class="[[custom_class ? custom_class : 'user-style'], [pxsize ? `is-${pxsize}x${pxsize}` : 'is-40x40']]">
      <sh-icon
        v-if="user.email && user.email.includes('@sensehawk')"
        v-tooltip="{ content: show_tooltip ? 'SenseHawk' : null }"
        :file="'users_sprite'"
        :name="'sensehawk-created-36px'"
        class="is-rounded is-36x36"
      ></sh-icon>
      <sh-icon
        v-else
        v-tooltip="{ content: show_tooltip ? 'Unknown' : null }"
        :file="'users_sprite'"
        :name="'unknown-user-36px'"
        class="is-rounded is-36x36"
      ></sh-icon>
    </div>
  </div>
</template>
<script>
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    mixins: [HashColor],
    props: ["user", "pxsize",  "custom_class", "show_tooltip", "not_state"],
    computed: {
      person() {
        return !this.not_state ? this.$store.getters.state_users[this.user.uid] : this.user;
      },
    },
  };
</script>
<style lang="scss">
  .user-style {
    border-radius: 50%;
    margin-right: 1rem;
    object-fit: contain;
    height: 36px;
    width: 36px;
    overflow: hidden;
    font-size: initial;
    &.is-icon {
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      text-transform: capitalize;
    }
  }

  .is-32x32 {
    height: 32px !important;
    width: 32px !important;
  }

  .is-48x48 {
    height: 48px;
    width: 48px;
  }

  .is-28x28 {
    height: 28px;
    width: 28px;
  }

  .is-24x24 {
    height: 24px;
    width: 24px;
  }
</style>
