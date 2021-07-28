<template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
      </div>
      <div v-if="!$store.getters.is_org_user" class="list-top-section--create is-flex align-center">
        <div class="mr-20">
          <b-checkbox
            v-if="$store.getters.is_internal_user && $route.name !== 'team-details'"
            v-model="showAll"
            @click="showAll = !showAll"
            type="is-info"
          >
            <span class="is-medium-16-500-19">Show all users</span>
          </b-checkbox>
        </div>

        <div v-if="$route.name === 'user-list'" @click="open_invite_popup">
          <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17">Invite Users</div>
        </div>
        <div v-if="$route.name === 'admin-user-list'" @click="open_form(UsersFormComponent, { header: 'Create New User' })">
          <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17">New User</div>
        </div>
      </div>
    </div>

    <div v-if="data && data.length">
      <list-header></list-header>
      <div class="sh-list">
        <div class="sh-list__item" v-for="user in data" :key="user.uid">
          <div class="columns is-flex align-center">
            <div class="column is-3 user-card">
              <div class="left">
                <img
                  class="image is-rounded is-30x30"
                  v-if="user.display_picture || user.profile_picture"
                  :src="user.display_picture || user.profile_picture"
                />
                <div
                  class=" is-icon is-30x30 user-style"
                  v-else
                  :style="
                    `background-color: ${hashed_color(user.first_name ? user.first_name + ' ' + user.last_name : user.email, 'userManagement')};`
                  "
                >
                  {{ user.first_name ? user.first_name.charAt(0) : user.email.charAt(0) }}
                </div>

                <div v-if="$store.state.online_users && $store.state.online_users.map((el) => el.id).includes(user.uid)" class="online-status"></div>
                <div class="badge-container">
                  <div v-if="user.is_owner" class="badge badge--owner">Owner</div>
                  <div v-else-if="user.is_manager" class="badge">Manager</div>
                  <div v-else-if="user.is_guest" class="badge badge--guest">Guest</div>
                </div>
              </div>
              <div class="right">
                <router-link class="has-text-dark" :to="{ name: 'user-details', params: { id: user.uid } }">
                  <div class="is-semiBold-16-600-19 name-highlights-on-hover truncate-text is-width-20">
                    {{ user.first_name ? user.first_name + " " + user.last_name : user.email ? user.email : "Unknown" }}
                  </div>
                  <div class="is-medium-14-500-17 has-text-theme-black has-opacity-7 mt-5">{{ user.organization && user.organization.name }}</div>
                </router-link>
              </div>
            </div>
            <div class="column is-4">
              <primary-tag
                :tags="user.labels"
                :type="'team'"
                :truncate_length="6"
                :noTopMargin="true"
                :toShowCount="$route.name != 'team-details' ? 2 : 1"
              />
            </div>
            <div class="column is-2">
              <div
                v-if="user.teams && user.teams.length"
                class="bottom no-whitespace-wrap is-medium-14-500-17 has-primary-text"
                v-tooltip="user.teams[0] && user.teams[0].name"
              >
                {{ user.teams[0].name | truncate(15) }}
              </div>
              <div v-else class="not-assigned is-regular-14-00-17 no-whitespace-wrap">*No role assigned</div>
            </div>
            <div class="column is-flex is-center" :class="$route.name === 'admin-user-list' ? 'is-2' : 'is-3'">
              <status-tag :status="user.is_guest ? (user.active ? 'active' : 'inactive') : user.status" />
            </div>
            <div v-if="$route.name === 'admin-user-list'" class="column is-1">
              <div class="is-flex is-vcenter is-centered">
                <div @click="open_form(UsersFormComponent, { header: 'Edit Users' }, user)" class="is-pointer">
                  <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-20x20"></sh-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="isLoading">
        <list-header></list-header>
        <list-skeleton></list-skeleton>
      </div>
      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/users-illustration.svg" alt />
        <div slot="button">
          <router-link v-if="$route.name === 'user-list'" :to="{ name: 'user-invite' }">
            <div class="sh-button sh-button--create">Invite Users</div>
          </router-link>
        </div>
      </no-results>
    </div>
    <div>
      <pagination
        :default_page_size="default_page_size"
        :current-page="currentPage"
        :page-count="pageCount"
        class="articles-list__pagination"
        @nextPage="pageChangeHandle('next')"
        @previousPage="pageChangeHandle('previous')"
        @loadPage="pageChangeHandle"
        :visiblePagesCount="visiblePagesCount"
        :totalRecords="totalRecords"
      ></pagination>
    </div>
  </div>
</template>

<script>
  import { userService } from "@/desktop/shared/services/";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import StatusTag from "@/desktop/shared/components/tags/status-tag";
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import UsersFormComponent from "@/desktop/admin/components/users/user-form.component";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
  import Pagination from "@/desktop/shared/components/pagination.vue";
  import UserInviteForm from "@/desktop/core/components/user/user-invite/user-invite-popup";
  import ListHeader from "@/desktop/core/components/user/user-list/components/user-list-header.vue";
  import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
  import { mapState, mapGetters } from "vuex";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

  export default {
    name: "user-list",
    mixins: [FormPopup, PaginationMixin, HashColor],
    components: {
      PrimaryTag,
      StatusTag,
      searchbar,
      Pagination,
      ListHeader,
      ListSkeleton,
    },
    data() {
      return {
        data: null,
        isLoading: false,
        showAll: false,
        UsersFormComponent: UsersFormComponent,
      };
    },

    created() {
      this.getData();
      this.$eventHub.$on("refresh-user-list", this.getData);
      this.$eventHub.$on("refresh-role-details", this.getData);
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-user-list", this.getData);
      this.$eventHub.$off("refresh-role-details", this.getData);
    },
    computed: {
      ...mapGetters(["is_online"]),
    },

    watch: {
      showAll() {
        this.getData();
      },
    },

    methods: {
      async getData() {
        this.isLoading = true;

        let query = {
          labels: true,
          display_picture: true,
        };

        if (this.$route.name === "role-details") query.team = this.$route.params.id;
        else if (this.$route.name === "team-details") query.label = this.$route.params.id;
        else if (this.$route.name === "admin-user-list" || this.$route.name === "user-create" || this.$route.name === "user-edit" || this.showAll)
          query.no_org = "";
        else if (this.$route.name === "organization-details") query.organization = this.$route.params.id;

        await this.get_data(query, userService, true);
        this.isLoading = false;
      },

      open_invite_popup() {
        this.$modal.show(UserInviteForm, {}, { height: "auto" });
      },
    },
  };
</script>

<style lang="scss">
  .user-card {
    display: flex;
    align-items: center;

    .left {
      position: relative;
      margin-right: 1rem;

      .online-status {
        height: 1rem;
        width: 1rem;
        background-color: #00da9e;
        z-index: 9;
        position: absolute;
        border-radius: 50%;
        bottom: 0.2rem;
        right: 0;
        border: 0.1rem solid #fff;
      }

      .badge-container {
        position: absolute;
        top: 2.6rem;
        width: 100%;
        display: flex;
        justify-content: space-around;
      }

      .badge {
        z-index: 1;
        background-color: white;
        color: #ed7836;
        font-weight: 600;
        font-size: 0.9rem;
        font-family: Barlow-SemiBold;
        padding: 0.1rem 0.5rem;
        text-align: center;
        border-radius: 10px;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
        display: inline-block;

        &--owner {
          color: $primary;
        }

        &--guest {
          color: #f9306d;
        }
      }
    }

    .right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
  .name-highlights-on-hover {
    &:hover {
      color: $primary !important;
    }
  }
</style>
