<template>
    <activity-block
        :style="username_truncate_width"
        :display_time="display_time"
        :mobile_view="mobile_view"
        :activity="activity"
    >
        <template #activity-description>
            changed owner to
        </template>
        <template #activity-details>
            <div
                v-if="activity.attributes.owner"
                class="is-inline-flex px-10 py-5 align-center bordered--user"
            >
                <user-avatar
                :user="activity.attributes.owner"
                :pxsize="24"
                :custom_class="'tiny-user-avatar'"
                ></user-avatar>
                <span
                :class="{'username-truncate' : mobile_view}"
                class="ml-5 is-medium-14-500-17 mx-10"
                v-username="activity.attributes.owner"
                ></span>
            </div>
        </template>
    </activity-block>
</template>

<script>
import ActivityBlock from "./activity-block";

export default {
    props: {
        activity: {
            required: true
        },
        mobile_view: {
            type: Boolean,
            default: false,
            required: false
        },
        display_time: {
            type: Boolean,
            default: true
        },
        text_truncate_length: {
            type: Number,
            default: 17,
            required: false
        }
    },
    components: {
        ActivityBlock
    },
    computed: {
        username_truncate_width() {
            return `--username-truncate-width : ${this.text_truncate_length}ch`;
        }
    }
}
</script>

<style lang="scss" scoped>
  .username-truncate {
    max-width: var(--username-truncate-width);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>