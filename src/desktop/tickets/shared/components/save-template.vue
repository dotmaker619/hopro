<template>
  <div class="save-template mb-40 pb-20" v-click-outside="() => close_modal()">
    <div class="template-dropdown is-paddingless is-static has-slimscroll-xs">
      <div class="template-dropdown__content padding-30 no-padding-bottom pt-15">
        <div class="template-dropdown__content--template">
          <div class="is-flex align-center">
            <span class="icon">
              <sh-icon :name="'search'" class="is-16x16"></sh-icon>
            </span>
            <input
              @click.prevent="show_templates = true"
              class="input"
              placeholder="Select Template or Create new... "
              v-model="search_keyword"
              @input="
                selected_template = null;
                search_templates();
              "
            />
            <span @click="show_templates = !show_templates" class="image is-22x22 mt-5 pl-5">
              <sh-icon class="icon" :name="show_templates ? 'expand' : 'collapse'"></sh-icon>
            </span>
          </div>

          <div
            v-if="show_templates && all_templates && all_templates.length && (!selected_template || selected_template.name !== search_keyword)"
          >
            <div
              v-click-outside="() => close_templates()"
              class="results has-slimscroll-xs"
              style="width:32rem;"
            >
              <div
                v-for="list in all_templates"
                :key="list.uid"
                class="item"
                @click.stop="select_template(list)"
                :class="[selected_template && selected_template.name == list.name ? 'selected_template' : null]"
              >
                <p>{{ list.name }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-15" v-if="type == 'save'">
          <p class="is-medium-14-500-17">Share with</p>
          <div class="my-15 is-inline-flex no-whitespace-wrap align-center">
            <b-radio class="radio" type="is-info" v-model="members" native-value="me">
              <span
                class="is-regular-14-00-17 mr-5"
                :class="{ 'is-medium-14-500-17': members == 'me' }"
              >Only Me</span>
            </b-radio>
            <b-radio class="radio" type="is-info" v-model="members" native-value="all">
              <span
                class="is-regular-14-00-17"
                :class="{ 'is-medium-14-500-17': members == 'all' }"
              >All Members</span>
            </b-radio>
            <sh-icon class="icon mr-5 mt-3" :name="'info'"></sh-icon>

            <!-- <b-radio class="radio" type="is-info" v-model="members" native-value="admins">
              <span class="is-regular-14-00-17" :class="{ 'is-medium-14-500-17': members == 'admins' }">Admins</span>
            </b-radio>-->
            <b-radio
              class="radio no-margin-right ml-5"
              type="is-info"
              v-model="members"
              native-value="selected"
            >
              <span
                class="is-regular-14-00-17"
                :class="{ 'is-medium-14-500-17': members == 'selected' }"
              >Select People</span>
            </b-radio>
          </div>
          <p class="is-flex is-vcenter" v-if="members == 'selected'">
            <user-tag :users="shared_with" :is_precense_component="true" :howManyToShow="5"></user-tag>
            <share-users-dropdown
              :is_saveTemplate="true"
              :icon="'share'"
              :icon_size="30"
              @update-bulk-watchers="shared_with = $event"
              :ticket="ticket"
            ></share-users-dropdown>
          </p>
        </div>
        <div @change="fill_inclusions()">
          <p class="is-medium-14-500-17 mb-10 mt-20">Include in Template</p>

          <b-radio class="radio mr-30" type="is-info" v-model="inclusions" native-value="all">
            <span
              class="is-regular-14-00-17 mr-30"
              :class="{ 'is-medium-14-500-17': inclusions == 'all' }"
            >Everything</span>
          </b-radio>
          <b-radio class="radio mr-30" type="is-info" v-model="inclusions" native-value="custom">
            <span
              class="is-regular-14-00-17"
              :class="{ 'is-medium-14-500-17': inclusions == 'custom' }"
            >Custom</span>
          </b-radio>
          <div class="mt-10">
            <div class="divider has-full-width"></div>
          </div>
          <div class="is-flex is-between mt-15">
            <div class="left">
              <p class="is-flex is-vcenter padding-10 no-padding-left">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="template_options"
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
                  v-model="template_options"
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
                  v-model="template_options"
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
                  v-model="template_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="status"
                  value="status"
                />
                <label for="status" class="ml-5 is-regular-14-00-17 has-text-theme-black">Status</label>
              </p>
            </div>
            <div class="middle">
              <p class="is-flex is-vcenter padding-10">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="template_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="attachments"
                  value="attachments"
                />
                <label
                  for="attachments"
                  class="ml-5 is-regular-14-00-17 has-text-theme-black"
                >Attachments</label>
              </p>
              <p class="is-flex is-vcenter padding-10">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="template_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="watchers"
                  value="watchers"
                />
                <label for="watchers" class="ml-5 is-regular-14-00-17 has-text-theme-black">Watchers</label>
              </p>
              <p class="is-flex is-vcenter padding-10">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="template_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="teams"
                  value="teams"
                />
                <label for="teams" class="ml-5 is-regular-14-00-17 has-text-theme-black">Teams</label>
              </p>
            </div>
            <div class="right">
              <p class="is-flex is-vcenter padding-10">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="template_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="checklists"
                  value="checklists"
                />
                <label
                  for="checklists"
                  class="ml-5 is-regular-14-00-17 has-text-theme-black"
                >Checklists</label>
              </p>
              <p class="is-flex is-vcenter padding-10">
                <input
                  type="checkbox"
                  name="create"
                  class="sh-custom-checkbox is-thinner fill"
                  v-model="template_options"
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
                  v-model="template_options"
                  :disabled="inclusions == 'all'"
                  :class="{ 'is-disabled': inclusions == 'all' }"
                  id="schedule"
                  value="schedule"
                />
                <label for="schedule" class="ml-5 is-regular-14-00-17 has-text-theme-black">Schedule</label>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="type == 'save'"
        class="is-pointer padding-30 no-padding-top is-flex is-end align-center"
      >
        <div
          @click.stop="$emit('close-save-template')"
          class="mr-5 button padding-20 is-white is-medium-16-500-19 has-shadow-light-grey"
          style="color:#747891;"
        >Cancel</div>
        <div
          v-if="selected_template"
          @click="update_save_template"
          class="sh-button sh-button--inverted"
          :class="{ 'is-disabled': !selected_template }"
        >Update Template</div>
        <div
          @click="save_as_template"
          class="sh-button sh-button--inverted"
          :class="{ 'is-disabled': !search_keyword }"
          v-else
        >Save as Template</div>
      </div>
      <div v-else class="is-pointer padding-30 no-padding-top is-flex is-end align-center">
        <div
          @click.stop="$emit('close-load-template');"
          class="mr-5 button padding-20 is-white is-medium-16-500-19 has-shadow-light-grey"
          style="color:#747891;"
        >Cancel</div>
        <div
          @click="load_from_template"
          class="sh-button sh-button--inverted"
          :class="{ 'is-disabled': !selected_template }"
        >
          Load Template
          <i v-if="loading_from_template" class="fa fa-spinner fa-spin"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ticketService } from "@/desktop/shared/services/";
