<template>
  <div class="is-sh-dropdown" :class="{ 'priority-dropdown': !create_new && !bulk_action }" v-click-outside="() => (active = false)">
    <div class="is-pointer" @click="active = !active">
      <div v-if="is_multi_select" class="is-medium-14-500-17 has-primary-text is-flex is-vcenter">
        <div v-if="priority && priority.length" class="is-flex is-vcenter">
          <sh-icon
            :name="'priority-' + `${priority_value ? priority_value : 1}`"
            class="is-pointer is-18x18 mr-5"
            v-for="priority_value in priority"
            :key="priority_value"
          ></sh-icon>
          <sh-icon :file="'terra_sprite'" :name="'terra-filter-add-priority'" class="is-20x20 ml-5"></sh-icon>
        </div>

        <p v-else class="is-flex is-vcenter">
          <sh-icon :file="'terra_sprite'" :name="'terra-filter-add-priority'" class="is-20x20 mr-5"></sh-icon>
          <span class="no-whitespace-wrap">Select priority</span>
        </p>
      </div>
      <sh-icon v-else-if="bulk_action" :name="'priority'" class="is-20x20" v-tooltip="{ content: 'Add Priority' }"></sh-icon>
      <sh-icon v-else-if="!priority" :name="'add-priority'" class="is-24x24" v-tooltip="{ content: 'Add Priority' }"></sh-icon>

      <div v-else class="is-selector" :class="[[ticket && !ticket.writeAccess ? 'has-no-access' : null], [active ? 'is-open' : 'is-close']]">
        <p class="is-flex">
          <sh-icon
            :name="'priority-' + `${priority ? priority : 4}`"
            class="is-20x20 mr-5"
            v-tooltip="{ content: priority ? `${priorities[priority]}` : 'Add Priority' }"
          ></sh-icon>
          <span>{{ priorities[priority] }}</span>
        </p>
      </div>
    </div>
    <div :class="{'mobile-background-new': isMobile}" v-if="active" @click="active = !active"></div>
    <ul class="is-options-list" v-if="active" :class="{'mobile-view-option': isMobile}">
      <li class="item mobile-header">
        <p class="is-medium-16-500-19">Priority</p>
        <p @click="active = false">
          <sh-icon :name="'close'" class="is-12x12" v-if="active"></sh-icon>
        </p>
      </li>
      <li class="item is-flex is-between pl-17" @click.stop="change_priority(i)" v-for="(priority_option, i) in priorities" :key="priority_option">
        <p class="item--text is-capitalized is-flex">
          <sh-icon :name="'priority-' + i" class="is-20x20 item--icon"></sh-icon>
          <span>{{ priority_option }}</span>
        </p>
        <span>
          <sh-icon :name="'checkmark'" class="is-12x12 item--icon" v-if="!is_multi_select ? i == priority : selected.includes(i)" />
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: ["priority", "bulk_action", "create_new", "is_multi_select"],
    data() {
      return {
        active: false,
        selected: this.priority || [],
        priorities: {
          1: "Critical",
          2: "High",
          3: "Medium",
          4: "Low",
        },
      };
    },

    methods: {
      change_priority(val) {
        if (this.is_multi_select) {
          if (this.selected.includes(val)) {
            _.remove(this.selected, (el) => el == val);
            this.selected = Object.assign([], this.selected);
          } else {
            this.selected.push(val);
          }
          this.$emit("input", this.selected);
        } else {
          this.$emit("change_ticket_priority", val);
          this.active = false;
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
  .is-selector {
    &.is-open {
      width: 15rem;
    }
    &.is-close {
      width: 10.9rem;
    }
  }

  .is-options-list {
    width: 15rem;
  }
  .is-6x6 {
    height: 6px;
    width: 6px;
  }
  .priority-dropdown {
    position: relative;
    // left: -1.75rem;
    width: 10.9rem;
  }
  .has-shadow-background {
    padding: 6px;
    border-radius: 100%;
    box-shadow: 2px 2px 5px 0px #ddd;
    background: white;
  }

  .pl-17 {
    padding-left: 17px;
  }
</style>
