<template>
    <activity-block :display_time="display_time" :mobile_view="mobile_view" :activity="activity">
        <template #activity-description>
            <slot name="activity-description"></slot>
        </template>
        <template #activity-details>
          <div v-if="!mobile_view" class="is-flex" style="flex-wrap: wrap">
            <div v-for="user in list_of_users_to_display" :key="user.uid" class="ml-5 is-inline-flex py-5 mt-5 align-center bordered--user px-10">
                <user-avatar
                :user="user"
                :pxsize="24"
                :custom_class="'tiny-user-avatar'"
                ></user-avatar>
                <span :class="{'text--strike-through' : strike_users}" class="ml-5 is-medium-14-500-17 mx-10" v-username="user"></span>
            </div>
            <div v-if="list_of_hidden_users.length" class="sh-user-tag__link ml-5 mt-5">+{{ list_of_hidden_users.length }}</div>
          </div>
          <user-tag
            v-else
            class="users"
            :custom_class="'user-style'"
            :custom_size="26"
            :tagsCountToShow="3"
            :users="list_of_users"
          ></user-tag>
        </template>  
    </activity-block>
</template>

<script>
import ActivityBlock from "./activity-block";
import UserTag from "@/desktop/shared/components/tags/user-tag-new";

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
        list_of_users: {
            required: true
        },
        strike_users: {
            required: false,
            type: Boolean,
            default: false
        },
        display_time: {
            type: Boolean,
            default: true
        }
    },
    data: () => ({
        number_of_users_to_display: 5
    }),
    computed: {
        list_of_users_to_display () {
            return this.list_of_users.slice(0, this.number_of_users_to_display);
        },
        list_of_hidden_users () {
            return this.list_of_users.slice(this.number_of_users_to_display);
        }
    },
    components: {
        ActivityBlock,
        UserTag
    }
}
</script>