import UserTag from "@/desktop/shared/components/tags/user-tag";
import ShareUsersDropdown from "./bulk-watchers-dropdown";
const queryString = require("query-string");

export default {
  props: ["tickets", "type", "callback", "loading_from_template"],
  components: {
    ShareUsersDropdown,
    UserTag
  },
  data() {
    return {
      shared_with: [],
      selected_template: null,
      search_keyword: null,
      all_templates: null,
      inclusions: "all",
      template_options: [
        "assignee",
        "attachments",
        "checklists",
        "priority",
        "watchers",
        "users",
        "teams",
        "schedule",
        "tags",
        "status"
      ],
      members: "me",
      show_templates: false
    };
  },
  mounted() {
    this.initial_data();
  },
  methods: {
    close_modal() {
      this.$emit("close-save-template");
    },
    close_templates() {
      this.show_templates = false;
    },
    async initial_data() {
      let { data } = await ticketService
        .getAll({
          query: "isTemplate=true&pageSize=5"
        })
        .catch(err => this.handleErrors(err));
      this.all_templates = data;
    },

    search_templates() {
      let query = {
        tags: true,
        isTemplate: true,
        q: this.search_keyword,
        pageSize: 5
      };
      _.debounce(async e => {
        let { data } = await ticketService
          .getAll({
            query: `${queryString.stringify(query)}`
          })
          .catch(err => this.handleErrors(err));
        this.all_templates = data;
      }, 500)();
    },
    fill_inclusions() {
      if (this.inclusions == "all") {
        let defaultInclusions = [
          "assignee",
          "attachments",
          "checklists",
          "priority",
          "watchers",
          "users",
          "teams",
          "schedule",
          "tags",
          "status"
        ];

        this.template_options = [...defaultInclusions];
      }
    },
    select_template(list) {
      this.selected_template = list;
      this.search_keyword = this.selected_template.name;
    },
    get_write_users() {
      if (this.members == "selected") {
        return this.shared_with;
      } else if(this.members=="me"){
        return [{uid:this.$store.state.claims.user_id, email:this.$store.state.claims.email }];
      }else {
        return null;
      }
    },

    async save_as_template() {
      await this.update_tickets({
        templateUsers: this.get_write_users(),
        templatePublic: this.members=="all"?true:false,
        action: "saveTemplate"
      }).then(() => {
        this.$emit("close-save-template");
      });
    },
    async update_save_template() {
      await this.update_tickets({
        templateUsers: this.get_write_users(),
        templatePublic: this.members=="all"?true:false,
        action: "saveTemplate",
        templateUid: this.selected_template.uid
      }).then(() => {
        this.$emit("close-save-template");
        this.$toast.show(
          "Template updated successfully",
          "",
          this.$store.state.izitoast_options.appSuccess
        );
      });
    },
    async load_from_template() {
      await this.update_tickets({
        templateUid: this.selected_template.uid
      }).then(() => {
        this.$emit("close-load-template");
      });
    },
    async update_tickets(extraProps) {
      let updateObject = {
        tickets: [],
        strict: true
      };
      let template = {
        action: "loadTemplate",
        name: this.search_keyword,
        include: {
          assignee: this.template_options.includes("assignee"),
          attachments: this.template_options.includes("attachments"),
          checklists: this.template_options.includes("checklists")
            ? {
                asignee: true,
                dueDate: true,
                attachments: true,
                resolved: true
              }
            : false,
          priority: this.template_options.includes("priority"),
          watchers: this.template_options.includes("watchers"),
          users: this.template_options.includes("users"),
          teams: this.template_options.includes("teams"),
          schedule: this.template_options.includes("schedule"),
          tags: this.template_options.includes("tags"),
          status: this.template_options.includes("status")
        }
        // element: {
        //   "uid": this.selected_template.elementUid,
        //   "type": this.selected_template.elementType,
        //   "stage": this.selected_template.stage,
        // },
      };
      template = { ...template, ...extraProps };

      if (this.callback) {
        this.callback(template);
        return;
      }

      updateObject.tickets = this.tickets;
      updateObject.tickets = this.tickets.map(uid => {
        return { ...template, ticketUid: uid };
      });

      return await ticketService
        .bulk_template({ body: updateObject })
        .catch(err => this.handleErrors(err));
    }
  }
};
</script>
<style lang="scss">
.save-template {
  // z-index: 999;
  .template-dropdown {
    position: relative;
    z-index: 100;
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
        max-height: 200px;
        overflow: auto;
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
