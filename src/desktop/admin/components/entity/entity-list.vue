<template>
  <div>
    <div class="table-isresponsive">
      <div class="list-card">
        <router-view></router-view>
        <div class="list-top-section">
          <div class="list-top-section--search">
            <searchbar @search="pageChangeHandle(1,$event)"></searchbar>
          </div>
          <div class="list-top-section--create">
            <div @click="open_form(EntityFormComponent, {header:'Create New Entity'})">
              <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17">New Entity</div>
            </div>
          </div>
        </div>
        <div v-if="data && data.length">
          <list-header></list-header>
          <div class="sh-list">
            <div class="sh-list__item" v-for="item in data" :key="item.id">
              <div class="columns is-flex align-center">
                <div class="column is-4">
                  <info-block
                    :info="{
                    name: item.name,
                    subtext: item.description ? item.description : '*No description found',
                    subtext_class: !item.description ? 'is-medium-14-500-17 not-assigned' : 'is-medium-14-500-17 has-primary-text',
                    name_class: 'is-medium-16-500-19 has-primary-text name-highlights-on-hover',
                    properties: item.properties,
                  }"
                  ></info-block>
                </div>
                <div class="column is-3">
                  <info-block
                    v-if="$store.getters.state_users[item.created_by.uid]"
                    :info="{
                      'name': `${$store.getters.state_users[item.created_by.uid].first_name} ${$store.getters.state_users[item.created_by.uid].last_name}`,
                      'image': $store.getters.state_users[item.created_by.uid].display_picture,
                      type: 'userManagement'
                    }"
                  ></info-block>
                </div>
                <div class="column is-2">
                  <primary-tags
                    :tags="[item.organization]"
                    :type="null"
                    :hideIcon="true"
                    :no_wrap="true"
                  />
                </div>
                <div class="column is-2">
                  <p
                    class="is-medium-16-500-19 no-whitespace-wrap"
                  >{{item.created_at | dateFormat}}</p>
                </div>
                <div class=" column is-1 sh-list__item--icon is-flex is-center">
                  <p @click="open_form(EntityFormComponent, {header:'Edit Entity'}, item)" class="is-pointer mr-10">
                    <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-20x20"></sh-icon>
                  </p>
                  <p @click="showDeleteModal = true; currentEntity=item" class="is-pointer">
                    <sh-icon :name="'delete'" :file="'helper_sprite'" class="is-20x20"></sh-icon>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="isLoading">
            <list-header></list-header>
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
            <img slot="image" src="@/assets/illustrations/assets-illustration.svg" alt />
            <div slot="button">
              <router-link v-if="$route.name === 'asset-list'" :to="{name:'asset-create'}">
                <div class="sh-button sh-button--create">Create New Asset</div>
              </router-link>
            </div>
          </no-results>
        </div>
        <div class="columns">
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
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="currentEntity.uid"
      :resourceName="currentEntity.name"
      :resourceType="'entity'"
      :resourceService="entityService"
      @closed="showDeleteModal=false"
      @deleted="show_success('Resource successfully deleted');getData()"
    />
  </div>
</template>



<script>
import searchbar from "@/desktop/core/shared/components/searchbar";
import { entityService, userService } from "@/desktop/shared/services/";
import InfoBlock from "@/desktop/shared/components/main-details-media.vue";
import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
import shDropdown from "@/desktop/shared/components/sh-dropdown";
import filterButton from "@/desktop/core/shared/components/filter-button";
import EntityFormComponent from "./entity-form.component.vue";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
import Pagination from "@/desktop/shared/components/pagination.vue";
import ListSkeleton from "@/desktop/shared/components/skeleton/list-skeleton.vue";
import ListHeader from "@/desktop/admin/components/entity/entity-list-header.vue";
export default {
  mixins: [FormPopup, PaginationMixin],
  components: {
    InfoBlock,
    PrimaryTags,
    shDropdown,
    searchbar,
    filterButton,
    Pagination,
    ListSkeleton,
    ListHeader
  },
  data() {
    return {
      data: null,
      entities: null,
      isLoading: false,
      showDeleteModal: false,
      currentEntity: null,
      entityService: entityService,
      EntityFormComponent: EntityFormComponent,
    };
  },
  created() {
    this.getData();
    this.$eventHub.$on("refresh-entity-list", this.getData);
  },
  beforeDestroy() {
    this.$eventHub.$off("refresh-entity-list", this.getData);
  },
  methods: {
    async getData() {
      this.isLoading = true;

      let { results, count } = await entityService.getAll({
        query: `page_size=${
          this.$route.query.page_size || this.default_page_size
        }&page=${this.$route.query.page || 1}&search=${
          this.$route.query.q || ""
        }&no_org`,
      });
      this.data = results;

      this.isLoading = false;
      this.updatePagination(count);
    },

    deleteEntity(entity) {
      let entity_uid = entity.uid;
      this.$buefy.dialog.confirm({
        type: "is-danger",
        message: `Are you sure you want to delete ` + entity.name + "?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          let id = this.$route.params.uid;
          let entityService = new EntityService(id);
          let results = await entityService.delete({
            id: entity_uid,
          });
          if (results.status === 204) {
            this.$toast.show(
              "Entity deleted sucessfully",
              "",
              this.$store.state.izitoast_options.appSuccess
            );
            this.getData();
          } else {
            this.$toast.show(
              this.$store.state.http_error_messages[err.response.status]
                .message,
              "",
              this.$store.state.izitoast_options.appError
            );
          }
        },
      });
    },
  },
};
</script>
