<template>
  <div>
    <div class="list-card">
      <router-view></router-view>
      <div class="list-top-section">
        <div class="list-top-section--search">
          <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
        </div>
        <div class="list-top-section--create">
          <div @click="open_form(OrgFormComponent, { header: 'Create New Organization' })">
            <div
              class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17"
            >New organization</div>
          </div>
        </div>
      </div>
      <div v-if="organizations && organizations.length && !isLoading">
        <list-header></list-header>
        <div class="sh-list">
          <div class="sh-list__item" v-for="item in organizations" :key="item.id">
            <div class="columns is-flex align-center">
              <div class="column is-3">
                <div @click="change_organization(item)" class="has-text-dark is-pointer">
                  <main-details-media
                    :truncate_value="20"
                    :info="{
                      name: item.name,
                      name_class: 'is-medium-16-500-19 has-primary-text name-highlights-on-hover',
                      properties: item.properties,
                    }"
                  ></main-details-media>
                </div>
              </div>
              <div class="column is-2">
                <div
                  v-if="item.owner && $store.getters.state_users[item.owner.uid]"
                  class="is-flex align-center"
                >
                  <user-avatar :user="item.owner" :pxsize="30" class="mr-10"></user-avatar>
                  <span class="is-medium-14-500-17 has-text-theme-grey" v-username="item.owner"></span>
                </div>
                <p v-else class="is-regular-14-00-17 not-assigned">*No owner</p>
              </div>
              <div class="column is-3">
                <app-tag :apps="item.applications" :howManyToShow="3" :item_id="item.uid" />
              </div>
              <div class="column is-2">
                <p class="is-medium-16-500-19 no-whitespace-wrap">{{ item.created_at | dateFormat }}</p>
              </div>
              <div class="column is-2 is-flex is-center is-between">
                <div></div>
                <status-tag :status="item.active ? 'active' : 'inactive'" />
                <div class="sh-list__item--icon" title="Go to details">
                  <router-link :to="{ name: 'organization-details', params: { id: item.uid } }">
                    <sh-icon :name="'group-right-arrow'" class="is-15x15"></sh-icon>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div v-if="isLoading">
          <list-skeleton
            :options="{
              row_count: 5,
              col_count: 4,
              name: 2,
              team: 1,
              user: 0,
              tags: 1,
              status: 0,
            }"
          ></list-skeleton>
        </div>
        <no-results v-else>
          <img slot="image" src="@/assets/illustrations/assets-illustration.svg" alt />
          <div slot="button">
            <router-link :to="{ name: 'orgnization-create' }">
              <div class="sh-button sh-button--create">Create New Asset</div>
            </router-link>
          </div>
        </no-results>
      </div>
      <div class="columns">
        <div class="column">
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
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

import { organizationService } from "@/desktop/shared/services/";
import searchbar from "@/desktop/core/shared/components/searchbar";
import MainDetailsMedia from "@/desktop/shared/components/main-details-media.vue";
import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
import AppTag from "@/desktop/shared/components/tags/app-tag";
import StatusTag from "@/desktop/shared/components/tags/status-tag";
import OrgFormComponent from "./organization-form.component.vue";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";
import ListSkeleton from "@/desktop/shared/components/skeleton/list-skeleton.vue";
import ListHeader from "@/desktop/admin/components/organizations/organization-list-header.vue";

export default {
  mixins: [FormPopup, PaginationMixin],
  components: {
    MainDetailsMedia,
    PrimaryTags,
    AppTag,
    searchbar,
    StatusTag,
    Pagination,
    ListHeader
  },
  data() {
    return {
      organizations: null,
      isLoading: false,
      OrgFormComponent: OrgFormComponent
    };
  },
  created() {
    this.getData();
    this.$eventHub.$on("refresh-organization-list", this.getData);
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-organization-list", this.getData);
  },
  methods: {
    ...mapMutations(["SET_CURRENT_ORGANIZATION"]),
    async change_organization(organization) {
      this.SET_CURRENT_ORGANIZATION(organization);
      await this.$router.push({ name: "home" });
      this.$router.go();
    },
    async getData() {
      this.isLoading = true;
      let { results, count } = await organizationService.getAll({
        query: `page_size=${this.$route.query.page_size ||
          this.default_page_size}&page=${this.$route.query.page ||
          1}&search=${this.$route.query.q || ""}`
      });
      this.organizations = results;
      this.isLoading = false;
      this.updatePagination(count);
    }
  }
};
</script>

<style lang="scss">
.no-results {
  padding: 10rem;
}
.details-arrow {
  color: black;
  &:hover {
    color: red;
  }
}
</style>
