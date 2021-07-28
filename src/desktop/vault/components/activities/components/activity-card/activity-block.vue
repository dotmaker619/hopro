<template>
    <div :class="{'activity-block': !mobile_view, 'activity-block__mobile-view': mobile_view}">
        <div :class="{'mobile-view has-slimscroll-xs' : mobile_view}" class="is-flex has-space-between align-center">
            <div class="is-flex align-center">
                <user-avatar
                :user="{...activity.actor.data, uid: activity.actor.id}" 
                :not_state="true"
                :pxsize="24"
                :custom_class="'tiny-user-avatar'"
                ></user-avatar>
                <span class="is-medium-14-500-17 has-text-grey is-inline-flex align-center">
                    <slot name="activity-description"></slot>
                </span>
            </div>
            <p class="is-medium-14-500-17 has-text-grey mt-5 pl-5" v-if="display_time && !mobile_view">{{ time }}</p>
        </div>
        <div :class="{'ml-30' : !mobile_view}" class="is-medium-14-500-17 mt-5 pl-5 is-inline-flex align-center">
            <slot name="activity-details"></slot>
        </div>
        <p v-if="display_time && mobile_view" class="is-medium-14-500-17 has-text-grey mt-5 pl-5">{{ time | sinceDays }}</p>
    </div>   
</template>

<script>
export default {
    props: {
        activity: {
            required: true
        },
        mobile_view: {
            type: Boolean,
            default: false
        },
        display_time: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            time: this.mobile_view ? new Date(`${this.activity.created} UTC`).toISOString() : moment(moment.utc(this.activity.created).toDate()).local().format("lll")       
        }
    }
}
</script>

<style lang="scss" scoped>
    .activity-block {
        margin-left: 0rem;
        white-space: nowrap;
        padding: 2rem 4rem;
        height: auto;
        &__mobile-view {
            @extend .activity-block;
            padding: 2rem;
            padding-top: 0;
        }
        .mobile-view {
            width: stretch;
            padding-bottom: 2.5px;
            padding-top: 2.5px;
        }
        .has-text-grey {
            color: rgba(122, 122, 122, 0.8) !important;
        }
        .bordered {
            border-radius: 20px;
            &--user {
              @extend .bordered;
              border: solid 1px rgba(50, 60, 70, 0.2);
            }
            &--file {
              @extend .bordered;
              border: solid 1px #2585d3;
            }
        }
        .text--strike-through {
          text-decoration: line-through;
        }
        .unset-margin-top {
            margin-top: 0;
        }
    }
</style>
