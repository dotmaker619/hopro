<template>
  <div class="advanced-option">
    <div class="advanced-option__color-icon" :class="{ 'advanced-option__color-icon--no-tags': hideTags }">
      <p class="advanced-option__color-icon__title">{{ type }} Color / Icon</p>
      <div class="advanced-option__color-icon__color">
        <div
          v-for="(color, i) in colorPalette.tag"
          :key="i"
          @click="selectedColor === color ? (selectedColor = null) : (selectedColor = color)"
          :style="`background-color: ${color}`"
          class="advanced-option__color-icon__color__circle"
          :class="{ 'advanced-option__color-icon__color__circle--selected': selectedColor === color }"
        >
          <i v-if="selectedColor === color" class="fa fa-check advanced-option__color-icon__color__circle__check" aria-hidden="true"></i>
        </div>
      </div>
      <div class="advanced-option__color-icon__partition">
        <div class="advanced-option__color-icon__partition__line"></div>
        <div class="advanced-option__color-icon__partition__text">or</div>
      </div>
      <b-upload v-model="icon" v-on:input="upload_image(icon, 'icon-type')" accept="image/*">
        <div class="advanced-option__color-icon__upload mt-20">
          <img :src="require('@/assets/icons/form-upload-icon.svg')" class="advanced-option__color-icon__upload__icon" />
          <div class="advanced-option__color-icon__upload__text">Upload Icon</div>
        </div>
      </b-upload>
      <p v-if="type == 'asset'" class="advanced-option__image__title mt-20">Upload Image</p>
      <b-upload v-if="type == 'asset'" v-model="cover" v-on:input="upload_image(cover, 'cover-type')" accept="image/*">
        <div class="advanced-option__color-icon__upload mt-20">
          <img :src="require('@/assets/icons/form-upload-icon.svg')" class="advanced-option__color-icon__upload__icon" />
          <div class="advanced-option__color-icon__upload__text">Upload Image</div>
        </div>
      </b-upload>
    </div>
    <div v-if="!hideTags" class="advanced-option__tags" v-click-outside="clicked_outside_tags">
      <div class="advanced-option__tags__title">Tags</div>
      <div class="advanced-option__tags__container">
        <assigned-tags :tags="selectedTags.map((tag) => tag.uid)" :write_access="false" />
      </div>
      <select-input
        ref="selectTagInput"
        :selected="formTags"
        :selectText="'Enter tags'"
        :selectOptions="availableTags"
        :multi="true"
        :showIcon="false"
        :isTag="true"
        @inputChange="handleInputChange"
        :removeItem="removeItemUid"
        class="ml-10"
      />
    </div>
    <div class="advanced-option__tags mt-30" v-if="type == 'asset'">
      <p class="advanced-option__tags__title">
        Output Coordinate system
      </p>

      <input list="crs" class="input crs_input" type="text" v-model="selected_coordinate_system" />
      <datalist id="crs">
        <option v-for="(coordinate_option, i) in available_coordinate_systems" :key="i">{{ coordinate_option }}</option>
      </datalist>
    </div>
  </div>
</template>

