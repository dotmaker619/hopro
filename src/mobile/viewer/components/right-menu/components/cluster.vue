<template>
  <div v-click-outside="() => (is_popup = false)">
    <div
      class="mobile-viewer-rightmenu__icon mobile-viewer-rightmenu__icon-clusters"
      @click="activate_cluster()"
    >
      <sh-icon
        v-if="cluster_for && type"
        :file="'terra_sprite'"
        :name="'terra-cluster-active'"
        class="is-14x14"
      ></sh-icon>
      <sh-icon v-else :file="'terra_sprite'" :name="'terra-cluster'" class="is-14x14"></sh-icon>
    </div>
    <div v-show="is_popup">
      <div class="mobile-viewer-cluster">
        <div class="app-card-indicator"></div>
        <div class="mobile-viewer-cluster__content">
          <div class="is-flex is-between align-center pb-10">
            <div class="is-flex align-center">
              <div class="is-regular-16-00-19 mr-10">Show</div>
              <div
                class="is-medium-14-500-17 has-accent-text"
                @click="deactivate_cluster()"
              >Clear All</div>
            </div>
            <div>
              <sh-icon
                @click.native="is_popup = false"
                :file="'terra_sprite'"
                :name="'terra-cluster-close'"
                class="is-10x10"
              ></sh-icon>
            </div>
          </div>
          <div class="mobile-viewer-cluster__list">
            <div class="mobile-viewer-cluster__list__item">
              <div class="is-flex align-center">
                <input
                  @input="cluster_for = 'ticket'"
                  class="sh-custom-mobile-checkbox"
                  type="checkbox"
                  name="ticket"
                  id="ticket"
                  value="ticket"
                  :checked="cluster_for == 'ticket'"
                />
                <br />
                <label for="ticket" class="ml-10 is-medium-14-500-17">
                  Ticket
                  <span class="tag is-info is-uppercase">{{ type }}</span>
                </label>
              </div>
              <div @click="ticket_filter = !ticket_filter">
                <sh-icon :file="'terra_sprite'" :name="'terra-cluster-setting'" class="is-16x16"></sh-icon>
              </div>
            </div>
            <div class="mobile-viewer-cluster__list__item">
              <div class="is-flex align-center">
                <input
                  @input="cluster_for = 'ticket'"
                  class="sh-custom-mobile-checkbox is-disabled"
                  type="checkbox"
                  name="vault"
                  id="vault"
                  value="vault"
                  :checked="cluster_for == 'vault'"
                />
                <br />
                <!-- <label for="vault" class="ml-10 is-medium-14-500-17">Vault</label> -->
                <label class="ml-10 is-medium-14-500-17 has-opacity-4">Vault</label>
              </div>
              <div>
                <sh-icon
                  :file="'terra_sprite'"
                  :name="'terra-cluster-setting'"
                  class="is-16x16 has-opacity-4"
                ></sh-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mobile-viewer-ticket-filter" v-if="ticket_filter">
      <div class="mobile-viewer-ticket-filter__nav">
        <span class="is-flex align-center">
          <span>
            <sh-icon
              @click.native="ticket_filter = false"
              :file="'terra_sprite'"
              :name="'terra-filter-close'"
              class="is-12x12 mr-10"
            ></sh-icon>
          </span>
          <span class="is-medium-14-500-17 has-primary-text">Tickets</span>
        </span>
        <span
          class="is-medium-14-500-17 has-accent-text"
          @click="
            allFiltersData = { priority: [], status: [], assignee: [], tags: [], dueDate: [] };
            allFiltersData = { ...allFiltersData };
          "
        >Clear All</span>
      </div>
      <div></div>
      <div class="mobile-viewer-ticket-filter__content">
        <div class="mobile-viewer-ticket-filter__content__item">
          <div class="is-regular-13-00-16 has-primary-text mb-10">Group By</div>
          <div class="is-flex" data-toggle="buttons">
            <div class="is-flex align-center mr-30 mobile-radio">
              <input type="radio" v-model="type" id="status" name="type" value="status" />
              <label for="status" class="is-medium-14-500-17 has-primary-text ml-5">Status</label>
            </div>
            <div class="is-flex align-center mobile-radio">
              <input type="radio" v-model="type" id="priority" name="type" value="priority" />
              <label for="priority" class="is-medium-14-500-17 has-primary-text ml-5">Priority</label>
            </div>
          </div>
        </div>
        <div class="mobile-viewer-ticket-filter__content__item">
          <div class="is-regular-13-00-16 has-primary-text mb-10">Assignee</div>
          <div class="is-flex">
            <AssigneeDropdown
              @update-watchers="allFiltersData.assignee = $event"
              :ticket_watchers="allFiltersData.assignee"
              :user_count="3"
              :custom_icon="'add-users-teams'"
            />
          </div>
        </div>
        <div class="mobile-viewer-ticket-filter__content__item is-flex">
          <div class="is-half">
            <div class="is-regular-13-00-16 has-primary-text mb-10">Priority</div>
            <div class="is-flex">
              <priority-dropdown
                @input="allFiltersData.priority = $event"
                :priority="allFiltersData.priority"
                :is_multi_select="true"
              ></priority-dropdown>
            </div>
          </div>
          <div class="is-half">
            <div class="is-regular-13-00-16 has-primary-text">Duedate</div>
            <div class="is-flex">
              <duedate-dropdown
                class="is-medium-16-500-19"
                :icon_class="'is-22x22 mr-7'"
                :due="allFiltersData.dueDate"
                @change-duedate="allFiltersData.dueDate = $event"
              ></duedate-dropdown>
            </div>
          </div>
        </div>
        <div class="mobile-viewer-ticket-filter__content__item">
          <div class="is-regular-13-00-16 has-primary-text mb-10">Tags</div>
          <div class="is-flex">
            <MobileTagsDropdown
              @input="allFiltersData.tags = $event"
              :initial_value.sync="allFiltersData.tags"
              :search_layout="true"
              :component="'tags'"
            />
          </div>
        </div>
        <div class="mobile-viewer-ticket-filter__content__item">
          <div class="is-regular-13-00-16 has-primary-text mb-10">Status</div>
          <div class="is-flex">
            <status-dropdown
              @input="allFiltersData.status = $event"
              :is_multi_select="true"
              :show_names="false"
              :component="'status'"
              :current_status="allFiltersData.status"
            />
          </div>
        </div>
      </div>
      <div
        @click="
          ticket_filter = false;
          load_cluster(false);
        "
        class="filter-dropdown-button is-semiBold-14-600-17"
      >Apply Filters</div>
    </div>
  </div>
