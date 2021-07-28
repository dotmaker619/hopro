<template>
  <div class="details-top-section">
    <!-- <div v-if="is_loading">
      <top-section-skeleton></top-section-skeleton>
    </div>-->
    <div v-if="$route.meta.screen && $route.meta.screen == 'mobile'">
      <mobile-top-section :ticket="ticket"></mobile-top-section>
    </div>
    <div v-else>
      <div class="details-top-section--header">
        <div>
          <div class="is-flex align-center">
            <p
              v-if="edit_ticket_name == -1"
              v-tooltip="ticket.name.length > 30 ? ticket.name : null"
              @click="
                ticket.writeAccess ? (edit_ticket_name = ticket.uid) : null
              "
              class="mr-10 is-semiBold-24-600-106"
              :class="[!ticket.writeAccess ? 'is-not-allowed' : null]"
            >
              {{ ticket.name | truncate(30) }}
            </p>
            <input
              v-click-outside="() => update_ticket_name(new_name)"
              v-if="edit_ticket_name == ticket.uid"
              type="text"
              name="name"
              id="ticket"
              class="is-inline-input is-semiBold-24-600-106"
              :placeholder="new_name"
              v-focus
              style="width: 40rem; height: 29px"
              v-model="new_name"
              @keyup.esc="edit_ticket_name = -1"
              @keyup.enter="update_ticket_name(new_name)"
            />
            <div @click="update_ticket({ bookmark: !ticket.bookmark })">
              <sh-icon
                :name="'bookmarked-highlight'"
                class="is-18x18 mr-10 is-pointer"
                v-if="ticket.bookmark"
              />
              <sh-icon
                :name="'bookmark'"
                class="is-18x18 mr-10 is-pointer"
                v-else
              />
            </div>
          </div>
          <div class="mt-15 details-top-section-tags">
            <tags-dropdown
              :service="ticketService"
              :tags="ticket.tags"
              :resourceId="ticket.uid"
              :write_access="ticket.writeAccess"
              :complete="update_ticket"
              :display_on_hover="ticket.tags.length"
            />
          </div>
        </div>
        <div>
          <status-dropdown
            :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
            @close="$emit('close-popup')"
            :current_status="ticket.status"
            :ticket="ticket"
            v-if="ticket"
            @update-ticket-status="
              update_ticket({ status: parseInt($event.value) })
            "
          ></status-dropdown>
        </div>
      </div>

      <div class="mt-30 ml-10">
        <div class="columns is-mobile details-row" v-if="!ticket.isTemplate">
          <div class="column is-6">
            <div class="columns align-center">
              <div class="column is-3">
                <span class="ticket-detail-heading">Assets</span>
              </div>
              <div class="column is-9">
                <primary-tags
                  @click.native="$emit('close')"
                  :tags="elementData ? [elementData] : null"
                  :type="'asset'"
                  v-if="elementData && elementData.type == 'asset'"
                ></primary-tags>
                <div class="is-flex is-vcenter is-pointer" v-else>
                  <sh-icon :name="'add-asset'" class="mr-7 is-30x30" />
                  <span
                    class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black"
                    >Asset not assigned</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="column is-7">
            <div class="columns align-center">
              <div class="column is-2">
                <span class="ticket-detail-heading">Location</span>
              </div>
              <div
                class="column is-10 is-flex"
                v-if="nameArray && nameArray.length"
              >
                <sh-icon
                  v-if="
                    elementData &&
                    ['file', 'folder', 'vault'].includes(elementData.type)
                  "
                  :file="'vault_sprite'"
                  :name="'add-folder'"
                  class="image is-pointer mr-5 is-20x20"
                />
                <div class="is-flex">
                  <div
                    v-for="(name, i) in nameArray"
                    :key="i"
                    class="is-flex is-vcenter"
                  >
                    <span
                      class="is-medium-14-500-17 no-whitespace-wrap"
                      v-tooltip="name"
                      :class="[
                        name == '*Not found'
                          ? 'has-text-light-grey'
                          : 'has-text-theme-black',
                      ]"
                      >{{ name | truncate(15) }}</span
                    >
                    <p v-if="i != nameArray.length - 1">
                      <sh-icon
                        :name="'collapse'"
                        class="is-16x16 mx-5"
                        style="transform: rotate(-90deg)"
                      ></sh-icon>
                    </p>
                  </div>
                </div>
              </div>
              <div class="is-flex is-vcenter is-pointer" v-else>
                <sh-icon :name="'add-location'" class="mr-7 is-30x30" />
                <span
                  class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black"
                  >Location not found</span
                >
              </div>
            </div>
          </div>
        </div>
        <div class="columns details-row is-mobile">
          <div class="column is-6">
            <div class="columns align-center">
              <div class="column is-3">
                <span class="ticket-detail-heading">Assignee</span>
              </div>
              <div class="column is-9" style="position: relative; left: -1rem">
                <user-assignee-dropdown
                  :class="[
                    ticket && !ticket.writeAccess ? 'has-no-access' : null,
                  ]"
                  :existing_user="ticket.takenUp"
                  @update-user="update_ticket({ takenUp: $event })"
                  :pxsize="24"
                  class="is-medium-16-500-19 is-paddingless"
                />
              </div>
            </div>
          </div>
          <div class="column is-7">
            <div class="columns align-center">
              <div class="column is-2">
                <span class="ticket-detail-heading">Created By</span>
              </div>

              <div class="column is-10">
                <div v-if="ticket.owner" class="is-flex is-vcenter">
                  <user-avatar
                    :user="ticket.owner"
                    :pxsize="24"
                    :custom_class="'tiny-user-avatar'"
                  ></user-avatar>
                  <p
                    class="is-medium-16-500-19 ml-8"
                    v-username="ticket.owner"
                  ></p>
                </div>
                <p v-else class="is-regular-14-00-17 has-text-grey mt-15">
                  *Not found
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="columns details-row is-mobile">
          <div class="column is-6">
            <div class="columns align-center">
              <div class="column is-3">
                <span class="ticket-detail-heading">Users</span>
              </div>
              <div class="column is-4 user-tag">
                <div
                  class="is-flex is-vcenter"
                  v-if="
                    (ticket.readUsers && ticket.readUsers.length) ||
                    (ticket.writeUsers && ticket.writeUsers.length)
                  "
                >
                  <user-tag
                    :custom_class="'tiny-user-avatar '"
                    :custom_size="24"
                    :users="[
                      ...(ticket.readUsers || []),
                      ...(ticket.writeUsers || []),
                    ]"
                    :tagsCountToShow="5"
                    :no_access="true"
                    :is_precense_component="true"
                    @handle_click="add_users"
                  ></user-tag>
                  <sh-icon
                    v-if="ticket.writeAccess"
                    :name="'add-users-teams'"
                    class="is-22x22 ml-5 is-pointer add-user-assignee"
                    v-tooltip="{ content: `Add users to this ticket` }"
                    @click.native="add_users"
                    :class="[
                      ticket && !ticket.writeAccess ? 'has-no-access' : null,
                    ]"
                  />
                </div>
                <div
                  v-else
                  class="is-flex is-vcenter is-pointer"
                  @click="add_users"
                  :class="[
                    ticket && !ticket.writeAccess ? 'has-no-access' : null,
                  ]"
                >
                  <sh-icon :name="'add-users-2'" class="mr-7 is-24x24" />
                  <span
                    class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black"
                    >Add Users</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="column is-7">
            <div class="columns align-center">
              <div class="column is-2">
                <span class="ticket-detail-heading">
                  <span class="mr-5">Teams</span>
                  <sh-icon
                    :name="'ticket-details-info'"
                    class="is-14x14 is-question"
                    v-tooltip="{
                      content:
                        'All members of the parent teams will also be given the same level of access',
                    }"
                  />
                </span>
              </div>
              <div class="column">
                <div class="is-flex is-vcenter" v-if="get_teams(ticket).length">
                  <primary-tags
                    :tags="get_teams(ticket)"
                    @clicked_tag="add_teams"
                    :toShowCount="3"
                    :no_access="true"
                    :type="'team'"
                    :no_wrap="true"
                    :truncate_length="10"
                  />
                  <sh-icon
                    v-if="ticket.writeAccess"
                    :name="'add-users-teams'"
                    class="show-on-hover is-22x22 ml-5 is-pointer add-user-assignee"
                    @click.native="add_teams"
                    :class="[
                      ticket && !ticket.writeAccess ? 'has-no-access' : null,
                    ]"
                  />
                </div>
                <div
                  v-else
                  class="is-flex is-vcenter is-pointer"
                  @click="add_teams"
                  :class="[
                    ticket && !ticket.writeAccess ? 'has-no-access' : null,
                  ]"
                >
                  <sh-icon :name="'add-teams'" class="mr-7 is-24x24" />
                  <span
                    class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black"
                    >Add Teams</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="columns details-row is-mobile">
          <div class="column is-6">
            <div class="columns align-center">
              <div class="column is-3">
                <span class="ticket-detail-heading">
                  <span class="mr-5">Followers</span>
                  <sh-icon
                    :name="'ticket-details-info'"
                    class="is-14x14 is-question"
                    v-tooltip="{
                      content:
                        'Added people will be notified of any changes on the tickets via push notifications and email',
                    }"
                  />
                </span>
              </div>
              <div class="column is-9 is-flex is-vcenter follower-tag">
                <watcher-dropdown
                  :class="[
                    ticket && !ticket.writeAccess ? 'has-no-access' : null,
                  ]"
                  :ticket="ticket"
                  :ticket_watchers="ticket.watchers"
                  @update-watchers="update_ticket({ watchers: $event })"
                ></watcher-dropdown>
              </div>
            </div>
          </div>
          <div class="column is-7">
            <div class="columns align-center">
              <div class="column is-2">
                <span class="ticket-detail-heading">Start Date</span>
              </div>
              <div class="column is-10">
                <div class="is-flex align-center ml-10">
                  <startdate-dropdown
                    :class="[
                      ticket && !ticket.writeAccess ? 'has-no-access' : null,
                    ]"
                    :ticket="ticket"
                    v-if="ticket"
                    @change-startdate="
                      update_ticket({
                        startDate: $event
                          ? new Date($event).toISOString()
                          : null,
                      })
                    "
                  ></startdate-dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="columns details-row is-mobile">
          <div class="column is-6">
            <div class="columns align-center">
              <div class="column is-3">
                <span class="ticket-detail-heading">Priority</span>
              </div>
              <div class="column is-9">
                <priority-dropdown
                  style="position: relative; left: -1rem"
                  :class="[
                    ticket && !ticket.writeAccess ? 'has-no-access' : null,
                  ]"
                  class="is-medium-16-500-19 priority-area"
                  @change_ticket_priority="
                    update_ticket({ priority: parseInt($event) })
                  "
                  :is_details="true"
                  :priority="ticket.priority"
                  v-if="ticket"
                ></priority-dropdown>
              </div>
            </div>
          </div>
          <div class="column is-7">
            <div class="columns align-center">
              <div class="column is-2">
                <span class="ticket-detail-heading">Due Date</span>
              </div>
              <div class="column is-10">
                <div class="is-flex align-center duedate-section">
                  <duedate-dropdown
                    :class="[
                      ticket && !ticket.writeAccess ? 'has-no-access' : null,
                    ]"
                    class="is-medium-16-500-19"
                    :ticket="ticket"
                    v-if="ticket"
                    :due="ticket.dueDate || null"
                    :in_details="true"
                    :left="true"
                    @change-duedate="
                      update_ticket({
                        dueDate: $event ? new Date($event).toISOString() : null,
                      })
                    "
                  ></duedate-dropdown>
                  <div
                    class="ml-15 set-schedule"
                    v-if="ticket && ticket.writeAccess"
                  >
                    or
                    <span @click="$emit('open-schedule-tab')"
                      >Set Schedule</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="level">
        <div class="level-left">
          <level-item></level-item>
        </div>
        <div class="level-right">
          <div
            class="level-item"
            :class="{
              'is-hidden': !(presence_members && presence_members.length),
            }"
          >
            <div class="ticket-detail-heading mr-10">
              <span class="mr-5">Viewing</span>
              <sh-icon
                v-tooltip="'Users who are currently viewing this ticket'"
                :name="'ticket-details-info'"
                class="is-14x14 is-pointer info-icon"
              />
            </div>
            <div class="is-flex is-vcenter">
              <user-tag
                :custom_class="'tiny-user-avatar '"
                :custom_size="24"
                :users="presence_members"
                :tagsCountToShow="3"
                :no_access="true"
                :is_precense_component="true"
              ></user-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import TagsDropdown from "@/desktop/shared/components/tags/type-tag/type-tag";
