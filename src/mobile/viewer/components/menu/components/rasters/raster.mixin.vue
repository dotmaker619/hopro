<script>
import { mapState } from "vuex";
import {
  apiService,
  terraService,
  viewService,
  projectService
} from "@/desktop/shared/services/";

export default {
  computed: {
    ...mapState("viewer", ["map", "details", "feature_types"]),
    layer_data: {
      get() {
        return this.$store.state.viewer.layer_data;
      },
      set(value) {
        this.$store.commit("viewer/SET_LAYER_DATA", value);
      }
    },
    active_layer: {
      get() {
        return this.$store.state.viewer.active_layer;
      },
      set(value) {
        this.$store.commit("viewer/SET_ACTIVE_LAYER", value);
      }
    }
  },
  methods: {
    fly(location) {
      this.map.flyTo({
        center: location,
        zoom: 17,
        speed: 5
      });
    },
    async fetch_meta(project) {
      if (!this.layer_data[project.uid]) {
        this.layer_data[project.uid] = { meta: {}, project: { ...project } };
        try {
          let results = await apiService.get({
            url: project.reports && project.reports.orthotiles.tile_url
          });
          this.layer_data[project.uid].meta = results.data || {};
        } catch (err) {
          this.$store.commit("viewer/SET_IS_VIEWER_LOADING", false);
          console.log("Error fetching layer meta...");
        }
      }
    },
    async fetch_features(project) {
      if (!this.layer_data[project.uid].features) {
        try {
          if (this.$route.name === "therm-viewer") {
            let data = await viewService.get_project_features({
              view_id: this.details.uid,
              project_id: project.uid,
              query: "tables=false"
            });
            this.layer_data[project.uid].features = (data.features || []).map(
              f => {
                f.properties["featureTypeId"] = f.properties.class_id;
                f.properties["project"] = project.uid;
                f.properties["custom_feature_id"] =
                  project.uid + "-" + btoa(Math.random()).substring(0, 8);
                return f;
              }
            );
          } else if (this.$route.name === "terra-viewer") {
            let data = await terraService.get_project_features({
              view_id: this.details.uid,
              id: project.uid
            });
            this.layer_data[project.uid].features = (data.features || []).map(
              f => {
                f.properties["custom_feature_id"] =
                  project.uid + "-" + btoa(Math.random()).substring(0, 8);
                return f;
              }
            );
          }
        } catch (err) {
          this.$store.commit("viewer/SET_IS_VIEWER_LOADING", false);
          this.layer_data[project.uid].features = [];
          console.log("Error fecthing features...");
        }
      }
    }
  }
};
</script>
