<template>
  <div style="padding:1rem">
    <div class="sh-tabs">
      <ul>
        <li>
          <a @click="active_tab = 'tickets'" :class="{ 'is-active': active_tab == 'tickets' }">Tickets</a>
        </li>
        <li>
          <a @click="active_tab = 'vault'" :class="{ 'is-active': active_tab == 'vault' }">Vault</a>
        </li>
      </ul>
    </div>
    <div v-if="active_tab === 'tickets'" class="ebs-quick-list__items" :class="{ 'is-full-width': is_tickets_fullscreen }">
      <tickets :is_viewer_small="!is_tickets_fullscreen" :element="element"></tickets>
    </div>
    <div v-else class="ebs-quick-list__items" :class="{ 'is-full-width': is_tickets_fullscreen }">
      <vault :is_viewer_small="!is_tickets_fullscreen" :element="element"></vault>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
  import vault from "@/desktop/vault/vault";
  import tickets from "@/desktop/tickets/components/tickets-list/tickets-list";
  import axios from "axios";

  export default {
    components: {
      tickets,
      vault,
    },
    data() {
      return {
        active_tab: "tickets",
        isLoading: false,
        element: null,
        is_active: false,
        is_tickets_fullscreen: false,
      };
    },
    beforeDestroy() {
      this.$eventHub.$off("update_element_data", this.update_element_data);
      if (window.addEventListener) {
        window.removeEventListener("message", this.message_event_handler);
      } else {
        window.detachEvent("onmessage", this.message_event_handler);
      }
    },
    created() {
      if (this.$route.name == "ebs") {
        let el = JSON.parse(atob(this.$route.params.element));

        if (el && el.uid) {
          this.element = el;
        } else this.create_element(atob(this.$route.params.element));
      }

      this.$eventHub.$on("update_element_data", this.update_element_data);

      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      var eventer = window[eventMethod];
      var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

      eventer(messageEvent, this.message_event_handler);
    },
    methods: {
      update_element_data (element) {
        this.element = element;
        this.element = Object.assign(this.element);
        this.$eventHub.$emit("get-other-tickets");
      },
      message_event_handler (e) {
        if ((e.data.name !== "show_ebs_data" && e.data.name !== "sidebar_toggle") || e.origin === window.origin) {
          return;
        }

        if (e.data.name == "sidebar_toggle") {
          this.is_tickets_fullscreen = !e.data.open;
        }
        if (e.data.name == "show_ebs_data") {
          if (e.data.element) {
            this.create_element(e.data.element);
          } else {
            this.is_active = false;
            this.element = null;
          }
        }
      },
      go_to_ebs() {
        this.$router.push({
          name: "ebs",
          params: { element: btoa(JSON.stringify(this.element)) },
        });
      },

      create_element(selected_feature) {
        if (selected_feature && selected_feature.properties.element && _.isObject(selected_feature.properties.element)) {
          let centroid = turf.centroid(selected_feature);
          if (centroid)
            centroid = {
              lng: centroid.geometry.coordinates[0],
              lat: centroid.geometry.coordinates[1],
            };

          this.element = {
            ...selected_feature.properties.element,
            active_tab: "tickets",
            name: selected_feature.properties.name,
            centroid,
          };
          this.element = Object.assign(this.element);
        } else {
          this.element = selected_feature;
        }

        // let action = value => {

        // };
        // if (selected_feature) {
        //   if (
        //     selected_feature.properties.element &&
        //     _.isObject(selected_feature.properties.element)
        //   ) {
        //       let centroid = turf.centroid(selected_feature);
        //   if (centroid)
        //     centroid = {
        //       lng: centroid.geometry.coordinates[0],
        //       lat: centroid.geometry.coordinates[1]
        //     };

        //   this.element = {
        //     ...value,
        //     active_tab: "tickets",
        //     name: selected_feature.properties.name,
        //     centroid
        //   };
        //   this.element = Object.assign(this.element);
        //     action(selected_feature.properties.element);
        //   } else {
        //     this.element = selected_feature;
        //   }
        // }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ebs-quick-list {
    padding: 1rem;
    border-radius: 10px;
    background: white;
    &.is-full-width {
      left: 12rem;
      width: 86.3vw;
    }
    &__items {
      // overflow: scroll;
      // width: 100%;
      // height: 90vh;
      overflow: visible;

      &.is-full-width {
        width: 100%;
      }
    }
  }

  .rotate-180 {
    transform: rotate(180deg);
    transform-origin: center;
    margin-bottom: 1rem;
  }
</style>
