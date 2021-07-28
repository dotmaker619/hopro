<template>
  <div class="">
    <div class="bg-white">
      <div class="is-medium-16-500-00 is-flex is-between padding-20">
        <span>Ticket Details </span>
        <div v-if="quick_action && verticalScroll" class="show-more-ticket" @click="quick_action = false">Show More</div>
      </div>
      <div class="ticket-details-content-scroll is-relative">
        <div class="bg-white pb-5" :class="{ 'scroll-box': quick_action }" id="overviewHeight">
          <div class="columns is-mobile is-multiline px-10 is-marginless details-scroll">
            <div class="column is-half">
              <p class="is-regular-12-00-14 mb-7">Assets</p>
              <primary-tags
                :tags="elementData ? [elementData] : null"
                :type="'asset'"
                :no_access="true"
                v-if="elementData && elementData.type == 'asset'"
              ></primary-tags>
              <div class="is-flex is-vcenter is-pointer" v-else>
                <sh-icon :name="'add-asset'" class="mr-7 is-22x22" />
                <span class="mr-10 is-regular-12-00-14 has-opacity-5 has-text-theme-black">Asset not assigned</span>
              </div>
            </div>
            <div class="column is-half">
              <p class="is-regular-12-00-14 mb-7">Priority</p>

              <priority-dropdown
                :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
                class="is-medium-16-500-19"
                @change_ticket_priority="update_ticket({ priority: parseInt($event) })"
                :is_details="true"
                :priority="ticket.priority"
                v-if="ticket"
              ></priority-dropdown>
            </div>
            <div class="column is-full">
              <p class="is-regular-12-00-14 mb-7">Location</p>
              <div class="column is-full is-flex is-paddingless" v-if="nameArray && nameArray.length">
                <sh-icon
                  v-if="elementData && ['file', 'folder', 'vault'].includes(elementData.type)"
                  :file="'vault_sprite'"
                  :name="'add-folder'"
                  class="image is-pointer mr-5 is-20x20"
                />
                <div class="is-flex">
                  <div v-for="(name, i) in nameArray" :key="i" class="is-flex is-vcenter">
                    <span
                      class="is-medium-14-500-17 no-whitespace-wrap"
                      v-tooltip="name"
                      :class="[name == '*Not found' ? 'has-text-light-grey' : 'has-text-theme-black']"
                      >{{ name | truncate(15) }}</span
                    >
                    <p v-if="i != nameArray.length - 1">
                      <sh-icon :name="'collapse'" class="is-16x16 mx-5" style="transform: rotate(-90deg);"></sh-icon>
                    </p>
                  </div>
                </div>
              </div>
              <div class="is-flex is-vcenter is-pointer" v-else>
                <sh-icon :name="'add-location'" class="mr-7 is-30x30" />
                <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black">Location not found</span>
              </div>
            </div>

            <div class="column  is-half">
              <p class="is-regular-12-00-14 mb-10">Start Date</p>

              <startdate-dropdown
                :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
                :ticket="ticket"
                v-if="ticket"
                @change-startdate="
                  update_ticket({
                    startDate: $event ? new Date($event).toISOString() : null,
                  })
                "
              ></startdate-dropdown>
            </div>
            <div class="column is-half">
              <p class="is-regular-12-00-14 mb-10">Due Date</p>
              <duedate-dropdown
                class="is-medium-16-500-19"
                :icon_class="'is-20x20 mr-7'"
                :ticket="ticket"
                v-if="ticket"
                :due="ticket.dueDate || null"
                @change-duedate="
                  update_ticket({
                    dueDate: $event ? new Date($event).toISOString() : null,
                  })
                "
              ></duedate-dropdown>
            </div>

            <div class="column is-half">
              <p class="is-regular-12-00-14 mb-10">Assignee</p>
              <user-assignee-dropdown
                :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
                :existing_user="ticket.takenUp"
                @update-user="update_ticket({ 'takenUp': $event })"
                :pxsize="20"
                class="is-medium-16-500-19 is-paddingless"
              />
            </div>
            <div class="column is-half">
              <p class="is-regular-12-00-14 mb-7">Created By</p>
              <div v-if="ticket.owner" class="is-flex is-vcenter">
                <user-avatar :user="ticket.owner" :pxsize="20" :custom_class="'tiny-user-avatar'"></user-avatar>
                <p class="is-medium-16-500-19 ml-8" v-username="ticket.owner"></p>
              </div>
              <p v-else class="is-regular-14-00-17 has-text-grey mt-15">*Not found</p>
            </div>
            <div class="column is-half">
              <p class="is-regular-12-00-14 mb-10">Users</p>
              <div class="is-flex is-vcenter" v-if="(ticket.readUsers && ticket.readUsers.length) || (ticket.writeUsers && ticket.writeUsers.length)">
                <user-tag
                  :custom_class="'tiny-user-avatar '"
                  :custom_size="24"
                  :users="[...(ticket.readUsers || []), ...(ticket.writeUsers || [])]"
                  :tagsCountToShow="4"
                  :no_access="true"
                  :is_precense_component="true"
                ></user-tag>
                <sh-icon @click.native="add_users" :name="'add-users-teams'" class="mr-7 is-24x24" />
              </div>
              <div v-else @click="add_users" class="is-flex is-vcenter is-pointer" :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]">
                <sh-icon :name="'add-users-2'" class="mr-7 is-22x22" />
                <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black">No Users Added</span>
              </div>
            </div>
            <div class="column is-half">
              <p class="is-regular-12-00-14 mb-10">Followers</p>
              <watcher-dropdown
                :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
                :ticket="ticket"
                :ticket_watchers="ticket.watchers"
                @update-watchers="update_ticket({ watchers: $event })"
              ></watcher-dropdown>
            </div>
            <div class="column is-full pb-20">
              <p class="is-regular-12-00-14">Teams</p>
              <div class="is-flex is-vcenter" v-if="get_teams(ticket).length">
                <primary-tags
                  :tags="get_teams(ticket)"
                  @clicked_tag="add_teams"
                  :toShowCount="2"
                  :no_access="true"
                  :type="'team'"
                  :no_wrap="true"
                  :truncate_length="10"
                />
                <sh-icon @click.native="add_teams" :name="'add-users-teams'" class="mr-7 is-24x24" />
              </div>
              <div v-else @click="add_teams" class="is-flex is-vcenter is-pointer mt-7">
                <sh-icon :name="'add-teams'" class="mr-7 is-22x22" />
                <span class="mr-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black">No Teams Assigned</span>
              </div>
            </div>
          </div>
        </div>
        <div class="quick-action" :class="{ 'is-absolute': quick_action }">
          <div class="is-regular-13-00-16 mb-15">Quick Actions</div>
          <div class="is-flex align-center is-between pb-20">
            <div @click="$emit('active-section', 4)">
              <div class="quick-action-icon">
                <sh-icon :name="'comments'" class="is-24x24"></sh-icon>
              </div>
              <span>Add Comments</span>
            </div>
            <div @click="$emit('active-section', 2)">
              <div class="quick-action-icon">
                <sh-icon :name="'checklist'" class="is-24x24"></sh-icon>
              </div>
              <span>Resolve Checklist</span>
            </div>
            <div>
              <div @click="uppyDropdown = true" class="quick-action-icon">
                <sh-icon :name="'camera'" class="is-24x24"></sh-icon>
              </div>
              <span>Add Attachment</span>
            </div>
          </div>
          <div class="quick-action-status">
            <status-dropdown
              :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
              :current_status="ticket.status"
              :ticket="ticket"
              v-if="ticket"
              @update-ticket-status="update_ticket({ status: parseInt($event.value) })"
            ></status-dropdown>
          </div>
        </div>
      </div>
    </div>
    <div @click="uppyDropdown = false" v-if="uppyDropdown" class="uppy-backdrop"></div>
    <upload-file
      :class="{ 'uppy-mobile': uppyDropdown }"
      @uploaded_success="upload_completed"
      @initialised="uppy = $event"
      service="tickets"
      :name="ticket.name"
      type="ticket"
      :uid="ticket.uid"
      id="ticket_attachments"
      :uploadMethod="uploadMethod"
      :isModal="$route.meta.screen == 'mobile' ? false : true"
      @close-uppy="uppyDropdown = false"
      v-if="uppyDropdown || $route.meta.screen !== 'mobile'"
    >
    </upload-file>
  </div>
