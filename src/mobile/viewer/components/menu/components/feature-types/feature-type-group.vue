<template>
  <div>
    <div class="m-terra-ft-group" :class="{ 'is-active': active }">
      <span class="is-flex align-center">
        <sh-icon
          @click.native="toggle_group()"
          v-if="is_filter_active"
          :file="'terra_sprite'"
          :name="'terra-unhide'"
          class="is-19x19 mr-10"
        ></sh-icon>
        <sh-icon
          @click.native="toggle_group()"
          v-else
          :file="'terra_sprite'"
          :name="'terra-hide'"
          class="is-19x19 mr-10"
        ></sh-icon>
        <span @click="active=!active" class="is-medium-14-500-17 has-primary-text">
          {{
          group.name
          }}
        </span>
      </span>
      <sh-icon
        @click.native="active=!active"
        v-if="active"
        :file="'terra_sprite'"
        :name="'terra-featuretype-uparrow'"
        class="is-19x19"
      ></sh-icon>
      <sh-icon 
        @click.native="active=!active"
      
      v-else :file="'terra_sprite'" :name="'terra-featuretype-downarrow'" class="is-19x19"></sh-icon>
    </div>
    <div v-show="active">
      <featureType
        v-for="feature_type in sort(group.featureTypes)"
        :feature_type="feature_type"
        :key="feature_type.id"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import featureType from "./feature-type";
export default {
  components: { featureType },
  props: ["group", "index"],
  data() {
    return {
      active: false,
      is_filter_active: true
    };
  },
  created() {
    if (this.index == 0) this.active = true;
  },
  computed: {
    // is_filter_active() {
    //   let featureTypesIds = this.group.featureTypes.map(f => f.id);
    //   let is_active = true;
    //   featureTypesIds.forEach(feature_typeid => {
    //     let index = this.feature_type_filters.findIndex(
    //       id => id === feature_typeid
    //     );

    //     if (index>=0) is_active = false;  this.feature_type_filters.splice(index, 1);
    //   });
    //   return true;
    // },
    feature_type_filters: {
      get() {
        return this.$store.state.viewer.feature_type_filters;
      },
      set(value) {
        this.$store.commit("viewer/SET_FEATURE_TYPE_FILTERS", value);
      }
    }
  },
  methods: {
    sort(data) {
      if (!data) return [];
      return _.sortBy(data, [p => p.name.toLowerCase()]);
    },
    toggle_group() {
      this.is_filter_active = !this.is_filter_active;
      let featureTypesIds = this.group.featureTypes.map(f => f.id);
      if (!this.is_filter_active) {
        featureTypesIds.forEach(id => {
          if (!this.feature_type_filters.includes(id)) {
            this.feature_type_filters.push(id);
          }
        });
      } else {
        featureTypesIds.forEach(feature_typeid => {
          let index = this.feature_type_filters.findIndex(
            id => id === feature_typeid
          );

          if (index !== -1) this.feature_type_filters.splice(index, 1);
        });
      }

      this.feature_type_filters = [...this.feature_type_filters];
    }
  }
};
</script>
<style lang="scss" scoped>
.m-terra-ft-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background-color: #f4f4f6;
  box-shadow: 0 1px 0 0 rgba(23, 30, 72, 0.1);
  &.is-active {
    background-color: #e8f3fb;
  }
}
</style>
