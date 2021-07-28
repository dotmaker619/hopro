<template>
  <div class="checklist-item" @mouseenter="hover = true" @mouseleave="hover = false">
    <div v-if="checklist">
      <div @click="isMobile ? (active = !active) : ''" class="is-flex is-vcenter checklist-item--heading" style="height:2rem">
        <div class="is-flex is-vcenter checklist-item--header">
          <div class="is-narrow no-padding" @click.stop="active = !active">
            <img src="@/assets/icons/expand-right.svg" class="image is-pointer" v-if="active" style="transform: rotate(90deg)" />
            <img src="@/assets/icons/expand-right.svg" class="image is-pointer" v-else />
          </div>
          <span
            class="is-medium-18-500-22"
            @click="ticket.writeAccess && !isMobile ? (edit_name = true) : null"
            v-if="!edit_name"
            :class="{ 'is-default': !ticket.writeAccess }"
            >{{ checklist.name }}</span
          >
          <input
            v-click-outside="() => (change_checklist_name(checklist.name), (edit_name = false))"
            type="text"
            class="is-inline-input is-medium-18-500-22"
            v-focus
            v-model="checklist.name"
            v-if="edit_name"
            @keyup.enter="
              change_checklist_name(checklist.name);
              edit_name = false;
            "
            @keyup.esc.stop="edit_name = false"
          />
          <span class="has-text-grey ml-10 is-medium-14-500-17 has-opacity-half">
            ({{ (resolved_tasks && resolved_tasks.length) || 0 }}/{{ (flatten_list && flatten_list.length) || 0 }})
          </span>
        </div>
        <div
          @click.stop
          class="dropdown"
          v-if="ticket.writeAccess && checklist.uid"
          :class="{
            'is-hidden':
              !hover &&
              (!$refs ||
                !$refs[`checklist${checklist.uid}`] ||
                (!$refs[`checklist${checklist.uid}`].active &&
                  !$refs[`checklist${checklist.uid}`].load_from_template &&
                  !$refs[`checklist${checklist.uid}`].open_template_modal &&
                  !$refs[`checklist${checklist.uid}`].assign_all)),
          }"
        >
          <task-list-dropdown
            @create_new="create_new = true"
            :ref="`checklist${checklist.uid}`"
            class="ml-10 is-pointer"
            @load_items="refresh_details"
            :ticket="ticket"
            :service="service"
            @open_save_modal="open_template_modal = true"
            @edit_checklist="edit_name = true"
            :checklist="checklist"
            @duplicate_checklist="$emit('duplicate_checklist', checklist)"
            @checklist_assignee_update="refresh_details"
          ></task-list-dropdown>
        </div>
      </div>
      <div v-if="active" class="checklist-task-list">
        <hr class="checklist-divider" />
        <sub-tasks
          :create_new="create_new"
          :items="checklist.items"
          :ticket="ticket"
          :checklist="checklist"
          :service="service"
          @add_task_to_checklist="add_task"
          @update_checklist_data="update_checklist"
          @delete_task_from_checklist="delete_task"
          @reorder_tasks="update_checklist_tasks"
          :depth="0"
          :keep_open="keep_open"
        ></sub-tasks>
        <create-subtask
          :keep_open="keep_open"
          class="checklist-subtask--create"
          :ticket="ticket"
          :isMobile="isMobile"
          @task_created="add_task"
        ></create-subtask>
      </div>
    </div>
  </div>
</template>