</template>
<script>
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
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
  import UploadFile from "@/desktop/shared/components/upload-file";

  import { ticketService } from "@/desktop/shared/services/";
  import { RRule } from "rrule";
  export default {
    props: ["elementData", "ticket", "nameArray"],
    components: {
      AssignedTags,
      UserTag,
      PrimaryTags,
      PriorityDropdown,
      UserAssigneeDropdown,
      WatcherDropdown,
      StatusDropdown,
      UploadFile,
      ActionsDropdown,
      StartdateDropdown,
      DuedateDropdown,
    },
    data() {
      return {
        uppyDropdown: false,
        window: {
          width: 0,
          height: 0,
        },
        verticalScroll: null,
        divHeight: null,
        quick_action: true,
      };
    },
    mounted() {
      this.isScrollCheck();
      console.log("url", window.location.host);
    },
    computed: {
      isMobileHost() {
        if (
          window.location.host == "localhost:8080" ||
          window.location.host == "m.sensehawk.com" ||
          window.location.host == "m-stage.sensehawk.com" ||
          window.location.host == "m-dev.sensehawk.com"
        ) {
          return true;
        } else {
          return false;
        }
      },
    },
    methods: {
      isScrollCheck() {
        this.divHeight = document.getElementById("overviewHeight");
        this.verticalScroll = this.divHeight.scrollHeight - 20 > this.divHeight.offsetHeight;
      },
      // scroll_bottom(){
      //   this.divHeight.scrollTop = this.divHeight.scrollHeight - this.divHeight.offsetHeight;
      // },
      update_ticket(value) {
        this.$store.dispatch("tickets/update_ticket_value", {
          id: this.ticket.uid,
          value: value,
        });
      },
      upload_completed() {
        this.uppyDropdown = false;
      },
      uploadMethod(serviceObject) {
        return ticketService.update_file_upload({
          body: {
            serviceObject: serviceObject,
          },
          id: this.ticket.uid,
        });
      },
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
            asset_id: this.ticket && this.ticket.targetElement ? this.ticket.targetElement.asset : null,
            item_uid: this.ticket.uid,
            complete: async (e) => {
              let readLabels = e.filter((u) => u.access === "read").map((u) => u.uid);
              let writeLabels = e.filter((u) => u.access === "write").map((u) => u.uid);
              this.update_ticket({ readLabels, writeLabels });
            },
          },
          { height: "65%", width: "100%", classes: ["add-user"] }
        );
      },
      add_users() {
        // this.$emit("overlay_popup", true);
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
          { height: "65%", width: "100%", classes: ["add-user"] },
          { name: "add-ticket-users" }
        );
      },
    },
  };
</script>
<style lang="scss" scoped>
  .quick-action {
    background-color: #f4f7fc;
    height: 20rem;
    padding: 2rem 2.4rem;
    // position: absolute;
    // bottom: 4.4rem;
    bottom: 0;
    width: 100%;
    &-icon {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      border: solid 1px rgba(23, 30, 72, 0.1);
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0px auto 5px;
    }
    &-status {
      height: 5rem;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.2);
    }
  }
  .details-scroll {
    overflow: visible;
    // height: 40rem;
  }
  .ticket-details-content-scroll {
    height: calc(100vh - 20rem);
    overflow: auto;
  }
  .scroll-box {
    height: calc(100vh - 40rem);
    overflow: hidden;
  }
  .show-more-ticket {
    color: $primary;
    background-color: #fff;
    text-decoration: underline;
    font-weight: 600;
    font-size: 13px;
  }
</style>
<style>
  .add-user {
    position: absolute !important;
    bottom: 0 !important;
    top: auto !important;
  }
</style>
