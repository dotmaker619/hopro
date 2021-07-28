<template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section is-paddingless">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
      </div>
      <div class="list-top-section--create">
        <!-- v-if="$route.name === 'user-details'" -->
        <div class="sh-button sh-button--inverted" @click="assign_assets">
          Assign Assets
        </div>
      </div>
    </div>
    <div v-if="data && data.length">
      <list-header></list-header>
      <div class="sh-list">
        <div class="sh-list__item" v-for="item in data" :key="item.id">
          <div class="columns is-flex align-center">
            <div class="column">
              <router-link :to="{ name: 'asset-details', params: { id: item.uid } }" class="has-text-dark">
                <main-details-media
                  :info="{
                    name: item.name,
                    name_class: 'is-medium-16-500-19 has-primary-text',
                    subtext: item.asset_type,
                    subtext_class: 'is-medium-14-500-17 has-primary-text is-capitalized',
                    properties: item.properties,
                    type: 'projectManagement',
                  }"
                  :hideImage="false"
                ></main-details-media>
              </router-link>
            </div>
            <div class="column">
              <primary-tags :tags="item.labels" :toShowCount="1" :type="'team'" :no_wrap="true" :noTopMargin="true" />
            </div>
            <div class="column">
              <assigned-tags v-if="item.tags && item.tags.length" :tags="item.tags" :write_access="false" :number_of_tags_to_display="2" />
              <div v-else class="is-flex align-center">
                <sh-icon :name="'tags'" class="is-20x20 mr-5 has-opacity-6"></sh-icon>
                <span class="is-regular-14-00-17 has-opacity-6">*No tags assigned</span>
              </div>
            </div>
            <div class="column is-flex align-center is-between">
              <div class="is-flex align-center">
                <div class="mr-10 is-flex is-vcenter">
                  <span
                    class="sh-access-tag"
                    :class="{
                      'sh-access-tag--read': item.access === 'read' || item.access === 'write',
                    }"
                  >
                    <i class="fa fa-check" aria-hidden="true" />
                  </span>
                  <span class="ml-5 is-regular-12-00-14 has-text-theme-black has-opacity-7">Read</span>
                </div>
                <div class="is-flex is-vcenter">
                  <span class="sh-access-tag" :class="{ 'sh-access-tag--write': item.access === 'write' }">
                    <i class="fa fa-check" aria-hidden="true" />
                  </span>
                  <span class="ml-5 is-regular-12-00-14 has-text-theme-black has-opacity-7">Write</span>
                </div>
              </div>
              <div class="user--assetlist--drop">
                <sh-icon
                  @click.native="drop_asset(item)"
                  v-tooltip="{ content: 'Remove asset', html: false }"
                  :name="'close'"
                  :file="'helper_sprite'"
                  class="is-16x16 mr-10 is-pointer"
                ></sh-icon>
              </div>
            </div>
          </div>
          <transfer-owner
            :ref="'assetList' + item.uid"
            :name="item.name"
            :service="assetService"
            :id="item.uid"
            @update_user="update_owner(item, $event)"
          ></transfer-owner>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="isLoading">
        <list-header></list-header>
        <list-skeleton></list-skeleton>
      </div>
      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/assets-illustration.svg" alt />
        <div slot="button">
          <router-link v-if="$route.name === 'asset-list'" :to="{ name: 'asset-create' }">
            <div class="sh-button sh-button--create">Create New Asset</div>
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
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="currentAsset.uid"
      :resourceName="currentAsset.name"
      :resourceType="'asset'"
      :resourceService="assetService"
      @closed="showDeleteModal = false"
      @deleted="
        show_success('Resource successfully deleted');
        getData();
      "
    />
  </div>
</template>
<script>
  import { assetService, userService, teamService } from "@/desktop/shared/services/";
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import AssignUserAssets from "@/desktop/core/components/user/user-details/components/assign-user-assets";
  import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
  import Pagination from "@/desktop/shared/components/pagination.vue";
  import ListHeader from "@/desktop/core/components/user/user-details/components/user-asset-list-header.vue";
  import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
  export default {
    mixins: [PaginationMixin],
    name: "user-asset-list",
    components: {
      MainDetailsMedia,
      PrimaryTags,
      AssignedTags,
      searchbar,
      Pagination,
      ListSkeleton,
      ListHeader,
    },
    data() {
      return {
        data: null,
        assetService: assetService,
        isLoading: false,
        showDeleteModal: false,
        currentAsset: null,
      };
    },
    created() {
      this.getData();
      this.$eventHub.$on("refresh-asset-list", this.getData);
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-asset-list", this.getData);
    },

    methods: {
      async getData() {
        this.isLoading = true;

        let query = {};
        let attribute = "assets";

        if (this.$route.name === "team-details-assets") {
          query.users = true;
          await this.get_data_with_attribute(this.$route.params.id, attribute, query, teamService);
        } else if (this.$route.name === "user-details") {
          query.labels = true;
          await this.get_data_with_attribute(this.$route.params.id, attribute, query, userService);
        }
        this.isLoading = false;
      },

      drop_asset(item) {
        if (this.$route.name === "team-details-assets") {
          teamService
            .post({
              id: this.$route.params.id,
              attribute: "assets/unassign",
              body: [{ uid: item.uid }],
            })
            .then(() => {
              this.$eventHub.$emit("refresh-details");
              this.$eventHub.$emit("refresh-asset-list");
            })
            .catch((err) => this.handleErrors());
        } else if (this.$route.name === "user-details") {
          userService
            .post({
              id: this.$route.params.id,
              attribute: "assets/unassign",
              body: [{ uid: item.uid }],
            })
            .then(() => {
              this.$eventHub.$emit("refresh-details");
              this.$eventHub.$emit("refresh-asset-list");
            })
            .catch((err) => this.handleErrors());
        }
        this.$emit("updateDetails");
      },

      open_transfer_popup(id) {
        let i = `assetList${id}`;
        this.$refs[i][0].open_popup();
      },

      assign_assets() {
        if (this.$route.name == "team-details-assets") {
          this.$emit("assigne-team-assets");
        } else {
          this.$modal.show(
            AssignUserAssets,
            {},
            { height: "80%" },
            {
              "closed": () => {
                this.$emit("updateDetails");
              },
            }
          );
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .sh-list__item {
    padding: 1.5rem;
    .user--assetlist--drop {
      visibility: hidden;
    }

    &:hover {
      .user--assetlist--drop {
        visibility: visible;
      }
    }
  }
</style>
