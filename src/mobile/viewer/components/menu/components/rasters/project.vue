<template>
  <div>
    <div class="project-list">
      <div class="is-flex">
        <sh-icon
          @click.native="active = !active"
          v-if="active"
          :file="'terra_sprite'"
          :name="'terra-project-uparrow'"
          class="is-8x8 mr-15 mt-15"
        ></sh-icon>
        <sh-icon
          @click.native="active = !active"
          v-else
          :file="'terra_sprite'"
          :name="'terra-project-rightarrow'"
          class="is-8x8 mr-15 mt-15"
        ></sh-icon>
        <div class="terra-project py-10">
          <div class="is-flex is-between">
            <span
              class="terra-project__name is-medium-14-500-17"
              @click.stop="set_active_layer()"
              style="width:100%"
            >
              {{project.name}}
              <i
                v-show="active_layer == project.uid"
                class="fa fa-circle has-text-success"
                aria-hidden="true"
              ></i>
            </span>
            <sh-icon :file="'terra_sprite'" :name="'terra-project-download'" class="is-14x14"></sh-icon>
          </div>
          <div v-if="active">
            <div class="project-opacity my-20">
              <b-field>
                <b-slider
                  v-model="opacity"
                  @input="set_opacity()"
                  class="is-medium-12-500-00"
                  rounded
                  tooltip-type="is-info"
                  :custom-formatter="val => 'Opacity:' + val + '%'"
                  type="is-opacity"
                ></b-slider>
              </b-field>
            </div>
            <div class="is-flex mt-15 is-between">
              <label class="is-flex align-center is-pointer mr-20">
                <input
                  @input="toggle_map(layer_data[project.uid]?!layer_data[project.uid].is_map:true)"
                  id="all"
                  :checked="layer_data[project.uid] && layer_data[project.uid].is_map"
                  type="checkbox"
                  class="sh-custom-mobile-checkbox"
                />
                <span class="ml-5 is-regular-13-00-20 has-opacity-7">Maps</span>
              </label>
              <label class="is-flex align-center is-pointer">
                <input
                  @input="toggle_features( layer_data[project.uid]? !layer_data[project.uid].is_features:true)"
                  id="all"
                  :checked="layer_data[project.uid] && layer_data[project.uid].is_features"
                  type="checkbox"
                  class="sh-custom-mobile-checkbox"
                />
                <span class="ml-5 is-regular-13-00-20 has-opacity-7">Features</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { projectService } from "@/desktop/shared/services/";
import RasterMixin from "./raster.mixin";
export default {
  mixins: [RasterMixin],
  data() {
    return { active: false, opacity: 100 };
  },
  props: ["project", "group_index", "index"],
  async mounted() {
    if (this.index == 0 && this.group_index == 0) {
      this.set_active_layer();
    }
  },
  watch: {
    active_layer() {
      this.active = this.active_layer != this.project.uid ? false : true;
    }
  },
  methods: {
    set_opacity() {
      if (this.map.getLayer("MAPLAYER:" + String(this.project.uid)))
        this.map.setPaintProperty(
          "MAPLAYER:" + String(this.project.uid),
          "raster-opacity",
          parseInt(this.opacity, 10) / 100
        );
    },
    async toggle_map(is_map) {
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", true);

      this.$eventHub.$emit("viewer-menu-close");

      await this.fetch_meta(this.project);
      this.layer_data[this.project.uid].is_map = is_map;
      this.layer_data = { ...this.layer_data };
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", false);

      if (is_map)
        this.fly(this.layer_data[this.project.uid].meta.center.slice(0, 2));
    },
    async toggle_features(is_features) {
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", true);

      this.$eventHub.$emit("viewer-menu-close");

      await this.fetch_meta(this.project);
      await this.fetch_features(this.project);
      this.layer_data[this.project.uid].is_features = is_features;
      this.layer_data = { ...this.layer_data };
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", false);

      if (is_features)
        this.fly(this.layer_data[this.project.uid].meta.center.slice(0, 2));
    },
    async set_active_layer() {
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", true);

      this.$eventHub.$emit("viewer-menu-close");

      Object.values(this.layer_data).forEach(layer => {
        if (layer.project.uid != this.project.uid) {
          this.layer_data[layer.project.uid].is_map = false;
          this.layer_data[layer.project.uid].is_features = false;
        }
      });
      await this.fetch_meta(this.project);
      await this.fetch_features(this.project);
      this.layer_data[this.project.uid].is_map = true;
      this.layer_data[this.project.uid].is_features = true;
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", false);

      if (this.layer_data[this.project.uid].meta.center) {
        this.fly(this.layer_data[this.project.uid].meta.center.slice(0, 2));
      } else if(this.layer_data[this.project.uid] && this.layer_data[this.project.uid].features.length) {
        let centroid = turf.centroid({
          type: "FeatureCollection",
          features: [this.layer_data[this.project.uid].features[0]]
        });
        this.fly(centroid.geometry.coordinates);
      }
      this.active_layer = this.project.uid;
      try {
        this.layer_data[
          this.project.uid
        ].project_details = await projectService.get({
          group_id: this.project.group,
          id: this.project.uid
        });
      } catch (err) {
        console.log(err);
      }
      this.layer_data = { ...this.layer_data };
    }
  }
};
</script>
<style lang="scss">
.project-opacity {
  .b-slider .b-slider-fill {
    background: #b5b7c5;
  }
  .b-slider .b-slider-track {
    background: #f9f9fb;
  }
}
</style>