<script>
  import SubTasks from "./subtasks-component";
  import TaskListDropdown from "./task-list-dropdown";
  import CreateSubtask from "./create-subtask.component";

  export default {
    props: ["checklist", "ticket", "keep_open","service"],

    data() {
      return {
        edit_name: false,
        hover: false,
        active: false,
        edit_dropdown: -1,
        delete_checklist: false,
        open_template_modal: false,
        create_new: false,
        isMobile: false,
      };
    },

    computed: {
      resolved_tasks() {
        if (this.flatten_list) return this.flatten_list.filter((item) => item.status == "resolved");
      },
      flatten_list() {
        if (this.checklist.items) return this.flatten(this.checklist.items);
      },
    },
    created() {
      this.active = this.keep_open;
      this.isMobile = this.$route.meta.screen === "mobile";
      this.$emit("created",this);
    },

    components: {
      SubTasks,
      TaskListDropdown,
      CreateSubtask,
    },
    methods: {
      flatten(items, obj, arr = []) {
        if (!items) return obj;
        items.forEach((item) => {
          let t = this.flatten(item.children, item, arr);
          if (!Array.isArray(t)) {
            arr.push(t);
          } else {
            arr.push(item);
          }
        });
        return arr;
      },
      async add_task(task) {
        this.checklist.organization = this.$store.state.current_organization.uid;
        this.checklist.items && this.checklist.items.length ? (this.checklist.items = [...this.checklist.items]) : (this.checklist.items = []);
        this.checklist.items.push(task);
        if (this.$route.name == "checklist-details" || !this.ticket.uid) {
          await this.$store.dispatch("checklist/update_template_checklist", {
            checklist_id: this.checklist.uid,
            body: this.checklist,
          });
        } else {
          await this.$store.dispatch("checklist/update_checklist", {
            id: this.ticket.uid,
            checklist_id: this.checklist.uid,
            body: this.checklist,
          });
        }
        this.$store.dispatch("checklist/add_checklists", { id: this.ticket.uid });
      },

      delete_task(childTask) {
        this.$set(
          this.checklist,
          "items",
          this.checklist.items.filter((task) => task.uid !== childTask.uid)
        );
        this.update_checklist_info(this.checklist);
      },

      change_checklist_name(name) {
        let checklist_to_update = this.checklist;
        checklist_to_update.name = name;
        this.update_checklist_info(checklist_to_update);
      },

      update_checklist(task) {
        let tasks_to_update = this.checklist.items;
        for (let i in tasks_to_update) {
          if (tasks_to_update[i] && tasks_to_update[i].uid == task.uid) {
            tasks_to_update[i] = task;
          }
        }
        this.update_checklist_tasks(tasks_to_update);
      },
      async update_checklist_info(checklist) {
        if (this.$route.name == "checklist-details" || !this.ticket.uid) {
          await this.$store.dispatch("checklist/update_template_checklist", {
            checklist_id: this.checklist.uid,
            body: this.checklist,
          });
        } else {
          this.$store.dispatch("checklist/update_checklist", {
            id: this.ticket.uid,
            checklist_id: this.checklist.uid,
            body: checklist,
          });
        }
      },
      async update_checklist_tasks(tasks) {
        if (this.$route.name == "checklist-details" || !this.ticket.uid) {
          await this.$store.dispatch("checklist/update_template_checklist", {
            checklist_id: this.checklist.uid,
            body: {
              items: tasks,
            },
          });
        } else {
          this.$store.dispatch("checklist/update_checklist", {
            id: this.ticket.uid,
            checklist_id: this.checklist.uid,
            body: {
              items: tasks,
            },
          });
        }
      },
      removeByAttr(arr, attr, value) {
        var i = arr.length;
        while (i--) {
          if (arr[i] && arr[i].hasOwnProperty(attr) && arguments.length > 2 && arr[i][attr] === value) {
            arr.splice(i, 1);
          }
        }
        return arr;
      },
    },
  };
</script>

//
<style lang="scss">
  .checklist-divider {
    border-radius: 10px;
    box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
    margin-left: 8rem;
  }
  .strike-through {
    text-decoration: line-through;
  }
  .sh-custom-checkbox {
    &.is-green {
      margin: auto;
      &::before {
        border: 2px solid #ddd;
        height: 2.6rem;
        width: 2.6rem;
        border-radius: 0.5rem;
      }
      &:checked::after {
        left: 10px;
        top: 7px;
        width: 6px;
        height: 10px;
        border: solid $white;
        border-width: 0px 2px 2px 0px;
        transform: rotate(45deg);
      }
      &:checked::before {
        border: none;
        background-color: #3dd598;
      }
    }
  }

  .is-20x20 {
    height: 20px;
    width: 20px;
  }

  .is-inline-input {
    width: min-content;
    border: none;
    box-shadow: none;
    padding: 0;
    background-color: transparent;
  }
  :focus {
    border: none;
    outline: transparent auto 0px !important;
  }
</style>
