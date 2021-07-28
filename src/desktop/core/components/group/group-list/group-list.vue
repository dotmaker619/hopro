<template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1,$event)"></searchbar>
      </div>
      <div class="list-top-section--create">
        <a @click="open_form_popup()" v-if="access('core', 'create_groups')">
          <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17">New Group</div>
        </a>
        <a v-else @click="no_access_popup('core', 'create_groups')">
          <div class="sh-button sh-button--create disabled-link is-semiBold-14-600-17">New Group</div>
        </a>
      </div>
    </div>
    <div v-if="data && data.length && !isLoading">
      <list-header></list-header>
      <div class="sh-list">
        <div class="sh-list__item" v-for="item in data" :key="item.id">
          <group-list-card
            v-if="item"
            :item="item"
            :groupService="groupService"
            :owner="item.owner?$store.getters.state_users[item.owner.uid]:{}"
            @refresh-group-list="getData"
            @update-group-owner="update_owner(item, $event)"
            @edit="open_form_popup(item)"
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
          <a @click="open_form_popup()">
            <div class="sh-button sh-button--create">Create New Group</div>
          </a>
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
import GroupListCard from "./components/group-list-card";
import searchbar from "@/desktop/core/shared/components/searchbar";
import GroupFormComponent from "@/desktop/core/components/group/group-list/components/group-form.component.vue";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";
import ListHeader from "@/desktop/core/components/group/group-list/components/group-list-header.vue";
import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
export default {
  name: "group-list",
  components: {
    GroupListCard,
    searchbar,
    Pagination,
    ListSkeleton,
    ListHeader,
  },
  mixins: [FormPopup, PaginationMixin],
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
      isLoading: false,
      GroupFormComponent: GroupFormComponent
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
      let query = {
        labels: true,
        users: true
      };

      if (
        this.$route.name === "asset-details-groups" ||
        this.$route.name === "asset-group-create"
      )
        query.asset = this.$route.params.id;
      else if (
        this.$route.name === "container-details" ||
        this.$route.name === "container-group-create"
      )
        query.container = this.$route.params.id;

      await this.get_data(query, groupService);

      this.isLoading = false;
    },
    open_form_popup(edit_item) {
      let info = {};
      info.header = edit_item ? "Edit group for" : "Create Group for";
      if (this.$route.name === "asset-details-groups") {
        info.asset_id = this.$route.params.id;
      }
      if (this.$route.name === "container-details") {
        info.container_id = this.$route.params.id;
      }
      this.open_form(this.GroupFormComponent, info, edit_item);
    },
    
  }
};
</script>



