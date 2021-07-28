<template>
  <draggable :group="{ name: 'g1' }" class="tasks" :list="items" handle=".handle" tag="ul" @change="checkMove">
    <li v-for="(task, i) in items" :key="task.uid" @mouseenter.stop="hover = task.uid" @mouseleave.stop="hover = -1">
      <div class="is-flex task is-vcentered mt-10 pt-5">
        <div class="is-flex is-vcenter checklist-task-actions">
          <div class="is-flex align-center checklist-task-actions--description" @click="isMobile ? resolve_task(task) : ''">
            <div class="checklist-grab-icon" style="cursor: grab" :class="[hover != task.uid || !ticket.writeAccess ? 'is-vhidden' : null]">
              <sh-icon :name="'drag-move'" class="is-20x20 mr-10 handle" />
            </div>
            <div @mouseenter.prevent="displayStatusHover(task.uid)" @mouseleave.prevent="hideStatusHover" class="is-flex checklist-status ck-status">
              <div @click.prevent.stop="resolve_task(task)">
                <sh-icon class="image is-20x20" :name="`checkbox-status` + (task.status ? `-${task.status}` : ``)"></sh-icon>
              </div>
              <div v-if="!isMobile && status_hover === task.uid" class="is-flex align-center checklist-status--box ck-status--box">
                <div
                  v-for="status in task_status_list"
                  :key="status"
                  v-show="status !== task.status"
                  class="ck-status--box__value"
                  @click.stop="
                    task.status = status;
                    active = -1;
                    update_checklist_data();
                  "
                >
                  <sh-icon class="image is-20x20" :name="`checkbox-status` + (status ? `-${status}` : ``)"></sh-icon>
                </div>
              </div>
            </div>
            <p
              class="is-medium-16-500-19 mx-5"
              :class="{
                'strike-through': task.status == 'rejected' || task.status == 'resolved',
                'has-no-access': ticket && !ticket.writeAccess,
              }"
              @click.stop="isMobile ? resolve_task(task) : (edit_name = task.uid)"
              v-if="edit_name != task.uid"
            >
              {{ task.name }}
            </p>
            <input
              type="text"
              name="name"
              class="input is-inline-input is-medium-16-500-19"
              id="name"
              style="padding:2rem"
              v-else
              v-focus
              v-model="task.name"
              @keyup.enter="edit_task_name(task)"
              v-click-outside="() => (isMobile ? '' : edit_task_name(task))"
            />
          </div>
          <!-- <sh-icon :name="'complete'" class="is-16x16 is-pointer" @click="edit_task_name(task)" v-if="edit_name == task.uid" /> -->
          <div style="display:flex;" class="is-medium-14-500-17 ml-10 align-center checklist-action--icons">
            <div
              v-if="!(isMobile && (task.attachments ? task.attachments : 0) + (added_attachments[task.uid] ? added_attachments[task.uid] : 0) == 0)"
              class="is-flex align-center"
            >
              <sh-icon
                :name="'link-active'"
                class="mr-5 is-pointer is-16x16"
                v-if="show_attachments == task.uid"
                @click.native="
                  show_attachments = -1;
                  show_uploader = false;
                "
              />
              <sh-icon
                :name="'link'"
                class="mr-5 is-pointer is-16x16"
                v-else
                @click.native="
                  show_uploader = false;
                  show_attachments = task.uid;
                "
              />
              <span>{{ (task.attachments ? task.attachments : 0) + (added_attachments[task.uid] ? added_attachments[task.uid] : 0) }}</span>
            </div>
            <p
              class="ml-10 sh-task-user-dropdown"
              v-show="task.assignee || hover === task.uid || show_notes === task.uid"
              :class="{ 'has-assignee': task.assignee }"
            >
              <user-dropdown
                :class="{ 'has-no-access': ticket && !ticket.writeAccess }"
                :existing_user="task.assignee"
                @update-user="update_task($event, task)"
                class="is-medium-16-500-19"
                :pxsize="24"
              ></user-dropdown>
            </p>

            <div
              :style="task.notes ? 'order:-1;margin-right:15px' : 'margin-left:15px;'"
              @mouseenter="task.notes && !isMobile && notes_editing === -1 ? (show_notes = task.uid) : ''"
              @mouseleave="task.notes && !isMobile && notes_editing === -1 ? (show_notes = -1) : ''"
              class="is-flex align-center sh-task-notes"
            >
              <add-notes
                :notes="task.notes"
                :active="show_notes === task.uid"
                :isEditing="!task.notes || notes_editing === task.uid"
                @close="
                  show_notes = -1;
                  notes_editing = -1;
                "
                @submit="
                  notes_editing = -1;
                  show_notes = -1;
                  task.notes = $event;
                  update_checklist_data();
                "
                @delete="
                  notes_editing = -1;
                  show_notes = -1;
                  task.notes = null;
                  update_checklist_data();
                "
              >
                <sh-icon
                  :name="'notes-active'"
                  class=" is-pointer is-18x18"
                  v-if="task.notes"
                  @click.native="
                    isMobile ? '' : (notes_editing = task.uid);
                    show_notes = task.uid;
                  "
                />
                <sh-icon
                  :name="'notes'"
                  class="is-pointer is-30x30"
                  v-show="(show_notes === task.uid || hover === task.uid) && !isMobile"
                  v-else
                  @click.native="show_notes = task.uid"
                />
              </add-notes>
            </div>
            <p
              @click.stop.prevent="
                show_uploader = true;
                show_attachments = task.uid;
              "
              v-show="show_attachments == task.uid"
              v-if="!isMobile"
              class="is-pointer ml-15 checklist-task-upload--icon"
            >
              <sh-icon name="task-atttachment" class="is-pointer" :class="[isMobile ? 'is-24x24' : 'is-30x30']" />
            </p>

            <sh-icon
              v-if="!isMobile"
              name="sub-task"
              class="ml-15 task-list-sub-task is-pointer is-30x30"
              :class="[
                [ticket && !ticket.writeAccess ? 'has-no-access d-none' : ''],
                [isMobile ? 'is-24x24' : 'is-30x30'],
                { 'has-opacity-5': subtask == task.uid },
              ]"
              v-show="active === task.uid || subtask === task.uid || hover === task.uid"
              @click.native="subtask = subtask === -1 ? task.uid : -1"
            />

            <!-- <p
              @click.stop.prevent="edit_task_name(task)"
              v-if="edit_name == task.uid"
              class="tick-background is-pointer mx-20 is-32x32"
            >
              <sh-icon :name="'tick-grey'" class="is-16x16" />
            </p>-->
          </div>
        </div>
        <sh-menu
          :items="menuData"
          @clicked-outside="
            active = -1;
            assign_all = false;
          "
          :data="task"
          :active="active === task.uid"
          :width="assign_all ? '20rem;' : '20rem'"
          class="checlist-task-menu is-flex align-center"
          :class="{
            'has-no-access d-none': ticket && !ticket.writeAccess,
            'is-userdropdown': assign_all,
          }"
          @item-clicked="listAction($event, task, i)"
        >
          <sh-icon
            @click.native="active = active !== -1 ? -1 : task.uid"
            :name="'3dots-menu-horizontal'"
            class="sh-menu-horizontal is-24x24 ml-20 is-pointer"
            v-show="active === task.uid || hover === task.uid"
          />
          <sh-icon @click.native="active = active !== -1 ? -1 : task.uid" :name="'3dots-menu'" class="sh-menu-vertical is-24x24 ml-20 is-pointer" />
          <template v-if="!assign_all" slot="prepend">
            <div class="px-15 pt-10 is-flex ck-status">
              <div class="is-medium-16-500-19">Status:</div>
              <div class="is-flex align-center ck-status--box">
                <div
                  v-for="status in task_status_list"
                  :key="status"
                  v-show="status !== task.status"
                  class="ck-status--box__value"
                  @click="
                    task.status = status;
                    active = -1;
                    update_checklist_data();
                  "
                >
                  <sh-icon class="image is-20x20" :name="`checkbox-status` + (status ? `-${status}` : ``)"></sh-icon>
                </div>
              </div>
            </div>
          </template>
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
        <hr />
      </div>
      <div @click="show_attachments = -1" v-if="show_attachments == task.uid" class="task-list-attachment-backdrop"></div>
      <task-attachments
        v-if="show_attachments == task.uid"
        :task="task"
        :showUploader="show_uploader"
        :upload_more="upload_more"
        :ticket="ticket"
        :service="service"
        :checklist="checklist"
        :style="`padding-left:-${depth * 3}rem;`"
        @added_attachments="
          show_uploader = false;
          added_attachments[task.uid] = added_attachments[task.uid] ? added_attachments[task.uid] : 0;
          added_attachments[task.uid] += $event;
        "
        @update_checklist="
          show_uploader = false;
          update_checklist_data();
          added_attachments[task.uid] = added_attachments[task.uid] ? added_attachments[task.uid] : 0;
          added_attachments[task.uid] += $event;
        "
      ></task-attachments>

      <div v-if="task.children && task.children.length">
        <sub-tasks
          :items="task.children"
          :ticket="ticket"
          :checklist="checklist"
          :depth="depth + 1"
          :service="service"
          @delete_task_from_checklist="delete_task_from_checklist($event, task)"
        ></sub-tasks>
      </div>
      <create-subtask
        :keep_open="true"
        :isMobile="isMobile"
        v-if="subtask == task.uid"
        @close_mobile="subtask = -1"
        class="subtask-create"
        :ticket="ticket"
        @task_created="add_task(task, depth, $event)"
      ></create-subtask>
      <create-subtask
        :keep_open="true"
        :isMobile="isMobile"
        v-if="edit_name == task.uid && isMobile"
        :task="task"
        @touchstart.native.stop
        @close_mobile="edit_name = -1"
        class="subtask-create"
        :ticket="ticket"
        @task_created="update_checklist_data"
      ></create-subtask>
      <prompt-modal
        v-if="delete_this_task == task.uid"
        :name="delete_this_task"
        :heading="$options.filters.truncate(task.name)"
        :iconPath="require('@/assets/icons/prompt/delete.svg')"
        :footer="true"
        :cancelString="'Cancel'"
        :confirmString="'Delete'"
        @cancel="$modal.hide(task.uid)"
        @confirm="delete_task(task)"
        @closed="$modal.hide(task.uid)"
      >
        <div class="prompt-modal__content__text" slot="content">
          Are you sure you want to delete
          {{ (task.name.charAt(0).toUpperCase() + task.name.slice(1)) | truncate(30) }}?
        </div>
      </prompt-modal>
    </li>
  </draggable>
