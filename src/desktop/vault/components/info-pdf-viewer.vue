<template>
  <div class="details">
    <div class="details-col">
      <div>
        <div class="header">Created By</div>
        <user-dropdown
          class="is-medium-14-500-17"
          :existing_user="(file||folder).owner"
          :is_name_hidden="false"
          :hide_close="true"
          :pxsize="30"
          @update-user="update_owner($event)"
          v-if="(file||folder).owner"
        ></user-dropdown>
      </div>
    </div>
    <div class="details-col">
      <div>
        <div class="header">
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
          :tagsCountToShow="4"
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

    <!--  -->
    <div class="details-col">
      <div>
        <div class="header">
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
          style="margin-top:0;"
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
  </div>
</template>

<script>
import { fileService } from "@/desktop/shared/services/";
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
import vaultMixin from "@/desktop/vault/shared/mixins/vault.mixin";
import AskPassword from "@/desktop/vault/components/ask-password-2";
import UpdateTagsMixin from "@/desktop/vault/mixin/update-tags.mixin";

import { mapState } from "vuex";

export default {
  mixins: [vaultMixin, UpdateTagsMixin],
  props: ["folder", "item"],
  components: { UserTag, TypeTag, PrimaryTag, UserDropdown },
  data() {
    return {
      apiService: fileService,
    };
  },
  computed: {
    ...mapState("vault", ["vault_files"]),
    file() {
      return this.vault_files.find((d) => this.item.uid == d.uid);
    },
    details() {
      return this.file;
    },
  },
  methods: {
    async update_tags(updates, list_of_assigned_tags) {
      await this.update_tags_for_item(updates, list_of_assigned_tags, this.details);
    },
    async update_owner(user) {
      let action = async (password) => {
        let body = {
          owner: {
            uid: user.uid,
            email: user.email,
          },
        };
        this.$store.commit(
          `vault/${
            this.file ? "UPDATE_FILE_DETAILS" : "UPDATE_FOLDER_DETAILS"
          }`,
          {
            owner: user,
            uid: this.details.uid,
          }
        );
        let res = await (this.file ? fileService : folderService)
          .patch({
            id: this.details.uid,
            body: body,
            headers: this.get_password_header(password),
          })
          .catch((err) => {
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
          inputPassword: action,
        },

        {
          width: "400px",
          classes: ["has-background-transparent"],
          height: "auto",
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.details {
  padding: 5px 15px;
  &-col {
    margin-bottom: 10px;
  }
}
</style>

