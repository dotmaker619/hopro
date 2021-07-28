<template>
  <div class="processing-image">
    <div class="processing-image__buttons">
      <div class="processing-image__buttons--view">
        <button class="action-buttons mr-10" :class="{ 'action-buttons--active': !tableView }" @click="tableView = false">
          <i class="fas fa-map-marker mr-10"></i>
          <span class="is-medium-14-500-17">Map</span>
        </button>
        <button class="action-buttons" :class="{ 'action-buttons--active': tableView }" @click="tableView = true">
          <i class="fas fa-list-alt mr-10"></i>
          <span class="is-medium-14-500-17">Images list</span>
        </button>
      </div>
      <div class="processing-image__buttons--actions">
        <div class="sh-buttons-group">
          <button class="sh-button sh-button--inverted">
            Selected
            {{ selected_images && selected_images.length ? selected_images.length : "0" }}
            images
          </button>

          <button class="sh-button" :class="[{ 'is-loading': is_saving_images }, { 'is-disabled': !canStartProcess }]" @click="save_images">
            Save Images
          </button>
        </div>
      </div>
    </div>
    <div class="processinng-images__body">
      <keep-alive>
        <images-map v-if="!tableView && report_details" :report_details="report_details" :raw_images="raw_images"></images-map>
      </keep-alive>
      <!-- @update_process="$emit('update_process_details')" -->
      <keep-alive>
        <images-list
          v-if="tableView"
          :process="process_details.status"
          :images_report="image_report"
          :report_details="report_details"
          :raw_images="raw_images"
        ></images-list>
      </keep-alive>
    </div>
    <div class="images-list__footer is-flex is-end mt-20">
      <div class="sh-buttons-group">
        <button
          class="sh-button sh-button--inverted"
          @click="$emit('resume-processing', (selected_images && selected_images.length) || 0)"
          v-if="process_details.resume"
        >
          <span
            class="is-flex is-center is-vcenter"
            :class="{
              'is-disabled': process_details.status != 'finished' && process_details.status != 'failed',
            }"
          >
            <svg viewBox="0 0 100 100" class="image is-16x16 mr-10">
              <use xlink:href="@/assets/icons/helper_sprite.svg#start-processing" />
            </svg>
            Resume Processing
          </span>
        </button>
        <button
          class="sh-button sh-button--inverted"
          :class="{
            'is-disabled': process_details.status == 'finished' || process_details.status == 'failed',
          }"
          @click="$emit('start-processing')"
          v-else
        >
          <span
            class="is-flex is-center is-vcenter"
            :class="{
              'is-disabled': process_details.status != 'pending' && process_details.gcp_status == 'mark',
            }"
          >
            <svg viewBox="0 0 100 100" class="image is-16x16 mr-10">
              <use xlink:href="@/assets/icons/helper_sprite.svg#start-processing" />
            </svg>
            Start Processing
          </span>
        </button>
        <router-link :to="{ name: 'processing-gcp' }" class="sh-button" tag="button">
          <span class="is-flex is-center is-vcenter">
            <svg viewBox="0 0 100 100" class="image is-16x16 mr-10">
              <use xlink:href="@/assets/icons/sprite.svg#pinned" />
            </svg>
            Add GCP
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import { uploadService, processingService } from "@/desktop/shared/services/";
  import ImagesMap from "./components/images-map";
  import ImagesList from "./components/images-list";
  import { mapState } from "vuex";
  export default {
    components: {
      ImagesList,
      ImagesMap,
    },
    data() {
      return {
        tableView: false,

        is_saving_images: 0,
      };
    },
    created() {
      this.getData();
    },
    computed: {
      ...mapState("processing", ["process_details"]),
      selected_images: {
        get() {
          return this.$store.state.processing.selected_images;
        },
        set(val) {
          this.$store.commit("processing/SET_SELECTED_IMAGES", val);
        },
      },
      image_report: {
        get() {
          return this.$store.state.processing.image_report;
        },
        set(val) {
          this.$store.commit("processing/SET_IMAGE_REPORT", val);
        },
      },
      report_details: {
        get() {
          return this.$store.state.processing.report_details;
        },
        set(val) {
          this.$store.commit("processing/SET_REPORT_DETAILS", val);
        },
      },
      raw_images: {
        get() {
          return this.$store.state.processing.raw_images;
        },
        set(val) {
          this.$store.commit("processing/SET_RAW_IMAGES", val);
        },
      },

      canStartProcess() {
        if (this.process_details.status == "pending" || !this.process_details.resume) return true;
        return false;
      },
    },
    methods: {
      async getData() {
        let { results } = await uploadService.get_reports({
          id: this.process_details.project_id,
        });

        let report = results.find((r) => r.report_type == "image_thumbnails");

        this.image_report = results.find((r) => r.report_type == "images");
        if (!report) report = this.image_report; //when thumbnails has not generated

        if (report) {
          this.get_download_link(report);
        }
      },
      async get_download_link(report) {
        let { urls } = await uploadService
          .get_raw_datas_download_links({
            id: this.process_details.project_id,
            report_uid: report.uid,
          })
          .catch((err) => this.handleErrors(err));

        this.raw_images = urls;
        if (!this.selected_images.length) this.selected_images = Object.keys(urls);

        let result = await uploadService.get_report_details({
          id: this.process_details.project_id,
          body: {},
          report_uid: report.uid,
        });
        this.report_details = result;
      },
      save_images() {
        if (this.selected_images && this.selected_images.length < 4) {
          this.$toast.show("Please select minimum 4 images", "", this.$store.state.izitoast_options.appWarning);
        } else {
          this.is_saving_images = 1;
          Promise.all([
            uploadService.get_raw_datas_download_links({
              id: this.process_details.project_id,
              report_uid: this.image_report.uid,
            }),
            uploadService.get_report_details({
              id: this.process_details.project_id,
              body: {},
              report_uid: this.image_report.uid,
            }),
          ])
            .then(async (values) => {
              this.$toast.show("Images saved", "", this.$store.state.izitoast_options.appSuccess);
              let download_urls = values[0].urls;
              let report_details = values[1];
              let images = [];
              this.selected_images.forEach((key) => {
                images.push({
                  url: download_urls[key],
                  key: key,
                  exif: report_details.datas[key].exif,
                });
              });
              await processingService.put({
                id: this.$route.params.id,
                body: { images: images },
              });
              this.$emit("images_saved");
              this.is_saving_images = 0;
            })
            .catch((err) => {
              this.is_saving_images = 0;
              this.handleErrors(err);
            });
        }
      },
    },
  };
</script>

<style lang="scss">
  .processing-image {
    &__buttons {
      padding: 2rem 0;
      display: flex;
      justify-content: space-between;
      &--view,
      &--actions {
        display: flex;
      }
      &--actions {
        display: flex;
        align-items: center;
        .action-buttons {
          background: $white;
          padding: 1rem 1.5rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1.4rem;
        }
      }
      &--view {
        padding: 1rem 2rem;
        background: $white;
        border: 1px solid #ddd;
        border-radius: 5px;
        .action-buttons {
          background: $white;
          border: none;
          font-size: 1.4rem;
          color: $secondary-text;

          padding: 0.5rem 0.8rem;
          display: flex;
          align-items: center;
          &:hover {
            cursor: pointer;
          }
          &--active {
            background: $secondary-text;
            color: $white;
            border-radius: 0.5rem;
          }
        }
      }
    }
  }
</style>
