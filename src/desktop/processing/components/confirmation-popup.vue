<template>
  <div>
    <modal
      :name="$route.name"
      transition="nice-modal-fade"
      classes="demo-modal-class"
      :min-width="200"
      :min-height="200"
      :adaptive="true"
      :scrollable="true"
      :reset="true"
      :pivot-y="0.5"
      width="45%"
      height="auto"
    >
      <div class="sh-form">
        <div class="sh-form__header">
          <h1 class="sh-form__header__title">Process Data</h1>
          <i @click="$modal.hide($route.name)" class="fa fa-times sh-form__header__close" aria-hidden="true"></i>
        </div>
        <div class="sh-form__content">
          <sh-icon :name="'total-processing'" class="is-96x96"></sh-icon>
          <p class="sh-form__content__subtitle">Process Data for</p>
          <div class="sh-form__content__organization">
            <div class="sh-form__content__organization__icon">{{ process_details.name.charAt(0) }}</div>
            <div class="sh-form__content__organization__name">{{ process_details.name.split("$$")[1] }}</div>
          </div>
          <div class="divider"></div>
        </div>
        <div class="sh-form__settings" v-if="data">
          <div class="columns">
            <div class="column is-6">
              <p class="sh-text-normal-14 has-text-grey">Project Type</p>
              <p class="sh-medium-header is-capitalized">{{ process_details.project_type }}</p>
            </div>
            <div class="column is-3">
              <p class="sh-text-normal-14 has-text-grey">Images</p>
              <p class="sh-medium-header">{{ (selected_images && selected_images.length) || 0 }}</p>
            </div>
            <div class="column is-3">
              <p class="sh-text-normal-14 has-text-grey">Matches</p>
              <p class="sh-medium-header">{{ data.min_no_match }}</p>
            </div>
          </div>
          <div class="columns">
            <div class="column is-6">
              <p class="sh-text-normal-14 has-text-grey">Calibration Method</p>
              <p class="sh-medium-header">{{ data.calibration_method }}</p>
            </div>
            <div class="column is-6">
              <p class="sh-text-normal-14 has-text-grey">Steps</p>

              <p class="tag is-large is-capitalized is-bordered is-white" v-for="step in data.steps" :key="step">{{ step }}</p>
            </div>
          </div>
          <div class="pl-20 pr-20 pb-30" @click="start">
            <div class="sh-form__content__button">Start Processing now</div>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import { processingService, uploadService } from "@/desktop/shared/services/";
  import { mapState } from "vuex";

  export default {
    data() {
      return {
        data: {},
        is_saving_images: false,
      };
    },

    computed: {
      ...mapState("processing", ["selected_images", "image_report", "raw_images", "report_details"]),

      process_details: {
        get() {
          return this.$store.state.processing.process_details;
        },
        set(val) {
          this.$store.commit("processing/SET_PROCESS_DETAILS", val);
        },
      },
    },
    methods: {
      async openConfirmationPopUp() {
        this.$modal.show(this.$route.name);

        this.data = await processingService.get_config({ id: this.$route.params.id }).catch((err) => {
          this.handleErrors(err);
        });
      },
      start() {
        if (
          this.process_details.status &&
          (this.process_details.status == "pending" ||
            ((this.process_details.status == "finished" || this.process_details.status == "failed") && this.process_details.resume == true))
        ) {
          this.save_images();
        } else {
          this.$buefy.toast.open(`Can not start process in ${this.process_details.status} state`);
        }
        this.$modal.hide(this.$route.name);

        // this.$emit("update_process_details");
      },
      save_images() {
        if (this.selected_images && this.selected_images.length < 4) {
          this.$toast.show("Please select minimum 4 images", "", this.$store.state.izitoast_options.appWarning);
        } else {
          this.is_saving_images = true;
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
              // this.$toast.show("Images saved", "", this.$store.state.izitoast_options.appSuccess);
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

              // this.$toast.show("Images saved", "", this.$store.state.izitoast_options.appSuccess);
              this.is_saving_images = false;
              this.start_process();
            })
            .catch((err) => {
              this.is_saving_images = false;
              this.handleErrors(err);
            });
        }
      },
      async start_process() {
        try {
          await processingService.start({
            id: this.$route.params.id,
            body: {
              asset_id: this.process_details.asset_id,
            },
          });

          this.$toast.show("Processing started", "", this.$store.state.izitoast_options.appSuccess);
        } catch (err) {
          this.$toast.show(err.response && err.response.data.message, "", this.$store.state.izitoast_options.appWarning);
        }
      },
    },
  };
</script>

<style lang="scss">
  .sh-form__settings {
    padding: 0 12rem;
  }
</style>
