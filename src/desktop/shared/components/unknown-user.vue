<template>
  <div v-if="$store.getters.state_users[user.uid]" class="add-user__content__top__row__main">
    <div class="image is-24x24 mr-10" v-if="$store.getters.state_users[user.uid].display_picture">
      <img :src="$store.getters.state_users[user.uid].display_picture" class="image is-24x24 is-rounded" />
    </div>
    <div
      v-else
      class="add-user__content__top__row__main__icon"
      :style="`background-color: ${name ? hashed_color(name, 'userManagement') : hashed_color(user.email, 'userManagement')}`"
    >
      {{ name && name.charAt(0).toUpperCase() }}
    </div>
    <span class="add-user__content__top__row__main__name">{{ name }}</span>
  </div>
  <div class="add-user__content__top__row__main" v-else>
    <div class="image is-24x24 mr-10">
      <sh-icon
        v-if="user.email && user.email.includes('@sensehawk')"
        v-tooltip="{ content: 'Sensehawk', html: false }"
        :file="'users_sprite'"
        :name="'sensehawk-created-36px'"
        class="info-block__image__container__picture image is-24x24"
      ></sh-icon>
      <sh-icon
        v-else
        v-tooltip="{ content: 'Unknown', html: false }"
        :file="'users_sprite'"
        :name="'unknown-user-36px'"
        class="info-block__image__container__picture image is-24x24"
      ></sh-icon>
    </div>
    <span class="add-user__content__top__row__main__name">{{ user.email.includes("@sensehawk") ? "Sensehawk" : "Unknown" }}</span>
  </div>
</template>

<script>
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    mixins: [HashColor],
    props: ["user"],
    computed: {
      name() {
        return (
          this.$store.getters.state_users[this.user.uid].first_name + " " + this.$store.getters.state_users[this.user.uid].last_name ||
          this.$store.getters.state_users[this.user.uid].email ||
          this.user.uid
        );
      },
    },
  };
</script>
