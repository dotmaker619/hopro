<template>
  <div
    class="is-flex is-between pl-35 py-20"
    :class="[ticket && !ticket.writeAccess ? 'is-not-allowed' : null]"
  >
    <p
      :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
      class="is-medium-16-500-19 has-text-theme-grey is-pointer has-opacity-8"
      @click="create_new = true"
      v-if="!create_new"
    >
      <i class="fas fa-plus mr-5"></i> New Task
    </p>

    <div
      class="is-flex is-vcenter checklist-input-field--create"
      v-if="create_new"
      v-click-outside="() => (create_new = false)"
    >
      <div class="is-flex is-vcenter">
        <sh-icon
          :name="'close'"
          class="is-16x16 is-pointer"
          @click.native="create_new = false"
        ></sh-icon>

        <div class="ml-20 input-div">
          <input
            type="text "
            class="input custom-input"
            id="custom-task-input"
            placeholder="Create New Task"
            v-model="new_task.name"
            v-focus
            @keyup.enter="create_new_task"
            @keyup.esc.stop="create_new = false"
          />
        </div>
        <p class="ml-10">
          <user-dropdown
            :existing_user="new_task.assignee"
            @update-user="new_task.assignee = $event"
            @unassigne_assignee="new_task.assignee = null"
            :pxsize="32"
          ></user-dropdown>
        </p>
      </div>
      <div @click="create_new_task" class="save-button is-pointer is-flex">
        <sh-icon
          :name="'ticket-show-tick'"
          class="is-16x16 mr-5 is-pointer"
        ></sh-icon>
        Save
      </div>
    </div>
  </div>
</template>
<script>
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
  import { v4 as uuidv4 } from "uuid";

  export default {
    props: ["ticket", "keep_open","isMobile","task"],
    components: {
      UserDropdown,
    },
    data() {
      return {
        create_new: false,
        new_task: {
          name: "",
          assignee: null,
          dueDate: null,
          resolved: false,
          status:null
        },
      };
    },
    computed:{
      offline() {
        return this.$store.state.is_offline;
      },
    },
    watch:{
      create_new:function(val){
        if(!val&&this.isMobile){
          this.$emit("close_mobile");
        }
      }
    },
    created() {
      this.create_new = this.keep_open;
      if(this.task){
        this.new_task=this.task;
      }
    },
    methods: {
      create_new_task() {
        if (this.new_task.name.length <= 1) {
          this.$toast.show("Task name can not be single letter", "", this.$store.state.izitoast_options.appWarning);
          return;
        }

        this.new_task.uid=this.offline&&!this.new_task.uid?uuidv4():undefined
        
        if(this.isMobile){
          this.create_new=false;
        }
        this.$emit("task_created", this.new_task);
        this.new_task = {
          name: "",
          assignee: null,
          dueDate: null,
          resolved: false,
          status:null
        };
      },
    },
  };
</script>
<style lang="scss" scoped>
.tick-background {
  height: 3.2rem;
  width: 3.2rem;
  background: white;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 1px 3px 6px 0px #ddd;
  margin-bottom: 0.5rem;
}
.input-div {
  border-bottom: 1px solid #ccc;
}

#custom-task-input {
  border: 0;
  width: 30rem;
}

.save-button {
  font-size: 14px;
  font-weight: 600;
  padding: 0.75rem 3rem;
  border-radius: 6px;
  box-shadow: 0 2px 5px 0 rgba(37, 133, 211, 0.3);
  border: solid 1px #2585d3;
  background-color: var(--white);
  line-height: 1.21;
  color: #2585d3;
}
</style>
