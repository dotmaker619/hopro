<template>
  <div class="ticket-list-item" v-if="ticket" @contextmenu="openContextMenu" :class="[selected.includes(ticket.uid) ? 'is-highlighted' : null]">
    <div class="ticket-list" @mouseenter="hover = true" @mouseleave="reset_state" v-click-outside="clicked_outside">
      <div class="columns is-gapless">
        <div class="column is-1 is-flex is-between">
          <div class="field" style="min-width:25px" @click="has_write_access ? $store.dispatch('tickets/select_ticket', ticket.uid) : null">
            <input
              :class="[!has_write_access || (!hover && !selected.includes(ticket.uid)) ? 'is-hidden' : null]"
              :disabled="!has_write_access"
              type="checkbox"
              name="checkbox"
              class="sh-custom-checkbox is-thinner"
              :id="ticket.uid"
              :checked="selected.includes(ticket.uid)"
            />
          </div>
          <div
            class="is-pointer"
            v-tooltip="{ content: `Bookmark` }"
            @click="update_ticket({ bookmark: !ticket.bookmark })"
            :class="{ 'is-invisible': !hover && !ticket.bookmark }"
          >
            <sh-icon :name="ticket.bookmark ? 'bookmarked-highlight' : 'bookmark'" class="is-18x18" />
          </div>
          <status-dropdown
            style="position:relative;top:-4px;height:3rem"
            v-tooltip="{
              content: ticket && !ticket.writeAccess ? status_values[ticket.status] : null,
            }"
            :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
            :current_status="ticket.status"
            :ticket="ticket"
            class=" mr-5"
            :show_names="false"
            v-if="ticket"
            @update-ticket-status="update_ticket({ status: parseInt($event.value) })"
          ></status-dropdown>
        </div>
        <div class="column is-3">
          <div class="name-block-details">
            <div class="is-medium-16-500-19 no-whitespace-wrap is-flex is-vcenter is-relative">
              <p class="is-pointer has-text-dark mb-5" :style="[is_viewer_small ? { width: '15rem' } : { width: '25rem' }]">
                <span
                  class="ticket-name-text"
                  @click="show_details(ticket.uid)"
                  v-tooltip="ticket.name && ticket.name.length > 30 ? ticket.name : null"
                  v-if="edit_ticket_name == -1"
                  >{{ ticket.name | truncate(30) }}</span
                >

                <input
                  v-else-if="edit_ticket_name == ticket.uid"
                  type="text"
                  name="name"
                  id="ticket"
                  class="input is-inline-input is-medium-16-500-19 ticket-input"
                  :placeholder="ticket.name"
                  v-focus
                  v-model="ticket.name"
                  @keyup.esc="edit_ticket_name = -1"
                  @keyup.enter="update_ticket_name"
                />
              </p>
              <sh-icon
                :name="[edit_ticket_name == ticket.uid ? 'tick-set-complete' : 'pen']"
                :class="{ 'is-hidden': !hover || !has_write_access }"
                class="is-absolute is-16x16 is-inline is-pointer"
                style="right:0"
                @click.native="edit_ticket_name == ticket.uid ? update_ticket_name() : (edit_ticket_name = ticket.uid)"
              ></sh-icon>
            </div>
            <tags-dropdown
              :service="ticketService"
              :tags="ticket.tags"
              :resourceId="ticket.uid"
              :number_of_tags_to_display="2"
              :write_access="has_write_access"
              :display_on_hover="!hover"
              :complete="update_ticket"
            />
          </div>
        </div>
        <div class="column is-6 is-flex align-center is-between">
          <div class="ml-10">
            <user-dropdown
              class="is-medium-14-500-17 has-text-new-grey"
              :existing_user="ticket.takenUp"
              :pxsize="30"
              @update-user="update_ticket({ takenUp: $event })"
              v-if="ticket"
              :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
            ></user-dropdown>
          </div>
          <div class="is-flex align-center" style="min-width:16rem">
            <duedate-dropdown
              :class="[!has_write_access ? 'has-no-access' : null]"
              class="is-medium-14-500-17 has-text-new-grey"
              :ticket="ticket"
              :due="ticket.dueDate || null"
              v-if="ticket && ticket.uid"
              @change-duedate="
                update_ticket({
                  dueDate: $event ? $event : null,
                })
              "
            ></duedate-dropdown>
            <p v-if="ticket.isRecurring" class="is-flex is-center" v-tooltip="{ content: rrule_string }">
              <sh-icon :name="'recurrence-recurs'" class="is-18x18 is-pointer" />
            </p>
          </div>
          <div class="mr-50">
            <priority-dropdown
              :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
              class="is-medium-14-500-17 has-text-new-grey"
              :priority="ticket.priority"
              :ticket="ticket"
              @change_ticket_priority="update_ticket({ priority: parseInt($event) })"
            ></priority-dropdown>
          </div>
        </div>
        <div class="column is-2 is-flex align-center is-between">
          <div class="ticket-progress-bar">
            <div
              class="status-progress"
              :class="{ 'is-pointer': total_items > 0 }"
              v-tooltip="{
                content: total_items > 0 ? `Taks: ${checked_items} / ${total_items}` : null,
              }"
            >
              <div class="status-progress--bar" :style="`width:${items_progress}%`"></div>
            </div>
            <div class="ml-10 is-medium-14-500-17 has-text-new-grey">{{ items_progress }}%</div>
          </div>
          <div v-if="ticket && has_write_access">
            <actions-dropdown
              :ticket="ticket"
              :hover="hover"
              @keep_active="keep_active = true"
              @close_dropdown="keep_active = false"
              :is_list="true"
            ></actions-dropdown>
          </div>
        </div>
      </div>
    </div>
    <ul id="right-click-menu" style="position:sticky;z-index:1000">
      <!-- <context-dropdown :ticket="ticket" ref="ticket-list-dropdown"></context-dropdown> -->
      <!-- class="position:absolute" -->
      <actions-dropdown
        style="position:absolute;top:-30px;"
        :style="{ left: context_right }"
        :ticket="ticket"
        ref="ticket-list-dropdown"
        :is_list="true"
        :is_context="true"
      ></actions-dropdown>
    </ul>

    <delete-modal
      v-if="showDeleteModal"
      :resourceId="ticket.uid"
      :resourceName="ticket.name"
      :resourceType="'ticket'"
      :resourceService="ticketService"
      @closed="showDeleteModal = false"
      @deleted="delete_ticket(ticket.uid)"
    />
  </div>
