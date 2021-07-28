<template>
  <div>
    <div class="mobile-viewer-topmenu">
      <div class="mobile-viewer-topmenu__nav">
        <span style="flex:1" class="is-flex align-center">
          <sh-icon
            v-if="active"
            :file="'terra_sprite'"
            @click.native="active = false"
            :name="'terra-filter-close'"
            class="is-12x12 mr-10"
          ></sh-icon>
          <router-link v-else :to="{name:'dashboard'}">
            <sh-icon :file="'terra_sprite'" :name="'terra-back-arrow'" class="is-12x12 mr-10"></sh-icon>
          </router-link>
          <span class="is-medium-14-500-17 has-primary-text is-flex align-center">
            <span class="mr-5">{{details.name | truncate(25)}}</span>
            <span
              v-if="layer_data[active_layer]"
              class="tag is-info is-light"
            >{{ layer_data[active_layer].project?layer_data[active_layer].project.name:"NA" | truncate(10) }}</span>
          </span>
        </span>
        <div :class="{'animate-offline-icon':background_sync===1}">
          <sh-icon @click.native="appOffline" :name="is_offline?'go-online-icon':'go-offline-icon'"  class="is-20x20 mr-15"/>
        </div>        
        <img
          @click="active = !active"
          src="@/assets/icons/terrra-mobile/terra-layer.svg"
          alt
          srcset
        />
      </div>
      <div v-show="active">
        <div class="mobile-viewer-topmenu__tabs">
          <div
            class="mobile-viewer-topmenu__tabs_item is-medium-14-500-17"
            :class="{ 'is-active': tab==0 }"
            @click="tab=0"
          >Feature Types</div>
          <div
            class="mobile-viewer-topmenu__tabs_item is-medium-14-500-17"
            :class="{ 'is-active': tab==1 }"
            @click="tab=1"
          >Rasters</div>
        </div>
        <div v-show="tab==0" class="tab-items">
          <featureTypeGroup
            v-for="(group, index) in sort(feature_types)"
            :key="group.uid"
            :group="group"
            :index="index"
          />
        </div>
        <div v-show="tab==1" class="tab-items">
          <projectGroup
            v-for="(group,index) in sort(details.groups)"
            :key="group.uid"
            :group="group"
            :index="index"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState,mapMutations } from "vuex";
import projectGroup from "./components/rasters/project-group";
import featureTypeGroup from "./components/feature-types/feature-type-group";
import isOnline from "is-online";

export default {
  data() {
    return { active: false, tab: 1 };
  },
  components: {
    projectGroup,
    featureTypeGroup
  },
  created() {
    this.$eventHub.$on("viewer-menu-close", () => (this.active = false));
  },
  beforeDestroy() {
    this.$eventHub.$off("viewer-menu-close");
  },
  computed: {
    ...mapState([
      "is_offline",
      "background_sync"
    ]),
    ...mapState("viewer", [
      "details",
      "feature_types",
      "layer_data",
      "active_layer"
    ])
  },
  methods: {
    ...mapMutations(["SET_GO_OFFLINE"]),
    async appOffline(){
      if(this.is_offline && !await isOnline()){
        this.$toast.show('Unable to go online, check  network connection','',this.$store.state.izitoast_options.appError);
        return;
      }
      this.SET_GO_OFFLINE(!this.is_offline);
      if (
        !this.is_offline && navigator.serviceWorker &&
        navigator.serviceWorker.controller
      ) {
        navigator.serviceWorker.controller.postMessage({
          type: "sync",
        });
      }
      if(this.is_offline){
        this.$toast.show('App went offline, click again to go online','',this.$store.state.izitoast_options.appWarning)
      }
      else{
        this.$toast.show('App went online, Syncing offline data','',this.$store.state.izitoast_options.appSuccess)
      }
    },
    sort(data) {
      if (!data) return [];
      return _.sortBy(data, [p => p.name && p.name.toLowerCase()]);
    },
  },
};
</script>

<style lang="scss" scoped>
.animate-offline-icon{
  position:relative;
  &::after{
    width: 7px;
    height: 7px;
    border-radius: 100px;
    -webkit-text-stroke: 1px solid black;
    content: " ";
    display: block;
    border: 3px solid white;
    position: absolute;
    top: 6px;
    left: 6px;
    animation-name: offline-animation;
    animation-timing-function: ease-in;
    animation-duration: 0.5s;
    animation-iteration-count: infinite;
     animation-direction:alternate;
  }
}

@keyframes offline-animation {
  from {transform: scale(1);}
  to {transform: scale(3);}
}


.tab-items {
  height: calc(100vh - 80px);
  overflow: auto;
}
</style>