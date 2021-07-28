<template>
  <div class="assets-selection" v-click-outside="() => (active = false)">
    <div class="is-flex align-center" @click="!$route.query.asset ? (active = !active) : (active = false)">
      <span class="is-medium-14-500-17 option-title" :class="{ 'is-hidden': hide_title }">Assets:</span>

      <span v-if="!$route.query.asset" class="option-value is-semiBold-14-600-17 is-pointer">{{
        selected_asset.length ? "Selected (" + selected_asset.length + ")" : "All"
      }}</span>
      <span v-else class="asset-query">
        <p>
          <span class="selected-count option-value is-semiBold-14-600-17 is-pointer">{{
            selected_asset.length ? "Selected (" + selected_asset.length + ")" : ""
          }}</span>
          <sh-icon v-if="!$route.query.asset" :name="`${active ? 'expand' : 'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
        </p>
        <span @click="clear_assets" class="clear-query option-value is-medium-16-500-19 has-accent-text is-pointer">Clear All</span>
      </span>
    </div>

    <div class="dropdown" v-if="active" v-click-outside="() => (active = false)">
      <div class="dropdown-header">
        <span class="is-flex align-center">
          <span class="is-medium-16-500-19 has-opacity-5 mr-15"> Assets </span>
          <span class="is-medium-16-500-19 mr-15 has-primary-text"> Selected ({{ selected_asset.length }}) </span>
        </span>
        <span class="is-medium-16-500-19 has-accent-text is-pointer" @click="clear_assets">Clear All</span>
      </div>
      <div class="dropdown-input is-flex align-center">
        <span class="mx-10 dropdown-input-image">
          <sh-icon :name="'nav-search'" />
        </span>
        <span class="search-input">
          <input id="searchAsset" class="search-assets is-regular-16-00-00" type="text" v-focus v-model="search" placeholder="Search Assets" />
        </span>
      </div>

      <div class="assets-dropdown-content has-slimscroll">
        <div class="asset-loading" v-if="isLoading">
          <img src="@/assets/icons/ellipsis-animation.svg" class="image is-64x64 margin-auto" />
        </div>
        <div v-else class="is-bottom-border is-flex align-center is-pointer assets-dropdown-content__item" v-for="(item, i) in filtered" :key="i">
          <input :id="item.uid" type="checkbox" class="sh-custom-checkbox" :value="item.uid" v-model="selected_asset" />

          <label class=" is-flex align-center is-pointer " :for="item.uid">
            <div
              class="asset-icon is-semiBold-14-600-24"
              :style="
                `background-color:${item.properties && item.properties.color ? item.properties.color : hashed_color(item.name, 'projectManagement')}`
              "
            >
              {{ item.name.charAt(0) }}
            </div>
            <span class="is-medium-14-500-24 ml-10 asset-item-name">{{ item.name | truncate(25) }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { assetService } from "@/desktop/shared/services/";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  import { mapState } from "vuex";

  export default {
    mixins: [HashColor],
    data() {
      return {
        active: false,
        search: "",
        // assets: [],
        openDisplayDropdown: false,
      };
    },
    props: ["from", "hide_title"],
    created() {
      if (this.$route.query.asset) {
        this.$store.commit("tickets/SET_SELECTED_ASSET", [this.$route.query.asset]);
      }
      this.getData();
    },
    computed: {
      ...mapState(["assets"]),
      filtered() {
        return _.filter(this.assets, (a) => _.includes(a.name.toLowerCase(), this.search.toLowerCase()));
      },
      selected_asset: {
        get() {
          if (this.from && this.from == "vault-dashboard") return this.$store.state.vault.selected_asset;
          else return this.$store.state.tickets.selected_asset;
        },
        set(value) {
          if (this.from && this.from == "vault-dashboard") this.$store.commit("vault/SET_SELECTED_ASSET", value);
          else this.$store.commit("tickets/SET_SELECTED_ASSET", value);
          if (this.$route.name == "schedules" || this.$route.name == "overview") {
            this.$parent.$emit("selected_asset", value);
          }
        },
      },
    },
    methods: {
      clear_assets() {
        this.selected_asset = [];
        this.$store.commit("tickets/SET_SELECTED_ASSET", []);
        this.$router.replace({
          ...this.$route,
          query: { ...this.$route.query, asset: undefined },
        });
      },
      toggle_asset(uid) {
        let index = this.selected_asset.findIndex((asset) => asset === uid);
        if (index != -1) this.selected_asset.splice(index, 1);
        else this.selected_asset.push(uid);
        this.selected_asset = [...this.selected_asset];
      },
      async getData() {
        if (this.assets) return;
        this.isLoading = true;
        let query = "page_size=1000&page_number=1";
        //   query.labels = true;
        let { results } = await assetService.getAssetsDashboard({ query });
        // this.assets = results;
        this.$store.commit("SET_ASSETS", results);
        this.isLoading = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .assets-selection {
    display: flex;
    align-items: center;
    position: relative;
    color: $primary-text;
    z-index: 20;
    .asset-query {
      .clear-query {
        display: none;
      }
      .selected-count {
        display: block;
      }
    }
    .asset-query:hover {
      .selected-count {
        display: none;
      }
      .clear-query {
        display: block;
      }
    }
  }
  .dropdown {
    box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px rgba(23, 30, 72, 0.1);
    background-color: #ffffff;
    position: absolute;
    width: 344px;
    height: 412px;
    z-index: 1;
    border-radius: 2rem;
    // padding: 2rem;
    overflow: auto;
    top: 25px;
    left: 12px;
    display: block;

    &-header {
      padding: 2rem 2rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-input {
      margin: 0 2rem;
    }
  }

  .assets-dropdown-content {
    height: 310px;
    overflow-y: auto;
    overflow-x: hidden;
    &__item {
      padding: 1.2rem 3rem;
      &:hover {
        background-color: #f7f8ff;
      }
    }
    .asset-item-name {
      color: #171e48;
    }

    .asset-icon {
      height: 2.4rem;
      width: 2.4rem;
      background-color: red;
      border-radius: 50%;
      color: white;
      display: flex;
      line-height: 24px;
      justify-content: center;
      text-transform: uppercase;
      margin: 0 0 0 15px;
    }
  }

  .dropdown-input {
    // border-radius: 22px;
    border-bottom: solid 0.6px rgba(141, 149, 170, 0.5);
    height: 40px;
    margin: 1rem 2rem 0;
    &-image {
      height: 16px;
      width: 16px;
      margin-right: 2.4rem;
    }
  }
  .search-input {
    flex: 1;
    input {
      width: 100%;
    }
  }
  .search-assets {
    height: 38px;
    border: 0;
    color: #171e48 !important;
  }
  input.search-assets::placeholder {
    color: #171e48;
    opacity: 0.5;
  }
  .asset-loading {
    display: flex;
    align-items: center;
    height: 60%;
  }
</style>
