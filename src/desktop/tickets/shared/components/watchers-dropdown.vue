<template>
  <div class="">
    <div class="is-sh-dropdown width" :style="`${isMobile ? 'width: fit-content' : ''}`" v-click-outside="() => (active ? (active = false) : null)">
      <div class="is-flex align-center">
        <user-tag
          :class="{ 'is-hidden': hide_watchers }"
          class="users"
          :no_access="isMobile ? true : no_access"
          :users="watchers"
          :tagsCountToShow="user_count || 5"
          :is_precense_component="true"
          :custom_class="!is_duplicate ? 'tiny-user-avatar' : 'user-style'"
          :custom_size="is_duplicate ? 36 : 24"
        ></user-tag>
        <div class="sh-dropdown-selection is-pointer" @click.stop="active = !active">
          <sh-icon v-if="watcher_uids.length" :name="'add-users-teams'" class="is-24x24 ml-5 is-pointer" :class="{ 'add-followers': !isMobile }" />
          <sh-icon
            v-else-if="custom_icon"
            :class="[custom_icon_size ? `is-${custom_icon_size}x${custom_icon_size}` : 'is-24x24', `${!isMobile ? 'add-followers' : ''}`]"
            :name="custom_icon"
            class="ml-5 is-pointer"
          />
          <div v-else class="is-flex is-vcenter is-pointer">
            <sh-icon :name="'add-watchers'" class="mr-7 is-24x24" />
            <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black">Assign Followers</span>
          </div>
        </div>
      </div>
      <div :class="{'mobile-background-new': isMobile}" v-if="active" @click="active = !active"></div>
      <ul
        class="is-options-list has-slimscroll-xs"
        v-if="active"
        style="border-radius:10px"
        :style="`${isMobile ? 'right: 0' : ''}`"
        :class="{ 'report-user-list': $route.name == 'reports', 'is-viewer-right': ['terra-viewer', 'therm-viewer'].includes($route.name), 'mobile-view-option': isMobile }"
      >
        <!-- TODO to make right:0 default or remover 'is-viewer' class -->
        <li class="item mobile-header">
          <p class="is-medium-16-500-19">Select Users</p>
          <p @click="active = false">
            <sh-icon :name="'close'" class="is-12x12" v-if="active"></sh-icon>
          </p>
        </li>
        <div class="field px-10 py-5 has-background-white is-marginless">
          <p class="control has-icons-left has-icons-right">
            <input class="input pt-10" type="email" placeholder="Search" v-model="searchQuery" />
            <span class="icon is-small is-left">
              <sh-icon :name="'search'" class="is-16x16"></sh-icon>
            </span>
          </p>
        </div>
        <div v-if="filtered_users.length == 0" class="is-flex mt-30 is-center">No search found</div>

        <li v-else class="item is-vcenter" v-for="user in filtered_users" :key="user.uid" @click="update_share_list(user)">
          <div v-if="user" class="is-relative" :class="{ 'item--icon': !isMobile }">
            <div class="is-flex align-center">
              <div :class="{ 'is-hidden': !isMobile }" class="mr-10">
                <input type="checkbox" :checked="watcher_uids.includes(user.uid)" class="sh-custom-checkbox" />
              </div>
              <div>
                <user-avatar :user="user" :pxsize="24" :custom_class="'tiny-user-avatar'"></user-avatar>
              </div>
            </div>
            <sh-icon
              :class="{ 'is-hidden': isMobile }"
              class="is-16x16 watcher_selected"
              :name="'tick-blue-bg'"
              v-if="watcher_uids.includes(user.uid)"
            ></sh-icon>
          </div>
          <span class="item--text ml-5" :class="{ 'username-truncate': !isMobile }" v-username="user"></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";

  export default {
    props: ["ticket_watchers", "is_duplicate", "user_count", "custom_icon", "custom_icon_size", "no_access", "hide_watchers", "add_icon_on_hover"],
    data() {
      return {
        active: false,
        searchQuery: "",
        is_loading: false,
        watchers: [],
        user_interaction: false,
      };
    },
    components: {
      UserTag,
    },
    async created() {
      this.watchers = [...this.ticket_watchers];
    },
    watch: {
      ticket_watchers() {
        this.watchers = [...this.ticket_watchers];
      },
    },
    computed: {
      watcher_uids() {
        return _.map(this.watchers, (w) => w.uid);
      },
      filtered_users() {
        if (this.searchQuery.length) {
          return Object.values(this.$store.getters.state_users)
            .filter((user) =>
              _.includes((user.first_name ? user.first_name + user.last_name + user.email : user.email).toLowerCase(), this.searchQuery.toLowerCase())
            )
            .splice(0, 5);
        } else {
          let allUsers = this.$store.state.users.filter((s) => !this.watcher_uids.includes(s.uid));
          return [...(this.watchers || []), ...(allUsers || [])].splice(0, 5);
        }
      },
    },

    methods: {
      update_share_list(user) {
        this.user_interaction = true;
        let new_user = { email: user.email, uid: user.uid };

        if (_.includes(this.watcher_uids, new_user.uid)) {
          this.watchers = _.filter(this.watchers, (watcher) => watcher.uid != new_user.uid);
        } else this.watchers.push(new_user);

        this.$emit("update-watchers", this.watchers);
      },
    },
  };
</script>
<style lang="scss">
  .is-viewer-right {
    right: 0;
  }
  .watchers-dropdown {
    .is-options-list {
      z-index: 10;
      width: 20rem;
      border-radius: 10px;
      box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px rgba(23, 30, 72, 0.1);
      background-color: $white;
      .input {
        height: 4rem;
      }
      .control.has-icons-left .icon.is-left {
        height: 4rem;
        width: 1.5rem;
      }
      .item--text {
        width: 15ch;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .add-followers {
      visibility: hidden;
      @include for-size(portrait-tablets) {
        visibility: visible !important;
      }
    }

    &:hover {
      .add-followers {
        visibility: visible !important;
      }
    }
  }

  .watcher_selected {
    position: absolute;
    bottom: -4px;
    right: -3px;
    @include for-size(portrait-tablets) {
      bottom: -8px !important;
      right: -8px !important;
    }
  }
  .report-user-list {
    position: absolute;
    top: -25rem !important;
    min-height: 24.5rem;
  }
</style>
