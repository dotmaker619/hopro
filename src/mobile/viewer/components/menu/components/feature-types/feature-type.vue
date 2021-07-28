<template>
  <div>
    <div @click="toggle_feaure_type()" class="m-terra-ft">
      <div class="m-terra-ft__color" :style="{ 'background-color': feature_type.properties.color }"></div>
      <div class="m-terra-ft__value">
        <span>
          <template v-if="!feature_type_filters.includes(feature_type.id)">{{ feature_type.name }}</template>
          <del v-else>{{feature_type.name}}</del>
        </span>
        <span>{{feature_count[feature_type.id] || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["feature_type"],
  data() {
    return {
      active: false
    };
  },
  computed: {
    ...mapGetters("viewer", ["feature_count"]),
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
    async toggle_feaure_type() {
      let index = this.feature_type_filters.findIndex(
        id => id === this.feature_type.id
      );

      if (index == -1) this.feature_type_filters.push(this.feature_type.id);
      else this.feature_type_filters.splice(index, 1);

      this.feature_type_filters = [...this.feature_type_filters];
    }
  }
};
</script>

<style lang="scss" scoped>
.m-terra-ft {
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  display: flex;
  align-items: center;

  &__color {
    height: 1.2rem;
    width: 1.2rem;
    border-radius: 50%;
  }

  &__value {
    width: 100%;
    display: flex;
    padding-left: 1rem;
    justify-content: space-between;
  }
}
</style>
