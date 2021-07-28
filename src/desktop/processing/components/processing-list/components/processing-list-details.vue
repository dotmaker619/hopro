<template>
  <div class="padding-20">
    <div class="processing-list__details">
      <div class="processing-list__details--header mb-20">
        <p class="is-semiBold-18-600-22">Details</p>
      </div>
      <div class="processing-list__details--data mb-30" v-if="details">
        <div class="columns">
          <div class="column margin-auto">
            <p class="is-regular-14-00-17 has-text-theme-grey has-opacity-7 mb-10">Action</p>
            <p class="is-capitalized is-medium-14-500-17">{{details[0].action}}</p>
          </div>
          <div class="column margin-auto">
            <p class="is-regular-14-00-17 has-text-theme-grey has-opacity-7 mb-10">Subject</p>
            <p class="is-capitalized is-medium-14-500-17">{{details[0].subject_data.data}}</p>
          </div>
          <div class="column margin-auto">
            <p class="is-regular-14-00-17 has-text-theme-grey has-opacity-7 mb-10">Initiated Time</p>
            <p
              class="is-capitalized is-medium-14-500-17 no-whitespace-wrap"
            >{{ details[0].created_at | dateFormat}}</p>
          </div>
          <div class="column margin-auto">
            <p class="is-regular-14-00-17 has-text-theme-grey has-opacity-7 mb-10">Finished Time</p>
            <p
              class="is-capitalized is-medium-14-500-17 no-whitespace-wrap"
            >{{details[0].finished_at | dateFormat}}</p>
          </div>
          <div class="column margin-auto">
            <p class="is-regular-14-00-17 has-text-theme-grey has-opacity-7 mb-10">Status</p>
            <p class="is-capitalized is-medium-16-500-19 has-text-theme-black">{{details[0].status}}</p>
          </div>

          <div class="column margin-auto">
            <router-link
              class="sh-button is-regular-14-00-17"
              :to="{name: 'processing-config', params:{id: process}}"
            >Download Report</router-link>
          </div>
        </div>
      </div>
    </div>

    <processing-list-events :actions="details" v-if=" $route.name != 'group-details-processing'"></processing-list-events>
  </div>
</template>

<script>
import { processingService } from "@/desktop/shared/services/";
import ProcessingListEvents from "./processing-list-events";

export default {
  props: ["process"],
  components: {
    ProcessingListEvents
  },
  data() {
    return {
      details: null
    };
  },
  created() {
    this.getAction();
  },
  methods: {
    async getAction() {
      let { results } = await processingService.get_action({
        id: this.process
      });
      if (results) {
        this.details = results;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
