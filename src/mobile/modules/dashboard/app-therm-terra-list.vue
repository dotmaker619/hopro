<template>
  <div class="m-views">
    <div class="m-views-tabs">
      <div
        class="m-views-tabs__item is-medium-14-500-17"
        v-for="(tab, index) in tabitems"
        :class="{ 'is-active': index == active }"
        :key="tab.name"
        @click="active = index"
      >
        {{ tab.name }}
      </div>
    </div>
    <div class="m-views-content">
      <div v-if="active == 0">
        <keep-alive>
          <terra-list :asset_id="asset_id"></terra-list>
        </keep-alive>
      </div>
      <div v-if="active == 1">
        <keep-alive>
          <therm-list :asset_id="asset_id"></therm-list>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
  import TerraList from "@/desktop/terra/components/terra-list/terra-list.vue";
  import ThermList from "@/desktop/therm/components/view-list/view-list.vue";

  export default {
    data() {
      return {
        active: 0,
        tabitems: [{ name: "terra" }, { name: "thermal" }],
        asset_id: null,
      };
    },
    components: {
      TerraList,
      ThermList,
    },
    created() {
      if (this.$route.query && this.$route.query.asset) {
        this.asset_id = this.$route.query.asset;
      }
    },
  };
</script>

<style lang="scss">
  .m-views {
    position: relative;
    top: -1px;
    &-tabs {
      background-color: $white;
      background: white;
      display: flex;
      border-bottom: 1px solid $blue-tint-border;
      position: sticky;
      top: 0;
      width: 100%;
      z-index: 1;
      &__item {
        height: 4rem;
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: capitalize;
        &.is-active {
          color: $primary;
          border-bottom: solid 3px $primary;
          border-radius: 2px;
          position: relative;
          top: 1.5px;
        }
      }
    }
    &-content {
      height: calc(100vh - 13.5rem);
      overflow: auto;
    }
  }
</style>
