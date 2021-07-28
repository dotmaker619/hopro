<template>
  <div>
    <button
      @click="access('core', 'can_modify_report')?open_popup():no_access_popup('core', 'can_modify_report')"
      :class="{'is-not-allowed disabled-link':!access('core', 'can_modify_report')}"
      class="upload_button mb-20"
    >
      <svg viewBox="0 0 100 100" class="image is-24x24 mr-5">
        <use xlink:href="@/assets/icons/helper_sprite.svg#upload-48px" />
      </svg>
      <span class="is-regular-14-500-17 has-opacity-8 has-text-theme-black">Upload more</span>
    </button>

    <b-modal :active="popup_active" :width="640" scroll="clip">
      <div class="card has-slimscroll-xs" style="max-height:100vh;overflow:scroll">
        <div class="card-header">
          <div class="card-header-title sh-text-normal-18 padding-20">Upload Report</div>
          <a @click="popup_active=false" class="card-header-icon" aria-label="more options">
            <span class="icon mr-10">
              <i class="fas fa-times" aria-hidden="true"></i>
            </span>
          </a>
        </div>
        <div class="card-content">
          <report-form
            @onchange_filetype="set_allow_types();uppy.reset();"
            @input="form=$event;"
            :services="services"
            :report_types="report_types"
            :form_for="'reports_data'"
          ></report-form>
          <div style="height:250px;padding:0 3rem">
            <div id="ReportUploadDashboard" class="DashboardContainer"></div>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>
<script>
import axios from "axios";

import { reportService, uploadService } from "@/desktop/shared/services/";
import ReportForm from "./form.component";

import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import Dashboard from "@uppy/dashboard";
import AwsS3Multipart from "@uppy/aws-s3-multipart";

// And their styles (for UI plugins)
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

