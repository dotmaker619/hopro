<template>
  <div class="ticket-priority-expand">
    <div class="pt-10 mr-10">
      <div class="ticket-overview-options">
        <div class="ticket-overview-options__left">
          <span class="is-flex align-center">
            <sh-icon @click.native="$router.go(-1)" v-if="$route.name != 'overview'" :name="'ticket-header-back'" class="is-16x16 mr-10 is-pointer" />
            <span class="ticket-overview-options__left__title">
              Overview
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="columns is-gapless">
      <div class="column is-8">
        <div class="ticket-priority-card">
          <div class="ticket-priority-card__header">
            <div class="ticket-priority-card__header__left">
              <sh-icon :name="'ticket-card-tags'" class="is-30x30 mr-10" />
              <span class="ticket-priority-card__header__left__title">Tag</span>
            </div>
            <div class="is-flex-center" @mouseover="refresh = true" @mouseleave="refresh = false">
              <div class="is-flex-center mr-20 is-pointer" @click="getTags('tags', 'status', {})">
                <sh-icon :name="'ticket-history-recents'" class="is-20x20 mr-5" />
                <div class="is-medium-12-500-14 has-opacity-5 has-text-danger" v-if="refresh">Refresh</div>
                <div class="is-medium-12-500-14 has-opacity-5" v-else>{{ since }} mins ago</div>
              </div>
              <div class="is-flex-center is-not-allowed">
                <sh-icon :name="'ticket-download'" class="is-20x20 mr-5" />
                <div class="is-medium-12-500-14 has-opacity-5 is-not-allowed">Export as CSV</div>
              </div>
            </div>
          </div>
          <div class="ticket-priority-card__content has-slimscroll">
            <div class="ticket-priority-card__content__item" v-for="(tag, index) in eachCount" :key="index">
              <div class="ticket-priority-card__content__item__right">
                <div class="columns is-flex-center is-marginless">
                  <div class="column is-3 is-paddingless">
                    <div class="priority-item-name is-medium-16-500-19">
                      <span class="is-capitalized">
                        {{ (tag.details && tag.details.name) || "" }}
                      </span>
                    </div>
                  </div>
                  <div class="column is-7 is-paddingless">
                    <ticket-multiple-progress :values="tag.stats" @filter_by="filter_ticket_list($event, index)"></ticket-multiple-progress>
                  </div>

                  <div class="column is-2 is-paddingless member-total">
                    {{ tag.total }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column is-4 ">
        <div class="ticket-priority-config-card">
          <div class="ticket-priority-config-header">
            Configure
          </div>

          <div>
            <div class="priority-config">
              <label class="is-flex is-pointer" @click="extract_tags(false)">
                <input type="checkbox" class="sh-custom-checkbox" :value="extract" :checked="extract == false" />
                <span class="is-medium-16-500-22 ml-10">Exact</span>
              </label>
            </div>
            <div class="priority-config">
              <label class="is-flex is-pointer" @click="extract_tags(true)">
                <input type="checkbox" class="sh-custom-checkbox" :value="extract" :checked="extract == true" />
                <span class="is-medium-16-500-22 ml-10">Each</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column is-12 mt-20">
        <tickets-list :extra_query="extra_query"></tickets-list>
      </div>
    </div>
  </div>
</template>

<script>
  import TicketsList from "@/desktop/tickets/components/tickets-list/tickets-list";
  import { ticketService } from "@/desktop/shared/services/";
  

  import { mapState } from "vuex";

  import TicketMultipleProgress from "@/desktop/tickets/components/ticket-dashboard/shared/filters/ticket-multiple-progress";
  export default {
    components: {
      TicketMultipleProgress,
      TicketsList,
    },
    data() {
      return {
        refresh: false,
        allTags: [],
        eachCount: {},
        extract: true,
        extra_query: {},
        lastFetchedAt: null,
        now: new Date(),
      };
    },
    computed: {
      ...mapState(["TAGS"]),
      since() {
        var a = moment(this.lastFetchedAt);
        var b = moment(this.now);
        return b.diff(a, "minutes");
      },
    },
    created() {
      if (this.$route.query && this.$route.query.filter == "Each") {
        this.extract = true;
      } else {
        this.extract = false;
      }
      setInterval(() => {
        this.now = Date.now();
      }, 60000);
      this.getTags("tags", "status", {});
    },

    methods: {
      async getTags(xkey, ykey, filter) {
        this.allTags = await this.getReport(xkey, ykey, filter);
        if (this.allTags && this.TAGS && Object.keys(this.TAGS).length) {
          if (this.extract == true) {
            this.allTags.map((item, index) => {
              if (index < 10) {
                return (this.eachCount[item.x] = {
                  stats: item.y,
                  details: this.TAGS[item.x],
                  total: _.sumBy(item.y, function(o) {
                    return o.count;
                  }),
                });
              }
            });
            this.eachCount = Object.assign({}, this.eachCount);
          } else {
            this.allTags.map((item, index) => {
              if (index < 5) {
                item.x.forEach((element) => {
                  let name = this.TAGS[element].name;
                  return (this.eachCount[name] = {
                    stats: item.y,
                    details: this.TAGS[element],
                    total: _.sumBy(item.y, function(o) {
                      return o.count;
                    }),
                  });
                });
              }
            });
            this.eachCount = Object.assign({}, this.eachCount);
          }
        }
        this.eachCount = Object.assign({}, this.eachCount);
      },

      async getReport(xkey, ykey, filter = {}) {
        this.lastFetchedAt = new Date().toISOString();
        let allFilters = { ...{ "organization": this.$store.state.current_organization.uid }, ...filter };
        let body = {
          "filters": allFilters,
          "x": {
            "key": xkey,
            "extract": this.extract,
          },
          "y": {
            "key": ykey,
          },
        };
        return await ticketService.get_report({ body }).catch((err) => {
          this.handleErrors(err);
        });
      },

      extract_tags(e) {
        this.extract = e;
        this.getTags("tags", "status", {});
      },
      filter_ticket_list(status, tag) {
        this.$store.dispatch("tickets/add_tickets", []);
        let new_query = { status: status, tag: tag, offset: 0 };
        this.extra_query = Object.assign({}, new_query);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ticket-priority-expand {
    padding: 1rem;
  }

  .ticket-priority-config {
    &-card {
      background-color: $white;
      border-radius: 1rem;
      box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
      margin: 2rem 1rem 0 1rem;
    }
    &-header {
      border-bottom: 1px solid #f0f1f3;
      padding: 1.5rem 3rem;
      font-family: Barlow-Medium;
      font-size: 18px;
      font-weight: 500;
      line-height: 22px;
      color: $ticket-heading;
    }
  }

  .ticket-priority-card {
    background-color: $white;
    border-radius: 1rem;
    box-shadow: 0 0 3px 0 rgba(23, 30, 72, 0.2);
    margin: 2rem 1rem 0 1rem;
    padding: 1.5rem 1.5rem 3rem 1.5rem;

    &__header {
      display: flex;
      justify-content: space-between;

      &__left {
        display: flex;
        align-items: center;
        &__title {
          font-family: Barlow-Medium !important;
          font-size: 18px !important;
          font-weight: 500 !important;
          line-height: 22px !important;
          color: $ticket-heading;
        }
      }
    }

    &__content {
      max-height: 380px;
      overflow-y: auto;
      &__item {
        display: flex;
        align-items: center;
        padding: 2rem 0 2rem 2.5rem;

        img {
          border-radius: 50%;
        }
        .priority-item-name {
          display: flex;
          align-items: center;
          color: $secondary-text;
          // padding-bottom: 0.5rem;
        }
        .item-desc {
          color: $primary-text;
          opacity: 0.7;
          // min-width: 15rem;
          // max-width: 15rem;
        }

        &__right {
          position: relative;
          width: 100%;
        }
      }
    }
  }
  .member-total {
    text-align: center;
  }
  .priority-config:first-child {
    padding: 2rem 3rem 1rem 3rem;
  }
  .priority-config {
    padding: 1rem 3rem 1rem 3rem;
  }
  .priority-config:last-child {
    padding: 1rem 3rem 2rem 3rem;
  }
</style>
