<template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section is-paddingless">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1,$event)"></searchbar>
      </div>
      <div class="list-top-section--create">
        <div class="sh-button sh-button--inverted" @click="assign_containers">Assign Containers</div>
      </div>
    </div>
    <div v-if="data && data.length">
      <list-header></list-header>
      <div class="sh-list">
        <div class="sh-list__item" v-for="item in data" :key="item.uid">
          <div class="columns is-flex align-center">
            <div class="column is-3">
              <router-link
                :to="{name: 'asset-details', params:{id:item.uid}}"
                class="has-text-dark"
              >
                <main-details-media
                  :info="{
                    name: item.name,
                    name_class: 'is-medium-16-500-19 has-primary-text',
                    subtext: item.group_counts + ' groups',
                    subtext_class: 'is-medium-14-500-17 has-primary-text is-capitalized has-opacity-7',
                    properties: item.properties,
                    truncate_value: 1
                  }"
                  :hideImage="false"
                ></main-details-media>
              </router-link>
            </div>
            <div class="column is-3">
              <primary-tag
                :tags="item.asset ? [item.asset] : null"
                :type="'asset'"
                :truncate_length="6"
                :noTopMargin="true"
              ></primary-tag>
            </div>
            <div class="column is-3">
              <app-type-tag
                v-if="item.app_types && item.app_types.length"
                :apps="item.app_types"
                :count="3"
                :item_id="item.uid"
              />
              <span v-else class="is-flex align-center">
                <img src="@/assets/icons/not-assigned/application.svg" class="mr-5 has-opacity-6" />
                <span class="is-regular-14-00-17 has-opacity-6">*No apps assigned</span>
              </span>
            </div>
            <!-- <div class="column is-3">
              <type-tag
                v-if="item.tags && item.tags.length"
                :tags="item.tags"
                :addMore="false"
                :showEllipsis="false"
                :tagsToShow="1"
              />
              <div v-else class="is-flex align-center">
                <sh-icon :name="'tags'" class="is-20x20 mr-5 has-opacity-6"></sh-icon>
                <span class="is-regular-14-00-17 has-opacity-6">*No tags assigned</span>
              </div>
            </div> -->
            <div class="column is-3 is-flex align-center is-between">
              <div class="is-flex">
                <div class="mr-10 is-flex is-vcenter">
                  <span
                    class="sh-access-tag"
                    :class="{'sh-access-tag--read' : (item.access === 'read' || item.access === 'write')}"
                  >
                    <i class="fa fa-check" aria-hidden="true" />
                  </span>
                  <span class="ml-5 is-regular-12-00-14 has-text-theme-black has-opacity-7">Read</span>
                </div>
                <div class="is-flex is-vcenter">
                  <span
                    class="sh-access-tag"
                    :class="{'sh-access-tag--write' : item.access === 'write'}"
                  >
                    <i class="fa fa-check" aria-hidden="true" />
                  </span>
                  <span class="ml-5 is-regular-12-00-14 has-text-theme-black has-opacity-7">Write</span>
                </div>
              </div>
              <div v-if="!$store.getters.is_org_user" class="user--containerlist--drop">
                <sh-icon
                  @click.native="drop_container(item)"
                  v-tooltip="{content : 'Remove container'}"
                  :name="'close'"
                  :file="'helper_sprite'"
                  class="is-16x16 mr-10 is-pointer"
                ></sh-icon>
              </div>
            </div>
          </div>
          <transfer-owner
            :ref="'containerList' + item.uid"
            :name="item.name"
            :service="containerService"
            :id="item.uid"
            @update_user="update_owner(item, $event)"
          ></transfer-owner>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="isLoading">
        <list-header></list-header>
        <list-skeleton></list-skeleton>
      </div>
      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/containers-illustration.svg" alt />
        <div slot="button">
          <router-link v-if="$route.name === 'container-list'" :to="{name:'container-create'}">
            <div class="sh-button sh-button--create">Create New Container</div>
          </router-link>
        </div>
      </no-results>
    </div>
    <div>
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
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="currentContainer.uid"
      :resourceName="currentContainer.name"
      :resourceType="'container'"
      :resourceService="containerService"
      @closed="showDeleteModal=false"
      @deleted="show_success('Resource successfully deleted');getData()"
    />
  </div>
</template>

<script>
import {
  containerService,
  userService,
  assetService,
} from "@/desktop/shared/services/";
import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import AppTypeTag from "@/desktop/shared/components/tags/app-type-tag";
import searchbar from "@/desktop/core/shared/components/searchbar";
import AssignUserContainers from "@/desktop/core/components/user/user-details/components/assign-user-containers";
import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";
import ListHeader from "@/desktop/core/components/user/user-details/components/user-container-list-header.vue";
import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
export default {
  mixins: [PaginationMixin],
  name: "user-container-list",
  components: {
    MainDetailsMedia,
    PrimaryTag,
    AppTypeTag,
    searchbar,
    Pagination,
    ListHeader,
    ListSkeleton,
  },
  data() {
    return {
      data: null,
      containerService: containerService,
      isLoading: false,
      showDeleteModal: false,
      currentContainer: null,
    };
  },
  created() {
    this.getData();
    this.$eventHub.$on("refresh-container-list", this.getData);
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-container-list", this.getData);
  },
  computed: {
    hideInfoBlockImage() {
      return this.$route.name == "container-list" ? false : true;
    },
    createFormRoute() {
      if (this.$route.name === "asset-details-containers")
        return "asset-container-create";
      return "container-create";
    },
    isDetailList() {
      if (this.$route.name === "user-details-containers") return true;
      return false;
    },
  },
  methods: {
    async getData() {
      this.isLoading = true;

      if (
        this.$route.name === "user-details-containers" ||
        this.$route.name === "user-container-create"
      ) {
        await this.get_data_with_attribute(
          this.$route.params.id,
          "containers",
          { labels: true },
          userService
        );
      } else {
        let query = {
          labels: true,
          users: true,
        };
        if (
          this.$route.name === "asset-details-containers" ||
          this.$route.name === "asset-container-create"
        )
          query.asset = this.$route.params.id;
        await this.get_data(query, containerService);
      }

      this.isLoading = false;
    },

    drop_container(item) {
      userService
        .post({
          id: this.$route.params.id,
          attribute: "containers/unassign",
          body: [{ uid: item.uid }],
        })
        .then(() => {
          this.$eventHub.$emit("refresh-details");
          this.$eventHub.$emit("refresh-container-list");
        })
        .catch((err) => this.handleErrors());
        this.$emit("updateDetails");
    },

    open_transfer_popup(id) {
      let i = `containerList${id}`;
      this.$refs[i][0].open_popup();
    },

    assign_containers() {
      this.$modal.show(AssignUserContainers, {}, { height: "80%" }, 
      {
        'closed': ()=> {
          this.$emit("updateDetails");
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.sh-list__item {
  padding: 1.5rem;

  .user--containerlist--drop {
    visibility: hidden;
  }

  &:hover {
    .user--containerlist--drop {
      visibility: visible;
    }
  }
}
</style>


