<template>
  <div>
    <div v-if="users && users.length" class="sh-user-tag" :class="{ 'no-wrap': no_wrap }">
      <div class="sh-user-tag__link" v-for="(user, i) in users.slice(0, howManyToShow)" :key="i">
        <div @click="no_access ? $emit('clicked_user') : $router.push({ name: 'user-details', params: { id: user.uid } })">
          <user-avatar :user="user" class="sh-user-tag__image is-pointer" :show_tooltip="true" :pxsize="pxsize?pxsize: 36 " :avatarfontsize="48"></user-avatar>
          <div class="status" v-if="show_presence"></div>
        </div>
      </div>
      <div v-if="users.length > howManyToShow" class="sh-user-tag__link is-pointer">+{{ users.length - howManyToShow }}</div>
    </div>

    <not-assigned v-else-if="!is_precense_component" :type="'user'" class="mt-10" />
  </div>
</template>

<script>
  import NotAssigned from "@/desktop/shared/components/not-assigned";
  import { userService } from "@/desktop/shared/services/";

  export default {
    components: {
      NotAssigned,
    },
    props: ["users", "howManyToShow", "is_precense_component", "show_presence", "no_access", "no_wrap", "pxsize"],
    data() {
      return {
        usersFromServer: null,
      };
    },
  };
</script>
<style lang="scss" scoped>
  // [user-title]:hover:after {
  //   opacity: 1;
  //   transition: all 0.1s ease 0.5s;
  //   visibility: visible;
  //   z-index: 1000;
  // }
  // [user-title]:after {
  //   content: attr(user-title);
  //   background-color: #000;
  //   color: #fff;
  //   font-size: 1.2rem;
  //   font-weight: 500;
  //   position: absolute;
  //   padding: 1px 5px 2px 5px;
  //   top: -3rem;
  //   left: 0;
  //   border-radius: 0.5rem;
  //   letter-spacing: 1px;
  //   white-space: nowrap;
  //   box-shadow: 1px 1px 3px #222222;
  //   opacity: 0;
  //   border: 1px solid #111111;
  //   z-index: 99999;
  //   visibility: hidden;
  // }
  // [user-title] {
  //   position: relative;
  // }

  .sh-user-tag__link {
    .status {
      position: absolute;
      right: -0.25rem;
      bottom: 0rem;
      z-index: 1;
      background-color: #73dca0;
      border: 2px solid white;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
    }
  }

  .terra-user {
    margin-right: -1rem;
    border: 1px solid #fff;
    height: 4rem;
    width: 4rem;
    img {
      border: 2px solid #fff;
    }
  }
  .more-user {
    height: 4rem !important;
    width: 4rem !important;
    margin: 0 10px !important;
  }
</style>
