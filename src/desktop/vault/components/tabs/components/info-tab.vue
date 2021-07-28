<template>
  <div class="vault-info-tab" v-if="details">
    <template v-if="folder">
      <div class="folder-icon-preview" style="width:auto;">
        <svg class="image ml-5 folder" viewBox="0 0 100 100">
          <use xlink:href="@/assets/icons/vault_sprite.svg#add-folder" />
        </svg>
      </div>
    </template>
    <template v-else-if="file">
      <div class="file-thumbnail is-relative" >
        <div @click="$eventHub.$emit('init-pdftron',file)" class="is-pointer thumbnail-overlay">
          <sh-icon  :class="'is-48x48 view-eye'" :file="'tickets_sprite'" :name="'attachment-eye'"></sh-icon>
        </div>
        <img class="file-thumbnail-icon"
          v-if="file.thumbnailLarge"
          style="width:260px;height:300px;object-fit: contain;"
          :src="file.thumbnailLarge"
        />
        <div v-else class="folder-icon-preview">
          <img
            class="file-type-icon-100"
            :src="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(file.fileName) + '.svg')"
          />
        </div>
      </div>
    </template>
    <div class="details">
      <template v-if="folder">
        <div
          class="name details-col"
          v-tooltip="folder.name.length > 15 ? mutableTag && mutableTag.name : null"
        >{{ folder.name | truncate(15) }}</div>
        <div class="props">
          <span class="size mr-10">{{ $prettysize(folder.fileSize) }}</span>
          |
          <span class="file-count ml-10">{{ folder.fileCount }} files</span>
        </div>
      </template>
      <template v-else-if="file">
        <div
          class="name details-col"
          v-tooltip="file.name.length > 15 ? file.name : null"
        >{{ file.name | truncate(15) }}</div>
        <div class="props">
          <span class="size mr-10">{{ $prettysize(file.fileSize) }}</span>
        </div>
      </template>
      <!--  -->
      <div class="details-col">
        <div>
          <div class="header">Created On</div>
          <div class="date-created">{{ details && details.created | prettyDate }}</div>
        </div>
        <div>
          <div class="header">Modified On</div>
          <div class="date-modify">{{ details && details.updated | prettyDate }}</div>
        </div>
      </div>
      <!--  -->
      <div class="details-col">
        <div>
          <div class="header mb-10">
            <span style="display:flex; align-items: center; justify-content: flex-start">
              Users
              <sh-icon
                :name="'add-plus'"
                class="is-22x22 ml-10 is-pointer"
                @click.native="add_users(details, file ? 'file' : 'folder')"
              ></sh-icon>
            </span>
          </div>
          <user-tag
            :custom_class="'tiny-user-avatar '"
            :custom_size="30"
            @clicked_user="add_users(details, file ? 'file' : 'folder')"
            :no_access="true"
            v-if="(details.readUsers && details.readUsers.length) || (details.writeUsers && details.writeUsers.length)"
            :users="[...(details.readUsers || []), ...(details.writeUsers || [])].map((user) => $store.getters.state_users[user.uid])"
            :howManyToShow="2"
          ></user-tag>
          <svg
            v-else
            @click="add_users(details, file ? 'file' : 'folder')"
            style="height: 3rem;width: 3rem;cursor:pointer"
            viewBox="0 0 100 100"
          >
            <use xlink:href="@/assets/icons/vault_sprite.svg#add-users" />
          </svg>
        </div>
      </div>
      <div class="details-col">
        <div>
          <div class="header mb-10">Created By</div>
          <user-dropdown
            class="is-medium-14-500-17 has-text-new-grey"
            :existing_user="(file||folder).owner"
            :is_name_hidden="false"
            :hide_close="true"
            :pxsize="30"
            @update-user="update_owner($event)"
            v-if="(file||folder).owner"
          ></user-dropdown>
        </div>
      </div>
      <!--  -->
      <div class="details-col">
        <div>
          <div class="header mb-10">
            <span style="display:flex; align-items: center; justify-content: flex-start">
              Teams
              <sh-icon
                :name="'add-plus'"
                class="is-22x22 ml-10 is-pointer"
                @click.native="add_teams(details, file ? 'file' : 'folder')"
              ></sh-icon>
            </span>
          </div>
          <primary-tag
            @clicked_tag="add_teams(details, file ? 'file' : 'folder')"
            :no_access="true"
            v-if="get_teams(details).length"
            :type="'team'"
            :tags="get_teams(details)"
            :toShowCount="2"
          />
          <svg
            v-else
            @click="add_teams(details, file ? 'file' : 'folder')"
            style="height: 3rem;width: 3rem;cursor:pointer"
            viewBox="0 0 100 100"
          >
            <use xlink:href="@/assets/icons/vault_sprite.svg#add-teams" />
          </svg>
        </div>
      </div>
      <div class="details-col">
        <div style="width: 100%">
          <div class="header">Tags</div>
          <type-tag
            :tags="details.tags"
            :resourceId="details.uid"
            :complete="update_tags"
          />
        </div>
      </div>
      <hierarchy
        class="mb-15"
        :stage="details.targetElement.stage"
        :element_id="details.targetElement.uid"
        @close="close_popup()"
      ></hierarchy>
      <div class="details-col">
        <a
          @click="download_files()"
          v-if="folder"
          class="button download-button is-info is-fullwidth"
          :class="{ 'is-disabled': !$store.getters.download_files_zip }"
        >
          <span class="icon">
            <svg class="image is-24x24" viewBox="0 0 100 100">
              <use xlink:href="@/assets/icons/vault_sprite.svg#download-white" />
            </svg>
          </span>
          <span>Download All</span>
        </a>
        <template v-else>
          <a @click="download()" class="button download-button is-info is-fullwidth">
            <span class="icon">
              <svg class="image is-24x24" viewBox="0 0 100 100">
                <use xlink:href="@/assets/icons/vault_sprite.svg#download-white" />
              </svg>
            </span>
            <span>Download</span>
          </a>

          <!-- x@click="download()"  -->
          <a
            @click="open_share_modal(file)"
            class="button download-button download-button--share ml-5 is-fullwidth"
          >
            <span class="icon">
              <svg class="image is-24x24" viewBox="0 0 100 100">
                <use xlink:href="@/assets/icons/vault_sprite.svg#share" />
              </svg>
            </span>
            <span>Share</span>
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {
  userService,
  teamService,
  fileService,
  folderService
} from "@/desktop/shared/services/";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";
import prettyFileIcons from "pretty-file-icons";
import InfoBlock from "@/desktop/shared/components/info-block";
import { mapState } from "vuex";
import hierarchy from "@/desktop/vault/components/hierarchy-section.vue";

