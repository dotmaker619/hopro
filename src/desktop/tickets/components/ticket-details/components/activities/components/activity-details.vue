<template>
  <div v-if="activity.verb == 'TICKET_ASSIGNMENT_CHANGED'" class="is-flex is-vcenter">
    <div v-if="activity.meta.assignee.from && $store.getters.state_users[activity.meta.assignee.from]" class="is-flex is-vcenter">
      <span class="is-regular-14-500-17 mr-10">from</span>
      <div>
        <user-avatar :user="$store.getters.state_users[activity.meta.assignee.from]" :pxsize="24" :custom_class="'tiny-user-avatar'"></user-avatar>
      </div>
      <p class="is-medium-14-500-17 ml-5" v-username="$store.getters.state_users[activity.meta.assignee.from]"></p>
    </div>
    <div v-if="activity.meta.assignee.to && $store.getters.state_users[activity.meta.assignee.to]" class="is-flex is-vcenter">
      <span class="is-regular-14-500-17 ml-10 mr-10">to</span>
      <div>
        <user-avatar :user="$store.getters.state_users[activity.meta.assignee.to]" :pxsize="24" :custom_class="'tiny-user-avatar'"></user-avatar>
      </div>
      <p class="is-medium-14-500-17 ml-5" v-username="$store.getters.state_users[activity.meta.assignee.to]"></p>
    </div>
  </div>
  <div v-else-if="activity.verb == 'TICKET_UNASSIGNED'">
    <div v-if="activity.meta.assignee.from" class="is-flex is-vcenter">
      <div>
        <user-avatar :user="$store.getters.state_users[activity.meta.assignee.from]" :pxsize="24" :custom_class="'tiny-user-avatar'"></user-avatar>
      </div>
      <p class="is-medium-14-500-17 ml-5" v-username="$store.getters.state_users[activity.meta.assignee.from]"></p>
    </div>
  </div>
  <div v-else-if="activity.verb == 'TICKET_ASSIGNED'">
    <div v-if="activity.meta.assignee.to" class="is-flex is-vcenter">
      <div>
        <user-avatar :user="$store.getters.state_users[activity.meta.assignee.to]" :pxsize="24" :custom_class="'tiny-user-avatar'"></user-avatar>
      </div>
      <p class="is-medium-14-500-17 ml-5" v-username="$store.getters.state_users[activity.meta.assignee.to]"></p>
    </div>
  </div>
  <div v-else-if="activity.verb == 'TICKET_PRIORITY_CHANGED'">
    <div class="is-flex is-vcenter" v-if="activity.meta.priority.from && activity.meta.priority.to">
      <span class="is-regular-14-500-17 mr-10">from</span>
      <sh-icon :name="'priority-' + activity.meta.priority.from" class="is-18x18"></sh-icon>
      <span class="mx-10 is-medium-14-500-17 is-capitalized">{{ priority_values[activity.meta.priority.from] }}</span>
      <span class="is-regular-14-500-17 mr-10">to</span>
      <sh-icon :name="'priority-' + activity.meta.priority.to" class="is-18x18"></sh-icon>
      <span class="is-medium-14-500-17 mx-10 is-capitalized">{{ priority_values[activity.meta.priority.to] }}</span>
    </div>
  </div>
  <div v-else-if="activity.verb == 'DUE_DATE_CHANGED'">
    <div class="is-flex is-vcenter">
      <sh-icon :name="is_old_overdue ? 'due-date-danger' : 'due-date-dark'" class="image is-16x16 mr-5" v-if="activity.meta.dueDate.from"></sh-icon>
      <span class="is-medium-14-500-17 is-capitalized" v-if="activity.meta.dueDate.from">{{
        new Date(activity.meta.dueDate.from).toLocaleDateString()
      }}</span>
      <span class="mr-10 is-regular-14-500-17 " :class="[activity.meta.dueDate.from ? 'ml-10' : 'ml-5']">to</span>
      <sh-icon :name="is_new_overdue ? 'due-date-danger' : 'due-date-dark'" class="image is-16x16 mr-5"></sh-icon>
      <span class="is-medium-14-500-17 is-capitalized">{{ new Date(activity.meta.dueDate.to).toLocaleDateString() }}</span>
    </div>
  </div>
  <div v-else-if="activity.verb == 'ATTACHMENT_DELETED'">
    <div class="is-flex is-vcenter">
      <span class="is-medium-14-500-17 is-capitalized"
        >Deleted {{ activity.meta.attachments.count }} {{ activity.meta.attachments.count > 1 ? "attachments" : "attachment" }}</span
      >
    </div>
  </div>
  <div v-else-if="activity.verb == 'ATTACHMENT_UPLOADED'">
    <div class="is-flex is-vcenter">
      <span class="is-medium-14-500-17 is-capitalized"
        >{{ activity.meta.attachments.count }} {{ activity.meta.attachments.count > 1 ? "attachments" : "attachment" }} added</span
      >
    </div>
  </div>
  <div v-else-if="activity.verb == 'MULTIPLE_ATTACHMENT_UPLOADED'">
    <div class="is-flex is-vcenter">
      <span class="is-medium-14-500-17 is-capitalized">{{ activity.meta.attachments.count }} attachments added</span>
    </div>
  </div>
  <div v-else-if="activity.verb == 'TICKET_STATUS_CHANGED'">
    <div class="is-flex is-vcenter">
      <span class="is-regular-14-500-17 mr-10">from</span>
      <p class="status-pointer" v-if="activity.meta.status.from" :class="status_bg_classes[activity.meta.status.from]"></p>
      <span v-if="activity.meta.status.from" class="mx-10 is-medium-14-500-17 is-capitalized">{{ status_values[activity.meta.status.from] }}</span>
      <span class="mr-10 is-regular-14-500-17" v-if="activity.meta.status.from">to</span>
      <p class="status-pointer" v-if="activity.meta.status.to" :class="status_bg_classes[activity.meta.status.to]"></p>
      <span v-if="activity.meta.status.to" class="mx-10 is-medium-14-500-17 is-capitalized">{{ status_values[activity.meta.status.to] }}</span>
    </div>
  </div>
</template>

<script>
  import { DateTime } from "luxon";

  export default {
    props: ["activity"],
    data() {
      return {
        status_values: {
          1: "pending",
          2: "in progress",
          3: "resolved",
          4: "closed",
          5: "rejected",
        },
        priority_values: {
          1: "Critical",
          2: "High",
          3: "Medium",
          4: "Low",
        },
        status_bg_classes: {
          "1": "is-bg-yellow",
          "2": "is-bg-green",
          "3": "is-bg-blue",
          "4": "is-bg-light-grey",
          "5": "is-bg-red",
        },
        priority_bg_classes: {
          "1": "is-bg-critical",
          "2": "is-bg-high",
          "3": "is-bg-medium",
          "4": "is-bg-low",
        },
      };
    },

    computed: {
      is_old_overdue() {
        if (!this.activity.meta.dueDate.from) return false;
        let givenDate = new DateTime.fromISO(this.activity.meta.dueDate.from);
        let today = new DateTime.local();
        return Math.floor(givenDate.diff(today, "days").days) > 0;
      },
      is_new_overdue() {
        if (!this.activity.meta.dueDate.to) return false;
        let givenDate = new DateTime.fromISO(this.activity.meta.dueDate.to);
        let today = new DateTime.local();
        return Math.floor(givenDate.diff(today, "days").days) > 0;
      },
    },
  };
</script>
