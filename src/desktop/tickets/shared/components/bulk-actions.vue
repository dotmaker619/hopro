<template>
  <div v-click-outside="() => ((save_template_popup = false), (tags = null))">
    <p class="bulk_action_bar" v-if="selected.length > 1">
      <span>
        <status-dropdown :show_names="false" @update-ticket-status="bulk_update_tickets({ status: parseInt($event.value) })"></status-dropdown>
      </span>
      <span>
        <priority-dropdown :bulk_action="true" @change_ticket_priority="bulk_update_tickets({ priority: parseInt($event) })"></priority-dropdown>
      </span>
      <span style="position:relative;right:0.6rem">
        <duedate-dropdown
          :bulk_selection="true"
          :icon="'due-date'"
          :icon_class="'is-22x22 is-paddingless'"
          @change-duedate="bulk_update_tickets({ dueDate: $event })"
        >
          ></duedate-dropdown
        >
      </span>
      <span>
        <user-dropdown
          :is_name_hidden="true"
          :pxsize="20"
          :icon="'assignee'"
          @update-user="bulk_update_tickets({ takenUp: $event })"
          :can_unassign="false"
        ></user-dropdown>
      </span>
      <span>
        <sh-icon
          @click.native="save_template_popup = !save_template_popup"
          :name="'load-from-template'"
          :file="'tickets-2'"
          class=" is-18x18 is-pointer"
          v-tooltip="{ content: `Load from template` }"
        ></sh-icon>
      </span>
      <span class="is-flex align-center">
        <type-tag
          :display_on_hover="false"
          :complete="
            (tag) => {
              bulk_update_tickets({ tags: { add: [tag] } });
            }
          "
        >
          <template #toggle-dropdown>
            <sh-icon :name="'tags'" :file="'tickets-2'" class="is-16x16 is-pointer" v-tooltip="'Add Tags'" />
          </template>
        </type-tag>
      </span>
      <span @click="bulk_update_tickets({ watch: true })">
        <sh-icon :name="'watch'" :file="'tickets-2'" class=" is-16x16 is-pointer" v-tooltip="{ content: 'Follow tickets' }" />
      </span>
      <!-- <span>
        <watchers-dropdown
          @update-bulk-watchers="bulk_update_tickets({ watchers: { add: $event } })"
          :ticket_watchers="[]"
          :is_bulk_action="true"
        ></watchers-dropdown>
      </span> -->
      <span @click="add_users">
        <sh-icon :name="'users'" :file="'tickets-2'" class=" is-18x18 is-pointer" v-tooltip="{ content: `Add users` }"></sh-icon>
      </span>
      <span @click="add_teams">
        <sh-icon :name="'teams'" :file="'tickets-2'" class=" is-18x18 is-pointer" v-tooltip="{ content: `Add teams` }"></sh-icon>
      </span>
      <span @click="bulk_update_tickets({ bookmark: true })">
        <sh-icon :name="'bookmark'" class=" is-16x16 is-pointer" v-tooltip="{ content: `Add bookmark` }"></sh-icon>
      </span>
      <span @click="toggle_multiple_archive">
        <sh-icon :name="'archive'" class=" is-20x20 is-pointer" v-tooltip="{ content: `Archive selected` }"></sh-icon>
      </span>
      <span @click="show_multi_delete = true">
        <sh-icon :name="'delete-ticket'" class=" is-20x20 is-pointer" v-tooltip="{ content: `Delete selected` }"></sh-icon>
      </span>
    </p>
    <div class="is-absolute has-background-white">
      <save-template :type="'load'" @close-load-template="save_template_popup = false" :tickets="selected" v-if="save_template_popup"></save-template>
    </div>
    <prompt-modal
      :name="'delete-multiple'"
      :heading="'Delete'"
      :iconPath="require('@/assets/icons/prompt/delete.svg')"
      :footer="true"
      :cancelString="'Cancel'"
      :confirmString="'Delete'"
      v-if="show_multi_delete"
      @cancel="show_multi_delete = false"
      @confirm="delete_tickets"
      @closed="show_multi_delete = false"
    >
      <div class="prompt-modal__content__text" slot="content">
        <p>Are you sure you want to delete multiple tickets?</p>
        <p>This action can not be undone</p>
      </div>
    </prompt-modal>
  </div>
</template>
<script>
  import DuedateDropdown from "@/desktop/tickets/shared/components/duedate-dropdown";
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
  import PriorityDropdown from "@/desktop/tickets/shared/components/priority-dropdown";
  import StatusDropdown from "@/desktop/tickets/shared/components/status-dropdown";
  import WatchersDropdown from "@/desktop/tickets/shared/components/bulk-watchers-dropdown";
  import SaveTemplate from "@/desktop/tickets/shared/components/save-template";
  import PromptModal from "@/desktop/shared/components/prompt-modal";
  import AddTeams from "@/desktop/shared/components/add-teams-modal";
  import AddUsers from "@/desktop/shared/components/add-users-modal";
  import { mapState, mapActions } from "vuex";
  import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";

  import { ticketService } from "@/desktop/shared/services/";
  export default {
    props: ["selected"],
    components: {
      DuedateDropdown,
      UserDropdown,
      PriorityDropdown,
      StatusDropdown,
      WatchersDropdown,
      PromptModal,
      SaveTemplate,
      TypeTag,
    },
    data() {
      return {
        show_multi_delete: false,
        save_template_popup: false,
        tags: null,
      };
    },
    computed: {
      ...mapState("tickets", ["selected"]),
    },
    methods: {
      ...mapActions("tickets", ["update_multiple_tickets", "remove_tickets", "select_ticket", "delete_multiple_tickets"]),
      async bulk_update_tickets(value) {
        this.update_multiple_tickets({
          tickets: this.selected,
          value: value,
        });
      },
      async toggle_multiple_archive() {
        if (this.show_archived) {
          this.bulk_update_tickets({ archive: false });
        } else {
          this.bulk_update_tickets({ archive: true });
        }
        this.remove_tickets(this.selected);
        this.select_ticket();
      },

      async delete_tickets() {
        this.delete_multiple_tickets(this.selected);
        this.show_multi_delete = false;
      },

      add_teams() {
        this.$modal.show(
          AddTeams,
          {
            teams: [],
            complete: async (e) => {
              this.bulk_update_tickets({ "labels": { "add": e } });
            },
          },
          { height: "80%" }
        );
      },
      add_users() {
        this.$emit("overlay_popup", true);
        this.$modal.show(
          AddUsers,
          {
            users: [],

            complete: async (e) => {
              this.bulk_update_tickets({ "users": { "add": e } });
            },
          },
          { height: "80%" },
          { name: "add-ticket-users" }
        );
      },
    },
  };
</script>

<style lang="scss">
  .bulk_action_bar {
    display: flex;
    align-items: center;
    background-color: $white;
    border: 1px solid #eee;
    border-radius: 0.5rem;
    position: relative;
    height: 4rem;
    width: auto;
    padding: 1rem;
    border-radius: 6px;
    box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.3);
    border: solid 1px $primary;
    justify-content: space-around;
    span {
      width: 3rem;
    }
  }
</style>
