<template>
  <div class="processing-card">
    <div class="processing-card__header">
      <div class="is-semiBold-16-600-19 mb-20">
        Keypoint Image scale
        <i class="fas fa-info-circle has-text-info help-cursor">
          <div class="info-content">
            The scale at which keypoints are extracted from an image.
            <ul>
              <li><strong>Full -</strong> Uses original image resolution.</li>
              <li>
                <strong>Rapid -</strong> Sales down for faster processing.
              </li>
              <li>
                <strong>Custom -</strong> Choose the appropriate scale below
              </li>
            </ul>
          </div>
        </i>
      </div>
    </div>

    <div class="processing-card__body">
      <div class="processing-card__body__content">
        <div
          class="processing-card__body__content--item"
          :class="{ 'is-disabled': can_resume }"
        >
          <input
            type="radio"
            class="processing-custom-checkbox"
            id="Full"
            value="Full"
            v-model="config.image_scale_type"
          />
          <label class="is-medium-14-500-17 has-opacity-7 ml-5" for="Full"
            >Full</label
          >
        </div>
        <div
          class="processing-card__body__content--item"
          :class="{ 'is-disabled': can_resume }"
        >
          <input
            type="radio"
            class="processing-custom-checkbox"
            id="Rapid"
            value="Rapid"
            v-model="config.image_scale_type"
          />
          <label class="is-medium-14-500-17 has-opacity-7 ml-5" for="Rapid"
            >Rapid</label
          >
        </div>
        <div
          class="processing-card__body__content--item"
          :class="{ 'is-disabled': can_resume }"
        >
          <input
            type="radio"
            class="processing-custom-checkbox"
            id="Custom"
            value="Custom"
            v-model="config.image_scale_type"
          />
          <label class="is-medium-14-500-17 has-opacity-7 ml-5" for="Custom"
            >Custom</label
          >
        </div>
      </div>

      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17 has-text-theme-black">Image Scale</p>

        <select
          v-if="config.image_scale_type == 'Full'"
          class="selection_input"
          :class="{ 'is-disabled': can_resume }"
          :disabled="canUpdateSettings"
        >
          <option selected disabled value="1">1x</option>
        </select>

        <select
          v-else-if="config.image_scale_type == 'Rapid'"
          class="selection_input"
          :class="{ 'is-disabled': can_resume }"
          :disabled="canUpdateSettings"
        >
          <option selected disabled value=".25">0.25x</option>
        </select>

        <select
          v-else
          class="selection_input"
          v-model="config.image_scale_value"
          :class="{ 'is-disabled': can_resume }"
          :disabled="canUpdateSettings"
        >
          <option
            v-for="(scale, index) in image_scale_value_options"
            :key="index"
            :value="scale"
          >
            {{ scale }}x
          </option>
        </select>
      </div>
      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17 has-text-theme-black">
          Matching
          <i class="fas fa-info-circle has-text-grey-dark">
            <div class="info-content">
              Number of matches between image pairs to consider as a best match
            </div>
          </i>
        </p>
        <div class="processing-card__body--element__content--item">
          <select
            class="selection_input"
            v-model="config.min_no_match"
            :class="{ 'is-disabled': can_resume }"
            :disabled="canUpdateSettings"
          >
            <option
              v-for="(min_no_match, index) in min_match_options"
              :key="index"
              :value="min_no_match"
            >
              {{ min_no_match }}
            </option>
          </select>
          <span class="is-regular-12-00-14">Min no of Matching</span>
        </div>
      </div>
      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17 has-text-theme-black">
          Targeted Number of Keypoints
          <i class="fas fa-info-circle has-text-grey-dark help-cursor">
            <div class="info-content">
              <div>
                Allows to set up the number of keypoints to be extracted.
                <ul>
                  <li>
                    Automatic (Default): Automatic way to select which keypoints
                    are extracted.
                  </li>
                  <li>
                    Custom: Directs Pix4Dmapper to identify a specific number of
                    keypoints, image content permitting. Number of Keypoints:
                    Maximum number of keypoints to be extracted per image.
                  </li>
                </ul>
              </div>
            </div>
          </i>
        </p>
        <div class="processing-card__body--element__content--item">
          <select
            class="selection_input"
            v-model="config.keypoint_selection_method"
            :class="{ 'is-disabled': can_resume }"
            :disabled="canUpdateSettings"
          >
            <option :value="'Automatic'">Automatic</option>
            <option :value="'CustomNumberOfkeypoints'">Custom</option>
          </select>
          <div
            class="processing-card__body--element__content--item"
            v-if="config.keypoint_selection_method == 'CustomNumberOfkeypoints'"
          >
            <input
              type="number"
              min="100"
              max="1000000"
              class="selection_input"
              v-model="config.number_of_keypoints"
              placeholder=" 100 to 1,00,0000"
            />
          </div>
        </div>
      </div>
      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17 has-text-theme-black">
          Matching Strategy
          <i class="fas fa-info-circle has-text-grey-dark help-cursor">
            <div class="info-content">
              Slower but more robust. If selected,geometrically inconsistent
              matches are discarded. Useful when many similar features are
              present throughout the project: rows of plants in a farming field,
              window corners on a building's facade, etc.
            </div>
          </i>
        </p>

        <div
          class="processing-card__body--element__content--item is-flex is-vcenter mt-20"
        >
          <input
            id="matching_strategy"
            v-model="config.geometrically_verified_matching"
            type="checkbox"
            class="sh-custom-checkbox"
          />
          <label
            for="matching_strategy"
            class="is-regular-14-00-17 has-text-theme-black"
          >
            Geometrically Verified Matching
          </label>
        </div>
      </div>
      <div class="processing-card__body--element mb-30">
        <p class="is-regular-14-00-17 has-text-theme-black">
          Rematch strategy
          <i class="fas fa-info-circle has-text-grey-dark help-cursor">
            <div class="info-content">
              Computes more matches between the images and re-optimizes the
              internal and external comera parameters. Takes more time and is
              slower
            </div>
          </i>
        </p>
        <div class="columns">
          <div class="column">
            <select
              class="selection_input"
              v-model="config.rematch_strategy"
              :class="{ 'is-disabled': can_resume }"
              :disabled="canUpdateSettings"
            >
              <option value="Auto" selected>Auto</option>
              <option value="Custom">Custom</option>
            </select>
            <div class="is-content-vcentered mt-5">
              <span
                v-if="config.rematch_strategy == 'Auto'"
                class="is-flex is-vcenter mt-10"
              >
                <input
                  id="rematch_auto"
                  disabled
                  :checked="config.rematch_strategy == 'Auto'"
                  type="checkbox"
                  class="sh-custom-checkbox color-custom is-not-allowed"
                />

                <label for="rematch_auto" class="has-text-grey">Rematch</label>
              </span>
              <span v-else class="is-flex is-vcenter mt-10">
                <input
                  id="rematch_custom"
                  type="checkbox"
                  class="sh-custom-checkbox"
                  v-model="config.rematch"
                  :class="{ 'is-disabled': can_resume }"
                  :disabled="canUpdateSettings"
                />

                <label for="rematch_custom">Rematch</label>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["canUpdateSettings"],
  data() {
    return {
      min_match_options: [3, 4, 5, 6],
      image_scale_value_options: [0.125, 0.25, 0.5, 1, 2],
    };
  },
  methods: {
    save_data() {
      //  this.config = {};
    },
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
};
</script>

<style lang="scss" scoped>
.processing-card:before {
  left: 50%;
}
</style>
