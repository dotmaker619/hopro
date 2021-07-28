<template>
  <!-- <b-modal :active.sync="active" :width="450"> -->
    <div class="card share-file-card" v-if="file">
      <div class="card-header">
        <p class="card-header-title" >
          <img
            :src="require('@/assets/file-type-icons/'+prettyFileIcons.getIcon(file.filename)+'.svg')"
            style="width:20px;margin-right:1rem"
          />
          <span v-tooltip="file.name" class="is-medium-14-500-17">

          {{file.name | truncate(20)}}
          </span>
        </p>
      </div>
      <div class="card-content">
        <!-- select users -->
        <div class="content-header">
          <svg viewBox="0 0 100 100" class="image" style="width:100px;height:100px">
            <use xlink:href="@/assets/icons/vault_sprite.svg#share-100px" />
          </svg>
          <p class="content-header-title">Share File</p>
        </div>
        <div class>
          <p class="is-flex is-medium-14-500-17">
            Users
            <!-- <AddUsers :ticket_watchers="form.users" @update_users="form.users=[...$event]" /> -->
            <watcher-dropdown
              :hide_watchers="true"
              :user_count="5"
              :ticket_watchers="form.users"
              @update-watchers="form.users = $event"
              :custom_icon="'add-users-teams'"
            ></watcher-dropdown>
          </p>
              <!-- :custom_icon="'add-users-teams'" -->
              <user-tag v-if="form.users"
                class="users mt-5"
                :users="form.users"
                :tagsCountToShow="10"
                :is_precense_component="false"
                :custom_class="'tiny-user-avatar'"
                :custom_size="30"
              ></user-tag>
          <!-- <UserTag v-if="form.users" :users="form.users" :toShowCount="10" /> -->
        </div>
        <div class="mt-20">
          <p class="is-flex is-medium-14-500-17">
            Teams
            <teams-dropdown :ticket_watchers="form.labels" @update-watchers="form.labels=[...$event]" />
          </p>
           <primary-tag
            v-if="form.labels"
            :type="'team'"
            :tags="form.labels"
            :toShowCount="10"
          />
          <!-- <span class="is-flex align-center" @click.stop.prevent>
            <primary-tag
              @clicked_tag="add_teams({})"
              :no_access="true"
              v-if="form.labels.length"
              :toShowCount="1"
              :type="'team'"
              :tags="form.labels"
            ></primary-tag>
            <sh-icon
              v-else
              class="is-pointer is-30x30"
              @click.native="add_teams({})"
              :file="'vault_sprite'"
              :name="'add-teams'"
            ></sh-icon>
          </span> -->
        </div>
        <div class="mt-20 duration">
          <p class="is-medium-14-500-17">Duration</p>
          <!-- <b-select expanded placeholder="Select Time" v-model="form.expires"> -->
          <a
            @click="form.expires=option.id"
            class="tag is-large mr-10"
            v-for="option in duration_options"
            :value="option.id"
            :class="{'active':option.id==form.expires}"
            :key="option.id"
          >{{ option.label }}</a>
          <!-- </b-select> -->
        </div>
        <div v-if="share_link" class="mt-20 share-link">
          <p class="is-medium-14-500-17">share url</p>
          <div v-if="share_link" class="tags">
            <div
              style="display: flex;
                          justify-content: center;
                          align-items: center;"
            >
              <svg viewBox="0 0 100 100" class="image" style="width:20px;height:20px">
                <use xlink:href="@/assets/icons/vault_sprite.svg#globe-share-url" />
              </svg>
              <span class="tag"  v-tooltip="share_link.length > 100 ? share_link :null">{{share_link | truncate(100) }}</span>
            </div>
            <b-tooltip :label="title" :delay="1000" type="is-dark">
              <span class style="cursor:pointer" @click="copy_share_url">
                <img src="@/assets/icons/duplicate-blue.svg" style="width:20px;height:16px" />
              </span>
            </b-tooltip>
          </div>
        </div>
        <div v-if="is_error" class="has-text-danger has-text-centered">Please select a user/team.</div>
        <div class="generate-button">
          <a
            class="button is-info is-large"
            :class="{'is-loading':is_loading}"
            @click="generate_share_url"
          >Generate share Link</a>
        </div>
      </div>
    </div>
  <!-- </b-modal> -->
