<template>
  <div class="vault-tabs" v-if="active">
    <template v-if="is_viewer_small">
        <div class="is-flex is-between px-20 pb-10 pt-5">
          <div class="is-flex">
            <sh-icon
            :name="'ticket-header-back'"
            @click.native="$store.commit('vault/SET_INFO_TAB',{active:false})"
            class="is-16x16 mr-10 is-pointer"
            />
            <div>
              <p class="is-medium-16-500-19 mb-5">{{file && file.name||folder && folder.name}}</p>
              <p class="is-regular-12-00-14">Vault</p>
            </div>
          </div>
          <!-- <span 
            @click="$store.commit('vault/SET_INFO_TAB',{active:false})"
            class="is-pointer is-pulled-right pt-10 px-10"
          >
            <sh-icon :name="'ticket-close-filter'" class="is-10x10" />
          </span> -->
        </div>
    </template>
    <div class="tabs has-background-white is-large is-flex is-between" :class="{'px-20':info_tab.active && is_viewer_small}">
      <ul>
        <li
          @click="$store.commit('vault/SET_INFO_TAB', { ...info_tab, tab: 'info' })"
          :class="{'is-active':active==='info'}"
        >
          <a class="tab-header is-medium-14-500-17">Information</a>
        </li>
        <li
          @click="$store.commit('vault/SET_INFO_TAB', { ...info_tab, tab: 'activity' })"
          :class="{'is-active':active==='activity'}"
        >
          <a class="tab-header is-medium-14-500-17">Activity</a>
        </li>
      </ul>
      <span v-if="!is_viewer_small"
        @click="$store.commit('vault/SET_INFO_TAB',{active:false})"
        class="is-pointer is-pulled-right pt-10 px-10"
      >
        <sh-icon :name="'ticket-close-filter'" class="is-10x10" />
      </span>
    </div>
    <div class="tabs-content" :class="{'':info_tab.active && is_viewer_small}">
      <template v-if="info_tab.type==='folder'">
        <InfoTab v-if="active==='info'" :folder="folder" :file="null" />
        <activityTab v-if="active==='activity'" :folder="folder" :file="null" />
      </template>
      <template v-else>
        <InfoTab v-if="active==='info'" :folder="null" :file="file" />
        <activityTab v-if="active==='activity'" :folder="null" :file="file" />
      </template>
    </div>
  </div>
</template>

<script>
import InfoTab from "./components/info-tab";
import activityTab from "./components/activity-tab";
import {
  userService,
  teamService,
  fileService,
  folderService
} from "@/desktop/shared/services/";
import { mapState } from "vuex";
export default {
  components: {
    InfoTab,
    activityTab
  },
  props: ["is_viewer_small"],
  created() {},
  computed: {
    ...mapState("vault", [
      "vault_folders",
      "current_folder",
      "info_tab",
      "vault_files"
    ]),
    active() {
      return this.info_tab ? this.info_tab.tab : "info";
    },
    file() {
      if (this.active && this.info_tab.file)
        return this.vault_files.find(
          item => this.info_tab.file.uid == item.uid
        );
    },
    folder() {
      if (this.active && this.info_tab.folder) {
        // return this.info_tab.folder
        console.log([...this.vault_folders,this.current_folder])
        return [...this.vault_folders,this.current_folder].find(
          item => this.info_tab.folder.uid == item.uid
        );
      }
    }
  },
  watch: {
    info_tab(val) {
      this.active = false;
      this.active = val.tab;
    }
  }
};
</script>

<style lang="scss">
.vault-tabs {
  flex: 0 0 300px;
  border-left: 1px solid #dbdbdb;
  background: white;
  .tabs {
    margin-bottom: 0;
    border-bottom: 2px solid #dbdbdb;
  }
  .tab-header {
    opacity: 0.4;
    padding: 15.5px;
    font-family: Barlow;
    font-size: 14px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.21;
    letter-spacing: normal;
    text-align: left;
    color: $low-priority;
  }
  .tabs li.is-active a {
    opacity: 1;
    border-width: 3px;
  }
}
</style>