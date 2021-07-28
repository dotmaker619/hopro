<template>
  <div class="share-users-dropdown">
    <div class="sh-dropdown" v-click-outside="() => (active ? (active = false) : null)">
      <div class="is-flex">
        <user-tag :users="shared" :is_precense_component="true"></user-tag>
        <div class="sh-dropdown-selection is-pointer" @click="active = !active">
          <svg viewBox="0 0 100 100" class="image is-36x36 is-pointer">
            <use xlink:href="@/assets/icons/sprite.svg#add-users" />
          </svg>
        </div>
      </div>

      <ul class="sh-dropdown-content share-position" v-if="active">
        <li class="is-flex is-between pl-20 pr-20 mb-20">
          <p class="is-medium-14-500-17">Share with</p>

          <p>
            <svg viewBox="0 0 100 100" class="image is-pointer" @click.stop="active = false" style="height:1.4rem;width:1.4rem">
              <use xlink:href="@/assets/icons/tickets_sprite.svg#close" />
            </svg>
          </p>
        </li>
        <div class="field px-20">
          <p class="control has-icons-left has-icons-right">
            <input class="input" type="email" placeholder="Search Users" v-model="searchQuery" />
            <span class="icon is-large is-left">
              <svg viewBox="0 0 100 100" class="imageis-48x48">
                <use xlink:href="@/assets/icons/helper_sprite.svg#search" />
              </svg>
            </span>
          </p>
        </div>

        <li
          class="sh-dropdown-content__item is-vcenter"
          v-for="user in filtered_users"
          :key="user.uid"
          @click="ticket.writeAccess ? update_share_list(user) : null"
        >
          <div v-if="user" class="sh-dropdown-content__item--icon">
            <user-avatar :user="user"></user-avatar>
            <svg viewBox="0 0 100 100" class="image is-24x24 status" v-if="watcher_uids.includes(user.uid)">
              <use xlink:href="@/assets/icons/vault_sprite.svg#tick-blue" />
            </svg>
          </div>
          <span class="sh-dropdown-content__item--text">{{ user.first_name ? user.first_name + " " + user.last_name : user.email }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { ticketService, userService } from "@/desktop/shared/services/";
  import UserTag from "@/desktop/shared/components/tags/user-tag";

  export default {
    props: ["ticket", "ticket_shared", "copy"],
    data() {
      return {
        active: false,
        searchQuery: "",
        is_loading: false,
        shared: [],
        user_interaction: false,
        users: [],
      };
    },
    components: {
      UserTag,
    },
    computed: {
      watcher_uids() {
        return _.map(this.shared, (w) => w.uid);
      },
      filtered_users() {
        if (this.searchQuery.length) {
          return this.users
            .filter(
              (user) =>
                _.includes(user.first_name, this.searchQuery) ||
                _.includes(user.last_name, this.searchQuery) ||
                _.includes(user.email, this.searchQuery)
            )
            .splice(0, 5);
        } else {
          let tempUsers = [...this.users];
          let tempArray = [];
          let tempIndex;
          this.shared.map((watch) => {
            let watched = tempUsers.filter((user, index) => {
              if (user["uid"] === watch["uid"]) {
                tempIndex = index;
                return user;
              }
            })[0];
            tempArray.push(watched);
            tempUsers.splice(tempIndex, 1);
          });

          let display_users = [...tempArray, ...tempUsers];
          return display_users.splice(0, 5);
        }
      },
    },
    async created() {
      this.users = await this.fetch_users();
    },

    methods: {
      fetch_users(q = "") {
        this.is_loading = true;
        let action = (res, resolve) => {
          resolve(
            _.map(res.results, (u) => {
              return {
                uid: u.uid,
                email: u.email,
                first_name: u.first_name,
                display_picture: u.display_picture,
                last_name: u.last_name,
              };
            })
          );
        };

        return new Promise(async (resolve, reject) => {
          // if the ticket is internal

          if (this.ticket && this.ticket.internal) {
            let data = await userService
              .get_all_without_organization({
                query: `display_picture=true&active=true&internal=true&search=${q}&organization=null`,
              })
              .catch((err) => {
                resolve([]);
              });
            action(data, resolve);
          } else {
            // If user is internal
            if (this.$store.getters.is_internal_user) {
              // If user is internal and resource internal flag (button) is true
              if (this.$store.state.is_internal_resource) {
                let data = await userService
                  .get_all_without_organization({
                    query: `display_picture=true&active=true&&search=${q}&active=true&internal=true`,
                  })

                  .catch((err) => {
                    resolve([]);
                  });
                action(data, resolve);
                this.is_loading = false;
              }
              // If user is internal and resource internal flag (button) is false
              else {
                let promise;
                // for non ticket component search
                if (this.ticket)
                  promise = userService.getAll({
                    query: `display_picture=true&active=true&&search=${q}&organization=${this.ticket.organization}`,
                  });
                // for ticket component search
                else
                  promise = userService.getAll({
                    query: `display_picture=true&active=true&search=${q}`,
                  });

                let data = await promise.catch((err) => {
                  resolve([]);
                });
                action(data, resolve);
              }
            } else {
              // if the user is not internal
              let data = await userService
                .getAll({
                  query: `display_picture=true&active=true&page_size=5&search=${q}`,
                })
                .catch((err) => {
                  resolve([]);
                });
              action(data, resolve);
            }
          }
        });
      },
      update_share_list(user) {
        this.user_interaction = true;
        let new_user = { email: user.email, uid: user.uid };

        if (_.includes(this.watcher_uids, new_user.uid)) {
          this.shared = _.filter(this.shared, (watcher) => watcher.uid != new_user.uid);
        } else this.shared.push(new_user);
      },
    },
  };
</script>
<style lang="scss" scoped>
  .share-users-dropdown .sh-dropdown-content {
    border-radius: 10px;
    border: none;
    box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
  }
  .is-36x36 {
    height: 3.6rem;
    width: 3.6rem;
  }
  .user-avatar {
    height: 3.6rem;
    width: 3.6rem;
    border-radius: 50%;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.4rem;
    font-weight: 600;
    user-select: none;
    text-transform: capitalize;
  }

  .sh-dropdown-content__item--icon {
    position: relative;
    max-height: 5rem;
    .status {
      position: absolute;
      right: -0.25rem;
      bottom: 0rem;
      z-index: 1;
    }
  }

  .is-main {
    position: absolute;
    top: 0;
    right: 15px;
  }

  .shared-count {
    width: 2rem;
    height: 2rem;
    border: solid 2px #ffffff;
    background-color: $primary;
    font-size: 1rem;
    text-align: center;
    color: white;
    border-radius: 100%;
    font-weight: 800;
  }

  .share-position {
    width: 28rem;
    left: 0;
  }
</style>