</template>

<script>
  import tagsDropdown from "@/desktop/shared/components/tags/type-tag/type-tag";
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
  import DuedateDropdown from "@/desktop/tickets/shared/components/duedate-dropdown";
  import PriorityDropdown from "@/desktop/tickets/shared/components/priority-dropdown";
  import StatusDropdown from "@/desktop/tickets/shared/components/status-dropdown";
  import ActionsDropdown from "@/desktop/tickets/shared/components/actions-dropdown";
  import { ticketService } from "@/desktop/shared/services/";
  import { RRule } from "rrule";
  import { mapState } from "vuex";
  import TicketDetails from "@/desktop/tickets/components/ticket-details/ticket-details";
  import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";

  export default {
    mixins: [TicketDetailsMixin],

    props: ["ticket", "selected_tickets", "is_grouped", "is_viewer_small"],
    data() {
      return {
        hover: false,
        keep_active: false,
        context_right: 0,
        context_top: 0,
        ticketService: ticketService,
        edit_ticket_name: -1,
        status_border_classes: {
          "1": "has-border-yellow",
          "2": "has-border-green",
          "3": "has-border-blue",
          "4": "has-border-light-grey",
          "5": "has-border-red",
        },
        status_values: {
          1: "pending",
          2: "in progress",
          3: "resolved",
          4: "closed",
          5: "rejected",
        },
      };
    },

    computed: {
      ...mapState("tickets", ["selected"]),

      checked_items() {
        return this.ticket.checklistsStats ? this.ticket.checklistsStats.checkedItems : 0;
      },
      total_items() {
        return this.ticket.checklistsStats ? this.ticket.checklistsStats.totalItems : 0;
      },
      items_progress() {
        return Math.round((this.checked_items / this.total_items) * 100) || 0;
      },
      rrule_string() {
        if (this.ticket.schedule && this.ticket.schedule.rrule) {
          return new RRule.fromString(this.ticket.schedule.rrule).toText();
        }
      },
      has_write_access() {
        return this.ticket.writeAccess;
      },
    },

    components: {
      tagsDropdown,
      UserDropdown,
      PriorityDropdown,
      DuedateDropdown,
      StatusDropdown,
      ActionsDropdown,
      TicketDetails,
    },
    methods: {
      show_details(uid) {
        this.open_ticket_details(uid);
        this.append_recently_accessed_resource("tickets", uid);
      },
      delete_ticket(uid) {
        this.$store.dispatch("tickets/remove_tickets", uid);
      },

      reset_state() {
        this.keep_active ? (this.hover = true) : (this.hover = false);
      },
      clicked_outside() {
        this.hover = false;
        this.edit_ticket_name != -1 ? (this.edit_ticket_name = -1) : null;
      },
      openContextMenu(e) {
        e.preventDefault();

        if (this.has_write_access) {
          if (this.$route.name == "therm-viewer" || this.$route.name == "terra-viewer") {
            if (this.is_viewer_small) {
              this.context_right = e.screenX - 125 + "px";
            } else {
              this.context_right = e.screenX + 185 + "px";
            }
          } else {
            this.context_right = e.screenX - 20 + "px";
          }
          this.context_top = e.screenY + 30 + "px";
          this.$eventHub.$emit("open_context_menu", this.ticket.uid);
        }
      },

      update_ticket(value) {
        this.$store.dispatch("tickets/update_ticket_value", {
          id: this.ticket.uid,
          value: value,
        });
      },

      async update_ticket_name() {
        this.update_ticket({ name: this.ticket.name });
        this.edit_ticket_name = -1;
      },
    },
  };