const CancelToken = axios.CancelToken;
export default {
  props: ["reports", "services", "report_types", "is_upload_popup"],
  components: {
    ReportForm
  },
  data: function() {
    return {
      uppy: null,
      attachments: [],
      dashboardOptions: {
        id: "Dashboard",
        inline: true,
        height: 250,
        target: `#ReportUploadDashboard`,
        proudlyDisplayPoweredByUppy: false,
        showProgressDetails: false,
        browserBackButtonClose: true,
        replaceTargetContent: true
      },

      uploadService: uploadService,
      report_form: {
        name: ""
      },
      edit_mode: -1,
      popup_active: this.is_upload_popup,
      active_contour: null,
      delete_button: false,
      errorss: [], // coz errors keyword is reserved in vuejs
      cancel: null,
      policy: null,
      form: {
        name: "",
        service: null,
        report_type: "",
        region: ""
      },
      uppy: null
    };
  },
  methods: {
    open_popup() {
      this.popup_active = true;
      setTimeout(() => {
        this.initialize();
      }, 100);
    },
    set_allow_types() {
      let allowedFileTypes =
        this.form.report_type && this.report_types[this.form.report_type]
          ? this.report_types[this.form.report_type].supported_formats
          : [];
      let folder_name =
        this.form.report_type && this.report_types[this.form.report_type]
          ? this.report_types[this.form.report_type].folder_name
          : "";

      this.dashboardOptions = { ...this.dashboardOptions };
      this.uppy.setOptions({
        ...this.uppy.opts,
        restrictions: {
          ...this.uppy.opts.restrictions,
          allowedFileTypes: allowedFileTypes
        },
        meta: {
          ...this.uppy.opts.meta,
          resource: JSON.stringify({
            type: "reports",
            uid:
              this.$route.params.id + `${folder_name ? "/" + folder_name : ""}`
          })
        }
      });
    },
    initialize() {

      this.uppy = Uppy({
        id: this.id,
        autoProceed: false,
        logger: Uppy.debugLogger,
        debug: false,
        meta: {
          stage: "core",
          resource: JSON.stringify({
            type: "reports",
            uid: this.$route.params.id
          })
        },
        restrictions: {
          maxFileSize:null,
          maxNumberOfFiles: 1,
          minNumberOfFiles: 1
        }
      });

      this.uppy.use(Dashboard, this.dashboardOptions);
      this.uppy.use(AwsS3Multipart, {
        limit: 4,
        companionUrl: process.env.VUE_APP_STORAGE_COMPANION_URL,
        companionHeaders: {
          key: this.$cookies.get("access_token")
        }
      });

      this.uppy.on("restriction-failed", (file, error) => {
        console.log("restriction-failed");
      });
      this.uppy.on("file-added", file => {
        if (!this.form.report_type) {
          this.show_warning("Pls select Report type");
          this.uppy.reset();
          return;
        }
        let index = (this.reports || []).findIndex(
          r => r.report_type === this.form.report_type
        );
        if (index !== -1) {
          this.show_warning(
            "This report already present pls delete and try again."
          );
          this.uppy.reset();
        }
      });
      this.uppy.on("upload-success", (file, response) => {
        this.updateService(file, response);
      });
      this.uppy.on("error", err => {
        console.log(err);
      });
      this.uppy.on("complete", data => {
        this.show_success("Files uploaded");
      });
    },

    async updateService(file, { uploadURL }) {
      uploadURL = decodeURIComponent(uploadURL);
      let pattern = /https:\/\/(.*)\.s3\.(.*)\.amazonaws.com\/(.*)/g;
      let [_, bucket, region, key] = pattern.exec(uploadURL);
      const serviceObj = {
        stage: this.service,
        name: "aws_s3",
        key: key,
        bucket: bucket,
        region: region
      };
      await this.create_report(
        {
          service: serviceObj,
          fileName: file.name
        },
        file
      );
    },

    async create_report(post_body) {
      let body = Object.assign({}, post_body, {
        report_type: this.form.report_type,
        name: this.form.name || post_body.fileName
      });
      reportService
        .create_report({ body, id: this.$route.params.id })
        .then(ress => {
          try {
            this.$parent.getData();
            setTimeout(() => {
              this.popup_active = false;
            }, 1000);
          } catch (err) {
            console.log(err);
          }
        });
    },
    download_report(report_uid, project_uid) {
      if (!this.can_download_report()) {
        this.$toast.show(
          "You do not have enough permissions to download the report!",
          "",
          this.$store.state.izitoast_options.appError
        );
        return;
      }
      this.uploadService
        .download_report({
          id: project_uid,
          report_uid
        })
        .then(res => {
          window.open(res.data.url, "_blank");
          // var a = document.createElement("a");
          // a.href = res.data.url;
          // a.click();
        });
    },
    update_report(report_uid, project_uid) {
      if (!this.can_modify_report()) {
        this.$toast.show(
          "You do not have enough permissions to update report!",
          "",
          this.$store.state.izitoast_options.appError
        );
        this.edit_mode = -1;
        return;
      }
      this.uploadService
        .update_report_details({
          id: project_uid,
          report_uid,
          body: this.report_form
        })
        .then(res => {
          if (this.project) this.getData();
          else this.$emit("change");
          this.$toast.show(
            "Updated sucessfully!",
            "",
            this.$store.state.izitoast_options.appSuccess
          );
          this.edit_mode = -1;
        });
    },
    delete_report(report, project_uid) {
      if (!this.can_modify_report()) {
        this.$toast.show(
          "You do not have enough permissions to delete report!",
          "",
          this.$store.state.izitoast_options.appError
        );
        return;
      }
      let report_uid = report.uid;
      this.$buefy.dialog.confirm({
        type: "is-danger",
        message: "Are you sure tou want to delete " + report.name + "?",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: async () => {
          let id = project_uid;
          let results = await this.uploadService.delete_report({
            id,
            report_uid
          });
          if (results.status == 204) {
            this.$toast.show(
              "Deleted Successfully",
              "",
              this.$store.state.izitoast_options.appSuccess
            );
            this.$emit("change");
          } else {
            this.$toast.show(
              this.$store.state.http_error_messages[results.status].message,
              "",
              this.$store.state.izitoast_options.appError
            );
          }
        }
      });
    },
    can_modify_report() {
      if (
        this.$store.getters.is_internal_user ||
        (this.$store.state.claims.app_permissions.core &&
          _.includes(
            this.$store.state.claims.app_permissions.core,
            "can_modify_report"
          ))
      ) {
        return true;
      }
      return false;
    },
    can_download_report() {
      if (
        this.$store.getters.is_internal_user ||
        (this.$store.state.claims.app_permissions.core &&
          _.includes(
            this.$store.state.claims.app_permissions.core,
            "can_download_report"
          ))
      ) {
        return true;
      }
      return false;
    },
    async enableEdit(i, name) {
      this.edit_mode = i;
      this.report_form.name = name;
      await Vue.nextTick();
      this.$refs["input" + i][0].focus();
    }
  }
};
</script>
<style lang="scss" scoped>
.form {
  .input,
  .input:focus {
    box-shadow: none;
    border-color: grey;
  }
}
.report-type {
  &:hover {
    .fa-angle-right {
      transition: all 0.3s;
      margin-left: 6px;
    }
  }
}
.file_tag {
  border: 1px solid gray;
  background: white;
  text-transform: uppercase;
  font-weight: 500;
  font-size: 0.7rem;
  letter-spacing: 1px;
  &:hover {
    i {
      color: black;
    }
  }
}
td {
  cursor: default;
}
</style>
