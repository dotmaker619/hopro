<template>
  <div>
    <div class="sh-dropdown" v-click-outside="() => (active = false)">
      <div class="sh-dropdown-selection is-pointer" @click="active = !active">
        <div v-if="icon">
          <sh-icon
            :name="icon"
            :file="icon_file ? icon_file : null"
            class="user-dd-user-icon image is-20x20"
            v-tooltip="{ content: `Assign user` , html: false}"
          />
        </div>

        <div v-else-if="(existing_user && existing_user.uid) || selected_user">
          <user-avatar v-if="existing_user && !selected_user" :user="existing_user" :pxsize="pxsize" :show_tooltip="true"></user-avatar>
          <user-avatar v-else :user="selected_user" :pxsize="pxsize" :show_tooltip="true"> </user-avatar>
        </div>

        <!-- <img
          v-else
          src="@/assets/icons/add-assignee.svg"
          class="image is-40x40"
          v-tooltip="{ content: `Assign user` }"
          alt
          style="position:relative;right:5px"
        /> -->
      </div>
      <ul class="sh-dropdown-content is-assignee" :class="position" v-if="active">
        <div class="field px-20">
          <p class="control has-icons-left has-icons-right">
            <input class="input" type="email" placeholder="Search Users" v-model="searchQuery" />
            <span class="icon is-left is-large">
              <sh-icon :name="'search'" />
            </span>
          </p>
        </div>

        <div v-if="is_loading && !users">
          <img src="@/assets/icons/ellipsis-animation.svg" class="image is-64x64 ml-auto mr-auto" />
        </div>
        <!-- <li
          class="sh-dropdown-content__item is-unassigne is-vcenter"
          @click.stop="unassigne_assignee"
          v-if="((existing_user && existing_user.uid) || (selected_user && selected_user.uid)) && can_unassign"
        >
          <div class="sh-dropdown-content__item--icon">
            <img src="@/assets/icons/add-assignee.svg" class="image" alt />
          </div>
          <p class="sh-dropdown-content__item--text is-medium-16-500-19">Unassign User</p>
        </li> -->
        <div class="sh-user-list has-slimscroll" v-if="users">
          <li class="sh-dropdown-content__item is-vcenter" v-for="user in users" :key="user.uid" @click.stop="update_assignee(user)">
            <div v-if="user" class="sh-dropdown-content__item--icon">
              <user-avatar :user="user"></user-avatar>
            </div>
            <span class="sh-dropdown-content__item--text is-medium-16-500-19" v-username="user"></span>
          </li>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      existing_user: Object,
      new_selection: Boolean,
      icon: String,
      icon_file: String,
      can_unassign: {
        type: Boolean,
        default: true,
      },
      position: String,

      pxsize: {
        type: Number,
        default: 36,
      },
      keep_open: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {
        active: false,
        searchQuery: "",
        is_loading: false,
        selected_user: null,
      };
    },
    created() {
      this.keep_open ? (this.active = true) : null;
    },

    computed: {
      users() {
        if (this.existing_user) {
          return Object.values(this.searched_users).filter((s) => s.uid != this.existing_user.uid);
        } else if (this.selected_user) {
          return Object.values(this.searched_users).filter((s) => s.uid != this.selected_user.uid);
        } else {
          return Object.values(this.searched_users);
        }
      },
      searched_users() {
        if (this.searchQuery.length) {
          return Object.values(this.$store.getters.state_users).filter((user) =>
            _.includes((user.first_name ? user.first_name + user.last_name + user.email : user.email).toLowerCase(), this.searchQuery.toLowerCase())
          );
        } else {
          return Object.values(this.$store.getters.state_users);
        }
      },
    },
    methods: {
      async update_assignee(user) {
        this.selected_user = user;
        this.$emit("update-user", user);

        this.active = false;
      },
      async unassigne_assignee() {
        this.selected_user = null;
        this.$emit("remove-user");
        this.active = false;
      },
    },
  };
</script>
<style lang="scss">
  .sh-user-list {
    max-height: 25rem;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
