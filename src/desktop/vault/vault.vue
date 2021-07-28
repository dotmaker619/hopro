<template>
  <div>
    <ShareFile />
    <div class="columns is-gapless">
      <VaultSidebar v-if="is_sidebar" />
      <div class="column">
        <Navbar v-if="is_app_navbar" class="nav-sticky" />
        <template v-if="!is_viewer_small">
        <TopFilters :is_viewer_small="is_viewer_small" v-if="!$route.name.includes('activities') " />
        <TopFilters2 :is_viewer_small="is_viewer_small" v-if="!$route.name.includes('activities')" />
        </template>
        <template v-else>
        <TopFilters2 :class="{'is-hidden':$store.state.vault.info_tab.active}" :is_viewer_small="is_viewer_small" v-if="!$route.name.includes('activities')" />
        <TopFilters :class="{'is-hidden':$store.state.vault.info_tab.active}" class="pl-10" :is_viewer_small="is_viewer_small" v-if="!$route.name.includes('activities') " />
        </template>

        <component :is_viewer_small="is_viewer_small" v-if="active_component" :is="active_component" :key="key"></component>
      </div>
    </div>
    <web-viewer
      v-if="webViewerURL"
      :url="webViewerURL"
      :name="item.name"
      :bookmark="item.bookmark"
      :uid="item.uid"
      :targetElement="webViewerElement"
      :icon="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(item.fileName) + '.svg')"
      @close="webViewerURL=null,webViewerElement=null"
      @delete="delete_item();"
    >
      <InfoTab :folder="null" :item="item" />
    </web-viewer>
  </div>
</template>
<script>
import TopFilters from "@/desktop/vault/components/vault-navbar/top-filter.vue";
import TopFilters2 from "@/desktop/vault/components/vault-navbar/top-filter-2.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import VaultSidebar from "./components/vault-sidebar.vue";

import VaultList from "./components/vault-list/vault-list.vue";
import Activities from "./components/activities/activities";
import ShareFile from "./components/share-file/share-file";
import webViewer from "@/desktop/shared/components/pdftron/web-viewer";
import prettyFileIcons from "pretty-file-icons";
import InfoTab from "./components/info-pdf-viewer";
import CommonMixin from "./mixin/common.mixin";

import {
  teamService,
  userService,
  fileService,
  folderService,
  assetService
} from "@/desktop/shared/services/";
import { mapState, mapMutations } from "vuex";

export default {
  mixins: [CommonMixin],
  props: ["element", "is_viewer_small"],
  components: {
    TopFilters,
    TopFilters2,
    VaultSidebar,
    Navbar,
    ShareFile,
    InfoTab,
    webViewer,
    "vault-list": VaultList,
    "vault-activities": Activities
  },
  data() {
    return {
      prettyFileIcons,
      asset_details: null,
      key: 1,
      webViewerURL: null,
      webViewerElement:null,
      item: null,
      apiService: fileService
    };
  },
  beforeDestroy() {
    this.$eventHub.$off("init-pdftron");
    this.$eventHub.$off("update_element_data", this.update_element_data);
    this.$store.commit("vault/SET_ELEMENT", this.element);
  },
  async created() {
    this.$eventHub.$on("update_element_data", this.update_element_data);

    this.$store.commit("vault/SET_ELEMENT", this.element);
    this.$eventHub.$on("init-pdftron", file => {
      console.log("pdf tron initing ....")
      this.item = file;
      if(typeof file.element === 'object'){
        this.webViewerElement = file.element ;
      }
      else{
        fileService.get_element({url:file.element}).then(res=>{
          this.webViewerElement = res.data.element;
        });
      }
      fileService
        .get_file_download_url({
          id: file.uid,
          headers: this.get_password_header(file.rootFolder),
          query: "read=true"
        })
        .then(res => {
          this.webViewerURL = res.data;
        });
    });
    if (this.$route.query.asset) {
      this.$store.commit("vault/SET_SELECTED_ASSET", [this.$route.query.asset]);
    }
  },
  computed: {
    is_sidebar() {
      return this.$route.meta.vault_sidebar;
    },
    active_component() {
      this.key++;
      return this.$route.meta.active_component || "vault-list";
    },
    is_app_navbar() {
      return this.$route.meta.app_navbar;
    },
    // _element() {
    //   return this.asset_details ? this.asset_details.element : this.element;
    // },
    ...mapState("vault", ["info_tab"])
  },
  methods: {
    ...mapMutations("vault", ["REMOVE_FILE", "REMOVE_FOLDER"]),
    update_element_data (element) {
      if (element.model == "folder")
        this.$store.commit("vault/UPDATE_FOLDER_DETAILS", {
          uid: element.uid,
          element: element.element
        });
      else
        this.$store.commit("vault/UPDATE_FILE_DETAILS", {
          uid: element.uid,
          element: element.element
        });
    },
    fileRemoved() {
      this.webViewerURL = null;
    }
  },
  watch: {
    element(val) {
      this.$store.commit("vault/SET_ELEMENT", val);
    }
  }
};
</script>
