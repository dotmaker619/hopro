<template>
  <div class="columns processing__events mt-20">
    <!-- Feed item -->
    <span class="heading has-text-weight-thin">Processing initiated</span>
    <div v-for="(action, i) in actions" :key="i" class="mt-20">
      <span v-if="action.status == 'finished'">
        <i class="far fa-check-circle timeline-icons has-text-success"></i>
      </span>
      <span v-else-if="action.status == 'progress'">
        <i class="fas fa-sync-alt timeline-icons has-text-primary process"></i>
      </span>
      <span v-else-if="action.status == 'pending'">
        <i class="far fa-clock timeline-icons has-text-orange"></i>
      </span>
      <span v-else-if="action.status == 'queued'">
        <i class="fas fa-fast-forward timeline-icons has-text-info"></i>
      </span>

      <span v-else-if="action.status == 'failed'">
        <i class="fas fa-exclamation-circle timeline-icons has-text-danger"></i>
      </span>

      <!-- <b-tooltip
        :label="`Started: ${action.created_at}
       Finished: ${action.finished_at} `"
        type="is-white"
        position="is-left"
        multilined
        size="is-large"
      >-->
      <div class="columns processing__events-item is-vcentered">
        <div class="tooltip-popup">
          <p class="sh-text-semibold-16">
            Started:
            <span class="sh-text-normal-16">{{action.created_at}}</span>
          </p>
          <p class="sh-text-semibold-16">
            Finished:
            <span class="sh-text-normal-16">{{action.finished_at}}</span>
          </p>
        </div>
        <div class="processing__events-item--date is-pointer is-capitalized column">
          <p
            class="is-capitalized has-text-right sh-text-normal-16"
          >{{action.created_at | prettyDate}}</p>
        </div>
        <div class="columns is-marginless">
          <div class="timeline-divider">
            <p class="timeline-divider--point"></p>
          </div>
        </div>
        <div class="processing__events-item--action is-pointer is-capitalized column">
          <p class="name is-capitalized sh-text-normal-18">{{action.action}}</p>
          <p class="sh-text-semibold-14 has-opacity-7 has-text-grey-dark">
            <i class="far fa-check-circle t has-text-success"></i>
            {{action.status}}
          </p>
        </div>
      </div>
      <!-- </b-tooltip> -->
    </div>
  </div>
</template>

<script>
import { processingService } from "@/desktop/shared/services/";

export default {
  data() {
    return {
      actions: null
    };
  },
  created() {
    this.getAction();
  },
  methods: {
    async getAction() {
      let { results } = await processingService.get_action({
        id: this.$route.params.id
      });
      if (results) {
        this.actions = results;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.processing__events {
  flex-direction: column;
  align-items: center;

  &-item {
    height: 10rem;
    position: relative;
    &--action,
    &--date {
      min-width: 10rem;
    }
    .tooltip-popup {
      display: none;
      position: absolute;
      background: #fff;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0px 0px 2px 2px #eee;
      z-index: 1;
      left: 30rem;
      width: 100%;
    }
    &:hover {
      .tooltip-popup {
        display: block;
      }
    }
  }
}
.timeline-icons {
  font-size: 1.4rem;
  display: block;
  position: absolute;
  top: 20%;
  left: -10px;
  z-index: 900;
  border: none;
  background: transparent;
}

.timeline-divider {
  height: 10rem;
  background-color: #ddd;
  width: 1px;
  margin: 5px 2rem;
  &--point {
    height: 6px;
    width: 7px;
    background: #222;
    border-radius: 1rem;
    position: relative;
    top: 50%;
    right: 3px;
  }
}
</style>


