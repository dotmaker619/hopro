<template>
  <div class="project__image-details">
    <div class="sh-medium-header is-marginless">Image details</div>
    <div v-if="is_loading" class="mt-10">
      <project-images-skeleton />
    </div>
    <div v-else class="mt-10 columns sh-image-details-card is-multiline is-mobile">
      <div class="column is-one-quarter">
        <p class="is-regular-14-00-17 has-text-light-grey pb-10 is-marginless">Data Captured Time</p>
        <p
          class="is-medium-14-00-17"
        >{{details.data_captured_time ? details.data_captured_time : "*Not found"}}</p>
      </div>
      <div class="column is-one-quarter">
        <p class="is-regular-14-00-17 has-text-light-grey pb-10 is-marginless">Data upload time</p>
        <p
          class="is-medium-14-00-17"
        >{{details.data_upload_time ? details.data_upload_time : "*Not found"}}</p>
      </div>
      <div class="column is-one-quarter">
        <p class="is-regular-14-00-17 has-text-light-grey pb-10 is-marginless">Area covered</p>
        <p
          class="is-medium-14-00-17"
        >{{details.area_covered ? details.area_covered + " ha": "*Not found"}}</p>
      </div>
      <div class="column is-one-quarter">
        <p class="is-regular-14-00-17 has-text-light-grey pb-10 is-marginless">Camera model</p>
        <p class="is-medium-14-00-17">
          {{
          details.camera_make || details.camera_model ? (details.camera_make && details.camera_model ?
          (details.camera_make + " | " + details.camera_model) : details.camera_make || details.camera_model):
          "*Not found"}}
        </p>
      </div>
      <div class="column is-one-quarter mt-20 mb-20">
        <p class="is-regular-14-00-17 has-text-light-grey pb-10 is-marginless">Image altitude</p>
        <p
          class="is-regular-14-00-17"
        >{{details.image_altitude ? details.image_altitude : "*Not found"}}</p>
      </div>
      <div class="column is-one-quarter mt-20 mb-20">
        <p
          class="is-regular-14-00-17 has-text-light-grey pb-10 is-marginless no-whitespace-wrap"
        >Average ground sampling distance</p>
        <p
          class="is-regular-14-00-17"
        >{{details.average_ground_sampling_distance != null ? details.average_ground_sampling_distance : "*Not found"}}</p>
      </div>
      <hr class="divider" />
      <div class="is-flex has-space-between has-full-width is-vcenter pr-30">
        <div class="mt-25 mb-40 ml-10">
          <p class="is-medium-14-500-20 mb-20">
            Raw images
            <i
              v-tooltip="'Refresh Images'"
              @click="sync_images()"
              class="fa fa-sync ml-10 is-pointer"
              :class="{'fa-spin':synching}"
            ></i>

            <router-link
              v-if="project_report_images && project_report_images.length"
              :to="{name:'project-images-list',params:{id:$route.params.id}}"
              class="has-text-blue is-medium-14-500-20 ml-10 is-pointer"
            >
              View All
              <i class="fas fa-chevron-right"></i>
            </router-link>
          </p>
          <template v-if="$store.getters.new_raw_upload_flow">
            <div class="project__image-details--images">
              <template v-if="project_report_images">
                <p
                  class="project__image-details--images--element"
                  v-for="(url, i) in project_report_images"
                  :key="i"
                >
                  <img :src="url" alt="i" />
                </p>
              </template>
              <upload-images
                :project_report="project_report"
                :project_report_images="project_report_images"
                :is_upload_popup="is_upload_popup"
                @update="is_upload_popup=false;update_details();upload_completed();$emit('update_details')"
              ></upload-images>
            </div>
          </template>
          <template v-else>
            <div class="project__image-details--images">
              <template v-if="project_report_images">
                <p
                  class="project__image-details--images--element"
                  v-for="(url,i) in project_report_images"
                  :key="i"
                >
                  <img :src="url" alt="i" />
                </p>
              </template>
              <div>
                <p
                  v-if="access('core', 'can_upload_images')"
                  class="image-block--upload is-pointer"
                  @click="is_upload_popup=true"
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
            </div>
            <upload-images-old
              :project_report="project_report"
              :project_report_images="project_report_images"
              :is_upload_popup="is_upload_popup"
              v-if="is_upload_popup"
              @close="is_upload_popup=false;update_details();upload_completed();$emit('update_details')"
            ></upload-images-old>
          </template>
        </div>
        <!-- v-if="images_report && !images_report.synced" -->
        <a
          v-tooltip="{content: `Synchronize uploaded images i.e, generate thumbnails, zip etc with updated files.`}"
          @click="sync_report(project_report)"
          class="has-text-theme-black"
        >
          <i class="fa fa-sync"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import {
  reportService,
  uploadService,
  missionService,
  projectService
} from "@/desktop/shared/services/";