</template>

<script>
import {
  userService,
  teamService,
  fileService
} from "@/desktop/shared/services/";
// import UserAvatar from "@/components/shared/components/user-avatar.component";
import Treeselect from "@riophae/vue-treeselect";
import TeamsDropdown from "./components/teams-dropdown";
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import prettyFileIcons from "pretty-file-icons";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import WatcherDropdown from "@/desktop/tickets/shared/components/watchers-dropdown";

export default {
  components: {
    Treeselect,
    UserTag,
    TeamsDropdown,
    PrimaryTag,
    WatcherDropdown
  },
  props: ["file","folder"],
  data() {
    return {
      prettyFileIcons,
      is_loading: false,
      is_error: false,
      active: false,
      title: "Copy to clipboard",
      share_link: "",
      duration_options: [
        { id: 3600, label: "1 Hour" },
        { id: 3600 * 6, label: "6 Hours" },
        { id: 3600 * 24, label: "1 Day" },
        { id: 3600 * 24 * 7, label: "1 Week" }
      ],
      form: {
        users: [],
        labels: [],
        expires: 3600
      },
      userService: userService,
      teamService: teamService,
      fileService: fileService
    };
  },
  created() {
    
      this.active = true;
      this.form.users = [];
      this.form.labels = [];
      this.title = "Copy to clipboard";
      this.is_loading = false;
      this.is_error = false;
      this.share_link = "";
    
  },
  beforeDestroy() {
  },
  methods: {
    generate_share_url() {
      this.is_loading = true;
      this.is_error = false;

      if (!this.form.users.length && !this.form.labels.length) {
        this.is_error = true;
        this.is_loading = false;
        return;
      }

      // let action = value => {
      this.fileService
        .get_share_uid({
          body: this.form,
          id: this.file.uid,
          headers: this.get_password_header(this.file.rootFolder)
        })
        .then(res => {
          this.is_loading = false;
          this.share_link = `${window.location.origin}/vault/share/${res.data.uid}/download`;
        })
        .catch(err => {
          this.is_loading = false;
          this.handleErrors(err);
        });
      // };

      // if (
      //   this.file.passwordProtected ||
      //   (this.file.folder && this.folder.passwordProtected)
      // ) {
      //   this.$buefy.dialog.prompt({
      //     message: `Create Password`,
      //     inputAttrs: {
      //       type: "password",
      //       placeholder: "Type Password",
      //       value: "",
      //       min: 5,
      //       required: true
      //     },
      //     confirmText: "Lock",
      //     onConfirm: action
      //   });
      // } else {
      //   action("");
      // }
    },
    copy_share_url() {
      this.$copyText(this.share_link).then(res => {
        this.title = "Copied";
      });
    }
  }
};
</script>

<style lang="scss">
.share-file-card {
  .duration .tag {
    border-radius: 4px;
    font-family: Barlow;
    font-size: 16px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.19;
    letter-spacing: normal;
    text-align: left;
    color: #171e48;
    &.active {
      color: white;
      background-color: #737891;
    }
  }
  .share-link {
    .tags {
      display: flex;
      align-items: center;
      justify-content: space-around;
      border-radius: 6px;
      box-shadow: 0 1px 0 0 rgba(23, 30, 72, 0.1);
      background-color: #eaefff;
      padding: 7px;
    }
    .tag {
      margin-bottom: 0;
      background-color: #eaefff;
    }
  }
  .generate-button {
    margin-top: 4rem;
    margin-bottom: 2rem;
    display: flex;
    justify-content: flex-end;
  }
  .card-header {
    padding-left: 2rem;
    img {
      border-radius: 4px;
      width: 40px;
      height: 40px;
    }
  }
  .card-content {
    padding: 2rem 6rem;
  }
  .content-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    &-title {
      margin-top: 1rem;
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
  }
  .vuetree-label {
    font-size: 11.5rem;
    display: flex;
  }
  .vue-treeselect__menu {
    line-height: 100% !important;
  }
  .ebs-contact-block {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    &--value {
      padding: 0 0;
    }
    .contact-meta {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
}
</style>

