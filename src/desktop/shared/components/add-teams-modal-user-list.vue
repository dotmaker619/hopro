<template>
  <div @click="is_dropdown = false">
    <span class="ml-80 is-regular-14-500-17 has-text-light-grey">
      Users ({{ data.length }})
    </span>
    <div class="user-list" style="margin-left: 80px">
      <div class="dropdown" :class="{ 'is-active': is_dropdown }">
        <div class="dropdown-trigger" @click.stop="is_dropdown = true">
          <div
            v-if="access('core', 'create_teams')"
            class="add-teams-modal-add mt-10 mb-15 is-pointer"
          >
            <img src="@/assets/icons/add-feature-type.svg" />
            <span class="ml-15">Add User </span>
          </div>
          <img
            v-if="loading"
            style="width: 30px"
            src="@/assets/icons/ellipsis-animation.svg"
          />
        </div>
        <div
          class="dropdown-menu"
          style="width: 280px; height: 300px; top: 0"
          @click.stop="
            '';

          "
        >
          <div class="dropdown-content" style="border-radius: 8px">
            <div class="is-flex align-center bb-1 pt-3 pb-5">
              <sh-icon :name="'search'" class="is-16x16 ml-10" />
              <input
                v-focus
                v-model="search"
                type="text"
                placeholder="Search"
                style="outline: none; border: 0; width: 100%; padding: 5px 10px"
              />
            </div>
            <div
              class="has-slimscroll-xs"
              style="height: 200px; overflow-y: scroll"
            >
              <div v-if="filtered.length" class="mt-10">
                <a
                  @click="add_user(item)"
                  style="padding-right: 0"
                  class="dropdown-item is-flex align-center py-10"
                  v-for="item in filtered"
                  :key="item.uid"
                >
                  <user-avatar
                    :user="item"
                    :pxsize="24"
                    class="mr-10"
                  ></user-avatar>
                  <span
                    style="width: 90%; overflow: hidden; color: #171e48"
                    class="is-medium-16-500-19 is-capitalized"
                    v-username="item"
                  ></span>
                </a>
              </div>
              <invite-user v-else :search="search"></invite-user>
            </div>
          </div>
        </div>
      </div>
      <div
        v-for="item in sorted_list"
        :key="item.uid"
        class="is-flex align-center mb-15"
      >
        <i
          v-if="access('core', 'modify_teams')"
          @click="remove_user(item)"
          class="fa fa-times add-item__content__top__row__cancel mr-15"
        />
        <user-avatar :user="item" :pxsize="24" class="mr-10"></user-avatar>
        <span
          style="color: #171e48"
          class="is-medium-14-500-17 is-capitalized"
          v-username="item"
        ></span>
      </div>
    </div>
  </div>
</template>

<script>
import { userService, teamService } from "@/desktop/shared/services/";
import InviteUser from "./add-teams-modal-user-list-invite/add-teams-modal-user-list-invite.vue";

export default {
  components: {
    InviteUser,
  },
  props: ["team_id"],
  data() {
    return {
      loading: false,
      data: [],
      dropdown_data: [],
      is_dropdown: false,
      search: "",
    };
  },
  created() {
    this.getData();
  },
  computed: {
    filtered() {
      return _.filter(this.dropdown_data, (f) =>
        _.includes(
          (f.first_name + " " + f.last_name).toLowerCase(),
          this.search.toLowerCase()
        )
      );
    },
    sorted_list() {
      return _.orderBy(this.data, [
        (f) => (f.first_name + " " + f.last_name).toLowerCase(),
      ]);
    },
    is_valid_email() {
      if (this.search) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(this.search).toLowerCase());
      }
      return false;
    },
  },
  methods: {
    async getData(isloading = true) {
      this.loading = isloading;
      userService
        .getAll({
          from_server: true,
          query: "page_size=100&label=" + this.team_id,
        })
        .then((res) => {
          this.loading = false;

          this.data = res.results;
        });
      this.loading = isloading;

      let data = await userService.getAll({
        from_server: true,
        query: "active=true&exclude_label=" + this.team_id,
      });
      this.loading = false;

      if (data.results) this.dropdown_data = data.results;
    },
    add_user(user) {
      let body = { users: [...this.data] };
      body.users.push(user);
      this.data = body.users;
      this.is_dropdown = false;
      teamService
        .patch({
          id: this.team_id,
          body,
        })
        .then((res) => {
          this.getData(false);
        })
        .catch((err) => this.handleErrors(err));
    },
    remove_user(user) {
      let body = { users: [...this.data] };
      body.users = _.filter(body.users, (u) => u.uid !== user.uid);
      this.data = body.users;
      teamService
        .patch({
          id: this.team_id,
          body,
        })
        .then((res) => {
          this.getData(false);
        })
        .catch((err) => this.handleErrors(err));
    },
  },
};
</script>
<style lang="scss" scoped>
.dropdown-content {
  box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16);
}
.dropdown-item {
  &:hover {
    background-color: #f4f6fe;
  }
}
.user-list-info-text {
  opacity: 0.7;
  font-family: Barlow;
  font-size: 14px;
  line-height: 1.57;
  text-align: left;
  color: #171e48;
}
</style>