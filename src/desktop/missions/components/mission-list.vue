<template>
  <div class="mission-list">
    <router-view></router-view>
    <div class="list-top-section">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1,$event)"></searchbar>
        <!-- <filter-button></filter-button> -->
      </div>
      <div class="list-top-section--create" style="display: flex; align-items: center">
        <router-link
          v-if="$route.name === 'group-details-missions'"
          class="mission-list__location"
          :to="{name:'missions-viewer',params:{id:$route.params.id}}"
          tag="div"
        >
          <img src="@/assets/icons/details/location.svg" />
        </router-link>
        <a
          v-if="access('missions', 'can_modify_missions')"
          @click="open_form(MissionFormComponent,{header:'Create Mission for',group_id: $route.params.id})"
        >
          <button class="sh-button sh-button--create">New Mission</button>
        </a>
        <a v-else @click="no_access_popup('missions', 'can_modify_missions')">
          <button class="sh-button sh-button--create is-not-allowed disabled-link">New Mission</button>
        </a>
      </div>
    </div>
    <div v-if="missions && missions.length">
      <div v-for="item in missions" :key="item.id">
        <div
          v-if="(item.readUsers && item.readUsers.length) || (item.writeUsers && item.writeUsers.length)"
          class="sh-list"
        >
          <div class="sh-list__item">
            <mission-list-card
              @edit="open_form(MissionFormComponent,{header:'Edit Mission for'},$event)"
              :missionGroup="item"
              :group="groupDict[item.groupUid]"
              :owner="$store.getters.state_users[item.owner.uid]"
              :users="[...item.readUsers, ...item.writeUsers].map(user => $store.getters.state_users[user.uid])"
            ></mission-list-card>
          </div>
        </div>
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
        <img slot="image" src="@/assets/illustrations/missions-illustration.svg" alt />
        <div slot="button">
          <a
            @click="open_form(MissionFormComponent,{header:'Create Mission for',group_id: $route.params.id})"
          >
            <div class="sh-button sh-button--create">Create New Mission</div>
          </a>
        </div>
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
</template>

<script>
import searchbar from "@/desktop/core/shared/components/searchbar";
import filterButton from "@/desktop/core/shared/components/filter-button";
import missionListCard from "./mission-card";
import MissionFormComponent from "./mission-form.component.vue";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";

import {
  missionService,
  groupService,
  userService
} from "@/desktop/shared/services/";
import MissionInnerCard from "./mission-inner-card";
import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";
import ListSkeleton from "@/desktop/shared/components/skeleton/list-skeleton.vue";
export default {
  mixins: [FormPopup, PaginationMixin],
  components: {
    searchbar,
    filterButton,
    missionListCard,
    MissionInnerCard,
    ListSkeleton,
    Pagination
  },
  data() {
    return {
      missions: null,
      groupDict: {},
      MissionFormComponent: MissionFormComponent,
      isLoading: false
    };
  },
  computed: {
    createFormRoute() {
      if (this.$route.name === "group-details-missions")
        return "group-mission-create";
      return "mission-create";
    }
  },
  created() {
    this.getData();
    this.$eventHub.$on("refresh-mission-list", this.getData);
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-mission-list", this.getData);
  },
  methods: {
    async getData() {
      this.isLoading = true;
      const queryString = require("query-string");

      let defaultQuery = this.get_default_query_params();
      let query = { sort: "desc" };
      if (
        this.$route.name === "group-details-missions" ||
        this.$route.name === "group-mission-create"
      )
        query.groupUid = this.$route.params.id;

      let result = await missionService
        .get_all_missiongroups({
          query: queryString.stringify({ ...defaultQuery, ...query })
        })
        .catch(err => this.handleErrors(err));

      if (result) {
        this.missions = result.data;
        this.updatePagination(result.headers["x-total-count"]);

        this.missions.forEach(m => {
          this.groupDict[m.groupUid] = {};
        });

        let groupQuery = "uid=" + Object.keys(this.groupDict).join(",");
        let groupResult = await groupService
          .getAll({ query: groupQuery })
          .catch(err => this.handleErrors(err));
        if (groupResult) {
          groupResult.results.forEach(g => {
            this.groupDict[g.uid] = g;
          });
        }
        this.groupDict = { ...this.groupDict };
      }
      this.isLoading = false;
    },
    get_mission_users(users) {
      let missionUsers = [];
      users.forEach(u => {
        missionUsers.push(this.userDict[u.uid]);
      });
      return missionUsers;
    }
  }
};
</script>

<style lang="scss">
.mission-list {
  &__list-top-section {
    display: flex;
  }
  &__location {
    width: 4rem;
    height: 4rem;
    border-radius: 6px;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-right: 1rem;
  }
}
</style>