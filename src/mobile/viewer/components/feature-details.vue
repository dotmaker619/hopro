<template>
  <div class="mobile-viewer-details" v-if="selected_feature">
    <CreateNewTicket
      :element="selected_feature_element"
      v-if="is_create_new_ticket"
      :open_on_create="true"
      @close="is_create_new_ticket = false"
      :fromFeature="true"
      :custom_class="['is-fixed','box-shadow']"
    />
    <div class="app-card-indicator"></div>
    <div class="mobile-viewer-details__add">
      <sh-icon
        @click.native="is_create_new_ticket = true"
        :file="'terra_sprite'"
        :name="'terra-map-add'"
        class="is-30x30 mr-5"
      ></sh-icon>
    </div>
    <div>
      <div class="mobile-viewer-details__details">
        <div class="is-flex">
          <img
            src="@/assets/icons/png/point.png"
            v-if="
              selected_feature && selected_feature.geometry.type === 'Point'
            "
            height="36px"
            width="36px"
          />
          <svg v-else viewBox="0 0 100 100" class="image is-36x36 mr-5">
            <use
              v-if="
                selected_feature && selected_feature.geometry.type === 'Polygon'
              "
              xlink:href="@/assets/icons/sprite.svg#polygon"
            />
            <use
              v-else-if="
                selected_feature &&
                  selected_feature.geometry.type === 'LineString'
              "
              xlink:href="@/assets/icons/sprite.svg#line"
            />
            <use xlink:href="@/assets/icons/sprite.svg#point" />
          </svg>
          <div>
            <div
              class="is-medium-14-500-17 mobile-viewer-details__details__header"
            >
              {{
                selected_feature.properties.name &&
                selected_feature.properties.name !== "null"
                  ? selected_feature.properties.name
                  : "NA"
              }}
            </div>
            <div class="is-flex align-center">
              <div
                class="map-details-status"
                :style="{ backgroundColor: feature_type_color }"
              ></div>
              <span
                class="is-regular-13-00-16 mobile-viewer-details__details__subheader"
                >{{ feature_type_name }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="mobile-viewer-details__project">
        <div class="mobile-viewer-details__project__details">
          <div class="project-details ml-4">
            <div class="is-regular-12-00-14 has-primary-text">Project</div>
            <div class="project-details__name is-medium-14-500-17">
              {{ layer_data[selected_feature.properties.project].project.name }}
            </div>
          </div>
          <div
            class="project-details"
            v-if="selected_feature.geometry.type === 'Polygon'"
          >
            <div class="is-regular-12-00-14 has-primary-text">Areas</div>
            <div class="project-details__value is-medium-14-500-17">
              {{ selected_feature_area.toFixed(4) }} acres
            </div>
          </div>
          <div
            class="project-details"
            v-if="selected_feature.geometry.type === 'LineString'"
          >
            <div class="is-regular-12-00-14 has-primary-text">Length</div>
            <div class="project-details__value is-medium-14-500-17">
              {{ (selected_feature_length * 1000).toFixed(3) }} m
            </div>
          </div>
        </div>
        <div style="overflow:scroll;height:20rem;">
          <div
            class="mobile-viewer-details__project__list"
            v-if="properties && Object.keys(properties).length"
          >
            <template v-for="(item, key, index) of properties">
              <div
                v-if="key[0] !== '_'"
                :key="index"
                class="project-list__item is-medium-14-500-17 has-primary-text"
              >
                <div>{{ headerCase(key) }}</div>
                <div
                  style="max-width: 270px;display: block;"
                  v-tooltip="item"
                  v-html="item"
                ></div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import CreateNewTicket from "@/desktop/tickets/components/tickets-list/components/create-new-ticket.vue";
import { headerCase } from "change-case";

export default {
  components: {
    CreateNewTicket,
  },
  data() {
    return { active: false, is_create_new_ticket: false };
  },
  watch: {
    selected_feature(val) {
      if (val) this.active = true;
    },
  },
  computed: {
    ...mapState("viewer", ["feature_types", "layer_data"]),
    ...mapGetters("viewer", ["selected_feature", "selected_feature_element"]),
    selected_feature_area() {
      if (!this.selected_feature) return "";
      return turf.area(this.selected_feature) * 0.000247105;
    },
    selected_feature_length() {
      if (!this.selected_feature) return "";
      return turf.length(this.selected_feature);
    },
    //
    properties() {
      return this.selected_feature.properties.extraProperties;
    },
    feature_types_map() {
      if (!this.feature_types) return {};
      let map = {};
      this.feature_types.forEach((ftg) => {
        ftg.featureTypes.forEach((ft) => {
          map[ft.id] = ft;
        });
      });
      return map;
    },
    feature_type_color() {
      return this.selected_feature.properties.featureTypeId &&
        this.feature_types_map[this.selected_feature.properties.featureTypeId]
        ? this.feature_types_map[this.selected_feature.properties.featureTypeId]
            .properties.color
        : "black";
    },
    feature_type_name() {
      return this.selected_feature.properties.featureTypeId &&
        this.feature_types_map[this.selected_feature.properties.featureTypeId]
        ? this.feature_types_map[this.selected_feature.properties.featureTypeId]
            .name
        : "NA";
    },
  },
  methods: {
    headerCase(key) {
      return headerCase(key);
    },
  },
};
</script>
