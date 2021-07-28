<template>
  <div class="vault-move"
  infinite-scroll-immediate-check="false"
  infinite-scroll-disabled="loading||is_fetched_all"
  v-infinite-scroll="load_more"
  infinite-scroll-distance="10" 
  v-click-outside="() => close()">
    <div class="dropdown is-right" @click.stop :class="{'is-active':active}">
      <div v-if="!hide_icon" class="dropdown-trigger is-flex align-center" style="line-height:.5;visibility:visible" @click="active=!active">
        <img  v-tooltip="'Move folder'" src="@/assets/icons/vault/move-folder.svg" />
      </div>
      <div v-if="active ||show_dropdown" class="dropdown-menu mt-5" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          <div class="field is-marginless px-10 pt-5 has-background-white">
            <p class="control has-icons-left has-icons-right">
              <input
                class="input"
                type="text"
                placeholder="Search"
                v-model="search"
                @keyup="search_folders"
              />
              <span class="icon is-left is-large">
                <sh-icon :name="'search'" />
              </span>
            </p>
          </div>
          <!-- <input
          v-focus
          class="input pl-10 pt-10 pb-10"
          v-model="search"
          style="border:0"
          placeholder="Search..."
          />-->
          <div class="has-slimscroll-xs" style="height:200px;overflow-x:hidden">
            <folder-tree
              :exclude_folders="exclude_folders"
              @move_folder="$emit('move_folder',$event)"
              :folder="folder"
              v-for="folder in filtered"
              :key="folder.uid"
            ></folder-tree>
              <div class="loading has-text-centered py-20" v-if="loading">
                <span class="fa fa-spinner fa-spin"></span>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
const queryString = require("query-string");
import FolderTree from "./folder-tree";
import { folderService } from "@/desktop/shared/services/";
var infiniteScroll = require("vue-infinite-scroll");

export default {
  props: ['hide_icon',"show_dropdown","exclude_folders"],
  directives: { infiniteScroll },
  data() {
    return { 
      active: false, 
      search: "", 
      folders: [],
      page_size: 7,
      page_num: 1,
      loading: true, 
      is_fetched_all: false
    };
  },
  components: {
    FolderTree
  },
  created() {
    this.getData();
  },
  methods: {
    search_folders() {
      if(!this.search){
        this.page_num=1;
        this.getData();
      }else {
      _.debounce(async e => {
        let results = await folderService
          .getAll({
            query:
              `page_size=1000`+ `${this.search ? "&search=" + this.search : ""}`
          })
          .catch(err => this.handleErrors(err));
        this.folders = results;
        this.loading=false
      }, 500)();
      }
    },
    reverse_array(arr) {
      return _.reverse(arr || []);
    },
    load_more(){
      this.page_num+=1;
      if(!this.is_fetched_all) this.getData();
    },
    async getData(){
      this.loading =true;
      let results = await folderService
          .getAll({
            query:
              `page_size=${this.page_size}` + `&page_num=${this.page_num}` + `${this.search ? "&search=" + this.search : ""}`
          })
          .catch(err => this.handleErrors(err));
        if (!results.length || results.length < this.page_size) {
          this.is_fetched_all = true;
        }
        setTimeout(()=>{
        this.folders=[...this.folders, ...results];
          this.loading =false;
        },300)
    },
    close(){
      this.active=false;
      this.$emit('close');
    },
  },
  beforeDestroy(){
    this.active=false;
  },
  computed: {
    ...mapState("vault", ["vault_folders","selected_folders"]),
    filtered() {
      let folders_to_exclude = [...(this.selected_folders||[]),...(this.exclude_folders||[])]
      return _.filter(this.folders, f => !folders_to_exclude.includes(f.uid));
    }
  }
};
</script>
<style lang="scss">
.vault-move {
  .dropdown .dropdown-menu .dropdown-content {
    border-radius: 1rem;
    box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px rgba(23, 30, 72, 0.1);
    background-color: #ffffff;
  }
  .dropdown-content {
    width: 20rem;
    .input {
      border: none;
      box-shadow: none;
      border-radius: 0px;
      border-bottom: 1px solid #eee;
      &:focus {
        box-shadow: none;
        border-radius: 0px;
      }
      &::placeholder {
        opacity: 0.5;
        font-family: Barlow-Regular;
        font-size: 16px;
        text-align: left;
        color: #171e48;
      }
    }
  }
}
</style>