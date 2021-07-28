<template>
  <div class="save-template mb-40 pb-20" v-click-outside="() => close_modal">
      <div class="template-dropdown is-paddingless is-static has-slimscroll-xs" >
      <div class="template-dropdown__content padding-30 no-padding-bottom pt-15">
          <div class="" >
          <p class="is-medium-14-500-17">New Ticket Name</p>
          <input class="input mt-10 is-paddingless" style="width:100%;" placeholder="New Ticket Name" v-model="name" required />            
          </div>
        <div class="mt-15"></div>
        <div @change="fill_inclusions()">
          <p class="is-medium-14-500-17 mb-10 mt-20">What do you want to copy?</p>

          <b-radio class="radio mr-30" type="is-info" v-model="inclusions" native-value="all">
            <span class="is-regular-14-00-17 mr-30" :class="{'is-medium-14-500-17': inclusions=='all'}">Everything</span>
          </b-radio>
          <b-radio class="radio mr-30" type="is-info" v-model="inclusions" native-value="custom">
            <span class="is-regular-14-00-17" :class="{'is-medium-14-500-17': inclusions=='custom'}">Custom</span>
          </b-radio>
            <div class="mt-10">
                <div class="divider has-full-width"></div>
            </div>
        </div>
          <div class=" is-flex is-between mt-15">
            <div class="left ">
              <p class="is-flex is-vcenter padding-10 no-padding-left">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="assignee"
                  value="assignee"
                />
                <label for="assignee" class="ml-5 is-regular-14-00-17">Assignee</label>
              </p>
              
              <p class="is-flex is-vcenter padding-10 no-padding-left">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="priority"
                  value="priority"
                />
                <label for="priority" class="ml-5 is-regular-14-00-17 has-text-theme-black">Priority</label>
              </p>
              
              <p class="is-flex is-vcenter padding-10 no-padding-left">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="users"
                  value="users"
                />
                <label for="users" class="ml-5 is-regular-14-00-17 has-text-theme-black">Users</label>
              </p>
              <p class="is-flex is-vcenter padding-10 no-padding-left">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="recurrence"
                  value="recurrence"
                />
                <label for="recurrence" class="ml-5 is-regular-14-00-17 has-text-theme-black no-whitespace-wrap">Recurrence</label>
              </p>
            </div>
            <div class="middle">
                <p class="is-flex is-vcenter padding-10 no-padding-left">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="attachments"
                  value="attachments"
                />
                <label for="attachments" class="ml-5 is-regular-14-00-17 has-text-theme-black">Attachments</label>
              </p>
              <p class="is-flex is-vcenter padding-10 no-padding-left">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="dueDate"
                  value="dueDate"
                />
                <label for="dueDate" class="ml-5 is-regular-14-00-17 has-text-theme-black">Due Date</label>
              </p>
              
              <p class="is-flex is-vcenter padding-10 no-padding-left">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="teams"
                  value="teams"
                />
                <label for="teams" class="ml-5 is-regular-14-00-17 has-text-theme-black">Teams</label>
              </p>
            </div>
            <div class="right">
              <p class="is-flex is-vcenter padding-10 ">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="checklists"
                  value="checklists"
                />
                <label for="checklists" class="ml-5 is-regular-14-00-17 has-text-theme-black">Checklists</label>
              </p>
              <p class="is-flex is-vcenter padding-10">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="tags"
                  value="tags"
                />
                <label for="tags" class="ml-5 is-regular-14-00-17 has-text-theme-black">Tags</label>
              </p>
              <p class="is-flex is-vcenter padding-10">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="copy_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="description"
                  value="description"
                />
                <label for="description" class="ml-5 is-regular-14-00-17 has-text-theme-black no-whitespace-wrap">Description</label>
              </p>
              
            </div>
          </div>
        <div class="mt-10 mb-40 ml-15">
            <div class="columns is-vcenter mt-5 card px-30 py-20">
              <p class="column is-half">
                <span class="is-regular-14-00-17 has-text-theme-black mb-20">Assignee</span>
                <user-dropdown class="mt-5"
                  :can_unassign="true"
                  :is_name_hidden="true"
                  :existing_user="selected_assignee"
                  @update-user="selected_assignee = $event"
                  @remove-user="selected_assignee = null"
                  :pxsize="36"
                ></user-dropdown>
              </p>
              <p class="column is-half">
                <span class="is-regular-14-00-17 has-text-theme-black is-flex mt-3" >
                  Watchers
                  <sh-icon :name="'create-rounded'" :file="'tickets_sprite'" class="is-18x18 mr-20 is-pointer"></sh-icon>
                </span>
                <span class="is-flex is-vcenter">
                  <!-- <user-tag class="mt-5" :users="duplicate_watchers" :howManyToShow="2" :no_wrap="true" :is_precense_component="true"></user-tag> -->
                  <watchers-dropdown
                    :user_count="2"
                    :is_duplicate="true"
                    class="mt-5"
                    :ticket="ticket"
                    :ticket_watchers="duplicate_watchers"
                    v-if="ticket"
                    :add_icon_on_hover="true"
                    @update-watchers="update_watchers"
                  ></watchers-dropdown>
                </span>
              </p>
            </div>
          </div>
      </div>

      <div  class="is-pointer padding-30 no-padding-top is-flex is-end align-center">
        <div @click.stop="$emit('close-duplicate-modal')" class="mr-5 button padding-20 is-white is-medium-16-500-19" style="color:#747891;">Cancel</div>
        <div @click="duplicate_ticket" class="sh-button sh-button--inverted "  :class="{ 'is-disabled': !name }">Duplicate Ticket</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ticketService } from "@/desktop/shared/services/";
  import UserDropdown from "./user-assignee-dropdown";
  import WatchersDropdown from "./watchers-dropdown";

  export default {
    props: ["ticket"],
    data() {
      return {
        inclusions: "all",
        copy_options: ["attachments", "users", "teams", "checklists", "priority", "recurrence", "tags", "dueDate", "description", "assignee"],
        name: null,
        duplicate_watchers: [],
        selected_assignee: null,
      };
    },
    components: {
      UserDropdown,
      WatchersDropdown,
    },

    created() {
      this.selected_assignee = this.ticket.takenUp;
      this.duplicate_watchers = this.ticket.watchers.filter(watcher=>watcher.uid);
    },
    methods: {
      close_modal(){
        this.$emit('close-duplicate-modal');
      },
      async duplicate_ticket() {
        if (!this.name || !this.name.length) {
          this.$toast.show("Name can not be empty", "", this.$store.state.izitoast_options.appError);
          return;
        }
        let req = {
          body: {
            tickets:[]
          }
        }
        let data = {
          action: "duplicate",
          name: this.name,
          include: {
            attachments: this.copy_options.includes("attachments"),
            comments: this.copy_options.includes("comments"),
            checklists: this.copy_options.includes("checklists")
            ? {
                  "asignee": true,
                  "dueDate": true,
                  "attachments": true,
                  "resolved": true,
                }
              : false,
            description: this.copy_options.includes("description"),
            watchers: false,
            priority: this.copy_options.includes("priority"),
            recurrence: this.copy_options.includes("recurrence"),
            tags: this.copy_options.includes("tags"),
            dueDate: this.copy_options.includes("dueDate"),
            
            assignee: this.copy_options.includes("assignee") ? true : false,
          },
          takenUp: this.selected_assignee,
          watchers: this.duplicate_watchers,
          ticketUid: this.ticket.uid
        };
        req.body.tickets.push(data)
        let res = await ticketService
          .bulk_template(req)
          .catch((err) => this.handleErrors(err));
        this.close_modal();
      },
      fill_inclusions() {
        if (this.inclusions == "all") {
          let default_inclusions= ["attachments", "users", "teams", "checklists", "priority", "recurrence", "tags", "dueDate", "description", "assignee"];
          this.copy_options = [...default_inclusions];
        }
      },
      update_watchers(watchers) {
        this.duplicate_watchers = [...watchers];
      },
    },
  };
</script>
<style lang="scss">
.save-template{
      z-index: 999;
   .template-dropdown {
    
    border-radius: 10px;
    width: 383px;
    background-color: #fff;
    box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);

    &__content {
      &--template {
          position: relative;
      }
      &__text {
        text-align: center;
        font-size: 1.6rem;
        font-weight: 500;
        line-height: 1.75;
        color: rgba(23, 30, 72, 0.7);
      }

      .input {
        width: 95%;
        border: none;
        background-color: transparent;
        box-shadow: none;
        color: #171e48;
        font-size: 1.6rem;
        line-height: 2rem;
        border-radius: 0;
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);

        &:focus {
          outline: none;
        }

        &::placeholder {
          color: rgba(23, 30, 72, 0.4);
        }
      }

      .results {
        background-color: white;
        border: 1px solid #eee;
        z-index: 100;
        border-radius: 1rem;
        position: absolute;
        top: 4rem;
        padding: 1rem 0rem;
        box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);

        .item {
          cursor: pointer;
          padding: 1.3rem 2rem;
          &:hover {
            background-color: rgba(92, 126, 247, 0.2);
          }
        }
      }
    }

  }

  .hover-background {
    &:hover {
      background-color: $primary-background;
    }
  }
} 
</style>