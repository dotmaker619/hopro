<template>
  <div
    class="columns is-gapless is-vcentered vault-list-item py-10"
    :class="{'pl-20 pr-10':is_viewer_small,
    'active-background':info_tab.active && info_tab.type=='file' && info_tab.file && info_tab.file.uid==item.uid}"
    style="margin:0;"
    @click.shift.stop.exact="$emit('shift_click',item.uid)"
    @click.meta.exact="$emit('toggle_selection',item.uid)"
    @click.ctrl.exact="$emit('toggle_selection',item.uid)"
  >
    <div v-if="!is_viewer_small" class="column is-1 is-flex" style="flex:0 0 40px;margin-right:13px;">
      <div class="is-flex is-center align-center actions">
        <template v-if="!$route.query.recents">
          <!-- :class="{'is-disabled':file.passwordProtected}" -->
          <input
            type="checkbox"
            class="sh-custom-checkbox is-thinner ml-15"
            :id="item.uid"
            v-model="selected"
            :value="item.uid"
          />
          <p @click="bookmark(item, i)" :class="{ hidden: !item.bookmark }" class="bookmark ml-10">
            <sh-icon v-if="item.bookmark" :name="'bookmarked-highlight'" class="is-18x18" />
            <sh-icon v-else :name="'bookmark'" class="is-18x18" />
          </p>
        </template>
      </div>
    </div>
    <div
      class="column"
      :class="[is_viewer_small?'is-12':(info_tab.active||compact_view)?'is-4':'is-2']"
    >
      <div class="is-flex align-center">
        <div
          class="file-thumbnail" style="width:100%" :class="[!is_viewer_small?'align-center':'align-start']"
          
        >
          <div class="file-thumbnail-icon is-relative is-flex align-center">
            <div @click="$eventHub.$emit('init-pdftron',item);SET_INFO_TAB({ file: item, type: 'file', active: true, tab: 'info' });"
            class="is-pointer thumbnail-overlay">
              <sh-icon
                style="opacity:1"
                :class="'is-20x20 view-eye'"
                :file="'tickets_sprite'"
                :name="'attachment-eye'"
              ></sh-icon>
            </div>

            <img v-if="item.thumbnailSmall" class="image is-36x36" :src="item.thumbnailSmall" />
            <img
              v-else
              class="file-type-icon"
              :src="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(item.fileName) + '.svg')"
            />
          </div>
          <div class="file-thumbnail-details"  style="width:100%">
            <div class="is-flex is-vcentered" :class="{'mb-5':item.archive}">
              <span
                v-if="item.archive"
                @click.stop="archive(item)"
                @mouseenter="hover=true"
                @mouseleave="hover=false"
                class="file-thumbnail-details-archive is-pointer mr-5 is-medium-12-500-14 has-opacity-7"
              >{{hover?'Unarchive':'Archived'}}</span>
              <div
                class="is-flex align-center"
                style="flex-wrap: wrap;"
                v-if="item.ancestors && item.ancestors.length && !is_everything"
              >
                <sh-icon
                  :file="'vault_sprite'"
                  :name="'add-folder'"
                  class="image is-pointer is-16x16"
                />
                <p
                  style="overflow-wrap:break-word;"
                  v-for="(crumb,i) in item.ancestors"
                  :key="crumb.uid"
                  @click="!$route.name.includes('viewer')? $router.push({params: {folder_id: crumb.uid},query:{asset:$route.query.asset}}):$store.commit('vault/SET_CURRENT_FOLDER_UID',crumb.uid)"
                  class="is-medium-12-500-14 mr-5 is-pointer is-flex align-center word-break is-capitalized has-text-grey has-opacity-7"
                >
                  {{crumb.name}}
                  <span class="ml-5" v-if="i!==item.ancestors.length-1">></span>
                </p>
              </div>
            </div>
            <div class="is-medium-16-500-19 has-text-theme-black is-flex align-center is-between" :class="{'mb-5':!is_viewer_small}" v-if="item.name">
              <template v-if="is_edit === i">
                <input
                  class="is-fullwidth input is-medium-14-500-17"
                  v-focus
                  v-click-outside="() => (is_edit = -1)"
                  v-model="form.name"
                  @keyup.enter="save(item)"
                  type="text"
                />
              </template>
              <template v-else>
                <p class="is-inline-flex align-center" @click="SET_INFO_TAB({ file: item, type: 'file', active: true, tab: 'info' })">
                  <span
                    class="file-thumbnail-details-name is-inline"
                    v-tooltip="(info_tab.active||is_viewer_small||compact_view)?item.name.length>30?item.name:null:item.name.length>10?item.name:null"
                  >{{ item.name | truncate(info_tab.active||is_viewer_small||compact_view?30:10) }}</span>
                  <span @click.stop="bookmark(item, i)" v-if="is_viewer_small && item.bookmark"> 
                    <sh-icon 
                    :name="'bookmarked-highlight'"
                    class="is-14x14 ml-10 bookmark-marked"
                  />
                  </span>
                  <span class="download is-flex">
                    <p
                      v-if="is_viewer_small"
                      @click.stop="bookmark(item, i)"
                      :class="{ hidden: !item.bookmark }"
                      class=""
                    >
                      <sh-icon v-if="!item.bookmark && is_viewer_small" :name="'bookmark'" class="is-14x14 bookmark ml-10 bookmark-unmarked" />
                    </p>
                    <a @click.stop="download(item)">
                      <sh-icon
                        class="mr-10 ml-10 is-pointer is-14x14"
                        :file="'tickets_sprite'"
                        :name="'download-blue'"
                      ></sh-icon>
                    </a>
                  </span>
                </p>
                  <!-- <span class="download is-flex">
                    <p
                      v-if="is_viewer_small"
                      @click.stop="bookmark(item, i)"
                      :class="{ hidden: !item.bookmark }"
                      class="bookmark ml-10"
                    >
                      <sh-icon
                        v-if="item.bookmark"
                        :name="'bookmarked-highlight'"
                        class="is-14x14 bookmark-marked"
                      />
                      <sh-icon v-else :name="'bookmark'" class="is-14x14 bookmark-unmarked" />
                    </p>
                    <a @click="download(item)">
                      <sh-icon
                        class="mr-10 ml-10 is-pointer is-14x14"
                        :file="'tickets_sprite'"
                        :name="'download-blue'"
                      ></sh-icon>
                    </a>
                  </span>
                </p> -->
              </template>
              <template v-if="is_viewer_small">
                <FileDropdown
                  :is_viewer_small="is_viewer_small"
                  class="file-actions"
                  @download="download(item)"
                  @archive="archive(item)"
                  @delete="delete_item(item)"
                  @move="move($event)"
                  @rename="
                    is_edit = i;
                    form.name = item.name || item.filename;
                  "
                  :file="item"
                  @share="open_share_modal(item)"
                />
              </template>
            </div>
            <div class="file-thumbnail-details-extra">
              <div class="file-thumbnail-details-extra-size">{{ $prettysize(item.fileSize || 0) }}</div>
              <img class="ml-10" style="height:18px" src="@/assets/icons/seperate.svg" alt />
              <div class="file-thumbnail-details-extra-upload ml-5">
                <svg class="image is-18x18 mr-5" viewBox="0 0 100 100">
                  <use xlink:href="@/assets/icons/vault_sprite.svg#upload-new-versions" />
                </svg>
                1
              </div>
              <img
                v-if="item.shareCount"
                class="ml-5 mr-5"
                style="height:18px"
                src="@/assets/icons/seperate.svg"
                alt
              />
              <div v-if="item.shareCount" class="file-thumbnail-details-extra-share">
                <svg class="image is-18x18 mr-5" viewBox="0 0 100 100">
                  <use xlink:href="@/assets/icons/vault_sprite.svg#share" />
                </svg>
                {{ item.shareCount }}
                sharing
              </div>
            </div>
            <div v-if="is_viewer_small" class="is-flex align-center is-between">
              <type-tag
                :number_of_tags_to_display="2"
                :tags="item.tags"
                :resourceId="item.uid"
                :complete="update_tags"
              />
              <div class="is-pulled-right">
                <div class="is-flex align-center">
                  <user-avatar
                    v-if="item.owner"
                    :user="item.owner"
                    :pxsize="20"
                    class="mr-5"
                    :avatarfontsize="12"
                    :custom_class="'tiny-user-avatar'"
                  ></user-avatar>
                  <p
                    class="is-medium-14-500-17 has-text-blue-grey is-width-10"
                    v-username="item.owner"
                  ></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="is-flex is-vcenter" style="width: 32px;" @click="download(file)">
          <img class="download-is-hidden" src="@/assets/icons/download.svg" />
        </div>-->
      </div>
    </div>
    <template v-if="!is_viewer_small">
    <div
      class="column is-1"
      :class="[info_tab.active||is_viewer_small||compact_view?'is-3':'is-3']"
    >
      <!-- <OwnerOld :vault_item="file" :type="'file'" /> -->
      <!-- {{file.owner.email}} -->
      <user-dropdown
        :hide_close="true"
        class="is-medium-14-500-17 has-text-new-grey"
        :existing_user="item.owner"
        :pxsize="30"
        @update-user="update_owner($event, item)"
        v-if="item.owner"
      ></user-dropdown>
      <!-- <Owner
        v-if="file.owner"
        :existing_user="file.owner"
        :can_unassign="false"
        @update-user="update_owner($event, file)"
      />-->
    </div>
    <div class="column is-2" v-if=" !is_viewer_small && !info_tab.active && !compact_view">
      <primary-tag
        @clicked_tag="add_teams(item, 'file')"
        :no_access="true"
        v-if="item.readLabels.length || item.writeLabels.length"
        :toShowCount="1"
        :type="'team'"
        :tags="get_teams(item)"
      ></primary-tag>
      <sh-icon
        v-else
        class="is-30x30"
        @click.native="add_teams(item, 'file')"
        :file="'vault_sprite'"
        :name="'add-teams'"
      ></sh-icon>
    </div>
    <div class="column is-2" v-if="!is_viewer_small && !info_tab.active && !compact_view">
      <div class="is-flex is-vcenter">
        <user-tag
          class="users"
          :custom_class="'user-style is-30x30'"
          :custom_size="30"
          :tagsCountToShow="2"
          v-if="item.readUsers.length || item.writeUsers.length"
          @handle_click="add_users(item, 'file')"
          :no_access="true"
          :users="[...(item.readUsers || []),...(item.writeUsers || [])]"
        ></user-tag>
        <sh-icon
          v-else
          class="is-30x30"
          @click.native="add_users(item, 'file')"
          :file="'vault_sprite'"
          :name="'add-users'"
        ></sh-icon>
      </div>
      <!-- <user-tag
        v-if="file.readUsers.length || file.writeUsers.length"
        @clicked_user="add_users(file, 'file')"
        :no_access="true"
        :users="[...(file.readUsers || []),...(file.writeUsers || [])]"
        :howManyToShow="2"
      ></user-tag>
      <svg
        v-else
        @click="add_users(file, 'file')"
        style="height: 3.8rem;width: 3.8rem;cursor:pointer"
        viewBox="0 0 100 100"
      >
        <use xlink:href="@/assets/icons/vault_sprite.svg#add-users" />
      </svg>-->
    </div>

    <!-- <div v-if="!is_viewer_small" >{{ file.updated | prettyDate }}</div> -->
    <!-- <div class="column is-2" :class="[info_tab.active||is_viewer_small?'is-3':'is-2']">
      <type-tag :tags="file.tags" :addMore="false" :showEllipsis="false" :tagsToShow="2" />
    </div>-->
    <div
      class="column is-2"
      :class="[info_tab.active||is_viewer_small||compact_view?'is-4':'is-2']"
    >
      <div class="is-flex align-center is-center is-between">
        <type-tag
          :number_of_tags_to_display="info_tab.active||is_viewer_small||compact_view?5:3"
          :tags="item.tags"
          :resourceId="item.uid"
          :complete="update_tags"
        />
        <FileDropdown
          class="file-actions"
          @download="download(item)"
          @archive="archive(item)"
          @delete="delete_item(item)"
          @move="move($event)"
          @rename="
            is_edit = i;
            form.name = item.name || item.filename;
          "
          :file="item"
          @share="open_share_modal(item)"
        />
      </div>
    </div>
    </template>
  </div>
