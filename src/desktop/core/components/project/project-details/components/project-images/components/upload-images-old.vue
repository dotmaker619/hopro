<template>
  <div>
    <b-modal :active="is_upload_popup" :width="640" @close="on_close" :canCancel="!is_uploading">
      <div class="card">
        <div class="card-header">
          <div class="card-header-title is-uppercase padding-20">
            Upload Images
            <a
              v-if="dropzone && dropzone.files.length"
              class="button is-uppercase is-small is-info ml-10"
              :class="{'is-loading':is_loading_preview}"
              @click="show_preview()"
            >{{!preview_mode?'Preview':'Back'}}</a>
          </div>
          <a href="#" class="card-header-icon" aria-label="more options" @click="on_close">
            <sh-icon :name="'close'" :file="'helper_sprite'" class="is-16x16 mr-20"></sh-icon>
          </a>
        </div>
          <map-preview
            v-if="preview_mode && (preview_data||missions_data)"
            :preview_data="preview_data"
            :missions_data="missions_data"
          >Loading</map-preview>
        <div v-show="!preview_mode" class="card-content has-padding-x-huge">
          <div >
            <div
              v-click-outside="()=>show_dropzone=false"
              id="raw-images-dropzone"
              :class="[show_dropzone?'visible_dropdown dropzone dz-clickable' :'invisible_dropdown' ]"
              class="dropzone dz-clickable"
            >
              <div class="form-content">
                <report-form @input="form=$event"></report-form>
                <hr />
                <section class="has-text-centered" v-if="!is_uploading">
                  <b-field>
                    <div>
                      <div style="display:flex;align-items:center;justify-content:center;">
                        <sh-icon :name="'upload'" :file="'helper_sprite'" class="is-32x32"></sh-icon>
                      </div>
                      <div>Drop files here to upload</div>
                    </div>
                  </b-field>
                  <div class="has-text-centered">
                    <span class="has-text-grey">
                      # of images to upload ::
                      {{dropzone && dropzone.files.length}}
                      <!-- {{total_files}} -->
                    </span>
                  </div>
                </section>
              </div>
            </div>

            <div class="columns" v-if="total_files && is_uploading">
              <div class="column">
                <progress
                  style="height: 2rem;"
                  class="progress is-success"
                  :value="(total_files_uploaded*100/total_files).toFixed(0)"
                  max="100"
                >{{(total_files_uploaded*100/total_files).toFixed(0)}}%</progress>
              </div>
              <div class="column is-3">
                <div class="has-text-centered">
                  <b-taglist attached>
                    <b-tag type="is-dark is-large">{{total_files_uploaded}} / {{total_files}}</b-tag>
                    <b-tag type="is-success is-large">{{(total_files_uploaded*100/total_files).toFixed(0)}} %</b-tag>
                  </b-taglist>
                </div>
              </div>
            </div>
            <div class="uploading-status has-text-centered">{{upload_status_text}}</div>
          </div>
        </div>
        <!-- {{progress}} -->
        <div class="card-footer sh-buttons-group">
          <button
            class="card-footer-item sh-button margin-20"
            v-if="!is_uploading"
            @click="on_close"
          >Close</button>
          <button
            v-if="is_uploading"
            class="card-footer-item sh-button margin-20"
            @click="on_cancel"
          >Cancel</button>
          <button
            v-if="can_upload_images() && !is_uploading"
            @click="start_upload"
            class="card-footer-item sh-button margin-20"
          >Upload</button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>

import { MissionService, uploadService } from "@/desktop/shared/services/";




import ReportForm from "./form.component";
import MapPreview from "./thumbnails-map.component";