</script>

<style lang="scss">
  .status-pointer {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 0.2rem;
  }

  .status-progress {
    width: 100%;
    height: 0.4rem;
    display: flex;
    flex-wrap: nowrap;
    border-radius: 1rem;
    background: transparentize($progress-bar, 0.9);

    &--bar {
      height: 0.4rem;
      margin: 0 1px;
      border-radius: 1rem;
      // width: 35%;
      background-color: $progress-bar;
    }
  }

  .ticket-list-item {
    .ticket-list {
      background: white;
      border-bottom: 1px solid #eee;

      padding: 1.4rem 1.2rem;
      // height: 8rem;
      &:hover {
        background-color: #f5f9fd;
        border-bottom: 1px solid #d2e6f6;
      }
      @include for-size("tablet") {
        padding: 2rem 0.5rem;
      }
      &-selection {
        display: flex;
        justify-content: space-between;
        width: 9rem;
        align-items: flex-start;
        padding-right: 0;
        position: relative;
        top: -6px;
        .field {
          width: 2rem;
          height: 2rem;
        }
        // .status-selector {
        //   position: relative;
        //   top: -5px;
        // }
      }
    }
  }
  .ticket-progress-bar {
    display: flex;
    align-items: center;
    width: 75%;
  }

  .input {
    &.is-inline-input {
      width: 30rem;
      border: none;
      box-shadow: none;
      padding: 0;
      height: 1.8rem;
      background-color: transparent;
    }
    :focus,
    :active {
      border: none;
      outline: transparent auto 0px !important;
    }
  }

  .ticket-name-text {
    position: relative;
    top: -1px;
  }

  .ticket-input {
    background-image: linear-gradient(to right, #aba9a9 56%, rgba(255, 255, 255, 0) 0%);
    background-position: bottom;
    background-size: 9px 2px;
    background-repeat: repeat-x;
  }
  .sh-dropdown {
    position: relative;
    &-selection {
      cursor: pointer;
    }
    &-content {
      background: $white;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      width: max-content;
      padding: 2rem 0rem;
      position: absolute;
      right: -60%;
      box-shadow: 1px 1px 6px 2px #eee;
      top: 5rem;
      z-index: 10;
      width: 18rem;
      font-family: Barlow-Medium;
      &.is-assignee {
        width: 28rem;
        right: auto;
        left: -180%;
        z-index: 1000;
        &.is-top {
          top: -42rem;
          left: 0;
        }
      }
      &.is_details {
        right: 0;
        width: 28rem;
        z-index: 1000;
      }
      &.is-bulk {
        left: -60%;
        width: 28rem;
        right: 0;
        top: 4rem;
      }
      &.is-status {
        left: 0;
        top: 3rem;
        width: 22rem;
        &.is-details {
          top: 5rem;
        }
      }
      &.is-action {
        width: 25rem;
      }
      &.is-activities {
        width: 46.5rem;
        height: 40rem;
        overflow: hidden;
        right: -300%;
        border-radius: 1rem;
      }
      &.priority_in_bulk {
        left: -2rem;
        right: auto;
        top: 4.5rem;
      }
      &.create_new_assignee {
        left: -22%;
        width: 28rem;
        &.is-top {
          top: -39rem;
        }
      }
      &.assignee_in_detail {
        right: -7rem;
        width: 28rem;
      }
      &.priority_in_details {
        right: -15%;
        top: 3rem;
      }
      &.is_priority {
        left: auto;
        right: -2rem;
        top: 3rem;
      }

      &.is_priority_details {
        left: auto;
        right: 2rem;
        top: 3rem;
      }

      &:hover {
        background-color: $white;
      }
      .input {
        border: none;
        box-shadow: none;
        border-bottom: 1px solid #eee;
        border-radius: 0px;
        &:focus {
          border: none;
          box-shadow: none;
          border-bottom: 1px solid #eee;
          border-radius: 0px;
        }
      }

      .pointer {
        background-color: $white;
        height: 1rem;
        width: 1rem;
        border-top: 1px solid #aaa;
        border-right: 1px solid #aaa;
        transform: rotate(-45deg);
        position: absolute;
        top: -0.5rem;
        left: 65%;
        &.is-assignee {
          left: 59%;
        }
        &.is-status {
          left: 3rem;
        }
        &.is-bulk {
          left: 10%;
        }
        &.is-center {
          left: 50%;
        }
        &.in-list-page {
          left: 20%;
        }
      }
      &__item {
        padding: 1rem 2rem;
        display: flex;
        align-items: center;
        background-color: $white;
        &--icon {
          margin-right: 1rem;
          max-height: 4rem;
          max-width: 4rem;
        }
        &--text {
          &.is-footer {
            color: $primary;
          }
          &:first-letter {
            text-transform: uppercase;
          }
        }
        &:hover {
          background-color: $primary-background;
          cursor: pointer;
        }
        &.is-footer {
          border-top: 1px solid #ddd;
        }
        &.is-not-allowed {
          cursor: not-allowed;
        }
      }
    }
  }
  .dueDate {
    // &-tag {
    //   background-color: #e7e8ec;
    //   border-radius: 0.5rem;
    //   width: max-content;
    //   padding: 0.5rem 1rem;
    //   font-size: 1.4rem;
    //   font-weight: 600;
    //   margin: 3px;
    //   height: 3.4rem;
    //   color: #777;
    //   // width: 13rem;
    //   cursor: pointer;
    //   display: flex;
    //   align-items: center;
    //   &.is-danger {
    //     color: $rejected-status;
    //     background: #f8585924;
    //   }
    //   &--delete {
    //     position: absolute;
    //     right: 0px;
    //     height: 3rem;
    //     width: 2rem;
    //     display: flex;
    //     justify-content: center;
    //     align-items: center;
    //     border-top-right-radius: 5px;
    //     border-bottom-right-radius: 5px;
    //     &.is-grey {
    //       background: #999999;
    //       opacity: 0.8;
    //       color: #fff;
    //     }
    //     &.is-red {
    //       background: #ff3722;
    //       color: #e7e8ec;
    //     }
    //   }
    // }
    &-calendar {
      position: absolute;
      z-index: 1000;
      @include for-size("tablet") {
        position: fixed;
      }
    }
  }

  // .status-ticket-border {
  //   border-radius: 0.5rem;
  //   margin-bottom: 0.5rem;
  //   border-left-width: 5px;
  //   border-left-style: solid;
  //   padding: 1rem 1rem 0rem 2rem;

  //   &:hover {
  //     box-shadow: 2px 2px 4px 0px #eee;
  //   }
  // }
  .ticket-details-popup {
    padding: 4rem 0;

    .animation-content {
      background: white;
      z-index: 100;
      overflow: auto;
      border-radius: 1rem;
      &::-webkit-scrollbar {
        width: 0.3rem !important;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 1rem !important;
        background: #d1d1d1 !important;
      }

      .modal-close {
        display: none;
      }
      @include for-size("smartphones") {
        // position: absolute;
        // top: 0;
        // left: 0;
      }
    }

    @include for-size("tablet") {
      display: block !important;
    }
  }
</style>