import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
import AskPassword from "@/desktop/vault/components/ask-password-2";

import vaultMixin from "@/desktop/vault/shared/mixins/vault.mixin";
import UpdateTagsMixin from "@/desktop/vault/mixin/update-tags.mixin";
import ShareFile from "@/desktop/vault/components/share-file/share-file"
export default {
  mixins: [vaultMixin, UpdateTagsMixin],
  components: {
    PrimaryTag,
    UserTag,
    TypeTag,
    InfoBlock,
    hierarchy,
    UserDropdown
  },
  props: ["folder", "file"],
  data() {
    return {
      prettyFileIcons,
      folderService: folderService,
      fileService: fileService
    };
  },
  computed: {
    // consumed by the mixin
    apiService() {
      if (this.folder) return this.folderService;
      return this.fileService;
    },
    details() {
      return this.folder || this.file;
    }
  },
  methods: {
    open_share_modal(item) {
      this.$modal.show(
        ShareFile,
        {
          // folder: item,
          file: item
        },
        {
          width: "400px",
          classes: ["has-background-transparent"],
          height: "auto"
        }
      );
    },
    async update_tags (updates, list_of_assigned_tags) {
      await this.update_tags_for_item(updates, list_of_assigned_tags, this.details);
    },
    async update_owner(user) {
      let action = async password => {
        let body = {
          owner: {
            uid: user.uid,
            email: user.email
          }
        };
        this.$store.commit(
          `vault/${
            this.file ? "UPDATE_FILE_DETAILS" : "UPDATE_FOLDER_DETAILS"
          }`,
          {
            owner: user,
            uid: this.details.uid
          }
        );
        let res = await (this.file ? fileService : folderService)
          .patch({
            id: this.details.uid,
            body: body,
            headers: this.get_password_header(password)
          })
          .catch(err => {
            this.handleErrors(err);
          });
      };
      if (!this.details.passwordProtected) {
        action("");
        return;
      }

      this.$modal.show(
        AskPassword,
        {
          inputPassword: action
        },

        {
          width: "400px",
          classes: ["has-background-transparent"],
          height: "auto"
        }
      );
    },

    download_files() {
      this.$eventHub.$emit("download_zip", {
        folder: this.folder,
        type: "vault"
      });
    },
    download() {
      fileService
        .get_file_download_url({
          id: this.file.uid,
          headers: this.get_password_header(this.file.rootFolder)
        })
        .then(res => {
          window.open(res.data, "_blank");
        });
    }
  }
};
</script>

<style lang="scss">
.vault-info-tab {
  .team-details__body__info {
    margin-top: 0;
    .info-block__image__container__picture {
      height: 3.8rem;
      width: 3.8rem;
    }
  }

  flex: 0 0 300px;
  padding: 2rem;
  .file-thumbnail {
    img {border-radius:4px;}
    &:hover .thumbnail-overlay {
      opacity:0.5;
    }
    .thumbnail-overlay {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100%;
      width: 100%;
      opacity: 0;
      z-index:5;
      transition: .1s ease;
      background: rgba(23, 30, 72, 1);
      border-radius: 4px;
    }
    &-icon{
      width:257px;
      height:257px;
    }
    .view-eye  {
      z-index:10;
      color: white;
      font-size: 100px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      -ms-transform: translate(-50%, -50%);
      text-align: center;
    }
  }
  .folder-icon-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 257px;
    height: 257px;
    object-fit: contain;
    border-radius: 4px;
    background-color: #f5f7fc;
    .image {
      width: 100px;
      height: 100px;
    }
  }
  .date-modify,
  .date-created {
    margin-top: 0.75rem;
    font-family: Barlow;
    font-size: 14px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.21;
    letter-spacing: normal;
    text-align: left;
    color: #171e48;
  }
  .details {
    margin-top: 1.5rem;
    .details-col {
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
    }
    .name {
      margin-bottom: 11px;
      font-family: Barlow;
      font-size: 18px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.22;
      letter-spacing: normal;
      text-align: left;
      color: #171e48;
    }
    .props {
      opacity: 0.6;
      font-family: Barlow;
      font-size: 14px;
      font-weight: 500;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: left;
      color: #171e48;
      margin-bottom: 30px;
    }
    .header {
      font-family: Barlow;
      font-size: 12px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.17;
      letter-spacing: normal;
      text-align: left;
      color: #585e7d;
    }
    .download-button {
      height: 40px;
      border-radius: 6px;
      box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
      border: solid 1px $primary;
      background-color: $primary;
      font-family: Barlow;
      font-size: 14px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: left;
      color: #ffffff;
      &--share {
        background-color: #ffffff;
        color: $primary;
      }
    }
  }
}
</style>