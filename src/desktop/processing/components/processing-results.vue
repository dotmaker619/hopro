<template>
  <div class="columns processing-results-card">
    <div class="column is-narrow">
      <p class="is-regular-14-00-24 has-text-light-grey mr-20">Results:</p>
    </div>
    <div class="column is-narrow" v-for="(report_option, value) in report_options" :key="value">
      <p
        class="is-medium-14-500-17 has-text-theme-black processing-results-card__report-type is-vcenter mr-30 is-flex"
        v-if="$store.getters.is_internal_user || $store.getters.is_qc_internal_user"
        :class="{ 'is-not-allowed': process !== 'finished' }"
        :disabled="process !== 'finished'"
        @mouseenter="hover = value"
        @mouseleave="hover = -1"
        @click="value == 'reports' ? (reports_popup = true) : download_report(value)"
      >
        <sh-icon :name="process == 'finished' ? (hover == value ? 'download-fill' : 'download-active') : 'download'" class="is-24x24 mr-5"></sh-icon>

        <span>{{ report_option }}</span>
      </p>
    </div>
    <!-- <div class="column is-narrow">
      <p
        class="is-medium-14-500-17 has-text-theme-black processing-results-card__report-type mr-20 is-flex is-vcenter"
        :disabled="process.status == 'finished'"
        @click="reports_popup = true"
        @mouseenter="hover = 'reports'"
        @mouseleave="hover = -1"
      >
        <sh-icon
          :name="process == 'finished' ? (hover == 'reports' ? 'download-fill' : 'download-active') : 'download'"
          class="is-24x24 mr-5"
        ></sh-icon>
        <span>Reports</span>
      </p>
    </div> -->
    <reports-popup
      @close="reports_popup = false"
      v-if="reports_popup"
      :reports="reports_popup_data"
      :process="process"
      :project_id="project_id"
    ></reports-popup>
    <!-- <div class="column is-narrow">
      <p
        class="is-medium-14-500-17 has-text-theme-black processing-results-card__report-type is-vcenter mr-30 is-flex"
        v-if="$store.getters.is_internal_user || $store.getters.is_qc_internal_user"
        :class="{ 'is-not-allowed': process !== 'finished' }"
        :disabled="process !== 'finished'"
        @mouseenter="hover = 'processed_images'"
        @mouseleave="hover = -1"
        @click="download_report('processed_images')"
      >
        <sh-icon
          :name="process == 'finished' ? (hover == 'processed_images' ? 'download-fill' : 'download-active') : 'download'"
          class="is-24x24 mr-5"
        ></sh-icon>

        <span>Images</span>
      </p>
    </div>
    <div class="column is-narrow">
      <p
        class="is-medium-14-500-17 has-text-theme-black processing-results-card__report-type is-vcenter mr-30 is-flex"
        v-if="$store.getters.is_internal_user || $store.getters.is_qc_internal_user"
        :class="{ 'is-not-allowed': process !== 'finished' }"
        :disabled="process !== 'finished'"
        @mouseenter="hover = 'projectdata'"
        @mouseleave="hover = -1"
        @click="download_report('projectdata')"
      >
        <sh-icon
          :name="process == 'finished' ? (hover == 'projectdata' ? 'download-fill' : 'download-active') : 'download'"
          class="is-24x24 mr-5"
        ></sh-icon>

        <span>Data</span>
      </p>
    </div>
    <div class="column is-narrow">
      <p
        class="is-medium-14-500-17 has-text-theme-black processing-results-card__report-type is-vcenter mr-30 is-flex"
        v-if="$store.getters.is_internal_user || $store.getters.is_qc_internal_user"
        :class="{ 'is-not-allowed': process !== 'finished' }"
        :disabled="process !== 'finished'"
        @mouseenter="hover = 'processlog'"
        @mouseleave="hover = -1"
        @click="download_report('processlog')"
      >
        <sh-icon
          :name="process == 'finished' ? (hover == 'processlog' ? 'download-fill' : 'download-active') : 'download'"
          class="is-24x24 mr-5"
        ></sh-icon>

        <span>Log</span>
      </p>
    </div>
    <div class="column is-narrow">
      <p
        class="is-medium-14-500-17 has-text-theme-black processing-results-card__report-type is-vcenter mr-30 is-flex"
        v-if="$store.getters.is_internal_user || $store.getters.is_qc_internal_user"
        :class="{ 'is-not-allowed': process !== 'finished' }"
        :disabled="process !== 'finished'"
        @mouseenter="hover = 'pix4d_pdf'"
        @mouseleave="hover = -1"
        @click="download_report('pix4d_pdf')"
      >
        <sh-icon
          :name="process == 'finished' ? (hover == 'pix4d_pdf' ? 'download-fill' : 'download-active') : 'download'"
          class="is-24x24 mr-5"
        ></sh-icon>

        <span>Quality Report</span>
      </p>
    </div> -->
  </div>
</template>

<script>
  import { uploadService } from "@/desktop/shared/services/";
  import ReportsPopup from "./reports-popup";

  export default {
    props: ["process", "project_id"],
    data() {
      return {
        processed_data_download_links: {},
        reports: null,
        reports_popup: false,
        hover: -1,
        report_options: {
          "reports": "Reports",
          "processed_images": "Images",
          "projectdata": "Data",
          "processlog": "Log",
          "pix4d_pdf": "Quality Report",
        },
      };
    },
    components: {
      ReportsPopup,
    },
    async created() {
      await this.get_reports();
    },
    computed: {
      reports_popup_data() {
        if (!this.reports || !this.reports.length) return [];
        return _.filter(this.reports, (r) => _.includes(["ortho", "dsm", "3d_model", "point_cloud"], r.report_type));
      },
    },

    methods: {
      async get_reports() {
        let { results } = await uploadService.get_reports({ id: this.project_id }).catch((err) => {
          console.log(err);
        });

        this.reports = results;
        this.get_processed_data_download_links();
      },
      async get_processed_data_download_links() {
        let report = this.reports.find((r) => r.report_type == "processed");
        if (report) {
          let data = await uploadService
            .get_raw_datas_download_links({
              id: this.project_id,
              report_uid: report.uid,
            })
            .catch((err) => {
              console.log(err);
            });
          this.processed_data_download_links = data;
        }
      },
      download_report(name) {
        if (this.processed_data_download_links && this.processed_data_download_links.urls && this.processed_data_download_links.urls[name])
          window.open(this.processed_data_download_links.urls[name], "_blank");
      },
    },
  };
</script>

<style lang="scss">
  .processing-results-card {
    background: $white;
    padding: 1rem;
    border-radius: 1rem;
    box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
    align-items: flex-end;
    &__report-type {
      cursor: pointer;
    }
  }
</style>