</template>

<script>
import prettyFileIcons from "pretty-file-icons";

import { mapMutations, mapState, mapGetters } from "vuex";
import { folderService, fileService } from "@/desktop/shared/services/";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import FileDropdown from "../components/file-dropdown";
import vaultMixin from "@/desktop/vault/shared/mixins/vault.mixin";
import AskPassword from "@/desktop/vault/components/ask-password-2";
import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
import FileMixin from "@/desktop/vault/mixin/file-mixin.vue";

export default {
  mixins: [
    vaultMixin, 
    FileMixin
  ],
  props: ["item", "i", "is_viewer_small"],
  components: {
    UserTag,
    PrimaryTag,
    TypeTag,
    FileDropdown,
    UserDropdown
  },
  data() {
    return {
      prettyFileIcons,
      selected_all: false,
      is_edit: -1,
      form: { name: "" },
      apiService: fileService // consumed by the mixin
    };
  },
  methods: {
    async update_tags (updates, list_of_assigned_tags) {
      await this.update_tags_for_item(updates, list_of_assigned_tags, this.item);
    }
  }
  // computed: {
  //   is_viewer_route() {
  //     return this.$route.name.includes("viewer");
  //   },
  //   ...mapState("vault", [
  //     "selected",
  //     "last_selected",
  //     "files",
  //     "info_tab",
  //     "compact_view"
  //   ]),
  //   selected: {
  //     get() {
  //       return this.$store.state.vault.selected_files;
  //     },
  //     set(value) {
  //       this.$store.commit("vault/SET_SELECTED_FILES", value);
  //     }
  //   }
  // }
};
</script>

<style lang="scss">
</style>