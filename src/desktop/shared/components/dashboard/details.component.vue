<template>
  <div class="main-section">
    <span class="is-medium-14-500-17 has-text-dark-grey has-opacity-7">Dashboard</span>
    <div class="columns">
      <div class="map column is-half mr-10">
        <h6 class="is-medium-20-500-24 pb-20 mt-20">Asset Map</h6>
        <asset-map></asset-map>
      </div>
      <div class="apps column is-half">
        <app-tabs></app-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import AppTabs from "./app-tabs/app-tabs.component";
import MapComponent from "./map-component";
import UserTag from "@/desktop/shared/components/tags/user-tag";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import { userService } from "@/desktop/shared/services/";
import AssetMap from '../home/assetmap.component'
export default {
  components: {
    AppTabs,
    MapComponent,
    UserTag,
    PrimaryTag,
    AssetMap
  },
};
</script>
<style lang="scss" scoped>
.main-section {
  margin: 5rem 1rem;
  margin-right: 2rem;
  min-height: 55rem;
  background-color: #f4f7fc;
}
</style>