import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
import PriorityDropdown from "@/desktop/tickets/shared/components/priority-dropdown";
import UserAssigneeDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
import WatcherDropdown from "@/desktop/tickets/shared/components/watchers-dropdown";
import StatusDropdown from "@/desktop/tickets/shared/components/status-dropdown";
import ActionsDropdown from "@/desktop/tickets/shared/components/actions-dropdown";
import AddUsers from "@/desktop/shared/components/add-users-modal";
import AddTeams from "@/desktop/shared/components/add-teams-modal";
import DuedateDropdown from "@/desktop/tickets/shared/components/duedate-dropdown";
import StartdateDropdown from "@/desktop/tickets/shared/components/startdate-dropdown";
import { ticketService, apiService } from "@/desktop/shared/services/";
import { RRule } from "rrule";
import TopSectionSkeleton from "@/desktop/shared/components/skeleton/tickets/top-section-skeleton.vue";
import MobileTopSection from "@/mobile/modules/tickets/components/ticket-details/mobile-ticket-details";

export default {
  props: ["ticket", "is_loading", "presence_members"],
  data() {
    return {
      edit_ticket_name: -1,
      ticketService: ticketService,
      nameArray: [],
      elementData: null,
      new_name: this.ticket.name,
    };
  },
  components: {
    TagsDropdown,
    UserTag,
    PrimaryTags,
    PriorityDropdown,
    UserAssigneeDropdown,
    WatcherDropdown,
    StatusDropdown,
    ActionsDropdown,
    StartdateDropdown,
    DuedateDropdown,
    MobileTopSection,
    TopSectionSkeleton,
  },
  computed: {
    rrule_string() {
      if (this.ticket.rrule) {
        return new RRule.fromString(this.ticket.rrule).toText();
      }
    },
  },
  created() {
    this.get_element();
  },
  methods: {
    add_teams() {
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
          asset_id:
            this.ticket && this.ticket.targetElement
              ? this.ticket.targetElement.asset
              : null,
          item_uid: this.ticket.uid,
          complete: async (e) => {
            let readLabels = e
              .filter((u) => u.access === "read")
              .map((u) => u.uid);
            let writeLabels = e
              .filter((u) => u.access === "write")
              .map((u) => u.uid);
            this.update_ticket({ readLabels, writeLabels });
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
          item_uid: this.ticket.uid,

          complete: async (e) => {
            let readUsers = e.filter((u) => u.access === "read");
            let writeUsers = e.filter((u) => u.access === "write");
            this.update_ticket({ readUsers, writeUsers });
          },
        },
        { height: "80%" },
        { name: "add-ticket-users" }
      );
    },

    update_ticket(value) {
      this.$store.dispatch("tickets/update_ticket_value", {
        id: this.ticket.uid,
        value: value,
      });
    },

    async update_ticket_name(name) {
      this.update_ticket({ name: name });
      this.edit_ticket_name = -1;
    },

    async get_element() {
      this.nameArray = [];
      let res = await apiService
        .get_element_hierarchy({
          id: this.ticket.targetElement.uid,
          stage: this.ticket.targetElement.stage,
        })
        .catch((err) => {
          console.log(err);
          this.nameArray = ["*Not found"];
        });
      this.elementData = res;
      if (this.elementData) this.getName(this.elementData);
    },
    getName(dataObject) {
      if (dataObject[`name`]) {
        this.nameArray.push(dataObject[`name`]);
      }
      if (dataObject[`child`] && dataObject[`child`].uid)
        return this.getName(dataObject[`child`]);
      return null;
    },
  },
};
</script>

