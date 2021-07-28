<template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
      </div>
      <div class="list-top-section--create">
        <a v-if="access('core', 'create_labels')" @click="open_form(TeamFormComponent, { header: 'Create Team for' })">
          <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17">New Team</div>
        </a>
        <a v-else @click="no_access_popup('core', 'create_labels')">
          <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17 disabled-link is-not-allowed">New Team</div>
        </a>
      </div>
    </div>
    <div v-if="data && data.length && !isLoading">
      <list-header></list-header>
      <div class="sh-list">
        <div class="sh-list__item" v-for="item in data" :key="item.id">
          <div class="columns is-flex align-center">
            <div class="column is-3">
              <router-link :to="{ name: 'team-details', params: { id: item.uid } }" class="has-text-dark">
                <main-details-media
                  :info="{
                    name: item.name,
                    name_class: 'is-semiBold-16-600-19 name-highlights-on-hover',
                    subtext: item.label && item.label.name,
                    subtext_class: 'is-regular-14-00-17 has-text-theme-black mt-7',
                    properties: item.properties,
                    type: 'userManagement',
                  }"
                ></main-details-media>
              </router-link>
            </div>

            <div class="column is-3">
              <primary-tags :tags="item.asset_id ? [get_associated_asset(item.asset_id)] : []" :type="'asset'" :toShowCount="1" />
            </div>
            <div class="column is-3">
              <primary-tags :tags="item.assets" :type="'asset'" :toShowCount="1" />
            </div>
            <div class="column is-2">
              <user-tag
                :no_access="no_access"
                :users="item.users.map((user) => $store.getters.state_users[user.uid])"
                :tagsCountToShow="user_count || 3"
                :custom_class="'tiny-user-avatar is-medium-14-500-17'"
                :custom_size="30"
              ></user-tag>
            </div>
            <div class="column is-2 is-flex is-between">
              <div class="sh-list__item--icon">
                <sh-dropdown :triggerIsIcon="true">
                  <div slot="content">
                    <p @click="open_form(TeamFormComponent, { header: 'Create Team for' }, item)">
                      <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                      Edit Team
                    </p>
                    <p
                      @click="
                        showDeleteModal = true;
                        currentTeam = item;
                      "
                    >
                      <sh-icon :name="'delete'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                      Delete team
                    </p>
                  </div>
                </sh-dropdown>
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
        <img slot="image" src="@/assets/illustrations/teams-illustration.svg" alt />
        <div slot="button">
          <div @click="open_form({ info: { header: 'Create Team for' } })" class="sh-button sh-button--create">Create New Team</div>
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
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="currentTeam.uid"
      :resourceName="currentTeam.name"
      :resourceType="'team'"
      :resourceService="teamService"
      @closed="showDeleteModal = false"
      @deleted="
        show_success('Resource successfully deleted');
        getData();
      "
    />
  </div>
</template>
<script>
  import { teamService, userService } from "@/desktop/shared/services/";
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import filterButton from "@/desktop/core/shared/components/filter-button";
  import TeamFormComponent from "@/desktop/core/components/team/team-list/components/team-form.component";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
  import Pagination from "@/desktop/shared/components/pagination.vue";
  import ListHeader from "@/desktop/core/components/team/team-list/components/team-list-header.vue";
  import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
  import { mapState } from "vuex";

  export default {
    mixins: [FormPopup, PaginationMixin],
    name: "team-list",
    components: {
      MainDetailsMedia,
      PrimaryTags,
      shDropdown,
      searchbar,
      filterButton,
      UserTag,
      Pagination,
      ListHeader,
      ListSkeleton,
    },
    data() {
      return {
        data: null,
        teamService: teamService,
        isLoading: false,
        showDeleteModal: false,
        currentTeam: null,
        TeamFormComponent: TeamFormComponent,
      };
    },
    computed: {
      ...mapState(["assets"]),
    },
    created() {
      this.getData();
      this.$eventHub.$on("refresh-team-list", this.getData);
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-team-list", this.getData);
    },
    methods: {
      get_associated_asset(asset_id) {
        return _.find(this.assets, (o) => {
          return o.uid == asset_id;
        });
      },
      async getData() {
        this.isLoading = true;
        let query = {
          assets: true,
          users: true,
        };

        if (this.$route.name === "team-details") query.team = this.$route.params.id;
        else if (this.$route.name === "user-details") query.user = this.$route.params.id;

        await this.get_data(query, teamService, true);

        this.isLoading = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .list-top-section {
    display: flex;
    justify-content: space-between;
  }
</style>
