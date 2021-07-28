<template>
  <div class="bottom-nav">
    <router-link v-for="nav in navlist" :key="nav" class="bottom-nav__item" :to="{ name: nav.to }">
      <div
        class="bottom-nav__item__active"
        :class="{
          'is-active': $route.name == nav.to || $route.path.includes(nav.name),
        }"
      ></div>
      <m-icon
        :name="`${$route.name == nav.to || $route.path.includes(nav.name) ? nav.icon + '-active' : nav.icon}`"
        class="is-20x20 mr-5"
        :file="'core-sprite'"
      ></m-icon>
    </router-link>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        active: 2,
        navlist: [
          { name: "home", icon: "nav-assets", to: "home" },
          { name: "view", icon: "nav-views", to: "dashboard" },
          { name: "tickets", icon: "nav-tickets", to: "tickets-list" },
          { name: "vault", icon: "nav-vault", to: "vault" },
        ],
      };
    },
  };
</script>

<style lang="scss" scoped>
  .bottom-nav {
    background-color: $white;
    height: 4.4rem;
    box-shadow: 0 -5px 10px 0 rgba(0, 0, 0, 0.16);
    display: flex;
    width: 100%;
    &__item {
      width: 25%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 -1px 3px 0 rgba(0, 0, 0, 0.06);

      &__active {
        height: 2px;
        width: calc(100% - 40px);
        border-radius: 4px;
        background-color: #2585d3;
        position: absolute;
        top: 0;
        display: flex;
        visibility: hidden;
        &.is-active {
          visibility: visible;
        }
      }
    }
  }
</style>
