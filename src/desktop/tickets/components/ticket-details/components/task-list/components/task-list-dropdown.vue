<template>
  <div>
    <sh-menu
      v-bind="menuData"
      @clicked-outside="active = false"
      :active="active"
      :width="assign_all ? '20rem;' : '25.6rem;'"
      @icon-clicked="iconAction"
      @item-clicked="listAction"
    >
      <sh-icon @click.native="active = !active" :name="'3dots-menu-horizontal'" class="sh-menu-horizontal is-24x24 ml-20 is-pointer" />
      <sh-icon @click.native="active = !active" :name="'3dots-menu'" class="sh-menu-vertical is-24x24 ml-20 is-pointer" />
      <template v-if="assign_all" slot="prepend">
        <div class="field px-10">
          <p class="control has-icons-left has-icons-right">
            <input class="input" type="email" placeholder="Search Users" v-model="searchQuery" />
            <span class="icon is-left is-large">
              <sh-icon :name="'search'" />
            </span>
          </p>
        </div>
      </template>
      <template v-if="assign_all" slot="item" slot-scope="user">
        <user-avatar :user="user.item" :custom_class="'tiny-user-avatar'" :show_tooltip="true"></user-avatar>
        <span
          class="ml-6 sh-dropdown-content__item--text"
          style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;"
          v-if="!is_name_hidden"
          v-username="user.item"
        ></span>
      </template>
    </sh-menu>
    <prompt-modal
      v-if="delete_checklist"
      :name="checklist.name"
      :heading="checklist.name"
      :iconPath="require('@/assets/icons/prompt/delete.svg')"
      :footer="true"
      :cancelString="'Cancel'"
      :confirmString="'Delete'"
      @cancel="$modal.hide(checklist.name)"
      @confirm="delete_current_checklist(checklist)"
      @closed="$modal.hide(checklist.name)"
    >
      <div class="prompt-modal__content__text" slot="content">
        Are you sure you want to delete
        {{ checklist.name.charAt(0).toUpperCase() + checklist.name.slice(1) }}?
      </div>
    </prompt-modal>
    <save-template
      v-if="open_template_modal"
      :checklist="checklist"
      :ticket="ticket"
      :service="service"
      @hide-template-modal="load_from_template = false"
      @closed="open_template_modal = false"
      @update_items="$emit('load_items', $event)"
      @update="$eventHub.$emit('refresh_tasks_data')"
    ></save-template>
    <load-template
      v-if="load_from_template"
      :current_checklist="checklist"
      :items_only="true"
      :ticket="ticket"
      :service="service"
      @hide-template-modal="load_from_template = false"
      @closed="load_from_template = false"
      @update_items="$emit('load_items', $event)"
      @update="$eventHub.$emit('refresh_tasks_data')"
    ></load-template>
  </div>
</template>

