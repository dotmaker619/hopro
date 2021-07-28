<template>
  <div>
    <div class="container has-slimscroll-xs" v-if="activities && Object.keys(activities).length" @scroll="infinite_Scroll($event)">
      <div class="activities">
        <div class="activity" v-for="(grouped_activities, key, i) in activities" :key="i">
          <h1 class="is-medium-18-500-22">{{ activity_time(key) }}</h1>
          <div class="activity-card">
            <div class="activity-card__block" v-for="activity in grouped_activities" :key="activity.createdAt">
              <div class="activity-card__block--info">
                <div class="user-details">
                  <user-avatar :user="$store.getters.state_users[activity.actor.id]" :custom_class="'tiny-user-avatar'" :pxsize="30"></user-avatar>

                  <p class="is-medium-16-500-19 ml-5" v-if="activity.actor.id == $store.state.user_claims.user_id">You</p>
                  <p class="is-medium-16-500-19 ml-5" v-else v-username="$store.getters.state_users[activity.actor.id]"></p>
                </div>
                <p class="is-medium-14-500-17 has-text-blue-grey">{{ activity.createdAt | sinceDays }}</p>
              </div>
              <div class="activity-card__block--detail">
                <p class="is-regular-14-500-17 mr-5">{{ activity_text[activity.verb] }}</p>
                <activity-details :activity="activity"></activity-details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="loading" v-if="is_loading">
      <img src="@/assets/icons/ellipsis-animation.svg" class="image is-64x64 margin-auto" />
    </div>
    <div class="no-result" v-else-if="activities == null">
      <div class="no-results__image">
        <img slot="image" src="@/assets/illustrations/no-activity-illustration.svg" alt />
      </div>
      <div class="no-results__text is-medium-20-500-24 has-opacity-8">No activity</div>
      <p class="is-regular-14-00-17 has-opacity-8">No changes made to this ticket since its creation</p>
    </div>
  </div>
</template>
<script>
  import { ticketService } from "@/desktop/shared/services/";
  import ActivityDetails from "./components/activity-details";

  export default {
    props: ["ticket"],
    data() {
      return {
        allActivities: [],
        ticketFeed: null,
        constLimit: 10,
        activity_limit: 10,
        current_response: [],
        is_loading: false,
        load_more_scroll_position: 600,
        activity_text: {
          TICKET_ASSIGNMENT_CHANGED: "Changed assignment",
          TICKET_UNASSIGNED: "Unassigned ticket from",
          TICKET_ASSIGNED: "Assigned ticket to",
          TICKET_PRIORITY_CHANGED: "Changed priority",
          ATTACHMENT_UPLOADED: "Added attachment",
          DUE_DATE_CHANGED: "Changed duedate",
          ATTACHMENT_DELETED: "Deleted attachment",
          ATTACHMENT_UPLOADED: "Added attachment",
          DUE_DATE_CHANGED: "Changed duedate",
          MULTIPLE_ATTACHMENT_UPLOADED: "Added multiple attachments",
          TICKET_STATUS_CHANGED: "Changed status",
        },
      };
    },
    components: {
      ActivityDetails,
    },
    computed: {
      activities() {
        if (this.allActivities && this.allActivities.length) {
          return _.groupBy(this.allActivities, "date");
        } else {
          return null;
        }
      },
    },
    created() {
      this.getActivities();
    },
    methods: {
      async getActivities() {
        this.is_loading = true;
        let { data } = await ticketService
          .get_activities({
            id: this.ticket.uid,
          })
          .catch((err) => this.handleErrors(err));

        this.ticketFeed = stream.connect(data.appKey, data.token, data.appId, {
          location: data.location,
        });
        let act = this.ticketFeed.feed("ticket", this.ticket.uid);
        let { results } = await act.get({
          limit: this.activity_limit,
          offset: this.activity_limit - this.constLimit,
        });
        this.current_response = results.map((r) => (r["date"] = r.createdAt.split("T")[0]));
        this.is_loading = false;
        this.allActivities.push(...results);
      },
      infinite_Scroll(e) {
        if (this.current_response.length) {
          if (e.target.scrollTop > this.load_more_scroll_position) {
            this.activity_limit = parseInt(this.activity_limit + this.constLimit);
            this.getActivities();
            this.load_more_scroll_position = this.load_more_scroll_position * 2;
          }
        }
      },

      activity_time(date) {
        var fromNow = moment(date).fromNow();
        return moment(date).calendar(null, {
          lastWeek: "[Last] dddd",
          lastDay: "[Yesterday]",
          sameDay: "[Today]",
          nextDay: "[Tomorrow]",
          nextWeek: "dddd",
          sameElse: "DD-MMM-YYYY",
        });
      },
    },
  };
</script>

.<style lang="scss">
  .container {
    height: 70vh;
    overflow: auto;
    @include for-size(portrait-tablets) {
      width: auto;
      height: 75vh;
    }
    .activities {
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      .activity {
        margin-bottom: 5rem;
        h1 {
          @include for-size(portrait-tablets) {
            padding: 0.5rem;
          }
        }
        &-card {
          width: 77.8rem;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 2px 7px 0 rgba(23, 30, 72, 0.1);
          border: solid 1px rgba(23, 30, 72, 0.15);
          margin-top: 2rem;
          @include for-size(portrait-tablets) {
            width: 88%;
            border: none;
            box-shadow: none;

            margin-left: auto;
          }
          &__block {
            height: 10rem;
            padding: 2.5rem 3rem;

            @include for-size(portrait-tablets) {
              padding: 1rem 1rem 0 1.5rem;
              border: solid 1px rgba(23, 30, 72, 0.2);
              margin-bottom: 1.5rem;
              border-radius: 1rem;
              border-top-left-radius: 0px;
              position: relative;
            }
            &:not(:last-of-type) {
              border-bottom: 1px solid #eee;
              @include for-size(portrait-tablets) {
                padding: 1rem 1rem 0 1.5rem;
                border: solid 1px rgba(23, 30, 72, 0.2);
                margin-bottom: 1.5rem;
                border-radius: 1rem;
                border-top-left-radius: 0px;
                position: relative;
              }
            }
            &--info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              .user-details {
                display: flex;
                align-items: center;
                .activities_owner {
                  object-fit: contain;
                  height: 4rem;
                  width: 4rem;
                  overflow: hidden;
                  border-radius: 50%;
                  margin-right: 1rem;
                  @include for-size(portrait-tablets) {
                    width: 2.4rem;
                    height: 2.4rem;
                    position: absolute;
                    top: 0;
                    left: -3.5rem;
                  }
                  &.is-icon {
                    color: #ffffff;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    user-select: none;
                    text-transform: capitalize;
                    @include for-size(portrait-tablets) {
                      width: 2.4rem;
                      height: 2.4rem;
                      position: absolute;
                      top: 0;
                      left: -3.5rem;
                    }
                  }
                }
              }
            }
            &--detail {
              margin-left: 5.5rem;
              display: flex;
              align-items: center;
              @include for-size(portrait-tablets) {
                margin-left: 0;
                margin-top: 0.7rem;
                width: 80%;
                flex-wrap: wrap;
                .is-icon {
                  height: 2rem;
                  width: 2rem;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