</template>
<script>
import { ticketService } from "@/desktop/shared/services/";
import { mapState, mapGetters } from "vuex";
import MobileTagsDropdown from "@/mobile/viewer/shared/components/mobile-tags-dropdown.vue";
import DuedateDropdown from "@/desktop/tickets/shared/components/duedate-range-dropdown.vue";
import StatusDropdown from "@/desktop/tickets/shared/components/status-dropdown";
import AssigneeDropdown from "@/desktop/tickets/shared/components/watchers-dropdown";
import PriorityDropdown from "@/desktop/tickets/shared/components/priority-dropdown";

export default {
  data() {
    return {
      type: "",
      is_popup: false,
      // cluster_tickets: null,
      cluster_for: "ticket",
      ticket_filter: false,
      allFiltersData: {
        priority: [],
        status: [],
        assignee: [],
        tags: [],
        dueDate: []
      }
    };
  },
  components: {
    AssigneeDropdown,
    MobileTagsDropdown,
    DuedateDropdown,
    StatusDropdown,
    PriorityDropdown
  },
  created() {
    this.load_images();
    // this.load_cluster();
  },
  beforeDestroy() {
    this.clear_cluster();
  },
  computed: {
    ...mapState("viewer", [
      "map",
      "active_layer",
      "layer_data",
      "selected_feature_id"
    ]),
    ...mapGetters("viewer", ["all_features"]),
    ...mapState("tickets", ["cluster_ticket", "cluster_ticket_delete"]),
    cluster_tickets: {
      set(value) {
        this.$store.commit("viewer/SET_CLUSTER_TICKETS", value);
      },
      get() {
        return this.$store.state.viewer.cluster_tickets;
      }
    },
    filtered_tickets() {
      console.log("Total tickets counts:", this.cluster_tickets.length)
      console.log(this.cluster_tickets)
      console.log(this.allFiltersData);
      let tickets = _.filter(this.cluster_tickets || [], o => {
        return (
          (this.allFiltersData.priority.length
            ? this.allFiltersData.priority.includes(String(o.priority))
            : true) &&
          (this.allFiltersData.status.length
            ? this.allFiltersData.status.includes(o.status)
            : true) &&
          (this.allFiltersData.assignee.length
            ? this.allFiltersData.assignee
                .map(u => u.uid)
                .includes(o.takenUp && o.takenUp.uid)
            : true) &&
          (this.allFiltersData.tags.length ? this.tag_filter(o.tags) : true) &&
          (this.allFiltersData.dueDate.length
            ? this.duedate_filter(o.dueDate)
            : true)
        );
      });
      console.log("Filtered tickets count:", tickets.length);
      return tickets;
    }
  },
  watch: {
    layer_data: {
      handler: function(val, oldval) {
        if (!oldval) {
          this.activate_cluster();
          return;
        }

        if (this.map.getLayer("asset_circle"))
          this.map.removeLayer("asset_circle");
        if (this.map.getLayer("asset_label")) {
          this.map.removeLayer("asset_label");
          this.map.off("click", "asset_label");
        }
        if (this.map.getSource("assets")) this.map.removeSource("assets");

        if (val && this.cluster_for && this.type) this.load_cluster();
      },
      immediate: true
    },
    // active_layer(val) {
    //   if (this.map.getLayer("asset_circle"))
    //     this.map.removeLayer("asset_circle");
    //   if (this.map.getLayer("asset_label")) {
    //     this.map.removeLayer("asset_label");
    //     this.map.off("click", "asset_label");
    //   }
    //   if (this.map.getSource("assets")) this.map.removeSource("assets");

    //   this.type = "status";
    //   if (val && this.type) this.load_cluster();
    // },
    cluster_ticket(val) {
      if (!val || !this.type) return;

      let index = (this.cluster_tickets || []).findIndex(t => t.uid == val.uid);

      if (index != -1) {
        this.cluster_tickets[index] = val;
        this.cluster_tickets = [...(this.cluster_tickets || [])];
        this.load_cluster(false);
      } else {
        this.cluster_tickets.unshift(val);
        this.load_cluster(false);
      }
    },
    cluster_ticket_delete(uids) {
      if (uids && uids.length) {
        _.remove(this.cluster_tickets, ticket => uids.includes(ticket.uid));
        this.load_cluster(false);
      }
    },
    selected_feature_id(val) {
      if (!val || !this.type) return;
      this.load_cluster(false);
    }
  },
  methods: {
    duedate_filter(date) {
      if (!date) return false;
      let min = new Date(this.allFiltersData.dueDate[0]);
      let max = new Date(this.allFiltersData.dueDate[1]);
      let dueDate = new Date(date);
      return dueDate >= min && dueDate <= max;
    },
    tag_filter(tags) {
      if (_.intersection(tags, this.allFiltersData.tags).length) return true
      return false
    },
    onChange(event) {
      this.type = event.target.value;
    },
    load_images() {
      var popup = new mapboxgl.Popup({
        closeButton: false,
        className: "ticket-cluster-popup",
        offset: 0
      });

      document.addEventListener(
        "click",
        event => {
          // If the clicked element doesn't have the right selector, bail
          if (!event.target.matches(".ticket-cluster-popup-action")) return;

          // Don't follow the link
          event.preventDefault();

          // Log the clicked element in the console
          this.open_details_popup(event.target.getAttribute("data-ticket"));
        },
        false
      );

      this.map.on("mouseenter", "asset_label", e => {
        // Change the cursor style as a UI indicator.
        this.map.getCanvas().style.cursor = "pointer";
      });

      for (let i = 1; i <= 4; i++) {
        this.map.loadImage(
          "/img/icons/priority/" + i + ".png",
          (error, image) => {
            if (error) throw error;
            this.map.addImage("priority" + i, image);
          }
        );
      }
      for (let i = 1; i <= 5; i++) {
        this.map.loadImage(
          "/img/icons/status/" + i + ".png",
          (error, image) => {
            if (error) throw error;
            this.map.addImage("status" + i, image);
          }
        );
      }
    },
    deactivate_cluster() {
      this.cluster_for = "";
      this.is_popup = false;
      this.clear_cluster();
    },
    activate_cluster() {
      this.is_popup = true;
      if (!this.cluster_for) this.cluster_for = "ticket";
      if (!this.type) this.type = "status";

      this.load_cluster();
    },
    open_details_popup(ticket) {
      parent.postMessage(
        {
          name: "show_ticket_details",
          ticket: JSON.parse(ticket)
        },
        "*"
      );
    },
    clear_cluster() {
      if (this.map.getLayer("asset_circle"))
        this.map.removeLayer("asset_circle");
      if (this.map.getLayer("asset_label")) {
        this.map.removeLayer("asset_label");
        this.map.off("click", "asset_label");
      }
      if (this.map.getSource("assets")) this.map.removeSource("assets");
      this.is_popup = false;
      this.type = "";
      this.cluster_for = "";
    },
    async load_cluster(is_fetch_tickets = true) {
      let queryBoundary;
      let type = this.type;
      if (is_fetch_tickets) {
        try {
          let all_features = {
            type: "FeatureCollection",
            features: this.all_features
          };
          let featuresBox = turf.bboxPolygon(turf.bbox(all_features));
          let map_active_layers = Object.values(this.layer_data).filter(
            project => project.is_map == true
          );
          let map_bounds = [];

          for (let project of map_active_layers) {
            if (project.meta && project.meta.bounds) {
              map_bounds.push(turf.bboxPolygon(project.meta.bounds));
            }
          }
          queryBoundary = turf.union(featuresBox, ...map_bounds);

          this.cluster_tickets = (
            await ticketService.getAll({
              query: `pageSize=10000000&polygon=${btoa(
                JSON.stringify(queryBoundary.geometry)
              )}`
            })
          ).data;
        } catch (err) {
          console.log(err);
          // this.cluster_tickets = [];
        }
      }
      if (!this.cluster_tickets.length) return;

      let features = this.filtered_tickets.map(t => {
        if (t.location) {
          let feature = turf.feature(t.location);
          feature.properties["priority"] = t.priority;
          feature.properties["status"] = t.status;
          feature.properties["ticket"] = t;
          return feature;
        }
        return turf.feature({
          type: "Point",
          coordinates: [0, 0],
          properties: {
            priority: 0,
            status: 0,
            ticket: {}
          }
        });
      });

      let featuresCollection = { type: "FeatureCollection", features };

      var map = this.map;

      // filters for classifying assets into five categories based on magnitude
      var case1 = ["<", ["get", type], 2];
      var case2 = ["all", [">=", ["get", type], 2], ["<", ["get", type], 3]];
      var case3 = ["all", [">=", ["get", type], 3], ["<", ["get", type], 4]];
      var case4 = ["all", [">=", ["get", type], 4], ["<", ["get", type], 5]];
      var case5 = [">=", ["get", type], 5];
      // colors to use for the categories

      var colors =
        type === "status"
          ? ["#f79c4b", "#08aa4f", "#5240b9", "#b9bbc7", "#f85859"]
          : ["#babbc8", "#5cab51", "#f5ae38", "#e95456"];

      // add a clustered GeoJSON source for a sample set of assets
      if (!map.getSource("assets"))
        map.addSource("assets", {
          type: "geojson",
          data: featuresCollection,
          //  "https://docs.mapbox.com/mapbox-gl-js/assets/assets.geojson",
          cluster: this.$store.getters.tickets_clustering,
          clusterRadius: 80,
          clusterProperties: {
            // keep separate counts for each magnitude category in a cluster
            case1: ["+", ["case", case1, 1, 0]],
            case2: ["+", ["case", case2, 1, 0]],
            case3: ["+", ["case", case3, 1, 0]],
            case4: ["+", ["case", case4, 1, 0]],
            case5: ["+", ["case", case5, 1, 0]]
          }
        });
      else map.getSource("assets").setData(featuresCollection);
      // circle and symbol layers for rendering individual assets (unclustered points)
      if (map.getLayer("asset_circle")) {
        map.removeLayer("asset_circle");
      }
      if (map.getLayer("asset_label")) {
        map.removeLayer("asset_label");
      }

      map.addLayer({
        id: "asset_circle",
        type: "circle",
        source: "assets",
        filter: ["!=", "cluster", true],
        paint: {
          "circle-color": [
            "case",
            case1,
            colors[0],
            case2,
            colors[1],
            case3,
            colors[2],
            case4,
            colors[3],
            colors[4]
          ],
          "circle-opacity": 0,
          "circle-radius": 12
        }
      });
      map.addLayer({
        id: "asset_label",
        type: "symbol",
        source: "assets",
        filter: ["!=", "cluster", true],
        layout: {
          "icon-image": [
            "case",
            ["<=", ["get", type], 1],
            type + "1",
            ["<=", ["get", type], 2],
            type + "2",
            ["<=", ["get", type], 3],
            type + "3",
            ["<=", ["get", type], 4],
            type + "4",
            ["<=", ["get", type], 5],
            type + "5",
            type + "5"
          ],
          "icon-size": 1,
          "icon-allow-overlap": true
        }
      });

      let open_details = e => {
        this.open_details_popup(e.features[0].properties.ticket);
      };
      if (map.getLayer("asset_label"))
        map.off("click", "asset_label", open_details);

      map.on("click", "asset_label", open_details);
      // objects for caching and keeping track of HTML marker objects (for performance)
      var markers = {};
      var markersOnScreen = {};

      function updateMarkers() {
        var newMarkers = {};
        var features = map.querySourceFeatures("assets");

        // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
        // and add it to the map if it's not there already
        for (var i = 0; i < features.length; i++) {
          var coords = features[i].geometry.coordinates;
          var props = features[i].properties;
          if (!props.cluster) continue;
          var id = props.cluster_id;

          var marker = markers[id];
          if (!marker) {
            var el = createDonutChart(props);
            marker = markers[id] = new mapboxgl.Marker({
              element: el
            }).setLngLat(coords);
            // new mapboxgl.Popup()
            //   .setLngLat(coords)
            //   .setHTML(props.ticket.name)
            //   .addTo(map);
          }
          newMarkers[id] = marker;
          if (!markersOnScreen[id]) marker.addTo(map);
        }
        // for every marker we've added previously, remove those that are no longer visible
        for (id in markersOnScreen) {
          if (!newMarkers[id]) markersOnScreen[id].remove();
        }
        markersOnScreen = newMarkers;
      }
      // after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
      map.on("data", function(e) {
        if (e.sourceId !== "assets" || !e.isSourceLoaded) return;

        map.on("move", updateMarkers);
        map.on("moveend", updateMarkers);
        updateMarkers();
      });

      // code for creating an SVG donut chart from feature properties
      function createDonutChart(props) {
        var offsets = [];
        var counts = [
          props.case1,
          props.case2,
          props.case3,
          props.case4,
          props.case5
        ];
        var total = 0;
        for (var i = 0; i < counts.length; i++) {
          offsets.push(total);
          total += counts[i];
        }
        var fontSize =
          total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
        var r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
        var r0 = Math.round(r * 0.6);
        var w = r * 2;

        var html =
          '<div><svg width="' +
          w +
          '" height="' +
          w +
          '" viewbox="0 0 ' +
          w +
          " " +
          w +
          '" text-anchor="middle" style="font: ' +
          fontSize +
          'px sans-serif">';

        for (i = 0; i < counts.length; i++) {
          html += donutSegment(
            offsets[i] / total,
            (offsets[i] + counts[i]) / total,
            r,
            r0,
            colors[i]
          );
        }
        html +=
          '<circle cx="' +
          r +
          '" cy="' +
          r +
          '" r="' +
          r0 +
          '" fill="white" /><text dominant-baseline="central" transform="translate(' +
          r +
          ", " +
          r +
          ')">' +
          total.toLocaleString() +
          "</text></svg></div>";
        var el = document.createElement("div");
        el.innerHTML = html;

        return el.firstChild;
      }

      function donutSegment(start, end, r, r0, color) {
        if (end - start === 1) end -= 0.00001;
        var a0 = 2 * Math.PI * (start - 0.25);
        var a1 = 2 * Math.PI * (end - 0.25);
        var x0 = Math.cos(a0),
          y0 = Math.sin(a0);
        var x1 = Math.cos(a1),
          y1 = Math.sin(a1);
        var largeArc = end - start > 0.5 ? 1 : 0;

        return [
          '<path d="M',
          r + r0 * x0,
          r + r0 * y0,
          "L",
          r + r * x0,
          r + r * y0,
          "A",
          r,
          r,
          0,
          largeArc,
          1,
          r + r * x1,
          r + r * y1,
          "L",
          r + r0 * x1,
          r + r0 * y1,
          "A",
          r0,
          r0,
          0,
          largeArc,
          0,
          r + r0 * x0,
          r + r0 * y0,
          '" fill="' + color + '" />'
        ].join(" ");
      }
    }
  }
};
</script>

