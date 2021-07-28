<template>
  <div>
    <div class="is-sh-dropdown width" :class="{ 'has-no-width': is_name_hidden }" v-click-outside="() => (active = false)">
      <div class="user-assignee" :class="[[active ? 'is-open' : 'is-close'], [is_name_hidden ? 'is-flex is-vcenter' : 'is-selector']]">
        <span class="user-assignee-avatar is-pointer" @click="active = !active">
          <div v-if="existing_user && existing_user.uid">
            <p v-if="existing_user" class="is-flex is-vcenter">
              <user-avatar :user="existing_user" :pxsize="pxsize" :custom_class="'tiny-user-avatar'" :show_tooltip="true"></user-avatar>
              <span class="ml-6 username-truncate" v-if="!is_name_hidden" v-username="existing_user"></span>
            </p>
          </div>
          <div v-else class="is-flex is-vcenter is-pointer">
            <sh-icon
              :name="icon ? icon : 'add-user-assignee'"
              class="mr-7"
              :class="[pxsize ? `is-${pxsize}x${pxsize}` : 'is-30x30']"
              v-tooltip="{ content: `Assign user` }"
            />
            <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black" v-if="!is_name_hidden">Add Assignee</span>
          </div>
        </span>

        <sh-icon :class="{'is-hidden':hide_close}"
          :name="'ticket-priority-close'"
          v-if="(existing_user && existing_user.uid) || can_unassign"
          class="is-8x8 ml-10 close-icon is-pointer"
          @click.native.stop="update_user(null)"
        />
      </div>
      <div :class="{'mobile-background-new': isMobile}" v-if="active" @click="active = !active"></div>
      <ul class="is-options-list has-slimscroll-xs " v-if="active" :class="{'mobile-view-option': isMobile }" >
        <li class="item mobile-header">
          <p class="is-medium-16-500-19">
            Add Assignee
          </p>
          <p @click="active = false">
            <sh-icon :name="'close'" class="is-12x12" v-if="active"></sh-icon>
          </p>
        </li>
        <div class="field is-marginless px-10 pt-5 has-background-white">
          <p class="control has-icons-left has-icons-right ">
            <input class="input" type="email" placeholder="Search" v-model="searchQuery" />
            <span class="icon is-left is-large">
              <sh-icon :name="'search'" />
            </span>
          </p>
        </div>

        <div v-if="is_loading && !users">
          <img src="@/assets/icons/ellipsis-animation.svg" class="image is-64x64 ml-auto mr-auto" />
        </div>

        <li class="item is-vcenter" v-for="user in users" :key="user.uid" @click.stop="update_user(user)">
          <div v-if="user">
            <user-avatar :user="user" :pxsize="24" :custom_class="'tiny-user-avatar mr-5'"></user-avatar>
          </div>
          <span class="item--text" :class="{'username-truncate': !isMobile}" v-username="user"></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      existing_user: Object,
      icon: String,
      can_unassign: {
        type: Boolean,
        default: false,
      },
      is_name_hidden: {
        type: Boolean,
        defaut: false,
      },
      pxsize: {
        type: Number,
        default: 36,
      },
      hide_close: {
        type:Boolean,
        default: false
      }
    },

    data() {
      return {
        active: false,
        searchQuery: "",
        is_loading: false,
      };
    },

    computed: {
      users() {
        if (this.existing_user) {
          return Object.values(this.searched_users).filter((s) => s.uid != this.existing_user.uid);
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
      update_user(value) {
        this.searchQuery = "";
        this.$emit("update-user", value);
        this.active = false;
      }
    },
  };
</script>
<style lang="scss">
  .has-no-width {
    width: 0px;
  }
  .width {
    .is-selector {
      user-select: none;
      &.is-open {
        width: 19rem;
      }
      &.is-close {
        width: 19rem;
        .username-truncate {
          width: 18ch;
        }
        @include for-size(portrait-tablets) {
          .username-truncate {
            width: 18ch;
          }
        }
        @include for-size(smartphones) {
          .username-truncate {
            width: 15ch;
          }
        }
        @include for-size(small-phones) {
          .username-truncate {
            width: 12ch;
          }
        }
        &:hover {
          .username-truncate {
            width: 12ch;
          }
        }
      }
    }

    .is-options-list {
      width: 19rem;
    }
  }

  .is-sh-dropdown {
    position: relative;
    ul {
      padding-left: 0;
      margin-top: 0;
    }

    .is-selector {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1rem;
      height: 3.8rem;
      white-space: nowrap;
      object-fit: contain;
      border: solid 1px transparent;
      cursor: pointer;
      .close-icon {
        visibility: hidden;
      }
      &:hover {
        box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.07);
        border: solid 1px rgba(23, 30, 72, 0.1);
        .close-icon {
          visibility: visible;
        }
        @include for-size(portrait-tablets) {
          box-shadow: none;
        }
      }
      @include for-size(portrait-tablets) {
        padding: 0;
        height: auto;
        width: max-content;
        border: none;
      }
      &.is-close {
        background-color: transparent;
        border-radius: 6px;
        &:hover {
          background: #fff;
        }
      }
      &.is-open {
        border-radius: 10px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.07) !important;
        border: solid 1px rgba(23, 30, 72, 0.1) !important;
        background: #fff;
        @include for-size(portrait-tablets) {
          box-shadow: none !important;
          border: none !important;
        }
      }
      .username-truncate {
        width: 12ch;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
    }

    .is-options-list {
      max-height: 26rem;
      overflow-y: auto;
      overflow-x: hidden;
      background: $white;
      display: block;
      position: absolute;
      z-index: 10;
      top: 3.8rem;
      font-family: Barlow-Medium;
      border-bottom-left-radius: 10px;
      border-top: 0 solid transparent;
      border-bottom-right-radius: 10px;
      box-shadow: 0 22px 30px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px rgba(23, 30, 72, 0.1);
      border-top: none;

      &:hover {
        background-color: $white;
      }
      &.mobile-view-option {
        all: unset;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 35rem;
        position: fixed !important;
        bottom: 0px;
        width: 100%;
        left: 0;
        z-index: 1024;
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
      }
      // @include for-size(portrait-tablets) {
      //   all: unset;
      //   overflow-y: auto;
      //   overflow-x: hidden;
      //   max-height: 40rem;
      //   position: fixed !important;
      //   bottom: 0px;
      //   width: 100%;
      //   left: 0;
      //   z-index: 100;
      //   border-top-left-radius: 1rem;
      //   border-top-right-radius: 1rem;
      // }
      // @include for-size(tablet) {

      .input {
        border: none;
        box-shadow: none;
        border-bottom: 1px solid #eee;
        border-radius: 0px;
        &:focus {
          border: none;
          box-shadow: none;
          border-bottom: 1px solid #eee;
          border-radius: 0px;
        }
        &::placeholder {
          opacity: 0.5;
          font-family: Barlow-Regular;
          font-size: 16px;
          font-weight: normal;
          font-stretch: normal;
          font-style: normal;
          line-height: 1.19;
          letter-spacing: normal;
          text-align: left;
          color: #171e48;
        }
      }

      .item {
        height: 4rem;
        padding: 0.7rem 1.7rem;
        display: flex;
        align-items: center;
        background-color: $white;
        &--icon {
          margin-right: 0.6rem;
          max-height: 2.4rem;
          max-width: 2.4rem;
          @include for-size(portrait-tablets) {
            height: 2rem;
            width: 2rem;
            margin-right: 1rem;
          }
        }
        &--text {
          white-space: nowrap;
          font-family: Barlow-Medium;
          font-size: 1.6rem;
          font-weight: 500;
          line-height: 1.9rem;
          @include for-size(portrait-tablets) {
            height: 1.7rem;
            font-size: 1.4rem;
            font-weight: 500;
            font-family: Barlow-Medium;
          }
          &.is-footer {
            color: $primary;
          }
          &:first-letter {
            text-transform: uppercase;
          }
          &.username-truncate {
            width: 12ch;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
        }
        &:hover {
          background-color: $primary-background;
          cursor: pointer;
        }
        &.is-footer {
          border-top: 1px solid #ddd;
        }
        &.is-not-allowed {
          cursor: not-allowed;
        }
        &.mobile-header {
          display: none;
          @include for-size(portrait-tablets) {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #eee;
            border-top: 1px solid #eee;
            border-top-left-radius: 1rem;
            border-top-right-radius: 1rem;
          }
        }
      }
    }
  }

  .mobile-background {
    display: none;
    @include for-size(portrait-tablets) {
      display: block;
      height: 100vh;
      background: black;
      width: 100vw;
      position: fixed;
      top: 0;
      left: 0;
      opacity: 0.5;
      z-index: 5;
    }
    @include for-size(tablet) {
      display: block;
      height: 100vh;
      background: black;
      width: 100vw;
      position: fixed;
      top: 0;
      left: 0;
      opacity: 0.5;
      z-index: 5;
    }
  }
  .mobile-background-new {
    display: block;
    height: 100vh;
    background: black;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    opacity: 0.5;
    z-index: 10;
  }
</style>
