<template>
  <div class="project-reports">
    <div class="project-reports__heading">
      <p class="is-medium-16-500-22">Reports</p>
      <upload-report
        :reports="data"
        :report_types="report_types"
        :is_upload_popup="is_upload_popup"
        @close="is_upload_popup = false"
      ></upload-report>
    </div>
    <div class="project-reports__table" v-if="is_loading || (data && data.length)">
      <div class="project-reports__table--header">
        <div class="columns">
          <div class="column is-medium-16-500-19 has-opacity-7 is-3">Name</div>
          <div class="column is-medium-16-500-19 has-opacity-7 is-2">Report Type</div>
          <div class="column is-medium-16-500-19 has-opacity-7 is-3">Created on</div>
          <div class="column is-medium-16-500-19 has-opacity-7 is-2">Download</div>
          <div class="column is-medium-16-500-19 has-opacity-7 is-2">Action</div>
        </div>
      </div>
      <project-reports-skeleton v-if="is_loading"/>
      <div v-else-if="data && data.length" class="project-reports__table--body">
        <div v-for="(item, i) in data" :key="item.uid">
          <div class="columns project-reports__table--body--item">
            <div class="column is-3">
              <p
                v-if="is_edit_name == -1 || is_edit_name != i"
                :class="[item.name ? 'is-semiBold-16-600-19' : 'has-text-theme-grey is-regular-14-00-17']"
              >{{ item.name ? item.name : "*Name not found" }}</p>
              <p v-else-if="is_edit_name == i" v-cloak>
                <input
                  required
                  type="text"
                  class="input"
                  v-model="name"
                  @keyup.esc="is_edit_name = -1"
                  v-on:keyup.enter="update_name(item)"
                  v-focus
                />
              </p>

              <p class="is-medium-14-500-17 has-opacity-7">Size: {{ $prettysize(item.size) }}</p>
            </div>
            <div class="column is-2">
              <p
                class="report_tag"
              >{{ report_types[item.report_type] ? report_types[item.report_type].label : item.report_type }}</p>
            </div>
            <div class="column is-3">
              <p class="is-medium-16-500-19 no-whitespace-wrap">{{ item.created_at | dateFormat }}</p>
            </div>

            <div
              class="column is-2"
              @mouseenter="hover_on_report = item.uid"
              @mouseleave="hover_on_report = -1"
            >
              <span v-if="access('core', 'can_download_report')">
                <svg
                  viewBox="0 0 100 100"
                  class="image is-48x48 is-pointer mr-auto"
                  @click="onDownload(item)"
                >
                  <use
                    v-if="hover_on_report == item.uid"
                    xlink:href="@/assets/icons/helper_sprite.svg#download-active"
                  />
                  <use v-else xlink:href="@/assets/icons/helper_sprite.svg#download" />
                </svg>
              </span>
              <span v-else @click="no_access_popup('core', 'can_download_report')">
                <svg
                  viewBox="0 0 100 100"
                  class="image is-48x48 is-pointer mr-auto is-not-allowed disabled-link"
                >
                  <use
                    v-if="hover_on_report == item.uid"
                    xlink:href="@/assets/icons/helper_sprite.svg#download-active"
                  />
                  <use v-else xlink:href="@/assets/icons/helper_sprite.svg#download" />
                </svg>
              </span>
            </div>

            <div class="column is-2">
              <p class="actions-button" v-if="access('core', 'can_modify_report')">
                <span
                  v-if="is_edit_name == -1 || is_edit_name != i"
                  @click="onEdit(i, item.name)"
                >
                  <i class="far fa-edit"></i>
                </span>
                <span v-else @click="update_name(item)">
                  <i class="far fa-save"></i>
                </span>
                <span @click="onDelete(item)" v-if="is_edit_name == -1 || is_edit_name != i">
                  <i class="far fa-trash-alt"></i>
                </span>
                <span @click="is_edit_name = -1" v-else>
                  <i class="fas fa-times"></i>
                </span>
              </p>
            </div>
          </div>
          <hr class="divider is-marginless" />
        </div>
      </div>
    </div>
    <no-results v-else>
      <!-- <img slot="image" src="@/assets/illustrations/assets-illustration.svg" alt /> -->
    </no-results>
  </div>
