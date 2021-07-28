<template>
  <div
    id="viewer-load-template"
    v-click-outside="() => (active = false)"
    v-if="active"
  >
    <div class="create-ticket-component">
      <save-template
        @close-load-template="active = false"
        class="is-absolute"
        style="right: 21rem; top: 0"
        v-if="true"
        :tickets="[1]"
        :type="'load'"
        :callback="create_tickets"
        :loading_from_template="loading_from_template"
      ></save-template>
    </div>
  </div>
</template>

<script>
import { ticketService } from "@/desktop/shared/services/";
import { terraService } from "@/desktop/shared/services/";
import { viewService } from "@/desktop/shared/services/";
import SaveTemplate from "./save-template";
export default {
  components: {
    SaveTemplate,
  },
  data() {
    return {
      active: false,
      features: [],
      loading_from_template: false,
    };
  },
  created() {
    var eventMethod = window.addEventListener
      ? "addEventListener"
      : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

    eventer(messageEvent, this.load_data_from_template);
  },
  beforeDestroy() {
    if (window.addEventListener) {
      window.removeEventListener("message", this.load_data_from_template);
    } else {
      window.detachEvent("onmessage", this.load_data_from_template);
    }
  },
  methods: {
    load_data_from_template(e) {
      if (_.isObject(e.data) && e.data.name === "load_from_template") {
        console.log(e.data.features);
        if (e.data.features && e.data.features.length) {
          this.features = e.data.features;
          this.active = true;
        } else {
          this.features = [];
          this.active = false;
        }
      } else {
        this.active = false;
        this.features = [];
      }
    },
    on_close() {
      let wn = document.getElementById(this.$route.name).contentWindow;
      // postMessage arguments: data to send, target origin
      wn.postMessage(
        "on_load_templates_complete",
        this.$route.name === "terra-viewer"
          ? process.env.VUE_APP_TERRA_VIEWER
          : process.env.VUE_APP_THERM_VIEWER
      );
      this.active = false;
      this.loading_from_template = false;
    },
    async create_tickets(template) {
      try {
        this.loading_from_template = true;
        // Add loader as well
        template.include.location = false;
        template.include.organization = false;
        // 1. Get the elements with feature ids
        let res;
        if (this.$route.name === "terra-viewer") {
          res = await terraService.get_elements({
            body: {
              uids: this.features.map((feature) => feature.properties.uid),
            },
          });
        } else {
          res = await viewService.get_elements({
            body: {
              uids: this.features.map((feature) => feature.properties.uid),
            },
          });
        }

        let updateObject = {
          tickets: [],
          strict: true,
        };
        updateObject.tickets = this.features;
        updateObject.tickets = this.features.map((feature) => {
          let element = {
            uid: res[feature.properties.uid].uid,
            type: res[feature.properties.uid].type,
            stage: res[feature.properties.uid].stage,
            asset: res[feature.properties.uid].asset,
          };
          let centroid = turf.centroid(feature);
          let name;
          if (this.$route.name === "terra-viewer")
            name = feature.properties.name || "";
          else if (this.$route.name === "therm-viewer") {
            if (feature.properties.string_number) {
              name =
                feature.properties.string_number +
                "(" +
                feature.properties.class_name +
                ")";
            } else {
              name =
                feature.properties.uid +
                "(" +
                feature.properties.class_name +
                ")";
            }
          }
          name = [name, template.name].join(" ");
          return {
            ...template,
            targetElement: element,
            name,
            organization: this.$store.state.current_organization.uid,
            location: {
              type: "Point",
              coordinates: centroid.geometry.coordinates,
            },
          };
        });

        // 2. Call the API to create tickets for those element and selected template
        let data = await ticketService.bulk_template({ body: updateObject });

        // 3. post back message to viewer
        this.on_close();
        // 4. In viewer if clusters are active reload

        // 5. Close the popup
      } catch (err) {
        console.log(err);
        this.active = false;
        this.loading_from_template = false;
      }
    },
  },
};
</script>

<style lang="scss">
#viewer-load-template {
  height: 0;
  position: absolute;
  top: 5rem;
  z-index: 10000000;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
