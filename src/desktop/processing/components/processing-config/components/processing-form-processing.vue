<template>
  <div class="processing-card">
    <div class="processing-card__header">
      <div class="is-semiBold-16-600-19 mb-20">
        Steps
        <i style="cursor: help" class="fas fa-info-circle has-text-grey-dark">
          <div class="info-content">
            Steps processing should go through.
            <ul>
              <li>
                <strong>Calib -</strong>Caliberate camera and do initial
                processing to extract and match keypoints. Also, locates if GCPS
                are provided.
              </li>
              <li>
                <strong>Dense -</strong> Densification of points and create a 3D
                point cloud.
              </li>
              <li>
                <strong>Ortho -</strong>Generates orthomosaic and digital
                surface models
              </li>
            </ul>
          </div>
        </i>
      </div>
    </div>
    <div class="processing-card__body">
      <div class="processing-card__body__content">
        <div class="processing-card__body__content--item">
          <input
            type="checkbox"
            :class="{ 'is-disabled': can_resume }"
            class="sh-custom-checkbox is-thinner mr-5"
            id="calib"
            disabled
            value="calib"
            v-model="config.steps"
          />
          <label
            class="is-medium-14-00-17 has-opacity-7 is-capitalized"
            for="calib"
            >calib</label
          >
        </div>
        <div class="processing-card__body__content--item">
          <input
            type="checkbox"
            :class="{ 'is-disabled': can_resume }"
            class="sh-custom-checkbox is-thinner mr-5"
            id="dense"
            value="dense"
            v-model="config.steps"
            @change="remove_ortho"
          />
          <label
            class="is-medium-14-00-17 has-opacity-7 is-capitalized"
            for="dense"
            >dense</label
          >
        </div>
        <div class="processing-card__body__content--item">
          <input
            type="checkbox"
            :class="{ 'is-disabled': can_resume }"
            class="sh-custom-checkbox is-thinner mr-5"
            id="ortho"
            value="ortho"
            v-model="config.steps"
            @change="add_dense"
          />
          <label
            class="is-medium-14-00-17 has-opacity-7 is-capitalized"
            for="ortho"
            >ortho</label
          >
        </div>
      </div>

      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17">
          Calibration Method
          <i class="fas fa-info-circle has-text-grey-dark help-cursor">
            <div class="info-content">
              Defines how camera's internal and external parameters are
              optimized.
              <ul>
                <li><strong>Standard -</strong> Default method.</li>
                <li>
                  <strong>Alternative -</strong> Optimized for aeriel and nadir
                  images with accurate geolocation and for relatively flat
                  terrain.
                </li>
                <li>
                  <strong>Accurates geolocation -</strong> Optimized for very
                  accurate geolocation and orientation of images
                </li>
              </ul>
            </div>
          </i>
        </p>
        <div class="processing-card__body--element__content--item">
          <select
            class="selection_input"
            :class="{ 'is-disabled': can_resume }"
            v-model="config.calibration_method"
            :disabled="canUpdateSettings"
          >
            <option
              v-for="(calibration_method, i) in calibration_methods_options"
              :key="i"
              :value="calibration_method"
            >
              {{ calibration_method }}
            </option>
          </select>
        </div>
      </div>
      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17">Output Coordinate system</p>
        <div class="processing-card__body--element__content--item">
          <select
            class="selection_input"
            :class="{ 'is-disabled': can_resume }"
            v-model="config.coordinate_system"
            :disabled="canUpdateSettings"
          >
            <option
              v-for="(coordinate_option, i) in available_coordinate_systems"
              :key="i"
              :value="coordinate_option"
            >
              {{ coordinate_option }}
            </option>
          </select>
        </div>
      </div>
      <div class="processing-card__body--element mb-30 is-flex">
        <input
          id="3d_mesh"
          v-model="config.generate_3d_textured_mesh"
          type="checkbox"
          class="sh-custom-checkbox"
        />
        <label for="3d_mesh" class="is-regular-14-00-17 has-text-theme-black">
          Generate 3D Texture Mesh
          <i class="fas fa-info-circle has-text-grey-dark help-cursor">
            <div class="info-content">
              Allows the user to select whether the 3D Textured Mesh should be
              generated.
            </div>
          </i>
        </label>
      </div>

      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17">
          Raster DSM Method
          <i class="fas fa-info-circle has-text-grey-dark help-cursor">
            <div class="info-content">
              The method that is used for the Raster DSM generation. The method
              will affect the processing time and the quality of the results.
            </div>
          </i>
        </p>
        <div class="processing-card__body--element__content--item">
          <select
            class="selection_input"
            v-model="config.dsm_method"
            :disabled="canUpdateSettings"
            :class="{ 'is-disabled': can_resume }"
          >
            <option value="InverseDistanceWeighting">
              Inverse Distance Weighting
            </option>
            <option value="Triangulation">Triangulation</option>
          </select>
        </div>
      </div>

      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17">
          Internal Camera Optimization
          <i class="fas fa-info-circle has-text-grey-dark help-cursor">
            <div class="info-content">
              Defines which parameters of the camera are optimized.
              <ul>
                <li>
                  <strong>All -</strong>Optimizes all internal camera parameter.
                </li>
                <li>
                  <strong>None -</strong>Does not opimize any of the internal
                  camera parameters
                </li>
                <li>
                  <strong>Leading -</strong>Optimizes most important internal
                  camera parameters. Better for camera with slow rolling shutter
                  speed
                </li>
                <li>
                  <strong>All Prior -</strong>Forces the optimal internal
                  parameters to be close to the initial values
                </li>
              </ul>
            </div>
          </i>
        </p>
        <div class="processing-card__body--element__content--item">
          <select
            class="selection_input"
            v-model="config.camera_internal_optimization"
            :disabled="canUpdateSettings"
            :class="{ 'is-disabled': can_resume }"
          >
            <option
              v-for="(camera_internal_optimization,
              i) in camera_internal_optimization_options"
              :key="i"
              :value="camera_internal_optimization"
            >
              {{ camera_internal_optimization }}
            </option>
          </select>
        </div>
      </div>

      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17 is-flex is-vcenter">
          <input
            type="checkbox"
            name="ortho_resolution"
            class="sh-custom-checkbox is-thinner"
            id="ortho_resolution"
            checked
            disabled
            :class="{ 'is-disabled': can_resume }"
          />
          <label for="ortho_resolution">Ortho Resolution</label>
          <i class="fas fa-info-circle has-text-grey-dark ml-10 help-cursor">
            <div class="info-content">
              Select the output resolution of the generated orthomosaic
            </div>
          </i>
        </p>
        <div class="processing-card__body--element__content--item">
          <input
            style="cursor: not-allowed"
            disabled
            type="number"
            min="1"
            max="10000"
            class="selection_input not-allowed-form-color-custom"
            v-model="config.ortho_resolution_count"
            placeholder=" 1 to 10,000"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { processingService } from "@/desktop/shared/services/";

export default {
  props: ["canUpdateSettings"],
  data() {
    return {
      calibration_step: [],
      calibration_methods_options: [
        "Standard",
        "Alternative",
        "GeolocationAndOrientation",
      ],
      camera_internal_optimization_options: [
        "None",
        "Leading",
        "All",
        "AllPrior",
      ],
      available_coordinate_systems: [],
    };
  },
  created() {
    this.getCoordinateOptions();
  },
  computed: {
    can_resume() {
      let details = this.$store.state.processing.process_details;
      return details ? details.resume : false;
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
    async getCoordinateOptions() {
      this.available_coordinate_systems = await processingService
        .get_available_coordinates({})
        .catch((err) => console.log(err));
    },
    remove_ortho() {
      !this.config.steps.includes("dense") &&
      this.config.steps.includes("ortho")
        ? _.pull(this.config.steps, "ortho")
        : null;
    },
    add_dense() {
      !this.config.steps.includes("dense") &&
      this.config.steps.includes("ortho")
        ? this.config.steps.push("dense")
        : null;
    },
  },
};
</script>
<style lang="scss" scoped>
.processing-card:before {
  left: 90%;
}
</style>
