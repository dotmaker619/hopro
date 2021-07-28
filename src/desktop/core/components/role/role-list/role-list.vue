<template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1,$event)"></searchbar>
      </div>
      <div class="list-top-section--create">
        <a
          v-if="access('core', 'create_teams')"
          @click="open_form(RoleFormComponent, {header:'Create Role for'})"
        >
          <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17">New Role</div>
        </a>
        <a v-else @click="no_access_popup('core', 'create_teams')">
          <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17 disabled-link">New Role</div>
        </a>
      </div>
    </div>
    <div v-if="data && data.length">
      <list-header></list-header>
      <div class="sh-list" v-for="role in data" :key="role.uid">
        <div class="sh-list__item columns">
          <div class="column ">
            <router-link :to="{name: 'role-details', params: {id: role.uid}}" class="has-text-dark">
              <main-details-media
                :info="{
                  name : role.name, 
                  name_class: 'is-semiBold-16-600-19 name-highlights-on-hover',
                  properties: role.properties,
                  type: 'userManagement'
                }"
              ></main-details-media>
            </router-link>
          </div>
          <div class="column ">
            <main-details-media
              v-if="role.created_by && $store.getters.state_users[role.created_by.uid] && $store.getters.state_users[role.created_by.uid].first_name"
              :info="{
                name: `${$store.getters.state_users[role.created_by.uid].first_name} ${$store.getters.state_users[role.created_by.uid].last_name}`,
                name_class: 'is-medium-16-500-19 has-primary-text',
                image: $store.getters.state_users[role.created_by.uid].display_picture,
                type: 'userManagement'
              }"
            ></main-details-media>
            <main-details-media
              v-else-if="role.created_by && role.created_by.uid"
              :unknown="true"
              :info="{
                  name:  role.created_by.email.includes('@sensehawk')?'Sensehawk':'Unknown',
                  type: 'userManagement'
              }"
            ></main-details-media>
          </div>
          <div class="column">
            <app-tag :apps="role.applications" :howManyToShow="2" />
          </div>
          <div class="column">
            <user-tag
                :no_access="no_access"
                :users="role.users.map(user => $store.getters.state_users[user.uid])"
                :tagsCountToShow="user_count || 3"
                :custom_class=" 'tiny-user-avatar is-medium-14-500-17' "
                :custom_size="30"
              ></user-tag>
          </div>
          <div class="column is-flex is-center">
            <status-tag :status="'active'" />
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
        <img slot="image" src="@/assets/illustrations/roles-illustration.svg" alt />
        <div slot="button">
          <a @click="open_form(RoleFormComponent,{header:'Create Role for'})">
            <div class="sh-button sh-button--create">Create New Role</div>
          </a>
        </div>
      </no-results>
    </div>
    <div>
      <pagination :default_page_size="default_page_size"
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
import StatusTag from "@/desktop/shared/components/tags/status-tag";
import AppTag from "@/desktop/shared/components/tags/app-tag";
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import searchbar from "@/desktop/core/shared/components/searchbar";
import filterButton from "@/desktop/core/shared/components/filter-button";
import { roleService, userService } from "@/desktop/shared/services/";
import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
import RoleFormComponent from "@/desktop/core/components/role/role-list/components/role-form.component";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";
import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
import ListHeader from "@/desktop/core/components/role/role-list/components/role-list-header.vue";
export default {
  mixins: [FormPopup, PaginationMixin],
  name: "role-list",
  components: {
    StatusTag,
    AppTag,
    UserTag,
    searchbar,
    filterButton,
    MainDetailsMedia,
    Pagination,
    ListSkeleton,
    ListHeader
  },
  data() {
    return {
      data: null,
      isLoading: false,
      RoleFormComponent: RoleFormComponent
    };
  },
  created() {
    this.getData();
    this.$eventHub.$on("refresh-role-list", this.getData);
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-role-list", this.getData);
  },
  methods: {
    async getData() {
      this.isLoading = true;
      let query = {
        users: true
      };
      await this.get_data(query, roleService);
      this.isLoading = false;
    }
  }
};
</script>