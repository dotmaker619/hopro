<template>
  <div class="m-settings margin-15 has-background-white">
    <div class="m-settings--header padding-20">
      <div class="is-flex is-vcenter ">
        <sh-icon :name="'ticket-header-back'" class="is-14x14 mr-10 is-pointer" @click.native="$router.push({ name: 'home' })" />
        <p class="is-medium-16-500-19 flex-wrap">
          Settings
        </p>
      </div>
    </div>

    <div class="m-views mt-20">
      <div class="m-views-tabs px-20">
        <div
          class="m-views-tabs__item is-medium-14-500-17 pb-15 "
          v-for="(tab, index) in ['Profile', 'Change Password']"
          :class="[index == active ? 'is-active' : 'has-opacity-5']"
          :key="tab"
          @click="active = index"
        >
          {{ tab }}
        </div>
      </div>
      <div class="m-views-content">
        <div v-if="active == 0">
          <profile />
        </div>
        <div v-if="active == 1">
          <password />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Profile from "./components/profile";
  import Password from "./components/password";
  export default {
    data() {
      return {
        active: 0,
      };
    },
    components: {
      Profile,
      Password,
    },
  };
</script>
