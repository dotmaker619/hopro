<template>
  <div class="project__image-details">
    <!-- <div class="sh-medium-header is-marginless">Image details</div> -->

    <div class="tabs">
      <ul>
        <li :class="{'is-active': active_tab == 'map'}" @click="active_tab = 'map'">
          <a style="font-weight: 500;padding-top:0;font-size:18px">Map</a>
        </li>
        <li :class="{'is-active': active_tab == 'Image'}" @click="active_tab = 'Image'">
          <a style="font-weight: 500;padding-top:0;font-size:18px">Images</a>
        </li>
      </ul>
    </div>
    <div class="app-details" v-if="active_tab == 'map'">
      <thumbnails-map v-if="project_report && project_report.datas" :raw_images="project_report_images" :report_details="project_report"></thumbnails-map>
      <!-- :missions_data="mission" -->
    </div>

    <div class="app-details" v-else>
      <thumbnails-image-grid :raw_images="project_report_images" :report_details="project_report"></thumbnails-image-grid>
    </div>
  </div>
</template>

<script>

import ThumbnailsMap from "./components/thumbnails-map.component";
import ThumbnailsImageGrid from "./components/thumbnails-image-grid.component";
import {
  reportService,
  uploadService,
  missionService
} from "@/desktop/shared/services/";


export default {
  components: {
    ThumbnailsMap,
    ThumbnailsImageGrid
  },
  data() {
    return {
      active_tab: "map",
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
  async created() {
    await this.get_project_report();
    if (this.project_report.uid) await this.get_project_report_images();
  },
  methods: {
    async get_project_report() {
      let { results } = await reportService.get_reports({
        resource_name: "projects",
        query: "report_type=image_thumbnails",
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
      if (urls) this.project_report_images = urls;
    }
  }
};
</script>


<style lang="scss" scoped>
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
  padding-left: 1rem;
  padding-right: 1rem;
  &--images {
    display: flex;
    &--element {
      width: 7rem;
      height: 7.5rem;
      margin-right: 1rem;
      img {
        border-radius: 0.5rem;
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
