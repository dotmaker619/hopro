<template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section py-5" style="align-items: normal;">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
        <div @click="dropdown = !dropdown">
          <span class="filter__button input is-pointer">
            <i class="fas fa-filter " :class="{ 'has-text-blue': dropdown || filter_by.length }"></i>
          </span>
        </div>
      </div>
    </div>

    <div class="columns is-multiline padding-10 card" v-if="dropdown" v-click-outside="() => (dropdown = false)">
      <p class="checkbox-box pl-5 column is-3 is-flex " v-for="(checkbox, i) in filter_type" :key="i">
        <input :id="'checkbox' + i" class="sleek-checkbox" type="checkbox" :value="checkbox.name" v-model="filter_by" @change="getData()" />
        <label :for="'checkbox' + i" class="is-medium-14-500-17 ml-5 checkbox-label">{{ checkbox.label }}</label>
      </p>
    </div>

    <div v-if="data && data.length">
      <div class="sh-list" v-for="item in data" :key="item.id">
        <div class="sh-list__item" @mouseenter="list_hover = item.uid" @mouseleave="list_hover = -1">
          <div class="columns">
            <div class="column is-3 has-text-dark">
              <div v-if="edit_report === item.uid">
                <input
                  v-focus
                  type="text"
                  @keydown.enter="update_name(item)"
                  v-if="edit_report == item.uid"
                  class="is-semiBold-16-600-19 has-full-width input is-inline-input"
                  v-model="new_report_name"
                />
                <p class="is-medium-14-500-17 has-opacity-7 pt-5 no-whitespace-wrap">{{ `Size: ${$prettysize(item.size)}` }}</p>
              </div>
              <div
                v-else
                v-tooltip="(item.name || '*Not available')"
                class="column is-4 is-pointer"
                @click="$router.push({ name: 'project-details', params: { group_id: item.group.uid, id: item.project.uid } })"
              >
                <p class="is-semiBold-16-600-19 no-whitespace-wrap" v-if="edit_report != item.uid">{{ (item.name || "*Not available") | truncate(20) }}</p>

                <p class="is-medium-14-500-17 has-opacity-7 pt-5 no-whitespace-wrap">{{ `Size: ${$prettysize(item.size)}` }}</p>
              </div>
              <div></div>
            </div>
            <div class="column is-2">
              <p class="is-regular-14-00-17 has-text-light-grey">Report type</p>
              <p class="is-medium-16-500-22 is-capitalized pt-5">{{ item.report_type }}</p>
            </div>
            <div class="column is-3">
              <p class="is-regular-14-00-17 has-text-light-grey">Group</p>
              <primary-tags type="group" :tags="[item.group]"></primary-tags>
            </div>

            <div class="column is-2">
              <p class="is-regular-14-00-17 has-text-light-grey">Project</p>
              <primary-tags type="project" :tags="[item.project]"></primary-tags>
            </div>

            <div class="column is-1">
              <div
                class="is-flex is-center is-vcenter margin-y-auto"
                @mouseenter="hover = item.uid"
                @mouseleave="hover = -1"
                @click="download_report(item)"
                style="height:3.6rem;width:3.6rem;height:100%"
              >
                <span v-if="hover == item.uid">
                  <sh-icon :name="'download-fill'" class="is-pointer is-48x48"></sh-icon>
                </span>
                <span v-else>
                  <sh-icon :name="'download-active'" class="is-pointer is-48x48"></sh-icon>
                </span>
              </div>
            </div>
            <div
              class="asset-dropdown sh-list__item--icn margin-auto column is-1 is-pulled-right"
              v-click-outside="() => (list_hover == item.uid ? (list_hover = -1) : null)"
            >
              <div
                class="asset-dropdown-selection"
                @click="show_dropdown == -1 ? (show_dropdown = item.uid) : (show_dropdown = -1)"
                :class="{ 'is-hidden': list_hover != item.uid && show_dropdown != item.uid }"
              >
                <sh-icon :name="'3-dots-menu'" class="is-20x20 " />
              </div>
              <div class="asset-dropdown-content" v-if="show_dropdown == item.uid">
                <p
                  @click="
                    edit_report = item.uid;
                    new_report_name = item.name;
                    show_dropdown = -1;
                  "
                >
                  <sh-icon :name="'edit-small'" class="is-20x20 mr-5" />
                  <span class="is-medium-14-500-17">Edit report </span>
                </p>

                <p @click="confirm_delete(item)">
                  <sh-icon :name="'delete-small'" class="is-20x20 mr-5" /><span class="is-medium-14-500-17"> Delete report </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="isLoading">
        <list-skeleton
          :options="{
            row_count: 3,
            col_count: 4,
            text: 4,
          }"
        ></list-skeleton>
      </div>
      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/reports-illustration.svg" alt />
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
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="currentReport.uid"
      :resourceName="currentReport.name"
      :resourceType="'report'"
      :resourceService="reportService"
      @closed="showDeleteModal = false"
      @deleted="show_success('Resource successfully deleted');getData();$parent.$emit('update')"
    />
  </div>
