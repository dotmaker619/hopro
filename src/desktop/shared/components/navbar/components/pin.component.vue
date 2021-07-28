<template>
  <div class="pin-list__item is-flex align-center" @click="navigate_to_path" @mouseover="hover = true" @mouseleave="hover = false">
    <div class="pin-list__item--text columns align-center is-vcenter">
      <sh-icon
        class="image column is-3 is-36x36"
        style="border-radius:50%;"
        :style="`background-color:${hover || $route.path == pin.path ? '#2685d3' : '#616468'}`"
        :name="pin.type == 'therm' ? 'thermal' : pin.type"
      ></sh-icon>
      <input
        v-if="edit_pin == pin.path"
        type="text"
        name="name"
        id="pin"
        class="input column  is-10 ml-10 is-inline-input is-medium-14-500-20"
        :placeholder="pin.name"
        v-focus
        v-model="pin.name"
        @keyup.esc="edit_pin = -1"
        @keyup.enter="
          update_pin(pin);
          edit_pin = -1;
        "
      />
      <p v-else class="ml-10 column no-padding-left is-10 is-medium-14-500-20 has-opacity-7">{{ pin.name }}</p>
    </div>

    <div class="no-whitespace-wrap pin-list__item--actions">
      <sh-icon
        @click.stop.native="edit_pin = pin.path"
        :name="'pen'"
        :class="{ 'is-vhidden': !hover || edit_pin == pin.path }"
        class=" mr-10 is-16x16 is-inline is-pointer"
      ></sh-icon>
      <sh-icon
        :name="'tick-set-complete'"
        :class="{ 'is-hidden': !hover || edit_pin !== pin.path }"
        @click.stop.native="
          update_pin(pin);
          edit_pin = -1;
        "
        class=" mr-10  is-16x16 is-inline is-pointer"
      ></sh-icon>
      <sh-icon
        @click.stop.native="unpin(pin)"
        :class="{ 'is-vhidden': !hover }"
        :name="'unpinn'"
        class="ml-10 is-16x16 is-inline is-pointer"
      ></sh-icon>
    </div>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import PinMixin from "@/desktop/shared/mixins/pin.mixin";
  import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";

  export default {
    props: ["pin"],
    mixins: [PinMixin, TicketDetailsMixin],
    data() {
      return {
        edit_pin: -1,
        hover: false,
      };
    },
    computed: {
      ...mapState(["PINNED_TABS", "current_organization", "claims"]),
    },
    methods: {
      update_pin(item) {
        let updated_pins = this.PINNED_TABS.map((pin) => (pin.path == item.path ? { ...pin, name: item.name } : pin));
        this.edit_or_unpin(updated_pins);
      },
      unpin(pin) {
        let updated_pins = this.PINNED_TABS.filter((p) => p.path !== pin.path);
        this.edit_or_unpin(updated_pins);
      },
      navigate_to_path() {
        if (this.pin.type == "tickets") {
          let uid = this.pin.path.split("/")[2];

          this.open_ticket_details(uid);
        } else {
          this.$router.push({ path: this.pin.path });
        }
        this.$emit("close_pin_dropdown");
      },
    },
  };
</script>

<style></style>
