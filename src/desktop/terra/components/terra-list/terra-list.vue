<template>
  <div>
    <div v-if="isMobile">
      <div v-if="isLoading">
        <mobile-list-skeleton />
      </div>
      <div v-else>
        <div v-if="data && data.length">
          <div v-for="item in data" :key="item.id">
            <terra-mobile-item :item="item"></terra-mobile-item>
          </div>
        </div>
        <div v-else class="m-no-terra">
          <div class="m-no-terra--img">
            <img src="@/assets/illustrations/terra-illustration.svg" alt />
          </div>
          <div class="is-flex is-center mt-20 is-medium-16-500-19 has-primary-text">No Terra</div>
          <div class="is-flex is-center mt-10 is-regular-12-00-18 has-primary-text has-opacity-8">No result found</div>
        </div>
      </div>
    </div>
    <div v-else class="terra-list">
      <div class="pin px-20 pt-20" v-if="$route.name == 'terra-list'">
        <div class="pin-text">Terra</div>
        <div class="pin-icon is-disabled">
          <i class="fas fa-thumbtack"></i>
        </div>
      </div>
      <div class="recent">
        <div class="recent-header is-semiBold-16-600-19 px-20" v-if="$route.name == 'terra-list'">Recent</div>
        <list-header></list-header>
        <div v-if="recent_data && recent_data.length">
          <div class="list-card">
            <div class="sh-list">
              <terra-item
                @deleted-item="
                  show_success('Resource successfully deleted');
                  getRecentData();
                "
                v-for="item in recent_data.slice(0, 5)"
                :key="item.id"
                class="sh-list__item"
                :item="item"
                @edit="item.isContainer ? open_container_form_popup(item) : open_form(TerraFormComponent, { header: 'Edit Terra View for' }, $event)"
              ></terra-item>
            </div>
          </div>
        </div>
        <div v-else-if="isRecentLoading">
          <list-skeleton></list-skeleton>
        </div>
        <no-results v-else-if="(!recent_data || !recent_data.length) && $route.name != 'terra-list'">
          <img slot="image" src="@/assets/illustrations/assets-illustration.svg" alt />
        </no-results>
      </div>
      <div class="all mt-40" v-if="$route.name == 'terra-list'">
        <div class="all-header is-semiBold-16-600-19 mb-20 px-20">All</div>
        <div class="all-list">
          <div class="list-card">
            <div class="list-top-section">
              <div class="list-top-section--search">
                <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
              </div>
              <div class="list-top-section--create">
                <a
                  @click="
                    open_form(TerraFormComponent, {
                      header: 'Create Terra View for',
                    })
                  "
                >
                  <div class="sh-button sh-button--create">Create view</div>
                </a>
              </div>
            </div>

            <list-header></list-header>
            <div v-if="data && data.length">
              <div class="sh-list">
                <!-- item.isContainer -->
                <!-- : open_form(TerraFormComponent, { header: 'Edit Terra View for' }, $event) -->
                <terra-item
                  v-for="item in data"
                  :key="item.id"
                  class="sh-list__item"
                  @edit="item.isContainer ? open_container_form_popup() : open_form(TerraFormComponent, { header: 'Edit Terra View for' }, $event)"
                  :item="item"
                  @deleted-item="
                    show_success('Resource successfully deleted');
                    getTerraData();
                  "
                ></terra-item>
              </div>
            </div>
            <div v-else-if="isLoading">
              <list-skeleton></list-skeleton>
            </div>
            <no-results v-else>
              <img slot="image" src="@/assets/illustrations/assets-illustration.svg" alt />
            </no-results>

            <div class="columns" v-if="!isMobile">
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
      </div>
    </div>
  </div>
</template>

