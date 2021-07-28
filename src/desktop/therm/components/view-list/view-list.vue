<template>
  <div>
    <div v-if="isMobile">
      <div v-if="isLoading"><mobile-list-skeleton /></div>
      <div v-else>
        <div v-if="data && data.length">
          <div v-for="item in data" :key="item.id">
            <therm-mobile-item :item="item"></therm-mobile-item>
          </div>
        </div>
        <div v-else class="m-no-terra">
          <div class="m-no-terra--img">
            <img src="@/assets/illustrations/m-no-thermal-illustration.svg" alt="" />
          </div>
          <div class="is-flex is-center mt-20 is-medium-16-500-19 has-primary-text">No Thermal</div>
          <div class="is-flex is-center mt-10 is-regular-12-00-18 has-primary-text has-opacity-8">No result found</div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="is-medium-14-500-17 has-text-theme-grey has-opacity-7 mb-20 mt-20 px-20" v-if="$route.name == 'therm-view-list'">Thermal</div>
      <div class="therm-all pb-30">
        <div class="is-semiBold-16-500-19 mb-20 px-20" v-if="$route.name == 'therm-view-list'">Recent</div>
        <list-header></list-header>
        <div class="therm-all" v-if="recent_data && recent_data.length">
          <div class="sh-list">
            <viewCard v-for="item in recent_data.slice(0, 5)" :key="item.uid" class="sh-list__item" :item="item" />
          </div>
        </div>
        <div v-else>
          <div v-if="isRecentLoading">
            <list-skeleton></list-skeleton>
          </div>
          <no-results v-else>
            <img slot="image" src="@/assets/illustrations/assets-illustration.svg" alt />
          </no-results>
        </div>
      </div>
      <div class="therm-all mt-30" v-if="$route.name == 'therm-view-list'">
        <div class="is-semiBold-16-500-19 mb-20 px-20">All</div>
        <div class="list-top-section">
          <div class="list-top-section--search">
            <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
          </div>
          <div class="list-top-section--create">
            <a
              v-if="access('therm', 'can_create_views')"
              @click="open_form(ThermFormComponent, { header: 'Create Thermal View for' })"
              class="sh-button sh-button--create"
              >New View</a
            >
            <a v-else @click="no_access_popup('therm', 'can_create_views')">
              <div class="sh-button sh-button--create is-not-allowed disabled-link">New View</div>
            </a>
          </div>
        </div>
        <list-header></list-header>
        <div class="py-10" v-if="data && data.length">
          <div class="sh-list">
            <viewCard v-for="item in data" :key="item.uid" :item="item" class="sh-list__item" />
          </div>
        </div>
        <div v-else>
          <div v-if="isLoading">
            <list-skeleton></list-skeleton>
          </div>
          <no-results v-else>
            <img slot="image" src="@/assets/illustrations/assets-illustration.svg" alt />
          </no-results>
        </div>
      </div>
      <div class="columns" v-if="$route.name == 'therm-view-list'">
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
  import { viewService, userService } from "@/desktop/shared/services/";
  import viewCard from "@/desktop/therm/shared/components/view-card";
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import filterButton from "@/desktop/core/shared/components/filter-button";
  const queryString = require("query-string");
  import ThermFormComponent from "../therm-form.component.vue";
  import { mapState } from "vuex";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
  import Pagination from "@/desktop/shared/components/pagination.vue";
  import ThermMobileItem from "@/mobile/modules/therm/therm-list-item.vue";
  import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
  import MobileListSkeleton from "@/mobile/shared/components/list-skeleton.vue";
  import OrderMixin from "@/desktop/shared/mixins/order.mixin.vue";
  import ListHeader from "@/desktop/therm/components/view-list/therm-list-header.vue";
  export default {
    mixins: [FormPopup, PaginationMixin, OrderMixin],
    props: ["asset_id"],
    components: {
      searchbar,
      filterButton,
      viewCard,
      Pagination,
      ThermMobileItem,
      ListSkeleton,
      MobileListSkeleton,
      ListHeader,
    },
    data() {
      return {
        data: [],
        ThermFormComponent: ThermFormComponent,
        recent_data: [],
        isRecentLoading: false,
      };
    },
    created() {
      if (!this.isMobile) {
        this.getRecentData();
      }
      this.getData();
    },
    methods: {
      async getRecentData() {
        try {
          let query = {
            metrics: true,
            complete: true,
            page_number: 1,
            page_size: 5,
          };

          this.$route.query.asset ? (query.assetUid = this.$route.query.asset) : null;
          this.isRecentLoading = true;

          if (this.$route.name == "therm-view-list") {
            let recents_data = [];
            if (this.$store.state.RECENTLY_ACCESSED_RESOURCES.therm && this.$store.state.RECENTLY_ACCESSED_RESOURCES.therm.length) {
              let recent_therm_uids = [...this.$store.state.RECENTLY_ACCESSED_RESOURCES.therm].slice(0, 6).join("&viewUid=");

              let { data } = await this.fetch_therm_data(`${queryString.stringify(query)}&viewUid=${recent_therm_uids}`);

              let uids = [...this.$store.state.RECENTLY_ACCESSED_RESOURCES.therm];
              recents_data = this.maintain_order(uids, data);
            }

            let result = await this.fetch_therm_data(`${queryString.stringify(query)}&page_size=3&sort=-updatedAt`);

            let sorted_data = result.data;
            this.recent_data = [...recents_data, ...sorted_data];

            this.recent_data = _.uniqBy(this.recent_data, "uid");
          } else {
            if (this.asset_id) {
              query.assetUid = this.asset_id;
            }

            let { data } = await this.fetch_therm_data(queryString.stringify(query));

            this.recent_data = data;
            this.$emit("count", data.length);
          }
          this.isRecentLoading = false;
        } catch (err) {
          this.isRecentLoading = false;
        }
      },
      async getData() {
        try {
          this.isLoading = true;
          let query = {
            metrics: true,
            complete: true,
            projects: true,
            important: true,
            page_size: 1000,
            page_number: this.$route.query.page || 1,
            q: this.$route.query.q || "",
          };
          this.$route.query.asset ? (query.assetUid = this.$route.query.asset) : null;
          let { data } = await this.fetch_therm_data(queryString.stringify(query));

          this.data = data;
          this.isLoading = false;
        } catch (err) {
          this.isLoading = false;
        }
      },

      fetch_therm_data(query) {
        return viewService
          .getAll({
            query: query,
          })
          .catch((err) => this.handleErrors(err));
      },
    },
  };
</script>

<style></style>
