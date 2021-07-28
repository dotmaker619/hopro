<template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
      </div>
      <div class="list-top-section--create">
        <a v-if="access('core', 'create_assets')" @click="open_form(AssetFormComponent, { header: 'Create Asset for' })">
          <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17">New Asset</div>
        </a>
        <a v-else @click="no_access_popup('core', 'create_assets')">
          <div class="sh-button sh-button--create disabled-link is-semiBold-14-600-17">New Asset</div>
        </a>
      </div>
    </div>
    <div v-if="data && data.length && !isLoading">
      <list-header></list-header>
      <div class="sh-list">
        <div
          class="sh-list__item"
          @mouseleave="hover = -1"
          @mouseenter="hover = item.uid"
          v-for="item in data"
          :key="item.id"
          v-click-outside="() => (hover == item.uid ? (hover = -1) : null)"
        >
          <div class="columns ">
            <div class="column is-3">
              <router-link :to="{ name: 'asset-details', params: { id: item.uid } }" class="has-text-dark">
                <main-details-media
                  :truncate_value="22"
                  :info="{
                    name: item.name,
                    subtext: item.asset_type ? item.asset_type : '*Type not found',
                    name_class: 'is-semiBold-16-600-19 has-primary-text name-highlights-on-hover',
                    subtext_class: 'is-medium-14-500-17 has-primary-text is-capitalized',
                    properties: item.properties,
                  }"
                ></main-details-media>
              </router-link>
            </div>
            <div class="column is-2 is-flex align-center ">
              <user-avatar :user="item.owner" :pxsize="30" class="mr-10"></user-avatar>
              <span class=" is-medium-14-500-17 has-text-new-greys" v-username="item.owner"></span>
            </div>
            <div class="column is-4 is-flex  align-center">
              <primary-tags :tags="item.labels" :toShowCount="2" :type="'team'" class="is-marginless no-flex-wrap" :truncate_length="6" />
            </div>
            <div class="column is-3 is-flex is-between  align-center">
              <assigned-tags
                v-if="item.tags && item.tags.length"
                class="mt-1"
                :tags="item.tags"
                :write_access="false"
                :number_of_tags_to_display="3"
              />
              <div v-else class="is-flex align-center">
                <sh-icon :name="'tags'" class="is-20x20 mr-5 has-opacity-6"></sh-icon>
                <span class="is-regular-14-00-17 has-opacity-6">*No tags assigned</span>
              </div>
              <div class="transfer-ownership">
                <transfer-owner
                  :ref="'assetList' + item.uid"
                  :name="item.name"
                  :service="assetService"
                  :id="item.uid"
                  @update_user="update_owner(item, $event)"
                ></transfer-owner>
              </div>
              <div class="asset-dropdown " v-click-outside="() => (dropdown == item.uid ? (dropdown = -1) : null)">
                <div
                  class="asset-dropdown-selection"
                  @click="dropdown == -1 ? (dropdown = item.uid) : (dropdown = -1)"
                  :class="{ 'is-hidden': hover != item.uid && dropdown != item.uid }"
                >
                  <sh-icon :name="'3-dots-menu'" class="is-20x20"></sh-icon>
                </div>
                <div class="asset-dropdown-content" v-if="dropdown == item.uid">
                  <p @click="open_form(AssetFormComponent, { header: 'Edit Asset for' }, item)" tag="p">
                    <sh-icon :name="'edit-small'" class="is-24x24 mr-10"></sh-icon>
                    <span class="no-whitespace-wrap">Edit </span>
                  </p>

                  <p @click="open_transfer_popup(item.uid)">
                    <sh-icon :name="'transfer-2'" class="is-24x24 mr-10"></sh-icon>
                    <span class="no-whitespace-wrap">Transfer ownership</span>
                  </p>
                  <p
                    @click="
                      showDeleteModal = true;
                      currentAsset = item;
                    "
                  >
                    <sh-icon :name="'delete-small'" class="is-24x24 mr-10"></sh-icon>
                    <span class="no-whitespace-wrap">Delete asset</span>
                  </p>
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
        <img slot="image" src="@/assets/illustrations/assets-illustration.svg" alt />
        <div slot="button">
          <a @click="open_form(AssetFormComponent, { header: 'Create Asset for' })">
            <div class="sh-button sh-button--create">Create New Asset</div>
          </a>
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
  import AssetFormComponent from "../asset-form.component.vue";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
  import Pagination from "@/desktop/shared/components/pagination.vue";
  import ListHeader from "@/desktop/core/components/asset/asset-list/components/asset-list-header.vue";
  import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
  export default {
    mixins: [PaginationMixin, FormPopup],
    name: "asset-list",
    components: {
      MainDetailsMedia,
      PrimaryTags,
      AssignedTags,
      searchbar,
      ListHeader,
      ListSkeleton,
      Pagination,
    },
    data() {
      return {
        data: null,
        assetService: assetService,
        isLoading: false,
        showDeleteModal: false,
        currentAsset: null,
        hover: -1,
        dropdown: -1,
        AssetFormComponent: AssetFormComponent,
      };
    },
    created() {
      this.getData();
    },

    methods: {
      async getData() {
        this.isLoading = true;
        let query = {};
        query.users = true;
        query.labels = true;
        await this.get_data(query, assetService);
        this.isLoading = false;
      },

      open_transfer_popup(id) {
        let i = `assetList${id}`;
        this.$refs[i][0].open_popup();
      },
    },
  };
</script>

<style lang="scss">
  .asset-dropdown {
    &-selection {
      cursor: pointer;
    }
    &-content {
      background: $white;
      position: absolute;
      border: 1px solid #eee;
      right: 5rem;

      z-index: 100;
      box-shadow: 0px 2px 4px 0px #cdcdcd;
      border-radius: 0.5rem;
      min-width: 20rem;
      p {
        display: flex;
        padding: 1.2rem;
        border-bottom: 1px solid #eee;
        font-weight: 600;
        font-family: Barlow-regular;
        font-size: 14px;
        &:hover {
          cursor: pointer;
          background: $primary-background;
          color: $primary;
        }
      }
    }
  }

  .list-top-section {
    padding: 0 2rem;
  }
</style>
