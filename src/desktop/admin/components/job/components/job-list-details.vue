<template>
  <div class="padding-20">
    <div v-if="jobDetails">
      <b-tabs v-model="activeTag" size="is-large">
        <b-tab-item class="mt-20" label="Instance">
          <div class="columns is-mobile">
            <div class="column">
              <p class="heading">IP Address</p>
              <p>{{jobDetails.instance_ipv4 || "N.A."}}</p>
            </div>
            <div class="column">
              <p class="heading">Instance</p>
              <p class="columns is-vcentered is-marginless">
                <span class="mr-5">{{jobDetails.instance_type || "N.A."}}</span>
              </p>
            </div>
            <div class="column">
              <p class="heading">Vendor</p>
              <p class="columns is-vcentered is-marginless">
                <img
                  v-if="jobDetails.instance_vendor == 'aws-ec2'"
                  src="@/assets/icons/png/amazon.png"
                  width="30px"
                  height="30px"
                />
                <span class="is-uppercase">{{jobDetails.instance_vendor || "N.A."}}</span>
              </p>
            </div>
            <div class="column">
              <p class="heading">Status</p>
              <div class="level">
                <div
                  class="ball mr-10"
                  :class="{'green': jobDetails.instance_status=='running', 'yellow': jobDetails.instance_status=='pending' || jobDetails.instance_status=='shutting-down' || jobDetails.instance_status=='stopping', 'red': jobDetails.instance_status=='stopped' || jobDetails.instance_status=='terminated'}"
                ></div>
                <p
                  class="is-capitalized is-inline-block level-item"
                >{{jobDetails.instance_status || "N.A."}}</p>
              </div>
            </div>
          </div>
          <div class="columns is-mobile">
            <div class="column">
              <p class="heading">Launcher Response</p>
              <img
                src="@/assets/icons/noun_JSON.svg"
                width="30px"
                height="30px"
                @click.stop="openJobModal('launcher response', jobDetails.launcher_response)"
                class="is-pointer"
              />
            </div>
            <div class="column">
              <p class="heading">Trigger Event</p>
              <img
                src="@/assets/icons/noun_JSON.svg"
                width="30px"
                height="30px"
                @click.stop="openJobModal('launcher response', jobDetails.trigger_event)"
                class="is-pointer"
              />
            </div>
            <div class="column">
              <p class="heading">Created At</p>
              <p>{{jobDetails.created_at | prettyDate}}</p>
            </div>
            <div class="column">
              <p class="heading">Terminated At</p>
              <p>{{jobDetails.updated_at | prettyDate}}</p>
            </div>
          </div>
        </b-tab-item>
        <b-tab-item label="Task Timeline">
          <div v-if="actions" class="job-list__events">
            <div class="job-list__events--data has-slimscroll-xs-h is-flex pb-20">
              <div class="is-narrow move-action" @click="move_left" v-if="val_1 > 1">
                <i class="fas fa-chevron-circle-left"></i>
              </div>
              <div
                class="job-list__events--action is-paddingless has-text-centered"
                v-for="(action, i) in actions"
                :key="i"
              >
                <div
                  class="job-list__events--action-item pr-30"
                  style="cursor: pointer"
                  @click="openJobModal('event stream', action[3])"
                >
                  <p class="sh-medium-header">{{action[1]}}</p>
                  <p
                    class="sh-text-normal-14 has-text-grey is-capitalized mb-20"
                    :class="'processing--' + action[0].toLowerCase()"
                  >{{action[0]}}</p>
                  <p class="point"></p>
                  <p
                    class="sh-text-normal-14 has-text-grey has-opacity-7 is-capitalized mb-20"
                  >{{action[2] | sinceDays}}</p>
                </div>
              </div>
              <div
                class="move-action"
                @click="move_right"
                v-if="actions.length > 6 && val_2 < actions.length"
              >
                <i class="fas fa-chevron-circle-right"></i>
              </div>
            </div>
          </div>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import { jobService } from "@/desktop/shared/services/";
import JobModal from "./job-modal";

export default {
  props: ["jobUid"],
  data() {
    return {
      jobDetails: null,
      activeTag: 0,
      val_1: 0,
      val_2: 6
    };
  },
  computed: {
    actions() {
      if (this.jobDetails)
        return this.jobDetails.event_stream.slice().reverse();
    }
  },
  created() {
    this.getDetails();
  },
  methods: {
    async getDetails() {
      let results = await jobService.get({
        query: `uid=${this.jobUid}&complete=true`
      });
      if (results) {
        this.jobDetails = results.data[0];
      }
    },
    move_left() {
      this.val_1 -= 6;
      this.val_2 -= 6;
    },
    move_right() {
      this.val_1 += 6;
      this.val_2 += 6;
    },
    openJobModal(title, json) {
      this.$modal.show(
        JobModal,
        {
          title: title,
          jsonData: json
        },
        { height: "auto" }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.job-list__events {
  &--data {
    justify-content: flex-start;
  }
  &--action {
    border-bottom: 1px solid #ddd;
    width: 15%;
    &-item {
      position: relative;
      .point {
        height: 6px;
        width: 6px;
        background: #555;
        border-radius: 2rem;
        position: absolute;
        bottom: -23px;
        left: 6rem;
      }
    }
  }

  .move-action {
    display: flex;
    align-items: center;
    color: $grey;
    :hover {
      color: $primary;
      cursor: pointer;
    }
  }
}
</style>