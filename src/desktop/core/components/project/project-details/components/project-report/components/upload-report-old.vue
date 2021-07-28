<template>
  <b-modal :active="is_upload_popup" :width="640" scroll="keep" @close="is_uploading ? onCancel : $emit('close')">
    <div class="card">
      <div class="card-header">
        <div class="card-header-title sh-text-normal-18 padding-20">Upload Report</div>
      </div>
      <div class="card-content">
        <report-form
          @onchange_filetype="file = null"
          @input="form = $event"
          :services="services"
          :report_types="report_types"
          :form_for="'reports_data'"
        ></report-form>
        <section class="has-text-centered" v-if="!is_uploading">
          <b-field>
            <b-upload v-model="file" drag-drop :accept="allowed_file_type">
              <section class="section">
                <div class="content has-text-centered">
                  <p>
                    <svg viewBox="0 0 100 100" class="image is-32x32 margin-auto">
                      <use xlink:href="@/assets/icons/helper_sprite.svg#upload" />
                    </svg>
                  </p>
                  <p class="sh-text-normal-16">Drop your files here or click to upload</p>
                </div>
              </section>
            </b-upload>
          </b-field>
          <div v-if="file && file.name" class="has-text-centered">
            <div class="tags is-white has-addons is-outlined" style="border-radius:none;    justify-content: center;">
              <a v-tooltip="{ content: ` ${file.name}` , html: false}" class="tag is-info is-outlined is-large" style="border-right:none">{{
                file.name | truncate
              }}</a>
              <a class="tag is-info is-outlined is-large">{{ $prettysize(file.size) }}</a>
              <a class="tag is-info is-outlined is-large" style="border-left:none" @click="file = null">
                <i class="fas fa-times"></i>
              </a>
            </div>
          </div>
          <div v-if="errorss.length">
            <span class="has-text-danger" v-for="(m, i) in errorss" :key="i">{{ m }}</span>
          </div>
        </section>
        <div class="progressbar" v-if="is_uploading">
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td v-tooltip="{ content: `${file_progress.name}` , html: false}">
                  <span v-if="file_progress.name">{{ file_progress.name | truncate }}</span>
                </td>
                <td>{{ $prettysize(file_progress.size) }}</td>
                <td>
                  <progress
                    class="progress is-success"
                    style="height: 1.5rem;
    margin-top: .5rem;"
                    :value="file_progress.value"
                    max="100"
                    >{{ file_progress.value }}%</progress
                  >
                </td>
                <td>{{ file_progress.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- {{fileprogress}} -->
      <div class="card-footr sh-buttons-group is-flex is-center padding-30">
        <button @click="onCancel" class="sh-button has-text-light" v-if="is_uploading">Cancel</button>
        <button @click="start_upload" class="sh-button has-text-light" v-if="!is_uploading">Upload</button>
      </div>
    </div>
  </b-modal>
</template>
<script>
  import axios from "axios";

  import { reportService, uploadService } from "@/desktop/shared/services/";
  import ReportForm from "./form.component";

  const CancelToken = axios.CancelToken;
  export default {
    props: ["reports", "services", "report_types", "is_upload_popup"],
    components: {
      ReportForm,
    },
    data: function() {
      return {
        uploadService: uploadService,
        report_form: {
          name: "",
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
          report_type: "images",
          region: "",
        },
        //===============
        is_uploading: false,
        file_progress: {},
        file: null,
        post_url: null,
        post_creds: null,
        upload_with_creds_instance: null,
      };
    },
    computed: {
      allowed_file_type() {
        let report_type = null;
        //   this.report_types.find(
        // f => f.name == this.form.report_type
        //   );
        return report_type ? report_type.supported_formats.join(",") : "";
      },
    },
    methods: {
      onCancel() {
        if (this.post_url) {
          this.source = null;
          this.$emit("close");
        } else {
          this.upload_with_creds_instance.abort.bind(this.upload_with_creds_instance);
        }
        this.cancel("Operation canceled by the user.");
        this.file = null;
        this.errorss = [];
      },
      create_report(post_body) {
        this.file_progress.status = "Creating Report";
        let body = Object.assign({}, post_body, { name: this.form.name });
        delete body.url;
        reportService.create_report({ body, id: this.$route.params.id }).then((ress) => {
          try {
            this.$parent.getData();
            this.file_progress.status = "Completed!!";
            this.file = null;
            setTimeout(() => {
              this.upload_popup = false;
              this.is_uploading = false;
            }, 1000);
          } catch (err) {
            console.log(err);
          }
        });
      },
      async upload_with_creds(body) {
        try {
          this.post_creds = await this.uploadService.get_post_creds({
            body,
            id: this.$route.params.id,
          });
        } catch (err) {
          this.errorss = err.response.data;
          return;
        }

        var config = AWS.config.update({
          accessKeyId: this.post_creds.credentials.AccessKeyId,
          secretAccessKey: this.post_creds.credentials.SecretAccessKey,
          sessionToken: this.post_creds.credentials.SessionToken,
        });
        var bucket = new AWS.S3({
          params: {
            Bucket: this.post_creds.service.bucket,
          },
        });
        var params = {
          Key: this.post_creds.service.key,
          ContentType: this.file.type,
          Body: this.file,
        };
        this.file_progress = {
          name: this.file.name,
          value: 0,
          status: "Pending",
          size: this.file.size,
        };
        this.is_uploading = true;

        this.upload_with_creds_instance = bucket
          .upload(params, { partSize: 1024 * 1024 * 16 })
          .on("httpUploadProgress", (evt) => {
            this.file_progress.status = "In Progress";
            this.file_progress.value = Math.round((evt.loaded * 100) / evt.total);
          })
          .send((err, data) => {
            if (!err) {
              this.create_report(this.post_creds);
            } else {
              this.file_progress.status = "Error!";
            }
          });
      },
      async start_upload() {
        if (!this.can_modify_report()) {
          this.$toast.show("You do not have enough permissions to upload report!", "", this.$store.state.izitoast_options.appError);
          return;
        }

        this.errorss = [];
        if (!this.file) {
          this.errorss = ["Select file."];
          return;
        }
        if (!this.form.report_type) {
          console.log("Report type not available");
          this.errorss = ["Select the report type."];
          return;
        }

        let body = {
          filename: this.file.name,
          report_type: this.form.report_type,
          service: {
            name: this.form.service.name,
            region: this.form.region,
          },
        };

        if (this.file.size >= 100000000) {
          this.upload_with_creds(body);
          return;
        }

        try {
          this.post_url = await this.uploadService.get_post_url({
            body,
            id: this.$route.params.id,
          });
        } catch (err) {
          this.errorss = err.response.data;
          return;
        }

        this.is_uploading = true;
        let self = this;
        this.file_progress = {
          name: this.file.name,
          value: 0,
          status: "Pending",
          size: this.file.size,
        };
        let formData = new FormData();
        formData.append("file", this.file);
        axios.defaults.headers.common = {};
        axios.defaults.headers.put = {};
        axios
          .put(this.post_url.url, this.file, {
            onUploadProgress: (progressEvent) => {
              this.file_progress.status = "In Progress";
              this.file_progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            },
            cancelToken: new CancelToken(function executor(c) {
              self.cancel = c;
            }),
          })
          .then((res) => {
            this.create_report(this.post_url);
            this.$emit("close");
          })
          .catch((err) => {
            console.log(err);
            this.file_progress.status = "Error!";
            this.errorss = err.response.data;
          });
      },
      download_report(report_uid, project_uid) {
        if (!this.can_download_report()) {
          this.$toast.show("You do not have enough permissions to download the report!", "", this.$store.state.izitoast_options.appError);
          return;
        }
        this.uploadService
          .download_report({
            id: project_uid,
            report_uid,
          })
          .then((res) => {
            window.open(res.data.url, "_blank");
            // var a = document.createElement("a");
            // a.href = res.data.url;
            // a.click();
          });
      },
      update_report(report_uid, project_uid) {
        if (!this.can_modify_report()) {
          this.$toast.show("You do not have enough permissions to update report!", "", this.$store.state.izitoast_options.appError);
          this.edit_mode = -1;
          return;
        }
        this.uploadService
          .update_report_details({
            id: project_uid,
            report_uid,
            body: this.report_form,
          })
          .then((res) => {
            if (this.project) this.getData();
            else this.$emit("change");
            this.$toast.show("Updated sucessfully!", "", this.$store.state.izitoast_options.appSuccess);
            this.edit_mode = -1;
          });
      },
      delete_report(report, project_uid) {
        if (!this.can_modify_report()) {
          this.$toast.show("You do not have enough permissions to delete report!", "", this.$store.state.izitoast_options.appError);
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
              report_uid,
            });
            if (results.status == 204) {
              this.$toast.show("Deleted Successfully", "", this.$store.state.izitoast_options.appSuccess);
              this.$emit("change");
            } else {
              this.$toast.show(this.$store.state.http_error_messages[results.status].message, "", this.$store.state.izitoast_options.appError);
            }
          },
        });
      },

      can_modify_report() {
        if (
          this.$store.getters.is_internal_user ||
          (this.$store.state.claims.app_permissions.core && _.includes(this.$store.state.claims.app_permissions.core, "can_modify_report"))
        ) {
          return true;
        }
        return false;
      },
      can_download_report() {
        if (
          this.$store.getters.is_internal_user ||
          (this.$store.state.claims.app_permissions.core && _.includes(this.$store.state.claims.app_permissions.core, "can_download_report"))
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
      },
    },
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