<style lang="scss">
.details-top-section {
  &--header {
    display: flex;
    justify-content: space-between;
  }
  &--main {
    margin-top: 2rem;
    display: flex;
    justify-content: space-between;
  }
  &-tags {
    max-width: 400px;
  }

  .add-more-tags {
    width: 30rem;
  }
}

.thin-border {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
}

.ticket-detail-heading {
  font-family: Barlow-Regular;
  font-size: 16px;
  font-weight: normal;

  color: $light-grey-text;
  display: flex;
  align-items: center;
}
.priority-area {
  left: -1.5rem;
}
</style>
<style lang="scss">
.details-row {
  min-height: 5rem;
  margin-bottom: 0 !important;
  align-items: center;
}
.raised-by {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  padding: 0.5rem 1rem 0.5rem 0;

  &-avatar {
    height: 2.4rem;
    width: 2.4rem;
    margin-right: 1rem;
    img {
      height: 2.4rem;
      width: 2.4rem;
      border-radius: 50%;
    }
  }
}
.user-tag {
  &:hover {
    .add-user-assignee {
      visibility: visible;
    }
  }
  .add-user-assignee {
    visibility: hidden;
  }
}
.follower-tag {
  &:hover {
    .add-followers {
      visibility: visible;
    }
  }
  .add-followers {
    visibility: hidden;
  }
}
.set-schedule {
  color: $light-grey-text;
  font-family: Barlow-Italic;
  font-size: 16px;
  font-weight: normal;
  span {
    text-decoration: underline;
    cursor: pointer;
  }
}
.duedate-section {
  &:hover {
    .set-schedule {
      visibility: visible;
    }
  }
  .set-schedule {
    visibility: hidden;
  }
}

.column {
  .show-on-hover {
    visibility: hidden;
  }
  &:hover {
    .show-on-hover {
      visibility: visible;
    }
  }
}
.info-icon {
  margin-top: 0.2rem;
}
.is-visibility-hidden {
  visibility: hidden;
}
.is-visibility-visible {
  visibility: visible;
}

.is-question {
  cursor: help;
}
</style>
