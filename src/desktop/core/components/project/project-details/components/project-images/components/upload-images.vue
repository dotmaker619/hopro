<template>
  <div>
    <div>
      <p
        v-if="access('core', 'can_upload_images')"
        class="image-block--upload is-pointer"
        @click="popup_active=true"
      >
        <sh-icon :name="'upload'" :file="'helper_sprite'" class="is-24x24 pt-5"></sh-icon>
        <span class="is-medium-12-500-14 has-opacity-8">Upload</span>
      </p>
      <p
        v-else
        @click="no_access_popup('core', 'can_upload_images')"
        class="disabled-link is-not-allowed image-block--upload is-pointer"
      >
        <sh-icon :name="'upload'" :file="'helper_sprite'" class="is-24x24 pt-5"></sh-icon>
        <span class="is-medium-12-500-14 has-opacity-8">Upload</span>
      </p>
    </div>
    <b-modal
      :active="popup_active"
      :width="640"
      @close="popup_active=false"
      :can-cancel="uploading?[]:['escape', 'x', 'outside']"
      scroll="clip"
    >
      <div class="card has-slimscroll-xs" style="max-height:100vh;overflow:scroll">
        <div class="card-header">
          <div class="card-header-title is-uppercase padding-20">Upload Images</div>
          <a
            class="card-header-icon"
            aria-label="more options"
            @click="!uploading?popup_active=false:popup_active=true"
          >
            <sh-icon :name="'close'" :file="'helper_sprite'" class="is-16x16 mr-20"></sh-icon>
          </a>
        </div>
        <div class="card-content has-padding-x-huge">
          <div class="form-content">
            <report-form
              @input="form=$event;uppy1=false;open_popup()"
              :project_report="project_report"
            ></report-form>
          </div>
          <br />
          <div style="height:300px">
            <div v-if="uppy1" id="RawImagesUploadDashboard" class="DashboardContainer"></div>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import ReportForm from "./form.component";

import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import Dashboard from "@uppy/dashboard";
import AwsS3Multipart from "@uppy/aws-s3-multipart";

// And their styles (for UI plugins)
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

export default {
  props: ["project_report"],
  components: {
    ReportForm
  },
  data: function() {
    return {
      uppy1: true,
      uploading: false,
      uppy: null,
      popup_active: false,
      form: {
        name: "",
        service: null,
        report_type: "images",
        region: ""
      },
      dashboardOptions: {
        id: "Dashboard",
        inline: true,
        height: 300,
        target: `#RawImagesUploadDashboard`,
        proudlyDisplayPoweredByUppy: false,
        showProgressDetails: false,
        browserBackButtonClose: true,
        replaceTargetContent: true,
        disableThumbnailGenerator: true
      }
    };
  },
  created() {
    this.form.report_type = "images";
  },
  beforeDestroy() {
    this.uppy = null;
  },
  methods: {
    open_popup() {
      setTimeout(() => {
        this.uppy1 = true;
      }, 100);
      setTimeout(() => {
        this.initialize();
      }, 200);
    },
    custom_filename(meta) {
      if (meta.relativePath)
        return meta.relativePath
          .replace("/", "")
          .replace(/^([^.]*)\.(.*)$/, "$1-SH-" + this.random_string(3) + ".$2")
          .split("/")
          .join("-");
      return meta.name.replace(
        /^([^.]*)\.(.*)$/,
        "$1-SH-" + this.random_string(3) + ".$2"
      );
    },
    random_string(length) {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    },
    initialize() {
      this.uppy = Uppy({
        id: this.id,
        autoProceed: false,
        logger: Uppy.debugLogger,
        debug: false,
        meta: {
          stage: "images",
          resource: JSON.stringify({
            type: "raw-images",
            uid: this.$route.params.id
          })
        },
        restrictions: {
          allowedFileTypes: ["image/*"]
        },
        onBeforeUpload: files => {
          console.log(files);
          // We’ll be careful to return a new object, not mutating the original `files`
          const updatedFiles = {};
          Object.keys(files).forEach(fileID => {
            let filename = this.custom_filename(files[fileID].meta);
            updatedFiles[fileID] = files[fileID];
            updatedFiles[fileID].name = filename;
            updatedFiles[fileID].meta.name = filename;
            updatedFiles[
              fileID
            ].meta.preferred_key = `images/${this.$route.params.id}/${filename}`;
          });
          return updatedFiles;
        }
      });

      this.uppy.use(Dashboard, this.dashboardOptions);
      this.uppy.use(AwsS3Multipart, {
        limit: 4,
        companionUrl:
          process.env.VUE_APP_STORAGE_COMPANION_URL + this.form.region + "/",
        companionHeaders: {
          key: this.$cookies.get("access_token")
        }
      });
      this.uppy.on("upload", data => {
        this.uploading = true;
      });
      this.uppy.on("cancel-all", data => {
        this.uploading = false;
      });

      this.uppy.on("restriction-failed", (file, error) => {
        console.log("restriction-failed");
      });
      this.uppy.on("error", err => {
        this.uploading = false;
        console.log(err);
      });
      this.uppy.on("complete", data => {
        setTimeout(() => {
          this.uploading = false;
          this.$emit("update");
          this.popup_active = false;
        }, 1000);
        this.show_success("Files uploaded");
      });
    }
  }
};
</script>


<style lang="scss" >
.sh-image-details-card {
  background: $white;
  border-radius: 0.5rem;
  height: max-content;
  padding: 2rem;
  margin: 1rem 0;

  .column {
    padding: 1rem;
  }
}
.project__image-details {
  &--images {
    display: flex;
    .image-block {
      height: 6rem;
      width: 7rem;
      background: $blue;
      margin-right: 1rem;
      border-radius: 0.5rem;
      &--upload {
        background: $primary-background;
        border: 1px solid $grey-text;
        border-radius: 0.5rem;

        height: 6rem;
        width: 7rem;
        align-items: center;
        display: flex;
        justify-content: center;
        font-size: 1.4rem;
        flex-direction: column;
      }
    }
  }
  .input {
    border: none;
    border-bottom: 1px solid #eee;
    box-shadow: none;
    background-color: transparent;
  }

  .has-padding-x-huge {
    padding: 2rem 7rem;
  }

  .modal-content {
    overflow: visible;
    height: 100%;
  }
}
</style>