</template>
<script>
  import { reportService, uploadService } from "@/desktop/shared/services/";

  import InfoBlock from "@/desktop/shared/components/info-block";
  import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import filterButton from "@/desktop/core/shared/components/filter-button";
  const queryString = require("query-string");
  import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
  import Pagination from "@/desktop/shared/components/pagination.vue";
  import DeleteConfirmation from "@/desktop/core/shared/components/delete-confirmation-popup";
  import ListSkeleton from "@/desktop/shared/components/skeleton/list-skeleton.vue";
  export default {
    mixins: [PaginationMixin],
    name: "asset-list",
    components: {
      InfoBlock,
      PrimaryTags,
      shDropdown,
      searchbar,
      filterButton,
      Pagination,
      ListSkeleton,
      DeleteConfirmation,
    },
    data() {
      return {
        data: null,
        reportService: reportService,
        resource_type: null,
        hover: -1,
        showDeleteModal: false,
        currentReport: null,
        list_hover: -1,
        show_dropdown: -1,
        edit_report: -1,
        new_report_name: null,
        filter_type: null,
        dropdown: false,
        filter_by: [],
      };
    },
    created() {
      if (this.$route.name == "asset-details-reports") {
        this.resource_type = "assets";
      } else if (this.$route.name == "group-details-reports") {
        this.resource_type = "groups";
      }
      if (this.resource_type) this.getData();
    },

    methods: {
      async getData() {
        this.isLoading = true;
        let query = this.get_default_query_params();
        let report_types = this.filter_by.reduce((a, c) => a + "&report_type=" + c, "");
         

        let { results, count } = await reportService
          .get_reports({
            id: this.$route.params.id,
            resource_name: this.resource_type,
            query: queryString.stringify(query) + report_types+"&datas=false",
          })
          .catch((err) => {
            this.handleErrors(err);
          });
        this.data = results;

        let res = await uploadService.get_report_types({}).catch((err) => {
          console.log(err);
        });

        this.filter_type = res;

        this.updatePagination(count);
        this.isLoading = false;
      },
      async update_name(report) {
        if (!this.new_report_name || !this.new_report_name.length) {
          this.$toast.warning("Name can not be empty");
        } else {
          await reportService
            .update_report_detail({
              id: report.project.uid,
              report_uid: report.uid,
              body: {
                name: this.new_report_name,
              },
            })
            .catch((err) => this.handleErrors(err));

          this.edit_report = -1;
          this.getData();
          this.new_report_name = null;
        }
      },
      confirm_delete(item) {
        this.$modal.show(
          DeleteConfirmation,
          {
            report: item,
            type: "Report",
            complete: async () => {
              this.$parent.$emit('update');
              await reportService.delete_project_report({ id: item.project.uid, report_uid: item.uid }).catch((err) => this.handleErrors(err));
              this.show_success('Resource successfully deleted');
              this.getData();
            },
          },
          {
            width: "30%",
            classes: ["demo-modal-class"],
            scrollable: false,
            height: "auto",
            transition: "nice-modal-fade",
          },
          {
            'closed': ()=> {
              this.$parent.$emit('update');
            }
          }
        );
      },
      async download_report(report) {
        let { url } = await reportService.download_report({
          id: report.project.uid,
          report_uid: report.uid,
        });
        if (url) {
          window.open(url, "_blank");
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .list-top-section {
    // height: 6rem;
    display: flex;
    justify-content: space-between;
  }

  .has-text-blue {
    color: $primary;
  }
</style>
