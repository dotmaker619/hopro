<template>
  <div>
    <div class="therm-all" v-if="data && data.length">
      <div class="sh-list" v-for="item in data" :key="item.uid">
        <viewCard class="sh-list__item" :item="item" />
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
      </no-results>
    </div>
  </div>
</template>
<script>
  import { viewService, userService } from "@/desktop/shared/services/";
  import viewCard from "@/desktop/therm/shared/components/view-card";
  import ListSkeleton from "@/desktop/shared/components/skeleton/list-skeleton.vue";
  const queryString = require("query-string");

  export default {
    props: ["asset_id"],
    components: {
      viewCard,
      ListSkeleton,
    },
    data() {
      return {
        data: [],

        recent_therm: null,
      };
    },
    created() {
      this.getData();
    },
    methods: {
      async getData() {
        try {
          this.recent_therm =
            this.$store.state.RECENTLY_ACCESSED_RESOURCES.therm.length > 3
              ? this.$store.state.RECENTLY_ACCESSED_RESOURCES.therm.slice(0, 3)
              : this.$store.state.RECENTLY_ACCESSED_RESOURCES.therm;

          this.isLoading = true;

          let query = {
            metrics: true,
            complete: true,
            // projects: true,
            // important: true,
            page_size: 5,
            page_number: 1,
            // is_asset: true
          };

          if (this.asset_id) {
            query.assetUid = this.asset_id;
          }
          let recent = [];
          this.recent_therm.map(async (rt) => {
            let { data } = await viewService
              .get_view({
                id: rt,
                query: queryString.stringify(query),
              })
              .catch((err) => {
                this.handleErrors(err);
              });
            recent.push(data);
          });
          this.data = recent;
          this.$emit("count", data.length);

          this.isLoading = false;
        } catch (err) {
          this.isLoading = false;
        }
      },
    },
  };
</script>
