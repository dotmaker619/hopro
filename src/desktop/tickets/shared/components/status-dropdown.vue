<template>
  <div class="is-sh-dropdown is-status" v-click-outside="() => (active = false)">
    <div class @click="active = !active">
      <div v-if="is_multi_select" class="is-medium-14-500-17 has-primary-text is-flex is-vcenter">
        <div v-if="current_status && current_status.length" class="is-flex is-vcenter">
          <sh-icon
            :name="'status-' + `${status ? status : 1}`"
            :class="[`is-${size}x${size}`]"
            class="is-pointer"
            v-for="status in current_status"
            :key="status"
          ></sh-icon>
          <sh-icon :file="'terra_sprite'" :name="'terra-filter-add-status'" class="is-20x20 ml-5"></sh-icon>
        </div>
        <p v-else class="is-flex is-vcenter">
          <sh-icon :file="'terra_sprite'" :name="'terra-filter-add-status'" class="is-20x20 mr-5"></sh-icon>
          <span>Select status</span>
        </p>
      </div>
      <sh-icon
        v-tooltip="{ content: 'Update Status' }"
        :name="'status-' + `${current_status ? current_status : 1}`"
        :class="[`is-${size}x${size}`]"
        class="is-pointer"
        v-else-if="create_new || bulk_action || !show_names"
      ></sh-icon>

      <li
        v-else
        class="is-selector"
        :class="[active ? 'is-open ' + ` ${(status_options[current_status - 1].name).replace(/ /g, '')}-status` : 'is-close ' + ` ${(status_options[current_status - 1].name).replace(/ /g, '')}-status`]"
        :style="`${isMobile? 'border: 0':''}`"
      >
        <div class="is-flex align-center">
          <div
            class="status-pointer is-inline-block mr-10"
            :class="[current_status ? status_bg_classes[current_status] : status_bg_classes[1]]"
          ></div>
          <div class="sh-dropdown-content__item--text is-medium-16-500-19 has-text-theme-black is-capitalized">
            {{ status_options[current_status - 1].name }}
          </div>
        </div>
        <sh-icon :name="'expand'" class="is-16x16 ml-20" v-if="active"></sh-icon>
        <sh-icon :name="'collapse'" class="is-16x16 ml-20" v-else></sh-icon>
      </li>
    </div>
    <div :class="{'mobile-background-new': isMobile}" v-if="active" @click="active = !active"></div>
    <ul class="is-options-list is-status" :class="[{ 'ml--13 top-border-radius': !show_names }, {'mobile-view-option': isMobile}]" v-if="active">
      <li class="item mobile-header">
        <p class="is-medium-16-500-19">Status</p>
        <p @click="active = false">
          <sh-icon :name="'close'" class="is-12x12" v-if="active"></sh-icon>
        </p>
      </li>
      <li
        class="item is-flex is-between"
        v-for="state in status_options"
        :key="state.value"
        @click="state.value == 6 ? update_and_close() : change_status(state)"
        :class="{ 'is-disabled is-not-allowed': disabled_status && disabled_status.includes(parseInt(state.value)) }"
      >
        <div class="is-flex">
          <div class="status-pointer is-inline-block mr-10" :class="status_bg_classes[state.value]"></div>
          <div class="item--text is-medium-16-500-19 is-capitalized">{{ state.name }}</div>
        </div>
        <p class="is-pulled-right">
          <sh-icon
            :name="'checkmark'"
            class="is-12x12 item--icon"
            v-if="!is_multi_select ? state.value == current_status : selected.includes(state.value)"
          />
        </p>
      </li>
    </ul>
  </div>
</template>
<script>
  export default {
    props: {
      is_multi_select: {
        type: Boolean,
        default: false,
      },
      current_status: {},
      show_names: {
        type: Boolean,
        default: true,
      },
      size: {
        type: Number,
        default: 26,
      },
      disabled_status: Array,
      status_options: {
        type: Array,
        default: [
          {
            name: "pending",
            value: 1,
          },
          {
            name: "in progress",
            value: 2,
          },
          {
            name: "resolved",
            value: 3,
          },
          {
            name: "closed",
            value: 4,
          },
          {
            name: "rejected",
            value: 5,
          },
          // {
          //   name: "completed",
          //   value: "6"
          // }
        ],
      },
    },
    data() {
      return {
        active: false,
        selected: this.current_status || [],
        status_bg_classes: {
          "1": "is-bg-yellow",
          "2": "is-bg-green",
          "3": "is-bg-blue",
          "4": "is-bg-light-grey",
          "5": "is-bg-red",
          "6": "is-bg-blue",
        },
        status_shadow_classes: {
          "1": "has-shadow-yellow",
          "2": "has-shadow-green",
          "3": "has-shadow-blue",
          "4": "has-shadow-light-grey",
          "5": "has-shadow-red",
          "6": "has-shadow-blue",
        },
      };
    },

    methods: {
      change_status(status) {
        if (this.is_multi_select) {
          if (this.selected.includes(status.value)) {
            _.remove(this.selected, (el) => el == status.value);
            this.selected = Object.assign([], this.selected);
          } else {
            this.selected.push(status.value);
          }
          this.$emit("input", this.selected);
        } else {
          this.$emit("update-ticket-status", status);
          this.active = false;
        }
      },
      update_and_close() {
        this.change_status({
          name: "completed",
          value: "3",
        });
        this.$emit("close");
      },
    },
  };
</script>
<style lang="scss">
  .status-button {
    cursor: pointer;
    margin: auto;
    padding: 0.5rem 1.5rem;
    font-size: 1.8rem;
    font-weight: 500;
    height: 4rem;
    box-shadow: 0px 0px 1px 1px;
    border-radius: 0.5rem;
    background-color: $white;
    display: flex;
    width: max-content;
    :focus {
      outline: transparent auto 0px;
    }
    @include for-size(portrait-tablets) {
      padding: 0;
      box-shadow: none;
    }
  }
  .is-26x26 {
    height: 2.6rem;
    width: 2.6rem;
  }
  .is-status {
    .is-selector {
      &.is-close {
        width: 18rem;
        display: flex;
        justify-content: space-between;
        border-radius: 6px;
        &.pending-status {
          border: 1px solid $pending-status;
        }
        &.inprogress-status {
          border: 1px solid $completed-status;
        }
        &.resolved-status {
          border: 1px solid $completed-status;
          border: 1px solid $resolved-status;
        }
        &.closed-status {
          border: 1px solid $closed-status;
        }
        &.rejected-status {
          border: 1px solid $rejected-status;
        }
        @include for-size(portrait-tablets) {
          width: min-content;
          border: none !important;
        }
      }
      &.is-open {
        width: 18rem;
        display: flex;
        justify-content: space-between;

        @include for-size(portrait-tablets) {
          width: min-content;
        }
      }
    }
    .is-options-list {
      width: 18rem;

      @include for-size(portrait-tablets) {
        position: fixed;
        bottom: 0px;
        width: 100%;
        left: 0;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
    }
  }

  .top-border-radius {
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16) !important;
  }

  .ml--13 {
    margin-left: -1.3rem;
  }
</style>
