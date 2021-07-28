<script>
import { apiService, organizationService } from "@/desktop/shared/services/";
export default {
  methods: {
    get_target_element(element) {
      if (element) {
        return {
          asset: element.asset,
          type: element.type || element.elementType,
          uid: element.uid,
          stage: element.stage
        };
      }
      return false;
    },
    async create_or_get_element(element) {
      // When element is not created for the non vector resource
      if (element && _.isString(element)) {
        try {
          let res = await apiService.get({ url: element });

          if (this.$route.query.asset && this.asset_details) {
            this.asset_details.element = res.data;
          }

          this.$eventHub.$emit("update_element_data", res.data);
        } catch (err) {
          this.handleErrors(err);
        }
      }
      // When element passed as a feature or vector
      else if (
        element &&
        _.isObject(element) &&
        element.properties &&
        element.properties.element
      ) {
        let action = value => {
          let centroid = turf.centroid(element);
          if (centroid)
            centroid = {
              lng: centroid.geometry.coordinates[0],
              lat: centroid.geometry.coordinates[1]
            };

          this.$eventHub.$emit("update_element_data", {
            ...value,
            active_tab: "tickets",
            name: element.properties.name,
            centroid
          });
        };
        // element is already created for the feature
        if (_.isObject(element.properties.element)) {
          action(element.properties.element);
        }
        // element is not created for the feature
        else if (_.isString(element.properties.element)) {
          try {
            let res = await apiService.get({ url: element.properties.element });
            let new_element = res.data.element;
            action(new_element);
            try {
              if (!this.$route.meta.screen) {
                let wn = document.getElementById(this.$route.name)
                  .contentWindow;
                // postMessage arguments: data to send, target origin
                wn.postMessage(
                  {
                    name: "update_feature_props",
                    feature: element,
                    element: new_element
                  },
                  this.$route.name === "terra-viewer"
                    ? process.env.VUE_APP_TERRA_VIEWER
                    : process.env.VUE_APP_THERM_VIEWER
                );
              }
            } catch (err) {
              console.log(err);
            }
          } catch (err) {
            this.handleErrors(err);
          }
        }
      }
    },
    async get_org_element() {
      try {
        let details = await organizationService.get({
          id: this.$store.state.current_organization.uid
        });
        if (details.element && _.isString(details.element)) {
          let res = await apiService.get({ url: details.element });
          return res.data;
        } else return details.element;
      } catch (err) {
        console.log(err);
        this.handleErrors(err);
        return null;
      }
    }
  }
};
</script>
