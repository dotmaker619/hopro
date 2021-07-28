<template>
  <div v-if="is_viewer_small" class="is-flex align-center is-between">
    <searchbar2 style="width:80%" @search="SET_SEARCH_KEYS($event)"></searchbar2>
    <!-- TODO -->
    <div class="is-relative is-medium-14-500-17">
      <span @click="is_create = !is_create">
        <img src="@/assets/icons/vault/vault-add-new-folder.svg" class="image is-30x30 is-pointer mr-10" alt />
      </span>
      <div class="create-new-folder is-flex align-center" v-if="is_create" v-click-outside="() => (is_create = false)">
        <input
          v-focus
          @keyup.enter="create_new_folder"
          class="create-new-folder-input is-medium-14-500-17"
          placeholder="Folder Name"
          type="text"
          v-model="form.name"
        />
        <p @click="create_new_folder">
          <sh-icon :name="'ticket-show-tick'" class="is-16x16 is-pointer" :class="{ 'is-disabled': !form.name }"></sh-icon>
        </p>
      </div>
    </div>
  </div>
  <div v-else class="vault-navbar mt-10 mb-20 mx-10">
    <div class="vault-navbar-left ml-10">
      <searchbar @search="SET_SEARCH_KEYS($event)"></searchbar>
      <div class="filter__btn" @click="open_filter = !open_filter">
        <!-- :class="{ 'is-active': filtersQueryString.length }" -->
        <i class="fas fa-filter"></i>
      </div>
      <!-- <filter-button @click="open_filter=!open_filter"></filter-button> -->
      <filter-card
        v-click-outside="() => (open_filter = false)"
        style="position:relative;left:-64px;"
        v-if="open_filter"
        @close_filter="open_filter = false"
      ></filter-card>
      <VaultBulkActions
        @update_files="$emit('update_files')"
        v-if="$store.getters.vault_files_bulk_actions && ($store.state.vault.selected_files.length || $store.state.vault.selected_folders.length)"
      ></VaultBulkActions>
    </div>
    <div class="vault-navbar-right">
      <p
        @click="SET_COMPACT_VIEW(!compact_view)"
        :class="[!compact_view ? 'primary-text' : 'has-text-grey', view_type == 'grid' ? 'is-vhidden' : '']"
        class="is-medium-14-500-17 is-pointer mr-10 no-whitespace-wrap is-inline-flex is-center align-center"
      >
        <sh-icon v-if="!compact_view" :name="'ticket-show-tick'" class="is-14x14 is-pointer mr-5"></sh-icon>
        <span>Show more</span>
      </p>

      <sh-icon
        v-if="view_type == 'grid'"
        v-tooltip="'List view'"
        @click.native="SET_VIEW_TYPE('list')"
        :file="'vault_sprite'"
        class="image is-36x36 is-pointer"
        :name="'list-view-dark'"
      ></sh-icon>

      <sh-icon
        v-tooltip="'Grid view'"
        v-else
        @click.native="SET_VIEW_TYPE('grid')"
        :file="'vault_sprite'"
        class="image is-36x36 is-pointer"
        :name="'grid-view-dark'"
      ></sh-icon>
      <a
        v-tooltip="'Info'"
        @click="SET_INFO_TAB({ folder: current_folder, file: {}, type: 'folder', active: true, tab: 'info' })"
        style="width:44px;height:44px;display:flex;justify-content:center;align-items:center"
      >
        <img v-if="!info_tab.active" src="@/assets/icons/vault-info.svg" style="width:20px;" alt />
        <img v-else src="@/assets/icons/vault-info-active.svg" style="width:44px;width:44px;" alt />
      </a>
      <div class="is-relative is-medium-14-500-17 ml-10">
        <span @click="is_create = !is_create">
          <img src="@/assets/icons/vault/vault-add-new-folder.svg" class="image is-30x30 is-pointer" alt />
        </span>
        <div class="create-new-folder is-flex align-center" v-if="is_create" v-click-outside="() => (is_create = false)">
          <input
            v-focus
            @keyup.enter="create_new_folder"
            class="create-new-folder-input is-medium-14-500-17"
            placeholder="Folder Name"
            type="text"
            v-model="form.name"
          />
          <p @click="create_new_folder">
            <sh-icon :name="'ticket-show-tick'" class="is-16x16 is-pointer" :class="{ 'is-disabled': !form.name }"></sh-icon>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { fileService, assetService, folderService } from "@/desktop/shared/services/";
  import searchbar2 from "@/mobile/shared/components/searchbar.vue";
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import filterButton from "@/desktop/core/shared/components/filter-button";
  import { mapMutations, mapState } from "vuex";
  import VaultBulkActions from "@/desktop/vault/components/vault-navbar/components/vault-bulk-actions";
  import elementMixin from "@/desktop/shared/mixins/element.mixin";
  import FilterCard from "@/desktop/vault/components/vault-navbar/components/vault-filter-card";
  export default {
    props: ["is_viewer_small"],
    mixins: [elementMixin],
    components: {
      searchbar,
      searchbar2,
      filterButton,
      VaultBulkActions,
      FilterCard,
    },
    data() {
      return {
        is_create: false,
        open_filter: false,
        form: {
          name: "",
          internal: false,
          organization: this.$store.state.current_organization.uid,
        },
        is_saving: false,
        is_creating: false,
        parent: null,
        filtersQueryString: "",
        asset_details: null,
      };
    },
    beforeDestroy() {
      this.$eventHub.$off("create_new_folder");
    },
    created() {
      this.$eventHub.$on("create_new_folder", () => {
        this.is_create = true;
      });
    },
    computed: {
      ...mapState("vault", [
        "view_type",
        "info_tab",
        "selected",
        "compact_view",
        "element",
        "is_internal",
        "current_folder",
        "current_folder_uid",
        "filter_query",
      ]),
    },
    methods: {
      ...mapMutations("vault", ["SET_VIEW_TYPE", "SET_INFO_TAB", "SET_SEARCH_KEYS", "SET_COMPACT_VIEW"]),
      async create_new_folder() {
        this.parent = this.current_folder_uid ? this.current_folder : null;
        if (this.form.name) {
          this.form.name = this.form.name.trim();
          this.is_saving = true;
        }
        if (this.is_creating || !this.form.name) return;
        this.is_creating = true;
        let element;
        // create data for asset
        if (this.$route.query.asset) {
          if (!this.asset_details) this.asset_details = await assetService.get({ id: this.$route.query.asset }).catch(this.handleErrors);
          await this.create_or_get_element(this.asset_details.element);
          element = this.get_target_element(this.asset_details.element);
        } else if (this.element) {
          console.log(this.element);

          await this.create_or_get_element(this.element);
          element = this.get_target_element(this.element);
        } else {
          let org_element = this.$store.state.org_element;
          element = this.get_target_element(org_element);
        }
        if (!element) return;
        let properties = {};
        if (this.$store.getters.asset_configuration) {
          if (element.asset) {
            let asset = _.find(this.$store.state.assets, (a) => a.uid == element.asset);
            properties = (asset.properties && asset.properties.vault) || {};
          }
        }

        this.form.targetElement = element;

        this.form.internal = this.is_internal;

        if (this.element && this.element.centroid)
          this.form["location"] = {
            type: "Point",
            coordinates: Object.values(this.element.centroid),
          };

        let new_folder_data = { ...this.form };
        if (this.$store.getters.asset_configuration) {
          new_folder_data = _.mergeWith({}, properties, new_folder_data, (a, b) => (b === null ? a : undefined));
        }
        let result;
        if (this.parent) {
          result = await folderService
            .create_sub_folder({
              id: this.parent.uid,
              body: new_folder_data,
              headers: this.get_password_header(this.parent.rootFolder ? this.parent.rootFolder : this.parent.uid),
            })

            .catch((err) => this.handleErrors(err));
          this.$store.commit("vault/UPDATE_FOLDER_DETAILS", result);
          this.is_create = false;
          this.form.name = "";
        } else
          result = await folderService
            .post({
              body: new_folder_data,
              headers: this.get_password_header(""),
            })
            .catch((err) => this.handleErrors(err));

        this.$store.commit("vault/UPDATE_FOLDER_DETAILS", result);

        (this.form.fileName = null), (this.is_creating = false);
        setTimeout(() => {
          this.is_saving = false;
          this.is_create = false;
          this.form.name = "";
        }, 200);
        if (this.$route.name === "vault")
          this.$router.push({
            params: { folder_id: result.uid },
            query: { asset: this.$route.query.asset },
          });
        else this.$store.commit("vault/SET_CURRENT_FOLDER_UID", result.uid);
      },
    },
  };
</script>

<style lang="scss">
  .vault-navbar {
    .vault-owner {
      .user-dd-user-icon {
        height: 40px;
        width: 40px;
      }
    }
    user-select: none;
    // padding: 1rem;
    display: flex;
    justify-content: space-between;
    .is-size-24x24 {
      width: 30px;
      height: 30px;
      &-info {
        width: 50px;
        height: 50px;
      }
    }

    &-left {
      align-items: center;
      display: flex;
    }
    &-right {
      // margin-right: 4rem;
      display: flex;
      align-items: center;
      .primary-text {
        color: $primary;
      }
    }
  }

  .create-new-folder {
    position: absolute;
    top: 4rem;
    right: 0rem;
    z-index: 20;
    width: 240px;
    height: 48.4px;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
    border-radius: 5px;
    display: flex;

    background-color: white;
    &-input {
      width: 80%;
      color: #171e48;
      outline: none;
      border: none;
      border-right: 1px solid #eee;
      margin: 0.8rem;
      margin-left: 1rem;
      &::placeholder {
        color: rgba(23, 30, 72, 0.4);
      }
    }
  }
</style>