<script>
  import shMenu from "@/desktop/shared/components/menu";
  import PromptModal from "@/desktop/shared/components/prompt-modal";
  import SaveTemplate from "./save-template";
  import LoadTemplate from "./load-template";

  export default {
    props: ["ticket", "checklist","service"],
    data() {
      return {
        active: false,
        list: {
          icons: [
            {
              tooltip: { content: `Add task` },
              action: "create_new",
              icon: "add",
              is_disabled: false,
            },
            {
              tooltip: { content: `Edit name` },
              action: "edit_checklist",
              icon: "pen",
              is_disabled: false,
            },
            {
              tooltip: { content: `Duplicate checklist` },
              action: "duplicate_checklist",
              icon: "copy",
              is_disabled: this.checklist.isTemplate ? true : false,
            },
            {
              tooltip: { content: `Delete` },
              action: () => {
                this.active = false;
                this.delete_checklist = true;
                this.$modal.show(this.checklist.uid);
              },
              icon: "trash",
              is_disabled: false,
            },
          ],
          items: [
            {
              icon: "assignee",
              text: "Assign all to...",
              action: () => {
                this.assign_all = true;
              },
              is_disabled: false,
            },
            {
              icon: "assignee",
              text: "Unassign all",
              action: () => {
                this.update_all("assignee", null);
                this.active = false;
              },
              is_disabled: false,
            },
            {
              icon: "checkall",
              text: "Check all",
              action: () => {
                this.update_all("status", "resolved");
                this.active = false;
              },
              is_disabled: false,
            },
            {
              icon: "save-as-template",
              text: "Save as Template",
              action: () => {
                this.open_template_modal = true;
                this.active = false;
              },
              is_disabled: this.checklist.isTemplate ? true : false,
            },
            {
              icon: "magic-load",
              text: "Load from Template",
              action: () => {
                this.load_from_template = true;
                this.active = false;
              },
              is_disabled: this.checklist.isTemplate ? true : false,
            },
          ],
        },
        showDeleteModal: false,
        assign_all: false,
        load_from_template: false,
        open_template_modal: false,
        searchQuery: "",
        delete_checklist: false,
      };
    },
    components: {
      PromptModal,
      SaveTemplate,
      LoadTemplate,
      shMenu,
    },
    mounted() {
      if (this.$route.meta.screen === "mobile") {
        this.list = {
          icons: [],
          items: [
            {
              icon: "add",
              text: "New Task",
              action: () => {
                this.$emit("create_new");
              },
              is_disabled: false,
            },
            {
              icon: "pen",
              text: "Edit",
              action: () => {
                this.$emit("edit_checklist");
                this.active = false;
              },
              is_disabled: false,
            },
            {
              icon: "checkall",
              text: "Check all",
              action: () => {
                this.update_all("status", "resolved");
                this.active = false;
              },
              is_disabled: false,
            },
            {
              icon: "magic-load",
              text: "Load from Template",
              action: () => {
                this.load_from_template = true;
                this.active = false;
              },
              is_disabled: this.checklist.isTemplate ? true : false,
            },
            {
              icon: "trash",
              text: "Delete",
              action: () => {
                if (this.offline) {
                  this.active = false;
                  this.$toast.show("Offline - delete is unavailable", "", this.$store.state.izitoast_options.appError);
                  return;
                }
                this.active = false;
                this.delete_checklist = true;
                this.$modal.show(this.checklist.uid);
              },
              is_disabled: false,
            },
          ],
        };
      }
    },
    watch: {
      active: function(val) {
        this.assign_all = false;
        this.searchQuery = "";
      },
    },
    computed: {
      menuData() {
        if (this.assign_all) {
          return { items: this.searched_users };
        } else {
          return this.list;
        }
      },
      offline() {
        return this.$store.state.is_offline;
      },
      searched_users() {
        if (this.searchQuery.length) {
          return this.users.filter((user) =>
            _.includes((user.first_name ? user.first_name + user.last_name + user.email : user.email).toLowerCase(), this.searchQuery.toLowerCase())
          );
        } else {
          return this.users;
        }
      },
      users() {
        return Object.values(this.$store.getters.state_users).map((d) => {
          d.action = () => this.update_all("assignee", d);
          return d;
        });
      },
    },
    methods: {
      listAction(action) {
        action();
      },
      iconAction(action) {
        if (typeof action === "string") this.$emit(action);
        else action();
      },
      delete_current_checklist(checklist) {
        this.delete_checklist = false;
        this.$modal.hide(checklist.uid);
        this.$store.dispatch("checklist/delete_checklist", {
          id: this.ticket.uid,
          checklist_id: checklist.uid,
        });
      },
      update_all(key, value) {
        this.active = false;
        function updateAll(items) {
          if (!items) {
            return;
          }
          items.forEach((task) => {
            updateAll(task.children);
            task[key] = value;
          });
        }
        updateAll(this.checklist.items);
        if (this.$route.name == "checklist-details" || !this.ticket.uid) {
          this.$store.dispatch("checklist/update_template_checklist", {
            checklist_id: this.checklist.uid,
            body: this.checklist,
          });
        } else {
          this.$store.dispatch("checklist/update_checklist", {
            id: this.ticket.uid,
            checklist_id: this.checklist.uid,
            body: this.checklist,
          });
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .is-24x24 {
    height: 2.4rem;
    width: 2.4rem;
  }
</style>
