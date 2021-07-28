<template>
  <div>
    <div
      class="mobile-viewer-rightmenu__icon mobile-viewer-rightmenu__icon-filters"
      @click="filter_active=!filter_active;init_filters()"
    >
      <sh-icon
        v-if="filter_active"
        :file="'terra_sprite'"
        :name="'terra-filter-active'"
        class="is-14x14"
      ></sh-icon>
      <sh-icon v-else :file="'terra_sprite'" :name="'terra-filter'" class="is-14x14"></sh-icon>
    </div>
    <!-- <swipeable-bottom-sheet
      v-if="filter_active"
      class="mobile-viewer-filter"
      :openY="0.0"
      :halfY="0.5"
      ref="swipeableBottomSheet"
    >-->
    <div
      v-if="filter_active"
      class="mobile-viewer-filter mobile-viewer-rightmenu__icon-filters-body"
      v-click-outside="()=>{filter_active=false; open_property=false; open_value=false}"
    >
      <div class="filter-content">
        <div class="filter-content__header">
          <div class="is-flex align-center">
            <span @click="filter_active=false" class="mr-10 is-medium-16-500-19">
              Filters
              <span
                class="is-medium-14-500-17 has-accent-text"
                @click="extra_property_filters.selected_key =''; extra_property_filters.selected_values = []; extra_property_filters  = {...extra_property_filters}"
              >Clear All</span>
            </span>
            <sh-icon :file="'terra_sprite'" :name="'terra-filter-reload'" class="is-24x24 mr-5"></sh-icon>
          </div>
          <span @click="filter_active=false">
            <sh-icon :file="'terra_sprite'" :name="'terra-filter-close'" class="is-10x10 mr-5"></sh-icon>
          </span>
        </div>
        <div class="filter-content__property">
          <div class="is-regular-13-00-16">Property</div>
          <div class="filter-content__property__search">
            <div class="filter-content__property__search__icon">
              <sh-icon :file="'terra_sprite'" :name="'terra-filter-search'" class="is-16x16"></sh-icon>
            </div>
            <input
              @click="open_property = true"
              id="propertyname"
              :value="extra_property_filters.selected_key"
              type="text"
              name
              placeholder="Enter Property"
              readonly
            />
          </div>
        </div>
        <div class="filter-content__values">
          <div class="is-regular-13-00-16">Values</div>
          <div class="filter-content__values__search">
            <div class="filter-content__values__search__icon">
              <sh-icon :file="'terra_sprite'" :name="'terra-filter-search'" class="is-16x16"></sh-icon>
            </div>
            <input
              @click="open_value_modal()"
              id="propertyValue"
              :value="extra_property_filters.selected_values"
              type="text"
              name
              placeholder="Enter Values"
              readonly
            />
          </div>
        </div>
      </div>
      <div class="modal is-fixed" :class="{'is-active': open_property}">
        <div class="modal-background"></div>
        <div class="property-list-card" v-click-outside="()=>(open_property=false)">
          <div class="property-list-card__header">
            <span class="is-medium-14-500-17 has-opacity-4 mr-15">Select Property</span>
            <span>
              <sh-icon
                @click.native="open_property = false"
                :file="'terra_sprite'"
                :name="'terra-filter-close'"
                class="is-10x10 mr-10"
              ></sh-icon>
            </span>
          </div>
          <div class="property-list-card__body">
            <div v-if="Object.keys(keys) && Object.keys(keys).length">
              <div
                class="property-item"
                v-for="item in Object.keys(keys)"
                :key="item"
                @click="extra_property_filters.selected_key=item;open_property=false;extra_property_filters.selected_values=[],update_values()"
              >
                <span class="is-medium-14-500-17 has-primary-text">{{item}}</span>
                <sh-icon
                  v-if="extra_property_filters.selected_key == item"
                  :name="'ticket-show-tick'"
                  class="is-14x14"
                />
              </div>
            </div>
            <div v-else class="is-flex is-center my-30 has-primary-text">No Results Found</div>
          </div>
        </div>
      </div>
      <div class="modal is-fixed" :class="{'is-active': open_value}">
        <div class="modal-background"></div>
        <div class="property-list-card" v-click-outside="()=>(open_value=false)">
          <div class="property-list-card__header">
            <span class="is-medium-14-500-17 has-opacity-4 mr-15">Select Values</span>
            <span>
              <sh-icon
                @click.native="open_value = false"
                :file="'terra_sprite'"
                :name="'terra-filter-close'"
                class="is-10x10 mr-5"
              ></sh-icon>
            </span>
          </div>
          <div class="property-list-card__body">
            <!-- <div class="property-item" v-for="item in Object.keys(values)" :key="item" @click="extra_property_filters.selected_key=item;open_property=false;update_values()"> -->
            <div
              class="property-item"
              v-for="item in values"
              :key="item"
              @click="selectValues(item);values.length==1?open_value=false:open_value=true"
            >
              <span class="is-medium-14-500-17 has-primary-text">{{item}}</span>
              <sh-icon
                v-if="extra_property_filters.selected_values.includes(item)"
                :name="'ticket-show-tick'"
                class="is-14x14 mr-5"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- @click="apply" -->
      <div
        @click="extra_property_filters = { ...extra_property_filters }"
        class="filter-dropdown-button filter-submit-button is-semiBold-14-600-17"
      >Apply Filters</div>
    </div>

    <!-- </swipeable-bottom-sheet> -->
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";

