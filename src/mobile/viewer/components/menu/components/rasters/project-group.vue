<template>
  <div>
    <div class="mobile-viewer-topmenu__raster__item">
      <div class="is-flex is-between align-center" @click="active = !active">
        <span class="is-flex align-center">
          <sh-icon :file="'terra_sprite'" :name="'terra-raster-project'" class="is-16x16 mr-5"></sh-icon>
          <span class="is-medium-14-500-17 has-primary-text">{{ group.name}}</span>
        </span>
        <span>
          <sh-icon
            v-if="active"
            :file="'terra_sprite'"
            :name="'terra-raster-uparrow'"
            class="is-12x12"
          ></sh-icon>
          <sh-icon v-else :file="'terra_sprite'" :name="'terra-raster-downarrow'" class="is-12x12"></sh-icon>
        </span>
      </div>
      <div class="is-flex mt-15">
        <label class="is-flex align-center is-pointer mr-20">
          <input
            @input="is_group_map =!is_group_map;toggle_group_map(is_group_map)"
            :checked="is_group_map"
            type="checkbox"
            class="sh-custom-mobile-checkbox"
          />
          <span class="ml-5 is-regular-13-00-20 has-opacity-7">Maps</span>
        </label>
        <label class="is-flex align-center is-pointer">
          <input
            @input="is_group_feature =!is_group_feature;toggle_group_feature(is_group_feature)"
            :checked="is_group_feature"
            type="checkbox"
            class="sh-custom-mobile-checkbox"
          />
          <span class="ml-5 is-regular-13-00-20 has-opacity-7">Features</span>
        </label>
      </div>
      <div class="mt-10" v-show="active">
        <project
          v-for="(project,i) in sort(group.projects)"
          :key="project.uid"
          :project="project"
          :is_group_map="is_group_map"
          :group_index="index"
          :index="i"
        ></project>
      </div>
    </div>
  </div>
</template>

<script>
import project from "./project";
import RasterMixin from "./raster.mixin";
export default {
  mixins: [RasterMixin],
  props: ["group", "index"],
  data() {
    return { active: false, is_group_map: false, is_group_feature: false };
  },
  components: { project },
  methods: {
    sort(data) {
      if (!data) return [];
      return _.sortBy(data, [p => p.name.toLowerCase()]);
    },
    async toggle_group_map(is_map) {
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", true);

      this.$eventHub.$emit("viewer-menu-close");
      if (!this.group.projects || !this.group.projects.length) return;

      for (let i = 0; i < this.group.projects.length; i++) {
        await this.fetch_meta(this.group.projects[i]);
        this.layer_data[this.group.projects[i].uid].is_map = is_map;
      }
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", false);

      this.layer_data = { ...this.layer_data };
      if (is_map)
        this.fly(
          this.layer_data[this.group.projects[0].uid].meta.center.slice(0, 2)
        );
    },
    async toggle_group_feature(is_features) {
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", true);

      this.$eventHub.$emit("viewer-menu-close");
      if (!this.group.projects || !this.group.projects.length) return;

      for (let i = 0; i < this.group.projects.length; i++) {
        await this.fetch_meta(this.group.projects[i]);
        await this.fetch_features(this.group.projects[i]);
        this.layer_data[this.group.projects[i].uid].is_features = is_features;
      }
      this.$store.commit("viewer/SET_IS_VIEWER_LOADING", false);

      this.layer_data = { ...this.layer_data };
      if (is_features)
        this.fly(
          this.layer_data[this.group.projects[0].uid].meta.center.slice(0, 2)
        );
    }
  }
};
</script>

<style>
</style>