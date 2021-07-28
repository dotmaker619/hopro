<template>
  <div>
    <p class="is-semiBold-24-600-106 mt-40 mb-30">Tickets</p>

    <div class="columns is-multiline">
      <div class="column is-half">
        <span class="ticket-detail-heading">Assignee</span>
        <user-assignee-dropdown
          :existing_user="ticket.takenUp"
          @update-user="add_ticket_assignee($event)"
          :pxsize="24"
          class="is-medium-16-500-19 is-paddingless is-relative"
          style="left:-1rem"
        />
      </div>
      <div class="column is-half">
        <span class="ticket-detail-heading mb-5">Followers</span>
        <watcher-dropdown :ticket_watchers="ticket.watchers" @update-watchers="add_ticket_watchers($event)"></watcher-dropdown>
      </div>

      <div class="column is-half">
        <span class="ticket-detail-heading mb-5">Users</span>

        <div class="is-flex is-vcenter" v-if="(ticket.readUsers && ticket.readUsers.length) || (ticket.writeUsers && ticket.writeUsers.length)">
          <user-tag
            :custom_class="'tiny-user-avatar '"
            :custom_size="24"
            :users="[...(ticket.readUsers || []), ...(ticket.writeUsers || [])]"
            :tagsCountToShow="5"
            :no_access="true"
            :is_precense_component="true"
            @handle_click="add_ticket_users"
          ></user-tag>
          <sh-icon
            :name="'add-users-teams'"
            class="is-22x22 ml-5 is-pointer add-user-takenUp"
            v-tooltip="{ content: `Add users to this ticket` }"
            @click.native="add_ticket_users"
          />
        </div>
        <div class="is-flex is-vcenter is-pointer" v-else @click="add_ticket_users">
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

        <div class="is-flex is-vcenter" v-if="(ticket.readLabels && ticket.readLabels.length) || (ticket.writeLabels && ticket.writeLabels.length)">
          <primary-tags
            :tags="get_teams(ticket)"
            @clicked_tag="add_ticket_teams"
            :toShowCount="3"
            :no_access="true"
            :type="'team'"
            :no_wrap="true"
            :truncate_length="10"
          />
          <sh-icon :name="'add-users-teams'" class="show-on-hover is-22x22 ml-5 is-pointer add-user-takenUp" @click.native="add_ticket_teams" />
        </div>
        <div class="is-flex is-vcenter is-pointer" @click="add_ticket_teams" v-else>
          <sh-icon :name="'add-teams'" class="mr-7 is-24x24" />
          <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black">Add Teams</span>
        </div>
      </div>
      <div class="column is-half">
        <span class="ticket-detail-heading">
          <span class="mr-5">Tags</span>
        </span>
        <tags-dropdown :complete="add_ticket_tags" :tags="ticket.tags || []" :display_on_hover="false" :resourceId="123" />
      </div>
    </div>
  </div>
</template>
<script>
  import UserAssigneeDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import AddTeams from "@/desktop/shared/components/add-teams-modal";
  import TagsDropdown from "@/desktop/shared/components/tags/type-tag/type-tag";
  import AddUsers from "@/desktop/shared/components/add-users-modal";
  import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
  import WatcherDropdown from "@/desktop/tickets/shared/components/watchers-dropdown";

  export default {
    props: ["config", "asset_id"],
    data() {
      return {
        ticket: {
          takenUp: null,
          tags: [],
          readUsers: [],
          writeUsers: [],
          readLabels: [],
          writeLabels: [],
          watchers: [],
        },
      };
    },
    components: {
      UserAssigneeDropdown,
      UserTag,
      AddTeams,
      TagsDropdown,
      AddUsers,
      PrimaryTags,
      WatcherDropdown,
    },

    created() {
      if (this.config) {
        this.ticket.takenUp = this.config.takenUp || null;
        this.ticket.tags = this.config.tags || [];
        this.ticket.readUsers = this.config.readUsers || [];
        this.ticket.writeUsers = this.config.writeUsers || [];
        this.ticket.readLabels = this.config.readLabels || [];
        this.ticket.writeLabels = this.config.writeLabels || [];
      }
    },
    methods: {
      add_ticket_assignee(user) {
        this.ticket.takenUp = _.pick(user, ["uid", "email"]);
        this.$emit("update", { "ticket": this.ticket });
      },
      add_ticket_tags(tag) {
        this.ticket.tags.push(tag);
        this.$emit("update", { "ticket": this.ticket });
      },
      add_ticket_watchers(watchers) {
        this.ticket.watchers = watchers;
        this.$emit("update", { "ticket": this.ticket });
      },
      add_ticket_teams() {
        this.$modal.show(
          AddTeams,
          {
            teams: [
              ...(this.ticket.readLabels || []).map((u) => ({
                uid: u,
                access: "read",
              })),
              ...(this.ticket.writeLabels || []).map((u) => ({
                uid: u,
                access: "write",
              })),
            ],
            asset_id: this.asset_id,
            complete: async (e) => {
              this.ticket.readLabels = e.filter((u) => u.access === "read").map((u) => u.uid);
              this.ticket.writeLabels = e.filter((u) => u.access === "write").map((u) => u.uid);
              this.$emit("update", { "ticket": this.ticket });
            },
          },
          { height: "80%" }
        );
      },
      add_ticket_users() {
        this.$modal.show(
          AddUsers,
          {
            users: [
              ...(this.ticket.readUsers || []).map((u) => ({
                ...u,
                access: "read",
              })),
              ...(this.ticket.writeUsers || []).map((u) => ({
                ...u,
                access: "write",
              })),
            ],
            complete: (e) => {
              this.ticket.readUsers = e.filter((u) => u.access === "read");
              this.ticket.writeUsers = e.filter((u) => u.access === "write");

              this.$emit("update", { "ticket": this.ticket });
            },
          },
          { height: "80%" },
          { name: "add-ticket-users" }
        );
      },
    },
  };
</script>
