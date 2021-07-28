<template>
  <div class="ticket-checklists">
    <div class="ticket-overview-options">
      <div class="ticket-overview-options__left">
        <span class="is-flex align-center">
          <sh-icon
            v-if="$route.name === 'checklist-details'"
            :name="'ticket-header-back'"
            @click.native="$router.go(-1)"
            class="is-16x16 mr-10 is-pointer"
          />

          <span class="ticket-overview-options__left__title">Checklists</span>
        </span>
      </div>
      <div class="ticket-overview-options__right is-relative is-medium-14-500-17">
        <span class="add-new-checklist" @click="activeModal = !activeModal">
          <sh-icon :name="'ticket-add-checklist'" class="is-12x12 mr-10" />
          <span class>New Checklist</span>
        </span>
        <div class="new-checklist-card padding-20" v-if="activeModal" v-click-outside="() => (activeModal = false)">
          <div class="new-checklist-card__header">
            <div class="is-pointer is-pulled-right" @click="activeModal = false">
              <sh-icon :name="'ticket-create-modal-close'" class="is-14x14" />
            </div>
          </div>
          <div class="new-checklist-card__content">
            <div class="new-checklist-card__content__icon">
              <sh-icon :name="'ticket-create-checklist'" class="is-70x70" />
            </div>
            <input v-focus class="new-checklist-card__content__input" placeholder="Checklist Name" type="text" v-model="name" />
            <div class="new-checklist-card__content__button">
              <span :class="{ 'is-disabled': !name }" class="new-btn is-pointer" @click="create_checklist">
                <span class="is-semiBold-16-600-19">Create New Checklist</span>
              </span>
            </div>
          </div>
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
    <div v-else class="ticket-checklists-item mt-20">
      <div v-for="(checklist, index) in allChecklists" :key="checklist">
        <check-list-card @refresh_checklist_template="get_template_checklists" :checklist="checklist" :index="index"></check-list-card>
      </div>
    </div>
  </div>
</template>

<script>
  import checklists from "@/desktop/tickets/components/ticket-details/components/task-list/components/checklist-component";
  import { mapState, mapGetters, mapActions } from "vuex";

  const queryString = require("query-string");
  import { ticketService } from "@/desktop/shared/services/";
  import CheckListCard from "@/desktop/tickets/components/ticket-dashboard/components/checklists/components/checklist-card";
  import CardSkeleton from "@/desktop/tickets/components/ticket-dashboard/shared/skeletons/card-skeleton.vue";

  export default {
    components: {
      CheckListCard,
      checklists,
      CardSkeleton,
    },
    data() {
      return {
        activeModal: false,
        is_loading: true,
        active: false,
        tasks: [],
        is_ticket_without_checklists: false,
        open_new_task: false,
        edit_name: false,
        new_active: false,
        show_create_new: false,
        name: "",
        new_task_name: "",
        new_task: {
          name: "",
          isTemplate: true,
          internal: false,
          items: [],
          organization: this.$store.state.current_organization.uid,
        },
      };
    },
    created() {
      this.$store.dispatch("checklist/initialize_service",ticketService);
      this.get_template_checklists();
    },
    computed: {
      ...mapState("checklist", ["allChecklists", "template"]),
    },
    methods: {
      create_checklist() {
        this.activeModal = false;
        this.create_new_checklist();
      },
      async get_template_checklists() {
        this.is_loading = true;
        await this.$store.dispatch("checklist/add_template_checklists");
        this.is_loading = false;
      },
      async create_new_checklist(task) {
        let checklist = { ...this.new_task, name: this.name };
        checklist.organization = this.$store.state.current_organization.uid;
        checklist.items = task ? [task] : [];
        await this.$store.dispatch("checklist/add_new_template_checklist", {
          body: checklist,
        });
        this.$router.push({
          params: { id: this.template.uid },
          name: "checklist-details",
        });
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
  .new-checklist-card {
    position: absolute;
    top: 5rem;
    right: 0rem;
    z-index: 3;
    width: 320px;
    height: 250px;
    border-radius: 10px;
    box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
    background-color: white;
    &__content {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      // justify-content: space-between;
      &__icon {
        padding: 1rem;
        .is-70x70 {
          height: 70px;
          width: 70px;
        }
      }
      &__input {
        width: 80%;
        border: 0;
        padding-bottom: 1rem;
        color: #171e48;
        font-size: 1.6rem;
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        background-color: #fafcff;
      }
      &__button {
        color: $primary;
        padding-top: 3rem;
        // padding: 2rem;
        .new-btn {
          width: 189px;
          height: 40px;
          padding: 1rem 1.5rem;
          border-radius: 6px;
          box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
          border: solid 1px #2585d3;
          background-color: white;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  .column {
    padding: 1rem;
  }
  // .ticket-checklists {
  //   // padding: 1rem;
  // }
  .add-new-checklist {
    cursor: pointer;
    height: 3.6rem;
    width: 15rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $primary;
    border-radius: 4px;
    background-color: $white;
    color: $primary;
    margin-left: 2rem;
  }
</style>