<style lang="scss">
.ticket-cluster-popup {
  padding: 10px;
  &.mapboxgl-popup {
    min-width: 330px !important;
  }
  .top {
    margin-left: -7px;
    display: flex;
    &-status,
    &-priority {
      display: flex;
      justify-content: center;
      font-family: Barlow-SemiBold;
      font-size: 14px;
      color: #171e48;
      font-weight: 600;
      text-transform: capitalize;
    }
    &-status {
      img {
        height: 35px;
      }
      p {
        margin-top: 4px;
      }
    }
    &-priority {
      margin-left: 10px;
      margin-top: -2px;
      img {
        height: 43px;
      }
      p {
        margin-top: 8px;
        margin-left: -3px;
      }
    }
  }
  .middle {
    margin-top: 4px;
    margin-bottom: 15px;
    font-size: 16px;
    font-family: Barlow-SemiBold;
    color: #171e48;
    font-weight: 600;
  }
  .bottom {
    font-size: 14px;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    &-due-date {
      display: flex;
      color: #fc5a5a;
      img {
        height: 19px;

        margin-right: 7px;
      }
    }
    &-see-more {
      color: #5c7ef7;
      img {
        height: 12px;
        margin-left: 7px;
      }
    }
  }
}
.ebs-count {
  position: fixed;
  right: 7rem;
  top: 1rem;
  z-index: 38;
  .dropdown-menu {
    border-radius: 8px;
    width: 277.7px;
    padding: 0 25px 31px 20px;
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16);
    background-color: #fafcff;
    .cluster-heading {
      display: flex;
      justify-content: space-between;
      font-family: Barlow;
      font-size: 16px;
      font-weight: bold;
      font-stretch: normal;
      font-style: normal;
      line-height: 75px;
      letter-spacing: normal;
      text-align: left;
      color: #132068;
    }
    .middle {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;
      border-radius: 4px;
      border: solid 1px #d0d2da;
      background-color: #ffffff;
      .middle-button {
        text-transform: capitalize;
        font-family: Barlow;
        font-size: 16px;
        font-weight: 600;
        padding: 10px 20px;
        border-radius: 4px;
        img {
          margin-right: 5px;
        }
        &-active {
          color: white;
          border: solid 1px #d0d2da;
          background-color: #5c7ef7;
        }
      }
    }
    .clear-all {
      height: 40px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 10px;
      height: 40px;
      border-radius: 4px;
      border: solid 1px #d0d2da;
      background-color: #ffffff;
      -webkit-text-stroke: 1px rgba(0, 0, 0, 0);
      font-size: 16px;
      font-weight: 600;
      color: #171e48;
    }
  }
}
.mobile-viewer {
  &-ticket-filter {
    z-index: 9;
    box-shadow: 0 -10px 30px 0 rgba(0, 0, 0, 0.5);
    background-color: $white;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    min-height: 100%;
    overflow: auto;

    &__nav {
      // position: fixed;
      z-index: 1;
      background: white;
      width: 100%;
      height: 5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
    }
    &__content {
      padding: 0 1.5rem;
      overflow: auto;
      max-height: calc(100vh - 130px);

      &__item {
        padding: 1.5rem 0;
      }
    }
  }
}
</style>
