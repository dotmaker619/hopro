<template>
  <div>
    <div class="m-ticket__search-bar">
      <search-bar @search="handleSearch" :placeholder_value="'Search Asset'"></search-bar>
    </div>
    <div v-if="is_asset_loading"><mobile-list-skeleton /></div>
    <div v-else class="mobile-assets">
      <template v-if="data && data.length">
        <div v-for="asset in data" :key="asset.uid">
          <router-link class="mobile-assets-item" :to="{ name: 'dashboard', query: { asset: asset.uid, asset_name: asset.name } }" tag="div">
            <div class="is-flex is-vcenter">
              <p
                class="image is-24x24 is-rounded has-text-white tiny-user-avatar mr-10"
                :style="
                  `background-color: ${
                    asset.properties && asset.properties.color ? asset.properties.color : hashed_color(asset.name, 'projectManagement')
                  }`
                "
              >
                {{ asset.name.charAt(0) }}
              </p>
              <div>
                <p class="is-medium-16-500-19 ">{{ asset.name | truncate(45) }}</p>
                <assigned-tags :write_access="false" :tags="asset.tags" :number_of_tags_to_display="2" v-if="asset.tags && asset.tags.length" />
                <p v-else class="is-regular-12-00-14 has-text-blue-grey has-opacity-7 mt-5">No tags</p>
              </div>
            </div>
            <div class="is-regular-12-00-14 is-capitalized has-text-new-grey" style="align-self: flex-end;">
              {{ asset.asset_type }}
            </div>
          </router-link>
        </div>
      </template>
      <div v-else class="m-no-asset">
        <div class="m-no-terra--img">
          <img src="@/assets/illustrations/assets-illustration.svg" alt="" />
        </div>
        <div class="is-flex is-center mt-20 is-medium-16-500-19 has-primary-text">No Assets</div>
        <div class="is-flex is-center mt-10 is-regular-12-00-18 has-primary-text has-opacity-8">No result found</div>
      </div>
    </div>
  </div>
</template>

<script>
  import SearchBar from "@/mobile/shared/components/searchbar.vue";
  import { assetService } from "@/desktop/shared/services/";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  const queryString = require("query-string");
  import MobileListSkeleton from "@/mobile/shared/components/list-skeleton.vue";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

  export default {
    mixins: [HashColor],
    data() {
      return {
        data: null,
        is_asset_loading: true,
        search_query: "",
      };
    },
    components: {
      AssignedTags,
      SearchBar,
      MobileListSkeleton,
    },
    created() {
      this.getData();
    },
    methods: {
      handleSearch(query) {
        this.search_query = query;
        this.getData();
      },
      async getData() {
        this.is_asset_loading = true;
        let query = {
          page_size: 1000,
          page_number: 1,
          search: this.search_query,
        };

        let { results } = await assetService.getAssetsDashboard({ query: queryString.stringify(query) });
        this.data = results;

        this.is_asset_loading = false;
      },
    },
  };
</script>

<style lang="scss">
  .mobile-assets {
    height: calc(100vh - 14rem);
    overflow: auto;
    &-item {
      display: flex;
      min-height: 6rem;
      background: white;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #eee;
      align-items: center;
    }
  }

  .m-no-asset {
    background-color: #fff;
    height: calc(100vh - 138px);
    &--img {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      height: 200px;
      img {
        height: 15.3rem;
        width: 18rem;
      }
    }
  }
</style>
