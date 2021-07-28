<template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section is-paddingless">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1,$event)"></searchbar>
      </div>
      <div class="list-top-section--create">
        <div class="sh-button sh-button--inverted" @click="assign_groups">Assign Groups</div>
      </div>
    </div>
    <div v-if="data && data.length">
      <list-header></list-header>
      <div class="sh-list">
        <div class="sh-list__item" v-for="item in data" :key="item.id">
          <group-list-card
            v-if="item"
            :item="item"
            :groupService="groupService"
            :owner="item.owner.uid"
            @refresh-group-list="getData"
            @update-group-owner="update_owner(item, $event)"
          ></group-list-card>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="isLoading">
        <list-header></list-header>
        <list-skeleton></list-skeleton>
      </div>
      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/groups-illustration.svg" alt />
        <div slot="button">
          <router-link v-if="$route.name === 'group-list'" :to="{name:'group-create'}">
            <div class="sh-button sh-button--create">Create New Group</div>
          </router-link>
        </div>
      </no-results>
    </div>
    <div>
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
</template>
<script>
import { groupService, userService } from "@/desktop/shared/services/";
import GroupListCard from "./user-group-list-card";
import searchbar from "@/desktop/core/shared/components/searchbar";
import filterButton from "@/desktop/core/shared/components/filter-button";
import AssignUserGroups from "@/desktop/core/components/user/user-details/components/assign-user-groups";
import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";
import ListHeader from "@/desktop/core/components/user/user-details/components/user-group-list-header.vue";
import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
export default {
  mixins: [PaginationMixin],
  name: "user-group-list",
  components: {
    GroupListCard,
    searchbar,
    filterButton,
    Pagination,
    ListSkeleton,
    ListHeader,
  },
  created() {
    this.getData();
    this.$eventHub.$on("refresh-group-list", this.getData);
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-group-list", this.getData);
  },
  data() {
    return {
      data: null,
      groupService: groupService,
      isLoading: false
    };
  },
  computed: {
    createFormRoute() {
      if (this.$route.name === "asset-details-groups")
        return "asset-group-create";
      else if (this.$route.name === "container-details")
        return "container-group-create";
      return "group-create";
    }
  },
  methods: {
    async getData() {
      this.isLoading = true;

      await this.get_data_with_attribute(
        this.$route.params.id,
        "groups",
        { labels: true },
        userService
      );

      this.isLoading = false;
    },

    assign_groups() {
      this.$modal.show(AssignUserGroups, {}, { height: "80%" },
      {
        'closed': ()=> {
          this.$emit("updateDetails");
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.sh-list__item {
  padding: 1.5rem 1.5rem 1.5rem 4rem;
}
</style>