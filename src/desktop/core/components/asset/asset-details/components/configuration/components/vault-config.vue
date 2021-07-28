<template>
  <div>
    <p class="is-semiBold-24-600-106 mt-40 mb-30">Vault</p>

    <div class="columns is-multiline">
      <!-- <div class="column is-half">
        <span class="ticket-detail-heading">Owner</span>
        <user-assignee-dropdown
          :existing_user="vault.owner"
          @update-user="add_vault_owner($event)"
          :pxsize="24"
          class="is-medium-16-500-19 is-paddingless is-relative"
          style="left:-1rem"
        />
      </div> -->

      <div class="column is-half">
        <span class="ticket-detail-heading mb-5">Users</span>

        <div class="is-flex is-vcenter" v-if="(vault.readUsers && vault.readUsers.length) || (vault.writeUsers && vault.writeUsers.length)">
          <user-tag
            :custom_class="'tiny-user-avatar '"
            :custom_size="24"
            :users="[...(vault.readUsers || []), ...(vault.writeUsers || [])]"
            :tagsCountToShow="5"
            :no_access="true"
            :is_precense_component="true"
            @handle_click="add_vault_users"
          ></user-tag>
          <sh-icon
            :name="'add-users-teams'"
            class="is-22x22 ml-5 is-pointer add-user-takenUp"
            v-tooltip="{ content: `Add users to this ticket` }"
            @click.native="add_vault_users"
          />
        </div>
        <div class="is-flex is-vcenter is-pointer" v-else @click="add_vault_users">
          <sh-icon :name="'add-users-2'" class="mr-7 is-24x24" />
          <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black">Add Users</span>
        </div>
      </div>

      <div class="column is-half ">
        <span class="ticket-detail-heading">
          <span class="mr-5">Teams</span>
          <sh-icon
            :name="'ticket-details-info'"
            class="is-14x14 is-question"
            v-tooltip="{ content: 'All members of the parent teams will also be given the same level of access' }"
          />
        </span>

        <div class="is-flex is-vcenter" v-if="(vault.readLabels && vault.readLabels.length) || (vault.writeLabels && vault.writeLabels.length)">
          <primary-tags
            :tags="get_teams(vault)"
            @clicked_tag="add_vault_teams"
            :toShowCount="3"
            :no_access="true"
            :type="'team'"
            :no_wrap="true"
            :truncate_length="10"
          />
          <sh-icon :name="'add-users-teams'" class="show-on-hover is-22x22 ml-5 is-pointer add-user-takenUp" @click.native="add_vault_teams" />
        </div>
        <div class="is-flex is-vcenter is-pointer" @click="add_vault_teams" v-else>
          <sh-icon :name="'add-teams'" class="mr-7 is-24x24" />
          <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black">Add Teams</span>
        </div>
      </div>
      <div class="column is-half mb-10">
        <span class="ticket-detail-heading">
          <span class="mr-5">Tags</span>
        </span>
        <tags-dropdown :complete="add_vault_tags" :tags="vault.tags || []" :display_on_hover="false" :resourceId="123" />
      </div>
    </div>
  </div>
</template>
<script>
  // import UserAssigneeDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import AddTeams from "@/desktop/shared/components/add-teams-modal";
  import TagsDropdown from "@/desktop/shared/components/tags/type-tag/type-tag";
  import AddUsers from "@/desktop/shared/components/add-users-modal";
  import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
  export default {
    props: ["config", "asset_id"],
    data() {
      return {
        vault: {
          // owner: null,
          tags: [],
          readUsers: [],
          writeUsers: [],
          readLabels: [],
          writeLabels: [],
        },
      };
    },
    components: {
      // UserAssigneeDropdown,
      UserTag,
      AddTeams,
      TagsDropdown,
      AddUsers,
      PrimaryTags,
    },

    created() {
      if (this.config) {
        // this.vault.owner = this.config.owner || null;
        this.vault.tags = this.config.tags || [];
        this.vault.readUsers = this.config.readUsers || [];
        this.vault.writeUsers = this.config.writeUsers || [];
        this.vault.readLabels = this.config.readLabels || [];
        this.vault.writeLabels = this.config.writeLabels || [];
      }
    },
    methods: {
      // add_vault_owner(user) {
      //   this.vault.owner = _.pick(user, ["uid"]);
      //   this.$emit("update", { "vault": this.vault });
      // },
      add_vault_tags(tag) {
        this.vault.tags.push(tag);
        this.$emit("update", { "vault": this.vault });
      },
      add_vault_teams() {
        this.$modal.show(
          AddTeams,
          {
            teams: [
              ...(this.vault.readLabels || []).map((u) => ({
                uid: u,
                access: "read",
              })),
              ...(this.vault.writeLabels || []).map((u) => ({
                uid: u,
                access: "write",
              })),
            ],
            asset_id: this.asset_id,
            complete: async (e) => {
              this.vault.readLabels = e.filter((u) => u.access === "read").map((u) => u.uid);
              this.vault.writeLabels = e.filter((u) => u.access === "write").map((u) => u.uid);
              this.$emit("update", { "vault": this.vault });
            },
          },
          { height: "80%" }
        );
      },
      add_vault_users() {
        this.$modal.show(
          AddUsers,
          {
            users: [
              ...(this.vault.readUsers || []).map((u) => ({
                ...u,
                access: "read",
              })),
              ...(this.vault.writeUsers || []).map((u) => ({
                ...u,
                access: "write",
              })),
            ],
            complete: (e) => {
              this.vault.readUsers = e.filter((u) => u.access === "read");
              this.vault.writeUsers = e.filter((u) => u.access === "write");

              this.$emit("update", { "vault": this.vault });
            },
          },
          { height: "80%" },
          { name: "add-vault-users" }
        );
      },
    },
  };
</script>
