<template>
  <div v-if="vault && !isMobile">
    <div class="create-new-folder is-flex align-center">
      <input
        @click.prevent.stop
        v-focus
        class="create-new-folder-input is-medium-14-500-17"
        type="text"
        placeholder="Ticket Name"
        v-model="form.name"
        @keyup.esc="
          $eventHub.$emit('close_create_ticket');
          $emit('close');
        "
        @keyup.enter="create_new_ticket()"
      />
      <p @click.stop="create_new_ticket()">
        <sh-icon :name="'ticket-show-tick'" class="is-16x16 is-pointer" :class="{ 'is-disabled': !form.name }"></sh-icon>
      </p>
    </div>
  </div>
  <div v-else-if="isMobile || viewer_ticket" :class="[isMobile ? 'mobile-viewer-create-ticket' : 'pt-10', fromFeature ? 'is-absolute' : null]">
    <!-- <div class="app-card-indicator"></div> -->
    <div class="create-details is-relative" :class="[{'bottom-auto':fromViewerApp }, {'is-fixed': $route.name == 'tickets-list'}, custom_class?custom_class:'']" v-click-outside="() => ($emit('close'))">
      <div class="is-flex align-center">
        <div class="mx-5 is-pointer" @click="$emit('hide')" v-if="!isMobile">
          <sh-icon :name="'close'" class="is-12x12"></sh-icon>
        </div>
        <status-dropdown
          :current_status="form.status"
          :create_new="true"
          :show_names="false"
          :size="22"
          @update-ticket-status="form.status = $event.value * 1"
        ></status-dropdown>
        <div class="column is-paddingless is-10" style="border-radius: 0;">
          <input
            type="text"
            name="ticket_name"
            id="name"
            v-focus
            class="input is-borderless no-box-shadow is-medium-14-500-17"
            placeholder="Ticket Name"
            v-model="form.name"
            @keyup.esc="
              $eventHub.$emit('close_create_ticket');
              $emit('close');
            "
            @keyup.enter="create_new_ticket()"
          />
        </div>
      </div>
      <div class>
        <div class=" is-flex is-between" :class="{ 'mt-10': isMobile }">
          <div class="is-flex align">
            <user-dropdown
              class="is-medium-14-500-17 has-text-new-grey"
              :existing_user="form.takenUp"
              @update-user="form.takenUp = $event"
              @remove-user="form.takenUp = null"
              :pxsize="20"
            ></user-dropdown>
          </div>
          <div class="is-flex align">
            <priority-dropdown
              :priority="form.priority"
              class="is-medium-14-500-17 has-text-new-grey"
              @change_ticket_priority="form.priority = parseInt($event)"
            ></priority-dropdown>
          </div>
        </div>
        <div class="is-flex is-between align-center mb-10" :class="{ 'mt-15 mb-20': isMobile }">
          <duedate-dropdown
            class="is-medium-14-500-17 has-text-new-grey"
            :due="form.dueDate"
            @change-duedate="form.dueDate = $event"
          ></duedate-dropdown>
          <div class="is-flex" @click="create_new_ticket()">
            <sh-icon :file="'terra_sprite'" :name="'terra-submit-ticket'" class="is-30x30"></sh-icon>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="create-list overflow-visible" :class="[status ? status_border_classes[status.value] : null]">
    <div class="columns is-flex is-vcenter">
      <div class="column is-flex has-space-around is-vcenter is-narrow" style="width:8.5rem">
        <div
          @click="
            $eventHub.$emit('close_create_ticket');
            $emit('close');
          "
        >
          <sh-icon :name="'close'" class="is-16x16 is-pointer" />
        </div>

        <status-dropdown
          :current_status="form.status"
          :create_new="true"
          :show_names="false"
          @update-ticket-status="form.status = $event.value * 1"
        ></status-dropdown>
      </div>
      <div class="column is-3 mr-15 is-paddingless" style="border-bottom: 1px dashed #aaa;border-radius: 0;">
        <input
          type="text"
          name="ticket_name"
          id="name"
          v-focus
          class="input is-inline-input is-medium-16-500-19"
          placeholder="Name"
          v-model="form.name"
          @keyup.esc="
            $eventHub.$emit('close_create_ticket');
            $emit('close');
          "
          @keyup.enter="create_new_ticket()"
        />
      </div>

      <div class="column is-2 mr-25">
        <user-dropdown
          class="is-medium-14-500-17 has-text-new-grey"
          :existing_user="form.takenUp"
          @update-user="form.takenUp = $event"
          @remove-user="form.takenUp = null"
          :pxsize="30"
        ></user-dropdown>
      </div>
      <div class="column is-2 mr-30">
        <duedate-dropdown
          class="is-medium-14-500-17 has-text-new-grey"
          :due="form.dueDate"
          @change-duedate="form.dueDate = $event"
        ></duedate-dropdown>
      </div>

      <div class="column" :class="[small_viewer ? 'is-1 mr-30' : 'is-2']">
        <priority-dropdown
          :priority="form.priority"
          class="is-medium-14-500-17 has-text-new-grey"
          @change_ticket_priority="form.priority = parseInt($event)"
        ></priority-dropdown>
      </div>
      <div class="column is-flex" @click="create_new_ticket()">
        <button
          class="sh-button button is-medium-16-500-19 is-flex is-vcenter has-text-white"
          style="padding-top:10px!important"
          :class="[is_saving ? 'is-loading' : null]"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import UserDropdown from "@/desktop/tickets/shared/components/user-assignee-dropdown";
  import PriorityDropdown from "@/desktop/tickets/shared/components/priority-dropdown";
  import { ticketService, organizationService, apiService } from "@/desktop/shared/services/";
  import DuedateDropdown from "@/desktop/tickets/shared/components/duedate-dropdown";
  import StatusDropdown from "@/desktop/tickets/shared/components/status-dropdown";
  import { mapState } from "vuex";
  import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";

  import elementMixin from "@/desktop/shared/mixins/element.mixin";
  export default {
    mixins: [elementMixin, TicketDetailsMixin],
    props: ["status", "priority", "element", "viewer_ticket", "fromFeature", "fromViewerApp", "open_on_create", "vault", 'custom_class'],
    data() {
      return {
        is_creating: false,
        is_saving: false,
        ticketService: ticketService,
        status_bg_classes: {
          "1": "is-bg-yellow",
          "2": "is-bg-green",
          "3": "is-bg-blue",
          "4": "is-bg-light-grey",
          "5": "is-bg-red",
        },
        status_border_classes: {
          "1": "has-border-yellow",
          "2": "has-border-green",
          "3": "has-border-blue",
          "4": "has-border-light-grey",
          "5": "has-border-red",
        },
        form: {
          name: null,
          priority: this.priority ? parseInt(this.priority) : 4,
          status: this.status ? parseInt(this.status) : 1,
          takenUp: null,
          internal: false,
          organization: this.$store.state.current_organization.uid,
          dueDate: null,
          startDate: null,
        },
        targetElement: null,
        properties: null,
      };
    },

    components: {
      shDropdown,
      UserDropdown,
      PriorityDropdown,
      DuedateDropdown,
      StatusDropdown,
    },
    computed: {
      ...mapState(["is_internal_resource"]),
      ...mapState("tickets", ["is_internal"]),
    },
    created() {
      this.getElement();
    },

    methods: {
      async getElement() {
        if (this.element) {
          await this.create_or_get_element(this.element);

          this.targetElement = this.get_target_element(this.element);
        } else {
          let org_element = this.$store.state.org_element;
          this.targetElement = this.get_target_element(org_element);
        }
        if (this.$store.getters.asset_configuration) {
          if (this.targetElement.asset) {
            let asset = _.find(this.$store.state.assets, (a) => a.uid == this.targetElement.asset);
            this.properties = (asset.properties && asset.properties.ticket) || {};
          }
        }
      },

      async create_new_ticket() {
        if (this.form.name) {
          this.form.name = this.form.name.trim();
          this.is_saving = true;
        }

        if (this.is_creating || !this.form.name) return;
        this.is_creating = true;
        let element;

        if (!this.targetElement) return;

        this.form.targetElement = this.targetElement;

        this.form.internal = this.is_internal;

        if (this.element && this.element.centroid)
          this.form["location"] = {
            type: "Point",
            coordinates: Object.values(this.element.centroid),
          };

        if (this.$route.name == "favorites") {
          this.form["bookmark"] = true;
        }
        if (this.element && this.element.dataUid) {
          this.form.dataUid = this.element.dataUid;
        }
        let new_ticket_data = { ...this.form };
        if (this.$store.getters.asset_configuration) {
          new_ticket_data = _.mergeWith({}, this.properties, new_ticket_data, (a, b) => (b === null ? a : undefined));
        }

        analytics.track("New Ticket");
        let ticket_data = await this.$store.dispatch("tickets/add_new_ticket", new_ticket_data);
        if (this.open_on_create) {
          this.open_ticket_details(ticket_data.uid);
        }
        this.$emit("close");
        this.$emit("ticket-created",ticket_data);
        (this.form.name = null),
          (this.form.priority = 4),
          (this.form.status = 1),
          (this.form.takenUp = null),
          (this.form.dueDate = null),
          (this.form.startDate = null),
          (this.is_creating = false);

        setTimeout(() => {
          this.is_saving = false;
        }, 200);
      },
    },
  };
</script>

<style lang="scss">
  .create-list {
    padding: 1rem 4rem;
    background: $white;
    border-bottom: 1px solid #ccc;
  }
  .custom-input {
    border: 1px solid #fff;
    height: 3rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    width: -webkit-fill-available;
    font-size: 1.7rem;
    font-weight: 400;
    box-shadow: 0px 0px 2px 1px #eee;
    &::placeholder {
      font-size: 1.6rem;
      line-height: 1.4rem;
      font-weight: 200;
      color: $grey-text;
    }
  }

  .has-border-yellow {
    border-color: $pending-status;
  }
  .has-border-green {
    border-color: $completed-status;
  }
  .has-border-blue {
    border-color: $resolved-status;
  }
  .has-border-light-grey {
    border-color: $closed-status;
  }
  .has-border-red {
    border-color: $rejected-status;
  }
  .has-border-completed {
    border-color: $primary;
  }

  .mr-25 {
    margin-right: 25px;
  }
</style>
<style lang="scss" scoped>
.is-fixed {
  position: fixed!important;
}
.is-absolute {
  position: absolute!important;
}
.bottom-auto {
  bottom: auto!important;
}
.box-shadow {
  box-shadow: 0 5px 20px #000;
}
</style>