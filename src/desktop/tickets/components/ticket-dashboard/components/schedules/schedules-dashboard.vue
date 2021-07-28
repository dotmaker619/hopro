<template>
  <div class="ticket-checklists is-relative">
    <top-header
      @addDisplayFilter="get_schdules($event)"
      @selected_asset="
        asset_query = $event;
        get_schdules();
      "
      @apply_filter="
        filter_query_string = $event;
        get_schdules();
      "
    >
      <div slot="right-side">
        <span class="add-new-checklist" @click="activeModal = true">
          <sh-icon :name="'ticket-add-checklist'" class="is-12x12 mr-10" />
          <span class="">New Schedule</span>
        </span>
      </div>
    </top-header>
    <div class="new-checklist-card padding-20 margin-20 " v-if="activeModal" v-click-outside="() => (activeModal = false)">
      <div class="new-checklist-card__header">
        <div class="is-pointer is-pulled-right" @click="activeModal = false">
          <sh-icon :name="'ticket-create-modal-close'" class="is-14x14" />
        </div>
      </div>
      <div class="new-checklist-card__content">
        <div class="new-checklist-card__content__icon">
          <sh-icon :name="'ticket-create-checklist'" class="is-70x70" />
        </div>
        <input
          v-focus
          class="new-checklist-card__content__input"
          placeholder="Ticket Name"
          type="text"
          v-model="form.name"
          @keyup.enter="create_schedule"
        />
        <div class="new-checklist-card__content__button">
          <span :class="{ 'is-disabled': !form.name }" class="new-btn is-pointer" @click="create_schedule">
            <span class="is-semiBold-16-600-19">Create New Schedule</span>
          </span>
        </div>
      </div>
    </div>
    <div v-if="is_loading">
      <div class="columns" v-for="i in 2" :key="i">
        <div v-for="i in 3" :key="i" class="column is-4">
          <card-skeleton></card-skeleton>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="schedule_groups">
        <div v-for="(tickets, key) in schedule_groups" :key="key">
          <schedule-block
            :tickets="tickets"
            :when="key"
            v-if="!filterDate || filterDate == 'All Time' || filterDate == schedule_times(key)"
          ></schedule-block>
        </div>
      </div>
      <no-results v-else></no-results>
    </div>
  </div>
</template>

<script>
  import TopHeader from "@/desktop/tickets/components/ticket-dashboard/shared/top-header.vue";
  import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
  import PriorityDropdown from "@/desktop/tickets/shared/components/priority-dropdown";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import { ticketService, organizationService, apiService } from "@/desktop/shared/services/";

  import ScheduleBlock from "./components/schedule-block";

  import { mapState, mapMutations } from "vuex";

  import elementMixin from "@/desktop/shared/mixins/element.mixin";
  import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";
  import { RRule, rrulestr } from "rrule";
  const queryString = require("query-string");
  import CardSkeleton from "@/desktop/tickets/components/ticket-dashboard/shared/skeletons/card-skeleton.vue";

  export default {
    mixins: [elementMixin, TicketDetailsMixin],
    components: {
      TopHeader,
      PrimaryTags,
      UserDropdown,
      PriorityDropdown,
      UserTag,
      ScheduleBlock,
      CardSkeleton,
    },
    data() {
      return {
        is_loading: true,
        scheduledTickets: null,
        activeModal: false,
        filterDate: null,
        name: null,
        is_creating: false,
        form: {
          name: null,
        },
        asset_query: null,
        filter_query_string: "",
      };
    },
    created() {
      this.get_schdules();
    },
    computed: {
      schedule_groups() {
        if (this.scheduledTickets && this.scheduledTickets.length) {
          return _.groupBy(this.scheduledTickets, "scheduleFrequency");
        } else {
          return null;
        }
      },

      ...mapState(["is_internal_resource"]),
      ...mapState("tickets", ["is_internal"]),
      ...mapMutations("tickets", ["ADD_NEW_TICKET"]),
    },
    methods: {
      async get_schdules(filter_query = {}) {
        this.is_loading = true;
        let query = {
          pageSize: 1000,
          isRecurring: true,
        };

        query = { ...query, ...filter_query };
        let assets_query = "";
        if (this.asset_query) {
          this.asset_query.forEach((asset) => {
            assets_query += "&assetUid=" + asset;
          });
        }

        let { data } = await ticketService
          .getAll({ query: queryString.stringify(query) + assets_query + this.filter_query_string })
          .catch((err) => this.handleErrors());
        this.scheduledTickets = data;
        // _.filter(data, "schedule.rrule");
        this.scheduledTickets.map((r) => {
          let parsed = r.schedule && r.schedule.rrule ? new RRule(RRule.parseString(r.schedule.rrule)) : null;

          return (r["scheduleFrequency"] = parsed ? parsed.options.freq : "");
        });
        this.is_loading = false;
      },
      async get_org_element() {
        try {
          let details = await organizationService.get({
            id: this.$store.state.current_organization.uid,
          });
          if (details.element && _.isString(details.element)) {
            let res = await apiService.get({ url: details.element });
            return res.data;
          } else return details.element;
        } catch (err) {
          console.log(err);
          this.handleErrors(err);
          return null;
        }
      },

      async create_schedule() {
        if (this.form.name) {
          this.form.name = this.form.name.trim();
        }

        if (this.is_creating || !this.form.name) return;
        this.is_creating = true;
        let element;

        if (this.element) {
          await this.create_or_get_element(this.element);
          element = this.get_target_element(this.element);
        } else {
          let org_element = await this.get_org_element();
          element = this.get_target_element(org_element);
        }
        if (!element) return;

        this.form.targetElement = element;

        this.form.internal = this.is_internal;

        if (this.element && this.element.centroid) this.form["location"] = { type: "Point", coordinates: Object.values(this.element.centroid) };

        let new_ticket_data = { ...this.form };

        let { data } = await ticketService.post({ body: new_ticket_data }).catch((err) => {
          this.handleErrors(err);
          this.$toast.show("Oops! Something went wrong", "", this.$store.state.izitoast_options.appError);
        });

        data.writeAccess = true;
        this.$store.commit("tickets/ADD_NEW_TICKET", data);
        this.open_ticket_details(data.uid);

        this.form.name = null;
      },

      schedule_times(date) {
        let scheduleKey;
        switch (date) {
          case "0":
            scheduleKey = "Yearly";
            break;
          case "1":
            scheduleKey = "Monthly";
            break;
          case "2":
            scheduleKey = "Weekly";
            break;
          case "3":
            scheduleKey = "Daily";
            break;

          default:
            break;
        }
        return scheduleKey;
      },
    },
  };
</script>

<style lang="scss">
  .ticket-checklists {
    padding: 2rem;
    &-items {
      display: flex;
      margin: 4rem 0 2rem 0;
    }

    &-item {
      display: grid;
      grid-gap: 2rem;
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .ticket-checklist-card {
    background-color: #fff;
    border-radius: 1rem;
    box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
    padding: 2rem 2rem 2rem 1.5rem;
    display: flex;

    &__right {
      width: 100%;
    }

    &__top {
      display: flex;
      align-items: center;
    }
    &__content {
      &__desc {
        font-family: Barlow-Medium !important;
        font-size: 14px !important;
        font-weight: 500 !important;
      }
      &-sec {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-top: 1rem;
        &__left {
          height: 3.6rem;
          width: 3.6rem;
          display: flex;
          img {
            margin-right: 0.5rem;
            border-radius: 50%;
          }
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  .column {
    padding: 1rem;
  }
</style>
