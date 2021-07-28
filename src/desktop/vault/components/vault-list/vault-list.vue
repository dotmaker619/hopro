<template>
  <div @dragenter.prevent.stop="current_folder_uid ? open_file_upload() : ''">
    <div
      class="is-flex is-between align-center ml-20 mb-10"
      v-if="current_folder_uid"
      :class="{ 'mb-20': !is_viewer_small, 'is-hidden': info_tab.active && is_viewer_small }"
    >
      <div
        class="is-inline-flex align-center"
        @click="
          $route.name === 'vault'
            ? $router.push({ name: 'vault', query: { asset: $route.query.asset } })
            : $store.commit('vault/SET_CURRENT_FOLDER_UID', null)
        "
      >
        <sh-icon :name="'ticket-header-back'" class="is-16x16 mr-10 is-pointer" />
        <template v-if="!is_viewer_small">
          <p v-for="(crumb, i) in breadcrumb" :key="crumb.uid" class="is-medium-16-500-19 mr-5 is-pointer is-capitalized">
            <router-link
              style="color:#171e48"
              v-if="$route.name == 'vault'"
              :to="{ params: { folder_id: crumb.uid }, query: { asset: $route.query.asset } }"
              >{{ crumb.name }}</router-link
            >
            <a v-else @click="$store.commit('vault/SET_CURRENT_FOLDER_UID', crumb.uid)">{{ crumb.name | truncate(is_viewer_small ? 5 : 20) }}</a>
            <span class="ml-5" v-if="i != breadcrumb.length - 1">></span>
          </p>
        </template>
        <p v-else class="is-medium-14-500-17 is-pointer">Home</p>
      </div>
      <svg
        v-if="$route.name.includes('viewer')"
        @click="current_folder && current_folder.uid ? open_file_upload() : $eventHub.$emit('create_folder', { parent: null })"
        viewBox="0 0 100 100"
        class="image is-24x24 mr-10 mt-5 is-pointer is-block is-pulled-right"
      >
        <use xlink:href="@/assets/icons/helper_sprite.svg#upload-grey" />
      </svg>
    </div>
    <div id="vault-dropzone" class="columns is-gapless is-marginless">
      <div class="column has-background-white" v-if="(!info_tab.active && is_viewer_small) || !is_viewer_small">
        <div class>
          <vault-headers
            v-if="!is_viewer_small"
            :class="{ 'sticky-header': $route.name.includes('viewer') }"
            v-show="view_type == 'list'"
            :small_viewer="is_viewer_small"
            :sorting_key="sort_key"
            @update_sort_key="sort_key = $event"
          ></vault-headers>
          <div v-if="group_by.key">
            <div
              v-infinite-scroll="() => (page_num = page_num + 1)"
              :class="{ 'has-slimscroll-xs folder-files-scroll': !$route.name.includes('viewer') }"
              v-if="Object.values(grouped_data).length"
              class="is-relative"
            >
              <div v-for="(group, heading, index) in group_by.key !== 'accessed' ? grouped_data : recent_data" :key="index">
                <vault-group-card :group="group" :index="index" :is_loading="is_loading" :heading="heading" :is_viewer_small="is_viewer_small" />
              </div>
            </div>
            <vault-list-skeleton v-else></vault-list-skeleton>
          </div>
          <div v-else>
            <!-- {{sorted_folders.length}} | {{sorted_files.length}} -->
            <div
              v-infinite-scroll="() => (page_num = page_num + 1)"
              :class="{ 'has-slimscroll-xs folder-files-scroll': !$route.name.includes('viewer') }"
              class="is-relative"
            >
              <data-component
                :data="[...(sorted_folders || []), ...(sorted_files || [])]"
                :is_loading="is_loading"
                :is_viewer_small="is_viewer_small"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- style="height:155vh;overflow:auto;" -->
      <!-- <tabs class="column is-3" v-if="info_tab.active && !is_viewer_small"></tabs> -->
      <tabs
        class="column is-3"
        :class="{ 'is-12': info_tab.active && is_viewer_small, 'is-hidden': !info_tab.active }"
        :is_viewer_small="is_viewer_small"
      ></tabs>
    </div>
    <upload-file
      @uploaded_success="upload_completed"
      @initialised="uppy = $event"
      service="vault"
      :name="current_folder ? current_folder.name : null"
      type="folder"
      :uid="current_folder ? current_folder.uid : null"
      id="vault_folders_modal"
      :uploadMethod="uploadMethod"
      isModal="true"
    >
      <div style="display:none">click</div>
    </upload-file>
    <!-- v-if="!info_tab.active && !$route.name.includes('viewer')" -->
    <div v-if="current_folder_uid">
      <div class="vault-add-files-widget" :class="{ 'is-hidden': $route.name.includes('viewer') }">
        <svg viewBox="0 0 100 100" class="image is-24x24 mr-5 mt-5">
          <use xlink:href="@/assets/icons/helper_sprite.svg#upload-grey" />
        </svg>
        Drop files here to attach or
        <span
          @click="current_folder && current_folder.uid ? open_file_upload() : $eventHub.$emit('create_folder', { parent: null })"
          id="upload-browse"
          >browse</span
        >
      </div>
    </div>
  </div>
