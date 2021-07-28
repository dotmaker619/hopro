<template>
  <div class="sh-tasklist-section">
    <div v-if="active">
      <skeleton-loading class="mt-40" v-for="j in [1, 2, 3, 4, 5]" :key="j">
        <row>
          <column :span="24" :gutter="10">
            <square-skeleton
              :boxProperties="{
                width: '100%',
                height: '10px',
              }"
            ></square-skeleton>
          </column>
        </row>
        <row class="mt-10" v-for="i in [1, 2]" :key="i" :justify="'flex-end'">
          <column :span="22" :gutter="10">
            <square-skeleton
              :boxProperties="{
                width: '100%',
                height: '15px',
              }"
            ></square-skeleton>
          </column>
        </row>
      </skeleton-loading>
    </div>
    <div class="ml-20 checklist-with-value" v-else-if="reverseAllChecklist && reverseAllChecklist.length">
      <div class="progress is-flex mb-10 is-vcenter">
        <p class="progress-percent is-medium-16-500-19 has-opacity-7">{{ progress }}%</p>
        <div class="progress-bar">
          <p class="progress-bar--completed" :style="`width:${progress}%`"></p>
        </div>
      </div>
      <div @click="create_new_checklist()" class="checklist-actions-mobile">
        <i class="fa fa-plus"></i>
      </div>

      <div :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]" class="mb-30 ml-5 checklist-actions--create">
        <span @click="create_new_checklist()" class="is-medium-16-500-19 is-pointer has-opacity-8" style="color:#5c7ef7">
          <i class="fas fa-plus mr-15"></i> New Checklist
        </span>
        <span class="mx-10 sh-medium-header">or</span>
        <load-template
          :service="service"
          :ticket="ticket"
          @update="get_checklist()"
          isButton="true"
          @hide-template-modal="load_from_template = false"
        ></load-template>
      </div>

      <div class="checklist-list" v-if="reverseAllChecklist && reverseAllChecklist.length">
        <div v-for="(checklist, i) in reverseAllChecklist" :key="checklist.uid">
          <checklists
            :checklist="checklist"
            :is_ticket_without_checklists="is_ticket_without_checklists"
            :ticket="ticket"
            :service="service"
            @remove_checklist="delete_checklist"
            @added_first_checklist="get_checklist()"
            @refetch_checklists="get_checklist()"
            @duplicate_checklist="create_duplicate_checklist"
            :keep_open="i == 0 && create_new"
          ></checklists>
        </div>
      </div>
    </div>
    <div v-else class="no-result">
      <img src="@/assets/illustrations/no-task-illustration.svg" alt />
      <hr />
      <div style="text-align: center;">
        <div class="mt-10">
          <p class="sh-text-normal-22 mb-10">No Task List</p>
          <p class="sh-text-normal-22 task-no-result-description">
            Create a list of task to keep track of the changes and have attachments added to each task. Moreover template them and reuse it for later
            use.
          </p>
        </div>
        <div class="load-button button ml-auto mr-auto mt-20">
          <p class="is-flex">
            <span @click="create_new_checklist()" class="is-regular-16-00-20">Create Checklist</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import checklists from "./components/checklist-component";
  import LoadTemplate from "./components/load-template";
  import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";

  export default {
    props: ["ticket", "channel", "service"],
    data() {
      return {
        active: false,
        load_from_template: false,
        tasks: [],
        is_ticket_without_checklists: false,
        open_new_task: false,
        edit_name: false,
        new_active: false,
        show_create_new: false,
        new_task_name: "",
        new_task: {
          name: "Checklist",
          isTemplate: false,
          internal: false,
          items: [],
          organization: this.$store.state.current_organization.uid,
        },
      };
    },
    components: {
      checklists,
      LoadTemplate,
      UserDropdown,
    },
    computed: {
      ...mapGetters("checklist", ["reverseAllChecklist"]),

      ...mapState("checklist", ["allChecklists"]),

      checked_items() {
        return (this.ticket.checklistsStats && this.ticket.checklistsStats.checkedItems) || 0;
      },

      total_items() {
        return (this.ticket.checklistsStats && this.ticket.checklistsStats.totalItems) || 0;
      },
      progress() {
        return Math.round((this.checked_items / this.total_items) * 100) || 0;
      },
    },
    created() {
      this.$store.dispatch("checklist/initialize_service", this.service);
      this.$eventHub.$on("refresh_tasks_data", this.get_checklist);
      this.get_checklist();
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh_tasks_data", this.get_checklist);
    },
    mounted() {
      if (this.channel) {
        console.log("channel");
        this.channel.bind("CHECKLIST_UPDATED", (data) => {
          this.realTimeChecklistUpdate(data);
        });
        this.channel.bind("CHECKLIST_ADDED", (data) => {
          this.realTimeChecklistUpdate(data);
        });

        this.channel.bind("CHECKLIST_REMOVED", (data) => {
          for (const i in data.checklists) {
            this.delete_checklist(data.checklists[i]);
          }
        });
      }
    },

    methods: {
      async get_checklist() {
        this.active = true;
        await this.$store.dispatch("checklist/add_checklists", {
          id: this.ticket.uid,
        });
        this.active = false;
      },
      async create_new_task() {
        if (this.new_task_name.length <= 1) {
          this.$toast.show("Task name can not be single letter", "", this.$store.state.izitoast_options.appWarning);
          return;
        }
        let new_task = {
          name: this.new_task_name,
          assignee: this.$refs.task_assignee.selected_user,
          dueDate: null,
          resolved: false,
        };

        await this.create_new_checklist(new_task);
        this.new_task_name = null;
      },

      async create_new_checklist(task) {
        if (this.$route.meta.screen !== "mobile") this.create_new = true;
        let checklist = this.new_task;
        checklist.organization = this.$store.state.current_organization.uid;
        checklist.items = task ? [task] : [];
        this.$store.dispatch("checklist/add_new_checklist", {
          id: this.ticket.uid,
          body: checklist,
        });
      },

      async create_duplicate_checklist(checklist) {
        let duplicate_checklist = JSON.parse(JSON.stringify(checklist));
        this.$store.dispatch("checklist/add_new_checklist", {
          id: this.ticket.uid,
          body: duplicate_checklist,
        });
        this.$toast.show("Checklist duplicated", "", this.$store.state.izitoast_options.appSuccess);
      },
      delete_checklist(checklist_uid) {
        this.$store.dispatch("checklist/delete_checklist", {
          id: this.ticket.uid,
          checklist_id: checklist_uid,
        });
      },

      async realTimeChecklistUpdate(data) {
        // if (data.uids && data.uids.includes(this.ticket.uid)) {
        let allcheck = await this.service.get_checklist({
          id: this.ticket.uid,
          query: this.$store.state.current_organization.uid,
        });

        let recieved_checklists = allcheck.data;

        for (const i in recieved_checklists) {
          this.$store.dispatch("checklist/update_realtime_checklist", {
            id: this.ticket.uid,
            body: recieved_checklists[i],
          });
          // }
        }
      },
    },
  };