<script>
  import { terraService } from "@/desktop/shared/services/";
  import TerraItem from "@/desktop/terra/components/terra-list/components/terra-list-item";
  import TerraMobileItem from "@/mobile/modules/terra/terra-list-item.vue";
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import filterButton from "@/desktop/core/shared/components/filter-button";
  const queryString = require("query-string");
  import TerraFormComponent from "@/desktop/terra/components/terra-form.component.vue";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
  import OrderMixin from "@/desktop/shared/mixins/order.mixin.vue";
  import Pagination from "@/desktop/shared/components/pagination.vue";
  import MobileListSkeleton from "@/mobile/shared/components/list-skeleton.vue";
  import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
  import ListHeader from "@/desktop/terra/components/terra-list/components/terra-list-header.vue";
  import ContainersFormComponent from "@/desktop/core/components/container/container-form.component.vue";

  export default {
    mixins: [FormPopup, PaginationMixin, OrderMixin],
    props: ["asset_id"],
    components: {
      TerraItem,
      TerraMobileItem,
      searchbar,
      filterButton,
      Pagination,
      ListSkeleton,
      MobileListSkeleton,
      ListHeader,
    },
    data() {
      return {
        recent_data: null,
        data: null,
        mobdata: null,
        isRecentLoading: false,
        TerraFormComponent: TerraFormComponent,
        ContainersFormComponent: ContainersFormComponent,
      };
    },
    created() {
      if (!this.isMobile) this.getRecentData();
      if (this.isMobile) this.default_page_size = 1000;
      this.getTerraData();
      // this.getMobData();
    },

    methods: {
      getData() {
        if (this.$route.name != "asset-details") {
          this.getTerraData();
        }
        this.getRecentData();
      },
      async getRecentData() {
        this.isRecentLoading = true;
        try {
          if (this.$route.name == "terra-list") {
            let recents_data = [];
            if (this.$store.state.RECENTLY_ACCESSED_RESOURCES.terra) {
              let recent_terra_uids = this.$store.state.RECENTLY_ACCESSED_RESOURCES.terra.join();
              let { data } = await this.fetch_terra_data(
                `uids=${recent_terra_uids}${this.$route.query.asset ? "&asset=" + this.$route.query.asset : null}`
              );
              let uids = [...this.$store.state.RECENTLY_ACCESSED_RESOURCES.terra];
              recents_data = this.maintain_order(uids, data);
            }

            let result = await this.fetch_terra_data(
              `order=-updated&&page_size=3${this.$route.query.asset ? "&asset=" + this.$route.query.asset : null}`
            );
            let sorted_data = result.data;
            this.recent_data = _.uniqBy([...recents_data, ...sorted_data], (d) => d.uid);
          } else {
            let query = {};
            if (this.$route.meta && this.$route.meta.screen == "mobile") {
              query.page_size = 1000;
              query.page_number = 1;
            } else {
              query.page_size = 5;
              query.page_number = 1;
            }

            if (this.asset_id) {
              query.asset = this.asset_id;
            }
            let { data } = await this.fetch_terra_data(queryString.stringify(query));
            this.recent_data = data;
            this.$emit("count", data.length);
            console.log(this.recent_data);
          }
          this.isRecentLoading = false;
        } catch (err) {
          this.isRecentLoading = false;
        }
      },
      async getTerraData() {
        try {
          this.isLoading = true;
          let query = {
            ...this.get_default_query_params(),
          };
          query.page_num = query.page;
          delete query.page;
          this.$route.query.asset ? (query.asset = this.$route.query.asset) : null;

          let { data, headers } = await this.fetch_terra_data(queryString.stringify(query));

          this.data = data;

          if (this.data) {
          }
          this.updatePagination(headers["x-total-count"]);

          this.isLoading = false;
          console.log(this.data);
        } catch (err) {
          console.log(err);
          this.isLoading = false;
        }
      },
      fetch_terra_data(query) {
        return terraService
          .get_views({
            query: query,
          })
          .catch((err) => this.handleErrors(err));
      },
      open_container_form_popup(edit_item) {
        let info = {};
        info.header = edit_item ? "Edit Container for" : "Create Container for";
        if (this.$route.name === "asset-details-containers") {
          info.asset_uid = this.$route.params.id;
        }
        if (edit_item) {
          info.has_group = edit_item.groups && edit_item.groups.length > 0;
          info.asset_uid = edit_item.metaData.asset.uid;
          info.subheader = edit_item.metaData.asset.name;
          info.header += " asset";
        }
        this.open_form(this.ContainersFormComponent, info, edit_item, [this.getRecentData, this.getData]);
      },
    },
  };
</script>
<style lang="scss">
  .terra-list {
    .recent-header {
      margin-bottom: 21px;
    }
    .list-top-section {
      display: flex;
      justify-content: space-between;
    }
  }
  .m-no-terra {
    background-color: #fff;
    height: calc(100vh - 138px);
    &--img {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      height: 200px;
      img {
        height: 128px;
        width: 128px;
      }
    }
  }
</style>