</template>

<script>
  import draggable from "vuedraggable";
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
  import AddNotes from "@/desktop/tickets/shared/components/add-notes";
  import TaskAttachments from "./task-attachments";
  import PromptModal from "@/desktop/shared/components/prompt-modal";
  import CreateSubtask from "./create-subtask.component";
  import shMenu from "@/desktop/shared/components/menu";
  import { set, get } from "idb-keyval";


  export default {
    name: "sub-tasks",
    props: ["items", "depth", "ticket", "checklist", "keep_open","service"],

    data() {
      return {
        status_hover: -1,
        task_status_list: [null, "resolved", "rejected", "onHold", "inProgress"],
        show_attachments: -1,
        delete_this_task: -1,
        added_attachments: {},
        upload_more: false,
        hover: -1,
        edit_name: -1,
        active: -1,
        subtask: -1,
        show_notes: -1,
        notes_editing: -1,
        add_new_attachments: false,
        show_uploader: false,
        assign_all: false,
        searchQuery: "",
        isMobile: false,
        menu_items: null,
        status_hover_timeout: null,
      };
    },
    components: {
      draggable,
      UserDropdown,
      TaskAttachments,
      PromptModal,
      CreateSubtask,
      shMenu,
      AddNotes,
    },
    created() {
      this.isMobile = this.$route.meta.screen === "mobile";
      get("attachments").then((offline_attachments) => {
        this.items.forEach(item => {
          if(offline_attachments[this.ticket.uid]){
            this.$set(this.added_attachments,item.uid,Object.values(offline_attachments[this.ticket.uid]).filter(d=>this.checklist.uid === d.checklist_id&&d.item_id ===item.uid).length);
          }
        });
      });
      this.menu_items = [
        {
          text: "Add sub task",
          action: (task, i) => {
            this.active = -1;
            this.subtask = task.uid;
          },
          icon: "add",
        },
        {
          text: "Edit",
          action: (task, i) => {
            this.edit_name = task.uid;
            this.active = -1;
          },
          icon: "edit-pen",
        },
      ];
      if (!this.isMobile) {
        this.menu_items.push(
          {
            icon: "assignee",
            text: "Assign all to...",
            action: (task) => {
              this.assign_all = true;
            },
          },
          {
            icon: "assignee",
            text: "Unassign all",
            action: (task) => {
              this.update_all("assignee", null, task);
              this.active = -1;
            },
          },
          {
            icon: "checkall",
            text: "Check all",
            action: (task) => {
              this.update_all("status", "resolved", task);
              this.active = -1;
            },
          }
        );
      } else {
          this.menu_items.push(
          {
            icon: "upload",
            text: "Upload Attachments",
            action: (task) => {
              this.show_uploader = true;
              this.show_attachments = task.uid;
              this.active = -1;
            },
          });
        this.menu_items.push(
          {
            icon: "notes-icon",
            text: (task) => (task.notes ? "Edit / Delete Notes" : "Add Notes"),
            action: (task) => {
              this.show_notes = task.uid;
              this.notes_editing = task.uid;
              this.active = -1;
            },
          }
        );
      }
      this.menu_items.push({
        text: "Delete",
        action: (task, i) => {
          if (this.offline) {
            this.active = -1;
            this.$toast.show("Offline - delete is unavailable", "", this.$store.state.izitoast_options.appError);
            return;
          }
          this.active = -1;
          this.delete_this_task = task.uid;
          this.$modal.show(task.uid);
        },
        icon: "delete-2",
      });
    },
    computed: {
      indent() {
        return {
          transform: `translate(${this.depth * 50}px)`,
          width: 100 % -((this.depth > 0 ? this.depth * 50 : 50) + "px"),
        };
      },
      offline() {
        return this.$store.state.is_offline;
      },
      menuData() {
        if (this.assign_all) {
          return this.searched_users;
        } else {
          return this.menu_items;
        }
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
          d.action = (task) => this.update_all("assignee", d, task);
          return d;
        });
      },
    },

    methods: {
      displayStatusHover(id) {
        clearTimeout(this.status_hover_timeout);
        this.status_hover_timeout = setTimeout(() => {
          this.status_hover = id;
        }, 500);
      },
      hideStatusHover() {
        clearTimeout(this.status_hover_timeout);
        this.status_hover = -1;
      },
      listAction(action, task, i) {
        action(task, i);
      },
      async add_task(task, depth, task_created) {
        this.checklist.organization = this.$store.state.current_organization.uid;
        task.children && task.children.length ? (task.children = [...task.children]) : this.$set(task, "children", []);
        task.children.push(task_created);
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
      update_task(user, task) {
        task["assignee"] = user?{uid:user.uid}:user;
        this.update_checklist_data();
      },
      resolve_task(task) {
        // task.resolved = !task.resolved;
        if (task.status == "resolved") {
          task.status = "rejected";
        } else if (task.status == "rejected") {
          task.status = null;
        } else {
          task.status = "resolved";
        }
        this.update_checklist_data();
      },
      update_checklist_data() {
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
      edit_task_name(task) {
        if (task.name.length <= 1) {
          this.$toast.show("Task name can not be single letter", "", this.$store.state.izitoast_options.appWarning);
          return;
        }
        this.update_checklist_data();
        this.edit_name = -1;
      },
      delete_task(task) {
        this.$emit("delete_task_from_checklist", task);
      },
      delete_task_from_checklist(childTask, parentTask) {
        this.$set(
          parentTask,
          "children",
          parentTask.children.filter((task) => task.uid !== childTask.uid)
        );
        this.update_checklist_data();
      },
      checkMove(e) {
        this.update_checklist_data();
      },
      update_all(key, value, task) {
        this.assign_all = false;
        this.active = -1;
        function updateAll(items) {
          if (!items) {
            return;
          }
          items.forEach((task) => {
            updateAll(task.children);
            task[key] = value;
          });
        }
        updateAll(task.children);
        task[key] = value;
        this.update_checklist_data();
      },
    },
  };
</script>

<style lang="scss">
  .input {
    &:focus {
      border: none !important;
      box-shadow: none;
    }
  }

  .sh-task-user-dropdown .user-assignee {
    left: 0;
  }

  .checklist-task-actions {
    min-height: 40px;
    &--description {
      max-width: 660px;
    }
  }
  .ck-status {
    align-items: center;
    cursor: pointer;
    &--box {
      svg {
        margin: 0px 5px;
      }
    }
  }

  .checlist-task-menu {
    .ck-status {
      padding-bottom: 15px;
      border-bottom: 1px solid #e6e6e6;
    }
  }

  @include for-size(portrait-tablets) {
    .ck-status {
      flex-flow: column;
      align-items: flex-start;
      &--box {
        margin-top: 10px;
        svg {
          margin: 0;
          margin-right: 15px;
        }
      }
    }
  }
  .checklist-status {
    position: relative;
    &--box {
      position: absolute;
      z-index: 10;
      top: 17px;
      left: 5px;
      padding: 5px;
      height: 40px;
      border-radius: 6px;
      box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
      background-color: white;
    }
  }
</style>
