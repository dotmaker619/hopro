<template>
  <div
    class="columns vault-top-header has-background-white is-gapless is-marginless is-mobile has-text-centered is-normal-14-500-17 has-text-theme-grey py-20"
  >
    <div
      class="column is-1 is-flex align-center"
      style="margin-right:13px;"
      :style="{'flex':!$route.query.recents?'0 0 70px':'0 0 40px'}"
    >
      <div
        v-if="!$route.query.recents"
        :class="[(selected_files.length || selected_folders.length)?'is-visible':'is-hidden']"
        class="is-flex align-center"
        style="flex:0 0 40px;"
      >
        <input
          class="sh-custom-checkbox is-thinner ml-15"
          type="checkbox"
          id="selection"
          v-model="selected_all"
          @change="set_selected()"
        />
        <span
          :class="[(selected_files.length || selected_folders.length)?'is-visible':'is-vhidden']"
          class="is-medium-14-500-19 ml-10 count"
        >{{selected_files.length+selected_folders.length}}</span>
      </div>
    </div>
    <div
      @click="update_sort_key('name')"
      class="column is-flex is-vcenter"
      :class="[info_tab.active||small_viewer||compact_view?'is-4':'is-2']"
    >
      <span class="is-pointer">File name</span>

      <span class="sort-indicators">
        <i
          class="fas fa-chevron-up fa-xs header-sort-icon"
          :class="[sorting_key === 'name' ? 'has-text-blue' : 'has-text-theme-grey']"
        ></i>
        <i
          class="fas fa-chevron-down fa-xs header-sort-icon"
          :class="[sorting_key === '-name' ? 'has-text-blue' : 'has-text-theme-grey']"
        ></i>
      </span>
    </div>
    <div
      @click="update_sort_key('owner')"
      class="column is-2 is-flex is-vcenter"
      :class="[info_tab.active?'is-3':'is-3']"
    >
      <span class="is-pointer">Owner</span>

      <span class="sort-indicators">
        <i
          class="fas fa-chevron-up fa-xs header-sort-icon"
          :class="[sorting_key === 'owner' ? 'has-text-blue' : 'has-text-theme-grey']"
        ></i>
        <i
          class="fas fa-chevron-down fa-xs header-sort-icon"
          :class="[sorting_key === '-owner' ? 'has-text-blue' : 'has-text-theme-grey']"
        ></i>
      </span>
    </div>
    <div
      v-if="!small_viewer && !info_tab.active && !compact_view"
      @click="update_sort_key('teams')"
      class="column is-flex is-vcenter"
      :class="[small_viewer ? 'is-4' : 'is-2']"
    >
      <span class="is-pointer">Teams</span>
      <!-- <span class="sort-indicators">
        <i class="fas fa-chevron-up fa-xs header-sort-icon" :class="[sorting_key == 'teams' ? 'has-text-blue' : 'has-text-theme-grey']"></i>
        <i class="fas fa-chevron-down fa-xs header-sort-icon" :class="[sorting_key == '-teams' ? 'has-text-blue' : 'has-text-theme-grey']"></i>
      </span>-->
    </div>

    <div
      v-if="!small_viewer && !info_tab.active && !compact_view"
      @click="update_sort_key('users')"
      class="column is-flex is-vcenter is-2 ml-20"
      :class="[small_viewer ? 'ml-20' : null]"
    >
      <span class="is-pointer">Users</span>
      <!-- <span class="sort-indicators">
        <i class="fas fa-chevron-up fa-xs header-sort-icon" :class="[sorting_key === 'users' ? 'has-text-blue' : 'has-text-theme-grey']"></i>
        <i class="fas fa-chevron-down fa-xs header-sort-icon" :class="[sorting_key === '-users' ? 'has-text-blue' : 'has-text-theme-grey']"></i>
      </span>-->
    </div>

    <div
      :class="[info_tab.active?'is-4':'is-2']"
      @click="update_sort_key('tags')"
      class="column is-flex is-vcenter"
    >
      <span class="is-pointer">Tags</span>
      <!-- <span class="sort-indicators">
        <i class="fas fa-chevron-up fa-xs header-sort-icon" :class="[sorting_key === 'tags' ? 'has-text-blue' : 'has-text-theme-grey']"></i>
        <i class="fas fa-chevron-down fa-xs header-sort-icon" :class="[sorting_key === '-tags' ? 'has-text-blue' : 'has-text-theme-grey']"></i>
      </span>-->
    </div>
  </div>
</template>
<script>
import { mapMutations, mapState, mapGetters } from "vuex";
export default {
  props: ["sorting_key", "small_viewer"],
  data() {
    return {
      selected_all: false
    };
  },
  created() {
    document.addEventListener("keyup", this.keyup_event_handler);
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this.keyup_event_handler);
  },
  methods: {
    ...mapMutations("vault", ["SET_SELECTED"]),
    keyup_event_handler (evt) {
      if (evt.keyCode == 27) {
        this.selected_all = false;
        this.set_selected();
      }
    },
    set_selected() {
      if (this.selected_all) {
        this.$store.commit(
          "vault/SET_SELECTED_FILES",
          this.$store.state.vault.vault_files.map(f => f.uid)
        );
        this.$store.commit(
          "vault/SET_SELECTED_FOLDERS",
          this.$store.state.vault.vault_folders.map(f => f.uid)
        );
      } else {
        this.$store.commit("vault/SET_SELECTED_FILES", []);
        this.$store.commit("vault/SET_SELECTED_FOLDERS", []);
      }
    },
    update_sort_key(value) {
      let new_value;
      this.sorting_key == value
        ? (new_value = "-" + value)
        : (new_value = value);
      this.$emit("update_sort_key", new_value);
    }
  },
  computed: {
    is_viewer_route() {
      return this.$route.name.includes("viewer");
    },
    ...mapState("vault", [
      "info_tab",
      "compact_view",
      "selected_files",
      "selected_folders"
    ])
  }
};
</script>
<style lang="scss">
.vault-top-header {
  border-bottom: 1px solid #eee;
  .count {
    background-color: #eee;
    height: 20px;
    width: 20px;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
  }
}
.header-sort-icon {
  cursor: pointer;
  height: 4px;
  width: 12px;
  margin: -2px 3px;
  display: table;
  font-weight: 600;
  font-size: 8px;
}
</style>