<script>
  import SelectInput from "@/desktop/shared/components/form/components/select-input";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  import { iconService, processingService } from "@/desktop/shared/services/";
  import axios from "axios";
  import { mapState } from "vuex";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

  export default {
    components: {
      SelectInput,
      AssignedTags,
    },
    props: ["type", "tags", "hideTags", "propertyColor", "propertyIcon", "propertyCover", "propertyCRS"],
    mixins: [HashColor],
    data() {
      return {
        selectedColor: null,
        selectedTags: [],
        finalTags: [],
        sliceLength: 8,
        removeItemUid: null,
        icon: null,
        iconUrl: null,
        cover: null,
        coverUrl: null,
        available_coordinate_systems: [],
        selected_coordinate_system: "",
      };
    },
    watch: {
      selectedTags(value) {
        // finalTags is accessed by parent element
        if (value) {
          this.finalTags = [];
          value.forEach((element) => {
            let e = { ...element };
            if (e.uid === e.name) delete e.uid;
            this.finalTags.push(e);
          });
        }
      },
      tags() {
        this.fill_selected_tags();
      },
    },
    computed: {
      ...mapState(["TAGS"]),

      availableTags() {
        return [...Object.values(this.TAGS)];
      },

      formTags() {
        if (this.tags) return this.tags.map((t) => this.TAGS[t]);
        return [];
      },
    },
    created() {
      this.selectedColor = this.propertyColor;
      this.iconUrl = this.propertyIcon;
      this.coverUrl = this.propertyCover;
      this.selected_coordinate_system = this.propertyCRS;
      this.fill_selected_tags();
      if (this.type == "asset") this.getCoordinateOptions();
    },
    methods: {
      async getCoordinateOptions() {
        this.available_coordinate_systems = await processingService.get_available_coordinates({}).catch((err) => console.log(err));
      },
      fill_selected_tags() {
        if (this.tags) this.selectedTags = this.tags.map((t) => this.TAGS[t]).filter((t) => t !== undefined);
      },
      clicked_outside_tags() {
        this.$refs.selectTagInput.dropdown = false;
      },
      handleInputChange(value) {
        this.selectedTags = value;
        this.selectedTags = [...this.selectedTags];
      },
      async upload_image(image, type) {
        if (image && image.size / Math.pow(1024, 2) > 2) {
          this.$buefy.toast.open({
            type: "is-warning",
            message: "Maximum icon size is 2MB",
          });
          this.cover = null;
          this.icon = null;
        } else {
          let urlResult = await iconService
            .generate_url({
              body: { filename: image.name },
            })
            .catch((err) => this.handleErrors(err));
          if (urlResult) {
            axios.defaults.headers.common = {};
            axios.defaults.headers.put = {};
            let uploadResult = await axios.put(urlResult.url, image).catch((err) => this.handleErrors(err));
            if (uploadResult) {
              if (type === "cover-type") this.coverUrl = uploadResult.config.url.split("?")[0];
              else this.iconUrl = uploadResult.config.url.split("?")[0];
              this.$buefy.toast.open({
                type: "is-success",
                message: type === "cover-type" ? "Image uploaded successfully" : "Icon uploaded successfully",
              });
            }
          }
        }
      },
    },
  };
</script>

<style lang="scss">
  .advanced-option {
    width: 100%;
    color: #171e48;
    font-size: 1.6rem;
    font-weight: 500;
    text-align: left;
    padding: 3rem 0;
    &__color-icon {
      width: 100%;
      padding-bottom: 2rem;

      &--no-tags {
        padding-bottom: 0;
      }

      &__title {
        text-transform: capitalize;
      }
      &__color {
        width: 100%;
        padding: 3rem 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        &__circle {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          cursor: pointer;
          &--selected {
            width: 3rem;
            height: 3rem;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          &__check {
            color: $white;
          }
        }
      }
      &__partition {
        margin-top: 1rem;
        position: relative;
        &__line {
          width: 100%;
          height: 2px;
          background-color: #f0f2f4;
        }
        &__text {
          opacity: 0.7;
          background-color: #fafcff;
          padding: 0 1rem;
          position: absolute;
          left: 47%;
          top: -1.25rem;
        }
      }

      &__upload {
        display: flex;
        flex-direction: row;
        width: 15rem;
        height: 5rem;
        border-radius: 6px;
        border: solid 1px $primary;
        background-color: #ffffff;
        align-items: center;
        justify-content: center;
        // margin-top: 3rem;
        cursor: pointer;
        &__icon {
          margin-right: 1rem;
        }
        &__text {
          color: $primary;
          font-size: 1.4rem;
          font-weight: 600;
        }
      }
    }

    &__tags {
      &__title {
        text-transform: capitalize;
      }
      &__container {
        margin-top: 0.5rem;
        padding: 1rem 0;
      }
    }
  }

  .crs_input {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    border-bottom: 1px solid #ddd;
    border-radius: 0;
    font-size: 1.6rem;
    line-height: 4rem;
  }
</style>