export default {
  props: ["project_report", "project_report_images", "is_upload_popup"],
  components: {
    ReportForm,
    MapPreview
  },
  data: function() {
    return {
      show_dropzone: false,
      dropzone: null,
      total_files: 0,
      total_files_uploaded: 0,
      options: {
        url: "https://test.com/",
        paramName: "file", // The name that will be used to transfer the file
        maxFilesize: 100, // MB
        acceptedFiles: "image/*",
        sending: this.sending,
        addedfiles: this.addedFiles,
        autoProcessQueue: false,
        createImageThumbnails: false,
        success: this.on_success,
        error: this.on_error,
        addRemoveLinks: true,
        parallelUploads: 10,
        previewTemplate: '<div style="display:none"></div>',
        queuecomplete: this.on_complete_queue
      },
      uploadService: uploadService,
      apiService: uploadService,
      form: {
        name: "",
        service: null,
        report_type: "images",
        region: ""
      },
      //---------===============----------------
      is_calculating_exifs: false,
      upload_datas_body: {},
      is_uploading: false,
      preview_mode: false,
      is_loading_preview: false,
      preview_data: [],
      all_exifs: {},
      missions_data: null,
      files: [],
      upload_popup: false,
      post_policy: {},
      report_details: null,
      upload_status_text: "",
      services: null,
      report_types: null
    };
  },
  created() {
    this.form.report_type = "images";
  },
  mounted() {
    this.init_dropzone();
  },
  methods: {
    init_dropzone() {
      setTimeout(() => {
        this.dropzone = new Dropzone("div#raw-images-dropzone", this.options);
        this.dropzone.on("dragover", () => {
          // console.log("dragover");
          this.show_dropzone = true;
          // if (!this.dropzone.files.length) this.show_dropzone = false;
        });
        this.dropzone.on("drop", () => {
          // console.log("dragover");
          this.show_dropzone = false;
          // if (!this.dropzone.files.length) this.show_dropzone = false;
        });
        this.dropzone.options.previewsContainer = document.querySelector(
          "#raw-images-dropzone"
        ).innerHTML;
        // console.log(this.dropzone);
      }, 500);
    },
    async start_upload() {
      try {
        if (!this.can_upload_images()) {
          this.$toast.show(
            "You do not have enough permissions to upload images!",
            "",
            this.$store.state.izitoast_options.appError
          );
          return;
        }
        let body = {
          report_type: this.form.report_type,
          service: {
            name: this.form.service.name,
            region: this.form.region
          }
        };
        this.post_policy = await this.uploadService.get_post_policy({
          id: this.$route.params.id,
          body
        });
        this.is_uploading = true;
        this.upload_status_text = "Calculating EXIF";
        await this.calculate_exifs();
        this.upload_status_text = "Removing duplicates";
        this.remove_duplicates();
        // await mark_duplicates();
        this.dropzone.options.url = this.post_policy.policy.url;
        this.dropzone.options.autoProcessQueue = true;

        this.upload_datas_body = {
          name: "",
          stage: this.post_policy.stage,
          service: this.post_policy.service,
          report_type: "images",
          datas: {}
        };
        if (this.dropzone.files.length) {
          this.upload_status_text = "Uploading...";
          this.dropzone.processQueue();
        }
      } catch (err) {
        console.log(err);
        this.upload_status_text = "Something went wrong.Please try again.";
      }
    },
    sending(file, xhr, formData) {
      let fields = this.post_policy.policy.fields;
      for (let key of Object.keys(fields)) {
        formData.append(key, fields[key]);
      }
    },
    removeIfDuplicateFiles(file) {
      let total = this.dropzone.files.length;
      let unique = {};
      this.dropzone.files.forEach(file => (unique[file.name] = file));
      this.dropzone.files = Object.values(unique);
    },
    addedFiles() {
      this.removeIfDuplicateFiles();
      this.total_files = this.dropzone.files.length;
      document.getElementsByClassName("dz-default")[0].style.display = "block";
    },
    is_duplicate(exif) {
      if (this.project_report && this.project_report.datas && exif)
        for (let e of Object.values(this.project_report.datas)) {
          if (
            e.exif.GPSTimeStamp &&
            _.isEqual(e.exif.GPSTimeStamp, exif.GPSTimeStamp) &&
            _.isEqual(e.exif.GPSDateStamp, exif.GPSDateStamp)
          ) {
            console.log(true);
            return true;
          }
        }
      console.log(false);
      return false;
    },
    remove_duplicates() {
      this.dropzone.files.forEach(file => {
        if (this.is_duplicate(this.all_exifs[file.upload.filename])) {
          this.dropzone.removeFile(file);
        }
      });
      this.total_files = this.dropzone.files.length;
      if (!this.total_files) {
        this.is_uploading = false;
        this.upload_status_text = "Selected files already exists.";
        this.dropzone.removeAllFiles(true);
        setTimeout(() => {
          this.on_close();
        }, 1000);
      }
    },
    calculate_exifs() {
      try {
        let self = this;
        return Promise.all(
          this.dropzone.files.map(file => {
            file.upload.filename = this.custom_filename(file);
            let newFile = new File([file], file.upload.filename);
            return new Promise((resolve, reject) => {
              if (!this.all_exifs[newFile.name]) {
                EXIF.getData(newFile, function() {
                  let exif = self.getEXIF(this);
                  self.all_exifs[newFile.name] = exif;
                  resolve();
                });
              } else {
                resolve();
              }
            });
          })
        );
      } catch (err) {
        console.log(err);
      }
    },
    getEXIF(file) {
      if (
        !EXIF.getTag(file, "GPSLatitude") ||
        !EXIF.getTag(file, "GPSLongitude")
      )
        return {};
      // else
      let time;
      if (EXIF.getTag(file, "DateTimeOriginal")) {
        time = moment(
          EXIF.getTag(file, "DateTimeOriginal"),
          "YYYY:MM:DD hh:mm:ss"
        );
      }
      let _exif = {
        Make: EXIF.getTag(file, "Make")
          ? EXIF.getTag(file, "Make").replace(/\0.*$/g, "")
          : "",
        Model: EXIF.getTag(file, "Model")
          ? EXIF.getTag(file, "Model").replace(/\0.*$/g, "")
          : "",
        GPSLatitude: EXIF.getTag(file, "GPSLatitude"),
        GPSLongitude: EXIF.getTag(file, "GPSLongitude"),
        GPSAltitude: EXIF.getTag(file, "GPSAltitude"),
        GPSTimeStamp:
          EXIF.getTag(file, "GPSTimeStamp") ||
          (time && time.format("h:m:s").split(":")),
        GPSDateStamp:
          EXIF.getTag(file, "GPSDateStamp") ||
          (time && time.format("YYYY:MM:DD"))
      };

      let exifLong = EXIF.getTag(file, "GPSLongitude");
      let exifLongRef = EXIF.getTag(file, "GPSLongitudeRef");
      let exifLat = EXIF.getTag(file, "GPSLatitude");
      let exifLatRef = EXIF.getTag(file, "GPSLatitudeRef");

      if (exifLatRef == "S") {
        var latitude =
          exifLat[0] * -1 + (exifLat[1] * -60 + exifLat[2] * -1) / 3600;
      } else {
        var latitude = exifLat[0] + (exifLat[1] * 60 + exifLat[2]) / 3600;
      }
      _exif["GPSLatitude"] = latitude;

      if (exifLongRef == "W") {
        var longitude =
          exifLong[0] * -1 + (exifLong[1] * -60 + exifLong[2] * -1) / 3600;
      } else {
        var longitude = exifLong[0] + (exifLong[1] * 60 + exifLong[2]) / 3600;
      }
      _exif["GPSLongitude"] = longitude;
      return _exif;
    },
    on_success(file) {
      this.upload_datas_body.datas[file.upload.filename] = {
        filename: file.upload.filename,
        exif: this.all_exifs[file.upload.filename],
        misc: {
          size: file.size
        }
      };
      this.update_datas(this);
    },
    on_error(first, errorMessage, third) {
      console.log(errorMessage);
      if (third)
        this.upload_status_text = "Something went wrong. Please Try again";
    },
    update_datas: _.throttle(self => {
      let body = Object.assign({}, self.upload_datas_body);
      self.upload_datas_body.datas = {};

      self.uploadService
        .add_raw_datas({ body, id: self.$route.params.id })
        .then(res => {
          self.total_files_uploaded += Object.values(body.datas).length;
          if (self.total_files_uploaded == self.total_files)
            setTimeout(() => {
              self.upload_status_text = "Upload completed.";
              self.on_close();
            }, 3000);

          // self.project_report = res.data;
          // self.get_report_thumbnails();
          // console.log("EXIF Data Uploaded Success");
        })
        .catch(err => {
          self.upload_status_text = "Something went wrong. Please Try again";
        });
    }, 3000),
    on_cancel() {
      if (this.total_files_uploaded !== this.total_files)
        this.$buefy.dialog.confirm({
          type: "is-danger",
          message: `Are you sure you want to cancel uploads?`,
          confirmText: "Yes",
          cancelText: "No",
          onConfirm: async () => {
            this.total_files = 0;
            this.total_files_uploaded = 0;
            this.is_uploading = false;
            this.is_loading_preview = false;
            this.dropzone.removeAllFiles(true);
          }
        });
    },
    on_complete_queue() {},
    on_close() {
      this.total_files = 0;
      this.total_files_uploaded = 0;
      this.upload_datas_body = {};
      this.upload_status_text = "";
      this.is_uploading = false;
      this.upload_popup = false;
      this.is_loading_preview = false;
      this.dropzone.removeAllFiles(true);
      this.$emit("close");
    },
    // old
    show_preview() {
      let self = this;
      if (!this.preview_mode && this.dropzone.files.length) {
        this.is_loading_preview = true;

        this.calculate_exifs().then(exifs => {
          // this.preview_data = exifs;
          this.preview_mode = !this.preview_mode;
          this.is_loading_preview = false;
          this.preview_data = Object.values(this.all_exifs);
          // new MissionService()
          //   .get_project_missions({
          //     id: this.$route.params.id,
          //     query: "complete=true"
          //   })
          //   .then(res => {
          //     this.is_loading_preview = false;
          //     this.missions_data = res.data;
          //     this.preview_mode = !this.preview_mode;
          //   })
          //   .catch(err => {
          //     this.is_loading_preview = false;
          //     this.preview_mode = !this.preview_mode;
          //     console.log("Error :: fetching Mission");
          //   });
        });
      } else {
        this.preview_mode = !this.preview_mode;
      }
    },
    custom_filename(file) {
      if (file.fullPath)
        return file.fullPath
          .replace(/^([^.]*)\.(.*)$/, "$1-SH-" + this.random_string(3) + ".$2")
          .split("/")
          .join("-  ");
      if (file.name)
        return file.name.replace(
          /^([^.]*)\.(.*)$/,
          "$1-SH-" + this.random_string(3) + ".$2"
        );
      return file.name;
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
    // permissions
    can_upload_images() {
      // TODO
      return true;

      if (
        this.$store.getters.is_internal_user ||
        (this.$store.state.claims.app_permissions.core &&
          _.includes(
            this.$store.state.claims.app_permissions.core,
            "can_upload_images"
          ))
      ) {
        return true;
      }
      return false;
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

  .dropzone {
    min-height: 150px;
    border: 1px dashed rgba(0, 0, 0, 0.3);
    background: white;
    padding: 20px 20px;
    border-radius: 1rem;
  }

  .modal-content {
    overflow: visible;
    height: 100%;
  }
}
#raw-images-dropzone {
  &.visible_dropdown {
    width: 100%;
    height: 40rem;
    opacity: 1;

    visibility: visible;
    border: 2px dashed #999;
    border-radius: 1rem;
    overflow: auto;
  }
  &.invisible_dropdown {
    visibility: hidden;
    height: 29rem;
    width: 100%;

    .form-content {
      opacity: 1 !important;

      visibility: visible !important;
    }
  }
  .dz-image-preview {
    display: none;
  }
  // margin: 10rem auto 0;
  width: 100%;
  .is-hidden {
    display: none;
  }
}
</style>
