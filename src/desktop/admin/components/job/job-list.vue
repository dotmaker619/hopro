<template>
  <div class="job-list">
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
      <div v-if="jobs && jobs.length">
        <div v-for="item in jobs" :key="item.id" class="sh-list is-paddingless">
          <job-list-card
            :item="item"
            :user="$store.getters.state_users[item.user.uid]"
            @refresh-job-list="getData"
          ></job-list-card>
        </div>
      </div>
      <div v-else>
        <div v-if="isLoading">
          <!-- show skeleton here -->
        </div>
        <no-results v-else />
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
</template>

<script>
import JobListCard from "./components/job-list-card";
import { jobService, userService } from "@/desktop/shared/services/";
import searchbar from "@/desktop/core/shared/components/searchbar";
import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";
export default {
  mixins:[PaginationMixin],
  components: {
    JobListCard,
    searchbar,
    Pagination
  },
  data() {
    return {
      jobs: []
    };
  },
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      let result = await jobService
        .get({
          query: `${this.filterQueryString}page_size=${this.$route.query
            .page_size || this.default_page_size}&page_number=${this.$route
            .query.page || 1}&q=${this.$route.query.q || ""}`
        })
        .catch(err => this.handleErrors(err));
      if (result) {
        this.jobs = result.data;

        this.updatePagination(result.headers["x-total-count"]);
      }
    },

    refreshJobs() {
      this.getData();
    }
  }
};
</script>