</template>
<script>
  import { folderService, fileService, userService, teamService } from "@/desktop/shared/services/";
  import RadialProgressBar from "vue-radial-progress";
  import InfoBlock from "@/desktop/shared/components/info-block";
  import axios from "axios";
  import { mapMutations, mapState, mapGetters } from "vuex";
  import UploadFile from "@/desktop/shared/components/upload-file";
  import DragSelect from "vue-drag-select/src/DragSelect.vue";
  import VaultHeaders from "./components/vault-headers";
  import Tabs from "@/desktop/vault/components/tabs/tabs";
  import AskPassword from "@/desktop/vault/components/ask-password-2";
  import RecentsMixin from "@/desktop/vault/mixin/vault-recents.mixin";
  import DataComponent from "@/desktop/vault/components/vault-list/components/vault-data-component";
  import VaultListSkeleton from "@/desktop/vault/components/vault-list/components/vault-list-skeleton.vue";
  import VaultGroupCard from "@/desktop/vault/components/vault-list/components/vault-group-card";
  var infiniteScroll = require("vue-infinite-scroll");
  export default {
    directives: { infiniteScroll },
    mixins: [RecentsMixin],
    props: ["is_viewer_small"],
    components: {
      "drag-select-container": DragSelect,
      InfoBlock,
      RadialProgressBar,
      UploadFile,
      VaultHeaders,
      Tabs,
      DataComponent,
      VaultGroupCard,
      VaultListSkeleton,
    },
    data() {
      return {
        page_size: 10,
        page_num: 1,

        active: null,
        uppy: null,
        dropzone: null,
        create_folder: false,
        fileService,
        folderService,
        is_loading: false,

        //=============
        form: { name: "" },
        sort_key: null,
        default_page_size: 1000,
        subfolders: [],
      };
    },
    async created() {
      this.$eventHub.$on(`refresh-vaultTag-list`, async (updates) => {
        if (updates) {
          if (updates.hasOwnProperty("parent")) this.$store.commit("vault/UPDATE_FOLDER_DETAILS", updates);
          else this.$store.commit("vault/UPDATE_FILE_DETAILS", updates);
        }
      });

      this.$eventHub.$on("open_file_upload", () => {
        console.log("open_file_upload");
        this.open_file_upload();
      });
      // calling on folder uid change
      // await this.getData();
    },
    beforeDestroy() {
      this.$eventHub.$off("open_file_upload");
      this.$eventHub.$off("refresh-vaultTag-list");
    },
    computed: {
      ...mapState("vault", [
        "element",
        "current_folder_uid",
        "current_folder",
        "vault_files",
        "vault_folders",
        "selected_asset",
        "show_filter",
        "group_by",

        "files",
        "folders",
        "view_type",
        "info_tab",
        "selected",
        "last_selected",
        "search_keys",
        "is_internal",
        "filter_query",
      ]),
      breadcrumb() {
        if (!this.current_folder || !this.current_folder.ancestors) return [];

        let data = [...this.current_folder.ancestors];
        data.push({
          name: this.current_folder.name,
          uid: this.current_folder.uid,
        });
        return data;
      },
      route_filter() {
        if (this.$route.query.bookmark) return "&bookmark=true";
        else if (this.$route.query.archive) return "&archive=true";
        else if (this.$route.query.shared) return `&shared=true`;
        else if (this.$route.query.owner) return `&owners=${this.$store.state.claims.user_id}`;
        else return "";
      },
      is_viewer_route() {
        return this.$route.name.includes("viewer");
      },
      sorted_files() {
        let data;
        if (!this.sort_key) data = [...this.vault_files];
        else {
          let sort_by;
          let order = this.sort_key.startsWith("-") ? "desc" : "asc";
          let key = this.sort_key.startsWith("-") ? this.sort_key.slice(1, this.sort_key.length) : this.sort_key;
          switch (key) {
            case "name":
              sort_by = "name";
              break;
            case "owner":
              sort_by = "owner.name";
              break;
          }
          data = _.orderBy(this.vault_files, [sort_by], [order]);
        }
        return data.splice(0, this.page_size * this.page_num);
      },
      sorted_folders() {
        let data;
        if (!this.sort_key) data = [...this.vault_folders];
        else {
          let sort_by;
          let order = this.sort_key.startsWith("-") ? "desc" : "asc";
          let key = this.sort_key.startsWith("-") ? this.sort_key.slice(1, this.sort_key.length) : this.sort_key;
          switch (key) {
            case "name":
              sort_by = "name";
              break;
            case "owner":
              sort_by = "owner.name";
              break;
          }
          data = _.orderBy(this.vault_folders, [sort_by], [order]);
        }
        return data.splice(0, this.page_size * this.page_num);
      },
      grouped_data() {
        let property = this.group_by.key;
        let grps = _.groupBy([...(this.sorted_folders || []), ...(this.sorted_files || [])], property);
        for (let key in grps) {
          // let data = grps[key];
          // grps[key] = {};
          // grps[key]["data"] = data;
          // grps[key]["grouped_by"] = this.group_by.filter_key;
        }
        return grps;
      },
      apply_filter() {
        return this.filter_query, this.is_internal, this.selected_asset, this.search_keys, Date.now();
      },
    },
    watch: {
      $route: {
        handler(newval, old) {
          if (!this.$route.query.asset) {
            this.$store.commit("vault/SET_SELECTED_ASSET", []);
          }

          this.page_num = 1;
          this.page_size = 10;
          this.$store.commit("vault/SET_VAULT_FILTERS", "reset");
          this.$store.commit("vault/SET_SELECTED_FOLDERS", []);
          this.$store.commit("vault/SET_SELECTED_FILES", []);
          this.$store.commit("vault/SET_INFO_TAB", { active: false });
          this.$store.commit("vault/SET_SEARCH_KEYS", "");

          this.$store.commit("vault/SET_CURRENT_FOLDER_UID", newval.params.folder_id);

          if (this.$route.query.recents) {
            this.get_recents();
            this.$store.commit("vault/SET_GROUP_BY", {
              label: "Accessed",
              key: "accessed",
              filter_key: "accessed",
              enable: true,
            });
            return;
          } else {
            if (this.group_by.filter_key == "accessed")
              this.$store.commit("vault/SET_GROUP_BY", {
                label: "None",
                key: null,
                filter_key: null,
                enable: true,
              });
          }

          if (!newval || !old || newval.params.folder_id !== old.params.folder_id) return;

          if (newval.params.folder_id) this.getFolderData();
          else this.getData();
        },
        immediate: true,
      },
      current_folder_uid: {
        handler(newval, old) {
          this.page_num = 1;
          this.page_size = 10;
          window.scrollTo(0, 0);
          this.$store.commit("vault/SET_SELECTED_FOLDERS", []);
          this.$store.commit("vault/SET_SELECTED_FILES", []);
          this.$store.commit("vault/SET_INFO_TAB", { active: false });
          this.$store.commit("vault/SET_SEARCH_KEYS", "");
          if (newval) {
            this.getFolderData();
            folderService.update_recents_list("vault-folders", this.current_folder_uid);
          } else {
            this.getData();
          }
        },
        immediate: true,
      },
      apply_filter() {
        if (this.$route.query.recents) {
          this.get_recents();
        } else if (this.current_folder_uid) {
          this.getFolderData();
        } else {
          this.getData();
        }
      },
    },

    methods: {
      ...mapMutations("vault", ["SET_SELECTED", "SET_LAST_SELECTED", "SET_VAULT_FILES", "SET_VAULT_FOLDERS"]),
      ...mapMutations(["SET_PASS_KEY"]),
      // Global data
      async getData(loading = true) {
        this.SET_VAULT_FOLDERS([]);
        this.SET_VAULT_FILES([]);
        if ((this.element && _.isString(this.element)) || this.$route.query.recents) return;

        try {
          this.is_loading = loading;
          let assets_query = "";
          if (this.selected_asset.length > 0) {
            this.selected_asset.forEach((asset) => {
              assets_query += "&asset=" + asset;
            });
          }
          let query =
            `${this.$route.query.asset ? "asset=" + this.$route.query.asset : this.element ? `element=${this.element.uid}` : ""}` +
            `${this.is_internal ? "internal=true" : ""}` +
            `${this.search_keys ? "&search=" + this.search_keys : ""}` +
            `${this.route_filter}` +
            `${!this.route_filter || this.$route.query.owner ? "" : `&is_root=false`}` +
            `${!this.filter_query ? "" : this.filter_query}` +
            assets_query;
          let promises = [
            folderService.getAll({
              query,
            }),
          ];

          if (this.route_filter)
            promises.push(
              fileService.getAll({
                query,
              })
            );

          let res = await Promise.all(promises);

          this.SET_VAULT_FOLDERS(res[0]);
          if (this.route_filter) this.SET_VAULT_FILES(res[1]);

          this.is_loading = false;
        } catch (err) {
          this.is_loading = false;
          this.SET_VAULT_FOLDERS([]);
          this.SET_VAULT_FILES([]);
        }
      },
      // Folder details data
      async getFolderData(loading = true) {
        this.SET_VAULT_FOLDERS([]);
        this.SET_VAULT_FILES([]);

        if (this.$route.query.recents) return;

        this.$store.commit("vault/SET_CURRENT_FOLDER", {});
        this.is_loading = loading;
        let action = async (password) => {
          try {
            let req_data = {
              id: this.current_folder_uid,
              headers: this.get_password_header(password),
            };
            let details = await folderService.get(req_data);
            if (details.passwordProtected) {
              this.$store.commit("SET_PASS_KEY", {
                uid: details.uid,
                value: password,
              });
            }

            this.$store.commit("vault/SET_CURRENT_FOLDER", details);

            let assets_query = "";
            if (this.selected_asset.length > 0) {
              this.selected_asset.forEach((asset) => {
                assets_query += "&asset=" + asset;
              });
            }
            req_data["query"] =
              `page_size=${this.default_page_size}` +
              `&page_num=1` +
              `${this.search_keys ? "&search=" + this.search_keys : ""}` +
              `${this.current_folder.internal ? "&internal=true" : ""}` +
              `${this.route_filter}` +
              `${!this.filter_query ? "" : this.filter_query}` +
              assets_query;

            let data = await Promise.all([folderService.get_sub_folders(req_data), folderService.folder_files(req_data)]);
            this.SET_VAULT_FOLDERS(data[0]);
            this.SET_VAULT_FILES(data[1]);
            this.is_loading = false;
          } catch (err) {
            console.log(err);
            this.is_loading = false;
            if (err.response.status == 401)
              this.$modal.show(
                AskPassword,
                {
                  inputPassword: action,
                },
                {
                  width: "400px",
                  classes: ["has-background-transparent"],
                  height: "auto",
                }
              );
          }
        };
        action(this.$store.state.pass_keys[this.current_folder_uid] || "");
      },
      toggle_visibility(group) {},
      handle_drag_selection(files) {
        let selected_arr = files.map((comp) => comp.file.uid);
        let index;
        this.SET_SELECTED(files.map((comp) => comp.file.uid));
        if (selected_arr.length > 0) {
          index = selected_arr[selected_arr.length - 1];
        } else {
          index = -1;
        }
        this.SET_LAST_SELECTED(index);
      },
      ATTACHMENT_CARD_CLICK(uid) {
        if (this.last_selected !== -1) {
          let lastIndex = this.files.findIndex((f) => f.uid == this.last_selected);
          let currentIndex = this.files.findIndex((f) => f.uid == uid);
          let min = Math.min(lastIndex, currentIndex);
          let max = Math.max(lastIndex, currentIndex);
          let selected = [];
          for (let i = min; i <= max && i < this.files.length; i++) {
            selected.push(this.files[i].uid);
          }
          this.SET_SELECTED(_.union(this.selected, selected));
          this.SET_LAST_SELECTED(uid);
        } else {
          this.TOGGLE_SELECTION(uid);
        }
      },
      TOGGLE_SELECTION(uid) {
        let exists = this.selected.includes(uid);
        let selected = [...this.selected];
        if (exists) {
          _.remove(selected, (selecteduid) => selecteduid == uid);
          if (!this.selected.length > 0) {
            this.SET_LAST_SELECTED(-1);
          }
        } else {
          selected.push(uid);
          this.SET_LAST_SELECTED(uid);
        }
        this.SET_SELECTED(selected);
      },
      // Dropzone
      open_file_upload() {
        try {
          this.uppy.getPlugin("Dashboard").openModal();
        } catch (err) {
          console.log(err);
        }
      },
      upload_completed() {
        if (this.current_folder_uid) this.getFolderData();
        this.$emit("update_files");
      },
      uploadMethod({ service }, file) {
        let properties = {};
        if (this.$store.getters.asset_configuration) {
          if (this.current_folder.targetElement && this.current_folder.targetElement.asset) {
            let asset = _.find(this.$store.state.assets, (a) => a.uid == this.current_folder.targetElement.asset);
            properties = (asset.properties && asset.properties.vault) || {};
          }
        }

        let new_folder_data = {
          name: this.form.name || file.name,
          fileName: file.name,
          filesize: file.size,
          filetype: file.type,
          folder: this.current_folder.uid,
          service: service,
          targetElement: this.current_folder.targetElement,
          internal: this.form.internal,
          organization: this.current_folder.organization,
          tags: [],
        };
        if (this.$store.getters.asset_configuration) {
          new_folder_data = _.mergeWith({}, properties, new_folder_data, (a, b) => (b === null ? a : undefined));
        }
        return fileService.update_file_upload_in_folder({
          id: this.current_folder.uid,
          body: [new_folder_data],
          headers: this.get_password_header(this.current_folder.rootFolder ? this.current_folder.rootFolder : this.current_folder.uid),
        });
      },
    },
  };
</script>
<style lang="scss">
  .sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  #vault-dropzone {
    // overflow: auto;
    // height: 64vh;
    // background: white;
  }

  .folder-files {
    background: white;
    &-scroll {
      height: 150vh;
      overflow-y: scroll;
    }
    .info-block .info-block__image__container__picture {
      height: 4rem;
      width: 4rem;
    }
    .empty-folder-illustration-vault {
      padding-top: 20vh;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .active {
      box-shadow: 0 1px 0 0 rgba(92, 126, 247, 0.3);
      background-color: #292a2b;
      .file-thumbnail-details-name {
        color: $primary;
      }
    }
  }

  .vault-add-files-widget {
    position: fixed;
    width: 80%;
    z-index: 37;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: #ccc;
    background: white;
    height: 55px;
    box-shadow: 10px 0 30px 0 rgba(23, 30, 72, 0.3);
    color: #868aa2;
    #upload-browse {
      margin-left: 5px;
      font-weight: 500;
      color: $primary;
      text-decoration: underline;
      cursor: pointer;
    }
    &-is-viewer {
      position: absolute;
      width: 100%;
    }
  }
</style>
