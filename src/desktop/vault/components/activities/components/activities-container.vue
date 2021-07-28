<template>
  <div @mouseenter="display_show_more = true" @mouseleave="display_show_more = false" class="activities-container is-relative">
    <activity-card :class="{'activity-outline' : index !== activities_display_set.length - 1}" v-for="(activity, index) in activities_display_set" :key="activity.id" :activity="activity"></activity-card>
    <button :class="{'is-vhidden': !display_show_more}" class="has-text-centered has-background-white is-relative is-medium-14-500-17 show-btn is-pointer px-5 py-5"
        @click="show_more_activities" v-if="activities_remaining_set.length">
        Show more
    </button>
  </div>
</template>

<script>
import * as cloneDeep from 'lodash/cloneDeep';
import ActivityCard from "./activity-card";

export default {
    components: {
        ActivityCard
    },
    data: () => ({
        activities_remaining_set: [],
        activities_display_set: [],
        display_show_more: false
    }),
    props: {
        activities: {
            default: [],
            required: true
        },
        number_of_activities_to_display: {
            type: Number,
            default: 3
        }
    },
    methods: {
        show_more_activities () {
            const activities_to_display = this.activities_remaining_set.splice(0, this.number_of_activities_to_display);
            this.activities_display_set = this.activities_display_set.concat(activities_to_display);
        }
    },
    watch: {
        activities: {
            immediate: true,
            handler (listOfActivities) {
                if (listOfActivities) {
                    this.activities_remaining_set = cloneDeep(this.activities);
                    this.show_more_activities();
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.activities-container {
    .show-btn {
        left: 50%; transform: translate(-50%, 70%);
        color: #2585d3;
        border-radius: 2rem;
        border: 1px solid #8d95aa;
        width: 10rem;
    }   
    .activity-outline {
        border-bottom: 1px solid #eee;
    }
}
</style>