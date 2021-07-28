<template>
  <div class="ticket-checklists">
    <div class="ticket-overview-options">
      <div class="ticket-overview-options__left">
        <span class="is-flex align-center">
          <!-- <sh-icon :name="'ticket-header-back'" @click.native="$router.go(-1)" class="is-16x16 mr-10 is-pointer" /> -->
          <span class="ticket-overview-options__left__title">
            Templates
          </span>
        </span>
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
      <div class="ticket-checklists-item mt-20" v-if="templates.length">
        <div v-for="template in templates" :key="template.uid">
          <template-card @refresh_template_tickets="getData" :ticket="template"></template-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const queryString = require("query-string");
  import { ticketService } from "@/desktop/shared/services/";
  import TemplateCard from "@/desktop/tickets/components/ticket-dashboard/components/templates/components/template-card";
  import CardSkeleton from "@/desktop/tickets/components/ticket-dashboard/shared/skeletons/card-skeleton.vue";
  export default {
    components: {
      TemplateCard,
      CardSkeleton,
    },
    data() {
      return {
        templates: [],
        is_loading: true,
      };
    },
    created() {
      this.getData("true");
    },
    beforeDestroy() {
      this.templates = [];
    },
    methods: {
      async getData(loading = false) {
        try {
          this.is_loading = loading;
          let query = {
            pageSize: 1000,
            pageNumber: 1,
            isTemplate: true,
          };
          let assets_query = "";

          let { data, headers } = await ticketService
            .getAll({
              query: queryString.stringify(query),
            })
            .catch((err) => {
              this.handleErrors(err);
            });

          this.templates = data;
          this.is_loading = false;
        } catch (err) {
          this.is_loading = false;
          this.templates = [];
        }
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
    X &-item {
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
      &-sec {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-top: 1rem;
        &__left {
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
  .ticket-checklists {
    // padding: 1rem;
  }
</style>
