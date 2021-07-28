<template>
  <div>
    <div
      class="mobile-viewer-rightmenu__icon"
      :class="{ 'terra-close': active }"
      @click="active = !active"
    >
      <sh-icon v-if="!active" :file="'terra_sprite'" :name="'terra-add'" class="is-14x14"></sh-icon>
      <sh-icon v-else :file="'terra_sprite'" :name="'terra-close'" class="is-19x19"></sh-icon>
    </div>
    <div v-show="active">
      <Cluster />
      <Filters :state="'half'" />
      <Application :state="'half'" />
      <MapMarker />
    </div>
    <div style="height: 100%;">
      <feature-details />
    </div>
  </div>
  <!-- popups -->
</template>

<script>
import Application from "./components/applications/applications";
import Filters from "./components/filter";
import Cluster from "./components/cluster";
import MapMarker from "./components/map-marker";
import FeatureDetails from "@/mobile/viewer/components/feature-details.vue";

export default {
  components: {
    Application,
    Filters,
    Cluster,
    MapMarker,
    FeatureDetails
  },
  data() {
    return {
      active: true,
      clusters: false,
      active_popup: ""
    };
  },
  methods: {
    select_popup(name) {
      this.active_popup = this.active_popup == name ? "" : name;
    }
  }
};
</script>

<style lang="scss" scoped>
.filter-dropdown-button {
  height: 4rem;
  margin: 3rem 1.5rem 1.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  border: solid 1px $primary;
  background-color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  cursor: pointer;
  &:hover {
    background-color: $primary;
    color: $white;
    box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  }
}
.mt-14 {
  margin-top: 1.4rem;
}
</style>
<style lang="scss">
.mobile-viewer-rightmenu__icon {
  position: fixed;
  right: 0;
  top: 6rem;
  z-index: 4;
  height: 3rem;
  width: 3rem;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.7rem 0 0 0.7rem;
  margin: 8px 0px;
  &-marker {
    top: 10rem;
  }
  &-applications {
    top: 14rem;
  }
  &-clusters {
    top: 18rem;
  }
  &-filters {
    top: 22rem;
  }
}
</style>