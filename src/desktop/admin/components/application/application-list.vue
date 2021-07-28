<template>
  <div>
    <div>
      <div v-for="application in applications" :key="application.uid" class="sh-list">
        <div class="sh-list__item columns" style="min-height:10rem">
          <svg viewBox="0 0 100 100" class="image is-64x64 mr-10 column is-1">
            <use
              :xlink:href="src + '#' + (application.name == 'therm' ? 'thermal' : application.name) + '-square' "
            />
          </svg>
          <div class="column is-6">
            <div class="sh-text-semibold-18">{{application.label}}</div>
            <div
              class="sh-text-normal-16 has-text-grey"
              :class="{'has-text-grey has-opacity-3': !application.description}"
            >{{application.description ? application.description : '*No description found'}}</div>
          </div>

          <div class="column is-2">
            <p class="sh-text-normal-14 has-text-grey">Status</p>
            <span
              class="sh-text-semibold-14"
              :class="{ 'has-text-danger' : !application.active}"
            >{{application.active == true? 'Enabled' : 'Disabled'}}</span>
          </div>

          <div class="column is-2">
            <button class="sh-button" v-if="application.active">Enable</button>
          </div>
        </div>
      </div>
    </div>

    <!-- No results -->
    <div
      class="column has-text-centered no-results"
      v-if="applications && !applications.length"
    >No Results</div>

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
        ></pagination>
      </div>
    </div>
  </div>
</template>



<script>
import { applicationService } from "@/desktop/shared/services/";


import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";

export default {
  mixins: [PaginationMixin],
  components: {
    Pagination
  },
  data() {
    return {
      applications: null,
      keys: ""
    };
  },
  created() {
    this.getData();
  },

  computed: {
    src() {
      return require(`@/assets/icons/sprite.svg`);
    }
  },
  methods: {
    async getData() {
      let { results, count } = await applicationService.getAll({
        query: `page_size=${this.$route.query.page_size ||
          this.default_page_size}&page=${this.$route.query.page ||
          1}&search=${this.$route.query.q || ""}`
      });
      this.applications = results;
      this.updatePagination(count);
    }
  }
};
</script>
