<template>
  <div class="activity-tab has-slimscroll-xs" @scroll="infinite_Scroll($event)">
    <!-- v-if="active && $store.getters.state_users" -->
    <!-- @scroll="infinite_Scroll($event)" -->
    <ul class="padding-20">
      <p class="pointer is-assignee"></p>
      <!-- <p class="activity-line">-------------------</p> -->
      <div class="animate-bottom">
        <li class="is-relative" v-for="(activity, i) in activities" :key="i">
          <div class="activity-divider"></div>
          <div class="activity-circle">
            <svg viewBox="0 0 100 100" class="image is-16x16">
              <use xlink:href="@/assets/icons/tickets_sprite.svg#circle" />
            </svg>
          </div>
          <activity-card :mobile_view="true" :activity="activity" />
        </li>

        <div class="loader" v-if="is_loading">
          <img
            src="@/assets/icons/ellipsis-animation.svg"
            style="margin-right: auto; margin-left: auto;"
            class="image is-64x64"
          />
        </div>
        <div v-if="!is_loading && !activities.length">
          <p class="sh-text-semibold-14 has-text-dark has-text-centered">No Activities</p>
        </div>
      </div>
    </ul>
  </div>
</template>

<script>
import {
  fileService,
  folderService,
  userService
} from "@/desktop/shared/services/";

import { DateTime } from "luxon";

import ActivityCard from "@/desktop/vault/components/activities/components/activity-card";

export default {
  props: ["file", "folder"],
  components: {
    ActivityCard
  },
  data() {
    return {
      activities: [],
      active: false,
      activity_limit: 10,
      activities_to_skip: 0,
      scrolled: false,
      status_bg_classes: {
        1: "is-bg-yellow",
        2: "is-bg-green",
        3: "is-bg-blue",
        4: "is-bg-light-grey",
        5: "is-bg-red"
      },
      priority_bg_classes: {
        1: "is-bg-critical",
        2: "is-bg-high",
        3: "is-bg-medium",
        4: "is-bg-low"
      },
      vaultFeed: null,
      constLimit: 10,
      current_response: [],
      is_loading: true
    };
  },
  computed: {
    type() {
      if (this.file) return "file";
      return "folder";
    },
    vault() {
      if (this.file) return this.file;
      return this.folder;
    }
  },
  async created() {
    this.vaultFeed = await this.get_activity_token(this.type, this.vault.uid);
    await this.get_activities();
  },
  methods: {
    async get_activity_token(type, uid) {
      let { data } = await (type === "folder" ? folderService : fileService)
        .get_activities({
          id: uid
        })
        .catch(err => this.handleErrors(err));
      return stream.connect(data.api_key, data.token, data.app_id, {
        location: data.location
      });
    },
    async get_activities() {
      this.is_loading = true;
      let act = this.vaultFeed.feed(this.type, this.vault.uid);
      let { results } = await act.get({
        limit: this.activity_limit,
        offset: this.activity_limit - this.constLimit
      });
      // await this.getUsersPicture(results, "user");
      this.current_response = results;
      this.is_loading = false;

      this.activities.push(...results);
      this.activities = [...this.activities];
    },
    infinite_Scroll(e) {
      if (this.current_response.length) {
        if (
          e.target.offsetHeight + e.target.scrollTop >=
          e.target.scrollHeight
        ) {
          this.activity_limit = parseInt(this.activity_limit + this.constLimit);
          this.get_activities();
        }
      }
    },
    days_to_duedate(dueDate) {
      let givenDate = new DateTime.fromISO(dueDate);
      let today = new DateTime.local();
      return Math.floor(givenDate.diff(today, "days").days);
    }
  }
};
</script>

<style lang="scss">
.activity-tab {
  max-height: 155vh;
  overflow: scroll;
  overflow-x: hidden;
  .user-avatar {
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 50%;
    margin-right: 1rem;
    &__icon {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #ffffff;
      font-weight: 600;
      font-size: 1.8rem;
      text-transform: capitalize;
      user-select: none;
    }
  }
  .activity-divider {
    height: 100%;
    width: 1px;
    position: absolute;
    top: 4px;
    border-right: 2px dashed #ddd;
  }
  .activity-circle {
    position: absolute;
    transform: translateX(-45%);
    top: 4px;
  }
  .activity-block {
    height: 8rem;
    margin-left: 4rem;
  }
  .loader {
    position: relative;
    left: 50%;
    top: 10%;
    z-index: 1;
    margin: 3rem 0 0 -1rem;
    border: 1rem solid #f3f3f3;
    border-radius: 50%;
    border-top: 1rem solid $primary;
    width: 5rem;
    height: 5rem;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
  }
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  /* Add animation to "page content" */
  .animate-bottom {
    position: relative;
    -webkit-animation-name: animatebottom;
    -webkit-animation-duration: 1s;
    animation-name: animatebottom;
    animation-duration: 1s;
  }
  @-webkit-keyframes animatebottom {
    from {
      bottom: -100px;
      opacity: 0;
    }
    to {
      bottom: 0px;
      opacity: 1;
    }
  }
  @keyframes animatebottom {
    from {
      bottom: -100px;
      opacity: 0;
    }
    to {
      bottom: 0;
      opacity: 1;
    }
  }
}
</style>