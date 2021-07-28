<template>
  <div class="sh-list__item padding-20">
    <div class="columns">
      <div class="column is-narrow is-pointer" @click="active=!active">
        <i class="fas fa-chevron-right"></i>
      </div>
      <div class="column is-2">
        <div style="display: flex; flex-direction: column">
          <span
            style="text-transform: uppercase; color: #171E48; font-weight: 700"
          >{{item.task_name}}</span>
          <span>{{item.uid}}</span>
        </div>
      </div>
      <div class="column is-3">
        <info-block
          :info="{
                  'name': `${user.first_name} ${user.last_name}`, 
                  'top': 'User', 
                  'image': user.display_picture,
                    type: 'userManagement'
                }"
        ></info-block>
      </div>
      <div class="column is-3">
        <p class="sh-text-normal-14 has-text-grey">Last Updated</p>
        <p
          class="sh-medium-header is-marginless is-capitalized no-whitespace-wrap"
        >{{item.updated_at | dateFormat}}</p>
      </div>
      <div class="column is-2">
        <p class="sh-text-normal-14 has-text-grey">Step</p>
        <p
          class="sh-medium-header is-marginless is-capitalized"
        >{{item.task_step && item.task_step.toUpperCase()}}</p>
      </div>
      <div class="column is-1">
        <p class="sh-text-normal-14 has-text-grey mr-5">Status</p>
        <p
          class="processing"
          :class="'processing--' + item.task_status.toLowerCase()"
        >{{item.task_status}}</p>
      </div>
    </div>
    <div class="details" v-show="active">
      <job-list-details :jobUid="item.uid"></job-list-details>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="item.uid"
      :resourceName="item.name"
      :resourceType="'job'"
      :resourceService="jobService"
      @closed="showDeleteModal=false"
      @deleted="$emit('refresh-job-list')"
    />
  </div>
</template>

<script>
import InfoBlock from "@/desktop/shared/components/info-block";
import shDropdown from "@/desktop/shared/components/sh-dropdown";
import { jobService } from "@/desktop/shared/services/";
import JobListDetails from "./job-list-details";

export default {
  props: ["item", "user"],
  components: {
    InfoBlock,
    shDropdown,
    JobListDetails
  },

  data() {
    return {
      active: false,
      jobService: jobService
    };
  }
};
</script>
<style lang="scss" >
.router-group-details {
  .router-process-management-main {
    .sh-list {
      min-width: -webkit-fill-available;
    }
  }
}
</style>