</script>

<style lang="scss">
  .checklist-actions-mobile {
    display: none;
  }
  .progress {
    height: 5rem;
    &-bar {
      margin-left: 1rem;
      width: 100%;
      height: 7px;
      background: #ddd;
      border-radius: 0.5rem;
      position: relative;
      &--completed {
        background-color: #3dd598;
        height: 7px;
        border-radius: 0.5rem;
        position: absolute;
        left: 0;
      }
    }
  }

  .sh-tasklist-section {
    padding: 4rem 5rem;
  }

  .sh-menu-vertical {
    display: none;
  }

  .create_checklist_dropdown {
    position: relative;
    font-size: initial;
    .dropdown_content {
      position: absolute;
      background: white;
      z-index: 1000;
      border: 1px solid #eee;
      border-radius: 1rem;
      font-size: 1.4rem;
      &--item {
        display: flex;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #eee;
        cursor: pointer;
      }
    }
  }

  .checklist-with-value .sh-dropdown-content {
    padding: 0;
    padding-top: 5px;
  }

  .checklist-input-field--create {
    width: 100%;
    justify-content: space-between;
  }

  .checklist-task-list {
    margin-left: -2.5rem;
    .tasks,
    .subtask-create {
      padding-left: 3rem;
    }
    .checklist-subtask--create {
      padding-left: 6.5rem;
    }
  }
  .checklist-list > div {
    margin-bottom: 30px;
  }

  .no-result {
    width: 100%;
    align-items: center;
    display: flex;
    flex-direction: column;
    hr {
      border-radius: 10px;
      box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
      position: relative;
      top: -70px;
      width: 80rem;
    }
    img {
      width: 261.2px;
      height: 196.8px;
      z-index: 1;
    }
    .sh-text-normal-22 {
      opacity: 0.8;
      font-size: 20px;
      font-weight: 500;
      line-height: 1.2;
      text-align: center;
      color: #171e48;
    }
    .load-button {
      font-size: 14px;
      font-weight: 600;
      padding: 2rem;
      border-radius: 6px;
      box-shadow: 0 2px 5px 0 rgba(37, 133, 211, 0.3);
      border: solid 1px #2585d3;
      background-color: var(--white);
      line-height: 1.21;
      color: #2585d3;
    }

    .task-no-result-description {
      width: 45rem;
      font-size: 1.2rem;
      line-height: 2rem;
    }
  }
</style>