</template>

<script>
import { reportService, uploadService } from "@/desktop/shared/services/";
import UploadReport from "./components/upload-report";

import DeleteConfirmation from "@/desktop/core/shared/components/delete-confirmation-popup";
import ProjectReportsSkeleton from "./components/project-reports-skeleton"

export default {
  components: {
    UploadReport,
    DeleteConfirmation,
    ProjectReportsSkeleton
  },
  data() {
    return {
      is_upload_popup: false,
      data: [],
      is_loading: false,
      is_edit_name: -1,
      name: null,
      hover_on_report: -1,
      report_types: null
    };
  },
  async created() {
    this.is_loading = true;
    await Promise.all([this.getData(), this.getReportTypes()]);
    this.is_loading = false;
  },

  methods: {
    async getData() {
      let { results } = await reportService
        .get_reports({
          query:'datas=false',
          id: this.$route.params.id,
          resource_name: "projects"
        })
        .catch(err => {
          this.handleErrors(err);
        });
      this.data = results;
    },
    async getReportTypes() {
      this.report_types = await uploadService
        .get_report_types({})
        .catch(err => this.handleErrors(err));

      this.report_types = _.keyBy(this.report_types, "name");
    },
    async onDownload(report) {
      let { url } = await reportService.download_report({
        id: this.$route.params.id,
        report_uid: report.uid
      });
      if (url) {
        window.open(url, "_blank");
      }
    },
    onEdit(i, name) {
      this.name = name;
      this.is_edit_name = i;
    },

    async update_name(report) {
      if (!this.name || !this.name.length) {
        this.$toast.warning("Name can not be empty");
      } else {
        await reportService
          .update_report_detail({
            id: this.$route.params.id,
            report_uid: report.uid,
            body: {
              name: this.name
            }
          })
          .catch(err => this.handleErrors(err));

        this.is_edit_name = -1;
        this.getData();
        this.name = null;
      }
    },

    onDelete(item) {
      this.$modal.show(
        DeleteConfirmation,
        {
          report: item,

          type: "Report",
          complete: async () => {
            await reportService
              .delete_project_report({
                id: this.$route.params.id,
                report_uid: item.uid
              })
              .catch(err => this.handleErrors(err));
            this.$buefy.toast.open({
              type: "is-danger",
              message: "Deleted successfully!"
            });
            this.getData();
          }
        },
        {
          width: "30%",
          classes: ["demo-modal-class"],
          scrollable: false,
          height: "auto",
          transition: "nice-modal-fade"
        }
      );
    }
  }
};
</script>

<style lang="scss">
.dialog {
  font-size: initial !important;
  .modal-card {
    .modal-card-body {
      margin: auto;
      display: flex;
      align-items: center;
    }
    .modal-card-foot {
      .button {
        font-size: initial !important;
      }
    }
  }
}
.project-reports {
  margin-top: 3rem;
  border-radius: 1rem;
  &__heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__table {
    background: $white;
    border-top-right-radius: 1rem;
    border-top-left-radius: 1rem;
    &--header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid $grey;
    }
    &--body {
      &--item {
        padding: 1.5rem 2rem;
        align-items: center;

        &:hover {
          .actions-button {
            visibility: visible;
          }
        }
      }
    }
  }
  .actions-button {
    visibility: hidden;

    span {
      margin-right: 2rem;
      cursor: pointer;
    }
    i {
      font-size: 1.8rem;
      color: $grey;
      opacity: 0.9;
    }
  }
}

.report_tag {
  width: max-content;
  padding: 0 1rem;
  height: 3rem;
  border-radius: 25rem;
  border: solid 1.5px #a2a5b5;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.9;
  font-family: Barlow-Medium;
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.21;
  letter-spacing: normal;
  text-align: left;
  color: #171e48;
  white-space: nowrap;
  text-transform: capitalize;
}

.upload_button {
  justify-content: center;
  padding: 0.7rem;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 0.6rem;
  background-color: $white;
  display: flex;
  align-items: center;
  border: solid 1.5px rgba(23, 30, 72, 0.3);
}
</style>
