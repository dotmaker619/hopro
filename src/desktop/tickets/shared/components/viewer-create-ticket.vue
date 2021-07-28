<template>
  <div id="viewer-create-ticket" v-if="element && active">
    <div class="create-ticket-component">
      <create-ticket @close="on_close()" :element="element" :without_status="true" :viewer_ticket="false"></create-ticket>
    </div>
  </div>
</template>

<script>
  import CreateTicket from "@/desktop/tickets/components/tickets-list/components/create-new-ticket";
  export default {
    components: {
      CreateTicket,
    },
    data() {
      return {
        element: null,
        active: false,
      };
    },
    watch: {
      $route: function() {
        this.element = null;
      },
    },
    created() {
      this.$eventHub.$on("update_element_data", this.update_element_data);

      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      var eventer = window[eventMethod];
      var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

      eventer(messageEvent, this.create_ticket);
    },
    beforeDestroy() {
      this.$eventHub.$off("update_element_data", this.update_element_data);
      if (window.addEventListener) {
        window.removeEventListener("message", this.create_ticket);
      } else {
        window.detachEvent("onmessage", this.create_ticket);
      }
    },
    methods: {
      update_element_data (element) {
        this.element = element;
        this.element = Object.assign(this.element);
      },
      create_ticket (e) {
        if (_.isObject(e.data) && e.data.name === "create_ticket") {
          if (e.data.element && e.data.element.properties.element) {
            this.create_element(e.data.element);
            this.active = true;
          } else {
            this.element = null;
            this.active = false;
          }
        }
      },
      on_close() {
        this.element = null;
        let wn = document.getElementById(this.$route.name).contentWindow;
        // postMessage arguments: data to send, target origin
        wn.postMessage(
          "create_new_ticket_closed",
          this.$route.name === "terra-viewer" ? process.env.VUE_APP_TERRA_VIEWER : process.env.VUE_APP_THERM_VIEWER
        );
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

<style lang="scss">
  #viewer-create-ticket {
    height: 0;
    position: absolute;
    top: 9rem;
    z-index: 10000000;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    .create-ticket-component {
      width: 70vw;
      width: 65vw;
      margin-left: 27.4rem;
    }
    .sh-dropdown-content {
      box-shadow: none;
    }
  }
</style>
