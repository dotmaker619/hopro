<template>
  <div class="is-sh-dropdown" v-click-outside="() => (active = false)">
    <div class="is-pointer" @click="active = !active">
      <p class="is-flex" v-if="existing_asset">
        <primary-tag
          :tags="[existing_asset]"
          :canDelete="true"
          @onDelete="remove_associated_asset"
          :type="'asset'"
          :howManyToShow="1"
          :no_access="true"
        ></primary-tag>
      </p>
      <div v-else class="is-selector" :class="[active ? 'is-open' : 'is-close']">
        <p class="is-flex is-vcenter">
          <img :src="require(`@/assets/icons/primary-tag/asset.svg`)" class="image is-16x16 mr-10" />
          <span>
            Assign Associated Asset
          </span>
        </p>
      </div>
    </div>

    <ul class="is-options-list assets-list has-slimscroll-xs" v-if="active">
      <div class="field is-marginless px-10 pt-5 has-background-white">
        <p class="control has-icons-left has-icons-right ">
          <input class="input" type="email" placeholder="Search" v-model="assetInput" />
          <span class="icon is-left is-large">
            <sh-icon :name="'search'" />
          </span>
        </p>
      </div>
      <li class="item is-flex is-between pl-17" @click.stop="update_asset(asset)" v-for="asset in filteredAssets" :key="asset.uid">
        <div class="item--text is-capitalized is-flex">
          <div class="image is-24x24 mr-10" v-if="asset.properties && asset.properties.icon">
            <img :src="asset.properties.icon" class="image is-24x24 is-rounded" />
          </div>
          <div
            v-else
            class="tiny-user-avatar"
            :style="
              `background-color: ${
                asset.properties && asset.properties.color ? asset.properties.color : hashed_color(asset.name, 'projectManagement')
              }`
            "
          >
            {{ asset.name.charAt(0).toUpperCase() }}
          </div>
          <span class="ml-10">{{ asset.name }}</span>
        </div>
        <span>
          <sh-icon :name="'checkmark'" class="is-12x12 item--icon" v-if="asset && asset.uid == existing" />
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
  import { assetService, teamService } from "@/desktop/shared/services/";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import { mapState } from "vuex";

  export default {
    props: ["existing", "complete"],
    mixins: [HashColor],
    data() {
      return {
        assetInput: "",
        isLoading: false,
        active: false,
        selected: null,
      };
    },
    components: {
      PrimaryTag,
    },

    computed: {
      ...mapState(["assets"]),
      filteredAssets() {
        if (this.assetInput) {
          return this.assets.filter((f) => f.name.toLowerCase().startsWith(this.assetInput.toLowerCase()));
        } else {
          return this.assets;
        }
      },
      existing_asset() {
        if (this.selected) {
          return _.find(this.assets, (o) => {
            return o.uid == this.selected;
          });
        } else {
          return null;
        }
      },
    },

    created() {
      this.selected = this.existing;
    },

    methods: {
      async update_asset(asset) {
        this.selected = asset.uid;
        let res = await teamService
          .patch({
            id: this.$route.params.id,

            body: {
              asset_id: asset.uid,
            },
          })
          .catch((err) => this.handleErrors(err));
        this.active = false;
        this.$toast.show("Added associated asset", "", this.$store.state.izitoast_options.appSuccess);
        this.$emit("update");
      },
      async remove_associated_asset() {
        this.selected = null;
        let res = await teamService
          .patch({
            id: this.$route.params.id,

            body: {
              asset_id: null,
            },
          })
          .catch((err) => this.handleErrors(err));
        // this.$emit("update");
        this.active = false;
        this.$toast.show("Removed associated asset", "", this.$store.state.izitoast_options.appWarning);
      },
    },
  };
</script>

<style lang="scss">
  .is-options-list {
    &.assets-list {
      width: 25.2rem;
    }
  }
</style>
