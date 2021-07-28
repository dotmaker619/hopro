<template>
  <div>
    <div
      class="mobile-viewer-rightmenu__icon mobile-viewer-rightmenu__icon-applications"
      @click="app_active=!app_active;show_popup=app_active"
    >
      <sh-icon
        v-if="app_active"
        :file="'terra_sprite'"
        :name="'terra-application-active'"
        class="is-12x12"
      ></sh-icon>
      <sh-icon v-else :file="'terra_sprite'" :name="'terra-application'" class="is-12x12"></sh-icon>
    </div>
    <div class="mobile-viewer-application">
      <swipeable-bottom-sheet
        :class="`${tab=='create-new-ticket' ? 'ticket-open': 'create-card-app'}`"
        :openY="0.0"
        :halfY="`${tab!='create-new-ticket' ? 0.32 : 0.75}`"
        ref="swipeableBottomSheet"
        v-if="show_popup"
        @close="app_active=false"
      >
        <div v-if="tab!='create-new-ticket'" class="mobile-viewer-application__tabs">
          <div
            class="mobile-viewer-application__tabs_item"
            :class="{ 'is-active': tab=='tickets' }"
            @click="tab = 'tickets'"
          >Tickets</div>
          <div
            class="mobile-viewer-application__tabs_item"
            :class="{ 'is-active': tab=='vault'  }"
            @click="
              tab = 'vault'
            "
          >Vault</div>
        </div>

        <div>
          <!-- {{selected_feature_element}} -->
          <tickets
            v-show="tab=='tickets'"
            :element="selected_feature_element" :extra_query="{element: selected_feature_element.uid}"
            @create_new_ticket="tab='create-new-ticket'" :customclass="'app-create-ticket'" :hideSearchbar="true" :uploadbtnclass="'terra-fab'"
          />
        </div>
        <vault v-show="tab=='vault'" :element="selected_feature_element" />
        <!-- <CreateNewTicket
          v-click-outside="()=>(tab='tickets')"
          :element="selected_feature_element"
          v-if="tab=='create-new-ticket'"
          @close="tab='tickets'" :fromViewerApp='true'
        /> -->
        <!-- <div
          class="terra-fab"
          v-if="app_active && selected_feature_element && tab!='create-new-ticket'"
        >
          <sh-icon
            @click.native="tab='create-new-ticket'"
            :file="'terra_sprite'"
            :name="'terra-fab-add'"
            class="is-16x16"
          ></sh-icon>
        </div> -->
      </swipeable-bottom-sheet>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { ticketService } from "@/desktop/shared/services/";
import { SwipeableBottomSheet } from "@/mobile/shared/components/swipe-bottom-card";
import ListItem from "@/mobile/modules/tickets/components/tickets-list/components/mobile-list-item.vue";
import Tickets from "@/desktop/tickets/components/tickets-list/tickets-list.vue";

import Vault from "./components/vault";
import CreateNewTicket from "@/desktop/tickets/components/tickets-list/components/create-new-ticket.vue";
const queryString = require("query-string");

export default {
  props: ["state"],
  data() {
    return {
      tab: "tickets",
      app_active: false,
      show_popup: false
    };
  },
  components: {
    SwipeableBottomSheet,
    Tickets,
    Vault,
    CreateNewTicket
  },
  watch: {
    selected_feature_element(val) {
      this.show_popup = val && this.app_active ? true : false;
    }
  },
  computed: {
    ...mapGetters("viewer", ["selected_feature_element"]),
    ...mapState(["current_organization", "PUSHER"]),
    ...mapState("tickets", ["tickets"]),
    ...mapState("viewer", ["cluster_tickets"]),
  }
};
</script>

<style lang="scss">
.create-card-app {
  height: 70%;
  position: fixed;
  bottom: 0;
  z-index: 16;
}
.ticket-open {
  height: 70%;
  position: fixed;
  bottom: 0;
  z-index: 16;
}
.terra-fab {
  background-color: $primary;
  height: 3.6rem;
  width: 3.6rem;
  position: fixed !important;
  bottom: 20px;
  right: 15px;
  z-index: 11;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: 0px 1px 3px 0px $primary;
  font-size: 16px !important;
}
.app-create-ticket {
  position: fixed;
  bottom: 0;
  z-index: 100;
  width: 100%;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  overflow: visible;
  height: 18rem;
}
</style>