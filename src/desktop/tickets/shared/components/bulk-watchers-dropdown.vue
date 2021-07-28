<template>
  <div>
    <div class="is-sh-dropdown watchers-dropdown" v-click-outside="() => (active ? (active = false) : null)">
      <div class="is-flex">
        <div class="sh-dropdown-selection is-pointer" @click="active = !active">
          <div class="is-flex is-vcenter is-pointer"  v-tooltip="{ content: `${is_saveTemplate?'Add people':'Add Followers'}` }">
            <sh-icon v-if="is_saveTemplate" class="is-36x36" :name="'add-user-assignee'"></sh-icon>
            <sh-icon v-else :name="'watch'" :file="'tickets-2'" class=" is-16x16" />
          </div>
        </div>
      </div>

      <ul class="is-options-list has-slimscroll-xs " v-if="active" style="border-radius:10px">
        <div class="field px-10">
          <p class="control has-icons-left has-icons-right">
            <input class="input pt-10" type="email" placeholder="Search" v-model="searchQuery" />
            <span class="icon is-small is-left">
              <sh-icon :name="'search'" class="is-24x24"></sh-icon>
            </span>
          </p>
        </div>

        <li class="item is-vcenter " v-for="user in filtered_users" :key="user.uid" @click="update_share_list(user)">
          <div v-if="user" class="item--icon is-relative">
            <user-avatar :user="user" :pxsize="24"></user-avatar>
            <sh-icon class="is-16x16 watcher_selected" :name="'tick-blue-bg'" v-if="watcher_uids.includes(user.uid)"></sh-icon>
          </div>
          <span class="item--text">{{ user.first_name ? user.first_name + " " + user.last_name : user.email }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { ticketService, userService } from "@/desktop/shared/services/";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";

  export default {
    props: {
      is_saveTemplate: {
        type: Boolean,
        defaut: false,
      },
    },
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
          return this.$store.getters.state_users;
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

        this.$emit("update-bulk-watchers", this.watchers);
      },
    },
  };
</script>
<style lang="scss">
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
    }
    &:hover {
      .add-followers {
        visibility: visible;
      }
    }
  }

  .watcher_selected {
    position: absolute;
    bottom: -4px;
    right: -3px;
  }
</style>