import { SwipeableBottomSheet } from "@/mobile/shared/components/swipe-bottom-card";
import { mapState, mapGetters } from "vuex";
export default {
  props: ["filters", "state"],
  data() {
    return {
      is_loading: false,
      keys: {},
      values: [],
      filter_active: false,
      open_property: false,
      open_value: false
    };
  },
  components: {
    Treeselect,
    SwipeableBottomSheet
  },
  created() {
    this.init_filters();
  },
  watch: {
    layer_data() {
      this.init_filters();
      this.extra_property_filters = { ...this.extra_property_filters };
    }
  },
  computed: {
    ...mapState("viewer", ["layer_data"]),
    all_features() {
      let features = [];
      Object.values(this.layer_data).forEach(layer => {
        if (layer.is_features) features.push(...(layer.features || []));
      });
      return features;
    },
    extra_property_filters: {
      set(value) {
        this.$store.commit("viewer/SET_EXTRA_PROPERTY_FILTERS", value);
      },
      get() {
        return this.$store.state.viewer.extra_property_filters;
      }
    }
  },
  methods: {
    update_values() {
      this.is_loading = true;
      new Promise((resolve, reject) => {
        let all_values = {};
        if (this.extra_property_filters.selected_key)
          this.all_features.forEach(f => {
            if (
              f.properties.extraProperties &&
              f.properties.extraProperties[
                this.extra_property_filters.selected_key
              ]
            ) {
              all_values[
                f.properties.extraProperties[
                  this.extra_property_filters.selected_key
                ]
              ] =
                f.properties.extraProperties[
                  this.extra_property_filters.selected_key
                ];
            }
          });
        resolve(Object.values(all_values));
      }).then(res => {
        this.values = [...(res || [])];
        this.is_loading = false;
      });
    },
    init_filters() {
      this.is_loading = true;
      new Promise((resolve, reject) => {
        this.all_features.forEach(f => {
          if (f.properties.extraProperties) {
            this.keys = {
              ...this.keys,
              ...(f.properties.extraProperties || {})
            };
          }
        });
        resolve(true);
      }).then(res => {
        setTimeout(() => {
          this.update_values();
          this.is_loading = false;
        }, 1000);
      });
    },
    selectValues(value) {
      if (!this.extra_property_filters.selected_values.includes(value)) {
        this.extra_property_filters.selected_values.push(value);
      }
    },
    open_property_modal() {},
    open_value_modal() {
      if (!this.values.length) {
        this.$toast.show("Please Select Property");
      } else {
        this.open_value = true;
      }
    }
  }
};
</script>

<style lang="scss">
.mobile-viewer-rightmenu__icon-filters-body {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 8;
}
.property-list-card {
  width: calc(100% - 40px);
  z-index: 1;
  background-color: #fff;
  // padding: 1rem;
  border-radius: 1rem;
  &__header {
    // margin: 0 1rem;
    padding: 1rem;
    border-bottom: 1px solid rgba(23, 30, 72, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__body {
    max-height: 300px;
    overflow: auto;
    padding: 0 1rem;
    .property-item {
      padding: 1rem 0;
      border-bottom: 1px solid rgba(23, 30, 72, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>