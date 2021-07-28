<template>
  <div>
    <div class="config-steps">
      <div class="config-steps__step">
        <div @click="form_step = 1" class="config-steps__step-icon" :class="{ 'config-steps__step-icon--active': form_step == 1 }">
          <p class="is-medium-16-500-19 has-opacity-7">1</p>
        </div>
        <p
          class="is-absolute no-whitespace-wrap has-text-theme-black is-semiBold-16-600-19 mt-5"
          :class="{ 'has-opacity-7 has-text-theme-grey': form_step != 1 }"
        >
          Select Type
        </p>
      </div>
      <p class="connecting-line"></p>
      <div class="config-steps__step">
        <div @click="form_step = 2" class="config-steps__step-icon" :class="{ 'config-steps__step-icon--active': form_step == 2 }">
          <p class="is-medium-16-500-19 has-opacity-7">2</p>
        </div>
        <p
          class="is-absolute no-whitespace-wrap has-text-theme-black is-semiBold-16-600-19 mt-5"
          :class="{ 'has-opacity-7 has-text-theme-grey': form_step != 2 }"
        >
          Calibration
        </p>
      </div>
      <p class="connecting-line"></p>

      <div class="config-steps__step">
        <div @click="form_step = 3" class="config-steps__step-icon" :class="{ 'config-steps__step-icon--active': form_step == 3 }">
          <p class="is-medium-16-500-19 has-opacity-7">3</p>
        </div>
        <p
          class="is-absolute no-whitespace-wrap has-text-theme-black is-semiBold-16-600-19 mt-5"
          :class="{ 'has-opacity-7 has-text-theme-grey': form_step != 3 }"
        >
          Processing
        </p>
      </div>
    </div>
    <div class="config-form">
      <div class="config-form__project" v-if="form_step == 1">
        <!-- @update_type="update_project_type($event)" -->
        <processing-form-project></processing-form-project>
      </div>
      <div class="config-form__calibration" v-if="form_step == 2">
        <processing-form-calibration :canUpdateSettings="canUpdateSettings"></processing-form-calibration>
      </div>
      <div class="config-form__processing" v-if="form_step >= 3">
        <processing-form-processing
          :can_resume="process_details.resume"
          :config="config"
          :canUpdateSettings="canUpdateSettings"
        ></processing-form-processing>
      </div>
      <div class="config-form__footer">
        <button class="sh-button sh-button--inverted is-pulled-left" @click="form_step--" v-if="form_step !== 1">
          <span class="is-flex is-vcenter is-semiBold-14-600-17">
            <i class="fas fa-angle-double-left sh-text-bold-18 mr-10"></i>
            Back
          </span>
        </button>
        <button class="sh-button is-pulled-right is-capitalized" @click="next_step">
          {{ form_action_button }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { assetService, projectService, processingService } from "@/desktop/shared/services/";
  import ProcessingFormProject from "./components/processing-form-project";
  import ProcessingFormCalibration from "./components/processing-form-calibration";
  import ProcessingFormProcessing from "./components/processing-form-processing";
  import { mapState } from "vuex";

  export default {
    components: {
      ProcessingFormProject,
      ProcessingFormCalibration,
      ProcessingFormProcessing,
    },
    data() {
      return {
        form_step: 1,
      };
    },
    created() {
      this.get_config();
    },
    computed: {
      ...mapState("processing", ["process_details"]),
      form_action_button() {
        let text = "";

        if (this.process_details && (this.process_details.status == "finished" || this.process_details.status == "failed")) {
          text = "continue";
        } else if (this.form_step == 1 || this.form_step == 2) {
          text = "save & continue";
        } else if (this.form_step == 3) {
          text = "submit";
        } else if (this.form_step == 4) {
          text = "select images";
        }

        return text;
      },
      canUpdateSettings() {
        return this.process_details && this.process_details.status && this.process_details.status != "pending";
      },
      config: {
        get() {
          return this.$store.state.processing.config;
        },
        set(val) {
          this.$store.commit("processing/SET_CONFIG", val);
        },
      },
    },
    methods: {
      async getAssetDetails() {
        let res = await assetService.get({ id: this.process_details.asset_id }).catch((err) => this.handleErrors(err));
        this.config.coordinate_system =
          res.properties && res.properties.selected_coordinate_system ? res.properties.selected_coordinate_system : null;
      },
      async get_config() {
        let data = await processingService
          .get_config({
            id: this.$route.params.id,
          })
          .catch((err) => this.handleErrors(err));
        // let preprocess = this.config.preprocess || false;
        // this.config = { ...data, preprocess };
        this.config = data;
        if (this.process && this.process_details.asset_id) this.getAssetDetails();
      },

      async next_step() {
        if (this.form_step == 1) {
          let result = await processingService
            .put({
              id: this.$route.params.id,
              body: {
                project_type: this.process_details.project_type,
              },
            })
            .catch((err) => this.handleErrors(err));

          await processingService
            .update_config({
              id: this.$route.params.id,
              body: this.config,
            })
            .catch((err) => this.handleErrors(err));

          if (result.success) await this.get_config();
          this.form_step = 2;
        } else if (this.form_step == 2) {
          if (
            this.config.keypoint_selection_method == "CustomNumberOfkeypoints" &&
            (this.config.number_of_keypoints < 100 || this.config.number_of_keypoints > 1000000)
          ) {
            this.$toast.show("Please select a valide value for Targeted Number of Keypoints", "", this.$store.state.izitoast_options.appWarning);
          }
          this.form_step = 3;
        } else if (this.form_step == 3) {
          if (
            this.process_details.resume ||
            (!this.process_details.resume && (this.process_details.status == "finished" || this.process_details.status == "failed"))
          ) {
            this.$router.push({ name: "processing-images" });
            return;
          }

          let new_service = await projectService.get_service_obj({
            id: this.process_details.project_id,
          });
          if (new_service && Object.keys(new_service).length) {
            this.config["service"] = new_service;
          } else {
            delete this.config["service"];
          }
          await processingService
            .update_config({
              id: this.$route.params.id,
              body: this.config,
            })
            .catch((err) => this.handleErrors(err));
          this.$toast.show("Saved sucessfully", "", this.$store.state.izitoast_options.appSuccess);
          this.form_step = 4;
        } else if (this.form_step == 4) {
          this.$router.push({ name: "processing-images" });
        }
      },
    },
  };
</script>

<style lang="scss">
  .config-steps {
    display: flex;
    justify-content: space-evenly;
    max-width: 60%;
    margin: 2rem auto;
    &__step {
      position: relative;
      p {
        left: -2rem;
      }
      &-icon {
        height: 4rem;
        width: 4rem;
        border: 2px solid rgba(23, 30, 72, 0.3);
        background: $white;
        padding: 0.8rem 0rem;
        border-radius: 4rem;
        display: inline-block;
        text-align: center;
        p {
          min-width: 1rem;
        }
        &:hover {
          border: 2px solid $primary;
          cursor: pointer;
          color: $primary;
        }
        &--active {
          border: 2px solid $primary;
          color: $primary;
          p {
            font-weight: 600;
          }
        }
      }
    }
    .connecting-line {
      height: 2px;
      background-color: #ddd;
      width: -webkit-fill-available;
      margin: auto 0;
    }
  }

  .config-form {
    &__footer {
      max-width: 70%;
      margin: auto;
    }
  }
</style>
