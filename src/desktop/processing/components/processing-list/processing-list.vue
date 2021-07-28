<template>
  <div>
    <div
      class="top-section router-project-management-top-section"
      v-if="$route.name !== 'group-details-processing'"
    >
      <h2 class="heading-1 is-medium-14-500-17">Processing</h2>
      <Metrics :page="'processing'" />
    </div>

    <div>
      <div
        class="list-card router-process-management-main"
        :class="{'padding-20' : $route.name != 'group-details-processing' }"
      >
        <div class="list-top-section py-5">
          <div class="list-top-section--search">
            <searchbar @search="pageChangeHandle(1,$event)"></searchbar>
            <!-- <filter-button></filter-button> -->
          </div>
        </div>
        <div v-if="data && data.length">
          <div v-for="item in data" :key="item.id" class="sh-list is-paddingless">
            <processing-list-card :item="item" @refresh-processing-list="getData"></processing-list-card>
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
            tags:1,
            status: 0
          }"
            ></list-skeleton>
          </div>
          <no-results v-else>
            <img slot="image" src="@/assets/illustrations/processing-illustration.svg" alt />
          </no-results>
        </div>

        <div class="columns">
          <div class="column">
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
      </div>
    </div>
  </div>
</template>

<script>
import Metrics from "@/desktop/core/shared/components/metrics/metrics";
import searchbar from "@/desktop/core/shared/components/searchbar";
import filterButton from "@/desktop/core/shared/components/filter-button";
import { processingService, userService } from "@/desktop/shared/services/";
import ProcessingListCard from "./components/processing-list-card";
import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";
import ListSkeleton from "@/desktop/shared/components/skeleton/list-skeleton.vue";
export default {
  mixins: [PaginationMixin],
  components: {
    Metrics,
    searchbar,
    filterButton,
    ProcessingListCard,
    Pagination,
    ListSkeleton,
  },
  data() {
    return {
      data: null,
      processingService: processingService,

      isLoading: false
    };
  },
  created() {
    this.getData();
  },
  computed: {
    hideInfoBlockImage() {
      return this.$route.name == "asset-list" ? false : true;
    }
  },
  methods: {
    async getData() {
      let query = {
        labels: true,
        users: true,
        organization: this.$store.state.current_organization.uid
      };

      if (this.$route.name === "group-details-processing")
        query.group_id = this.$route.params.id;

      await this.get_data(query, processingService);
    }
  }
};
</script>

