<template>
  <div>
    <div class="divider"></div>
    <div class="processing-list__events" v-if="actions">
      <div class="processing-list__events--header mb-20">
        <p class="is-semiBold-18-600-22">Events</p>
        <span class="is-medium-12-500-14 has-text-theme-black has-opacity-7">Processing initiated</span>
      </div>
      <div class="processing-list__events--data has-slimscroll-xs-h is-flex pb-20">
        <div class="is-narrow move-action" @click="move_left" v-if="val_1 > 1">
          <i class="fas fa-chevron-circle-left"></i>
        </div>
        <div
          class="processing-list__events--action is-paddingless has-text-centered"
          v-for="action in actions.slice(val_1, val_2)"
          :key="action.uid"
        >
          <div class="processing-list__events--action-item pr-30">
            <p class="is-medium-16-500-19 has-text-theme-black">{{action.action}}</p>
            <p
              class="is-medium-14-500-17 has-text-theme-black has-opacity-7 mt-10 is-capitalized mb-20"
            >{{action.status}}</p>
            <p class="point"></p>
          </div>
        </div>
        <div
          class="move-action"
          @click="move_right"
          v-if="actions.length > 6 && val_2 < actions.length"
        >
          <i class="fas fa-chevron-circle-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["actions"],
  data() {
    return {
      val_1: 0,
      val_2: 6
    };
  },
  methods: {
    move_left() {
      this.val_1 -= 6;
      this.val_2 -= 6;
    },
    move_right() {
      this.val_1 += 6;
      this.val_2 += 6;
    }
  }
};
</script>
<style lang="scss" scoped>
.processing-list__events {
  margin-top: 3rem;
  &--data {
    justify-content: flex-start;
  }
  &--action {
    border-bottom: 1px solid #ddd;
    width: 15%;
    &-item {
      position: relative;
      .point {
        height: 6px;
        width: 6px;
        background: #555;
        border-radius: 2rem;
        position: absolute;
        bottom: -23px;
        left: 6rem;
      }
    }
  }

  .move-action {
    display: flex;
    align-items: center;
    color: $grey;
    :hover {
      color: $primary;
      cursor: pointer;
    }
  }
}
</style>