import uploadImages from "./components/upload-images";
import uploadImagesOld from "./components/upload-images-old";
import ProjectImagesSkeleton from "./components/project-images-skeleton";

export default {
  components: {
    uploadImages,
    uploadImagesOld,
    ProjectImagesSkeleton
  },
  data() {
    return {
      is_loading: false,
      synching: false,
      is_upload_popup: false,
      project_report: {},
      project_report_images: [],
      mission: {},
      details: {
        data_captured_time: null,
        data_upload_time: null,
        area_covered: null,
        camera_model: null,
        image_altitude: null,
        mission: null,
        average_ground_sampling_distance: null
      }
    };
  },
  watch: {
    project_report() {
      this.details.data_upload_time = this.project_report.updated_at;
      if (this.project_report.datas) {
        let data_index = Object.keys(this.project_report.datas)[0];
        if (
          this.project_report.datas[data_index] &&
          this.project_report.datas[data_index].exif
        ) {
          this.details.camera_make = this.project_report.datas[
            data_index
          ].exif.Make;
          this.details.camera_model = this.project_report.datas[
            data_index
          ].exif.Model;
          this.details.image_altitude = this.project_report.datas[
            data_index
          ].exif.GPSAltitude;
        }
      }
    },
    mission() {
      this.details.mission = {
        name: this.mission.name,
        uid: this.mission.uid
      };
      this.details.area_covered = this.mission.area;
      if (this.mission.details) {
        this.details.data_captured_time = this.mission.details.end;
      }
      this.details.average_ground_sampling_distance = this.mission.settings
        ? this.mission.settings.gsd
        : null;
    }
  },
  async created() {
    this.is_loading = true;
    await Promise.all([this.update_details(), this.get_mission()]);
    this.is_loading = false;
  },
  methods: {
    async update_details() {
      await this.get_project_report();
      if (this.project_report.uid) await this.get_project_report_images();
    },
    async upload_completed() {
      uploadService.upload_completed({
        id: this.$route.params.id
      });
    },
    async get_project_report() {
      let { results } = await reportService.get_reports({
        resource_name: "projects",
        query: "report_type=images",
        id: this.$route.params.id
      });
      if (results && results.length) this.project_report = results[0];
    },
    async get_project_report_images() {
      let { urls } = await uploadService.get_raw_datas_download_links({
        id: this.$route.params.id,
        report_uid: this.project_report.uid,
        body: {}
      });
      if (urls) this.project_report_images = Object.values(urls).slice(0, 3);
    },
    async get_mission() {
      let result = await missionService
        .get_project_mission({
          query: `projectUid=${this.$route.params.id}`
        })
        .catch(err => this.handleErrors(err));
      if (result && result.data[0]) this.mission = result.data[0].missions[0];
    },
    sync_images() {
      this.synching = true;
      setTimeout(() => {
        this.update_details();
        this.$emit("update_details");
        this.synching = false;
      }, 1000);
    },
    async sync_report(report) {
      let res = await projectService
        .sync_report({
          id: this.$route.params.id,
          report_id: report.uid
        })
        .catch(err => {
          this.handleErrors(err);
        });
      if (res) {
        this.$toast.show(
          "Synchronization initiated",
          "",
          this.$store.state.izitoast_options.appSuccess
        );
      }
    }
  }
};
</script>


<style lang="scss" >
.sh-image-details-card {
  background: $white;
  border-radius: 1rem;
  height: max-content;
  padding: 2rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);

  .column {
    padding: 1rem;
  }
}
.project__image-details {
  &--images {
    display: flex;
    &--element {
      // display: flex;
      // justify-content: center;
      // align-items: center;
      width: 7rem;
      height: 7.5rem;
      margin-right: 1rem;
      border-radius: 0.5rem;
      img {
        object-fit: contain;
      }
    }
    .image-block {
      height: 6.5rem;
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
}
</style>
