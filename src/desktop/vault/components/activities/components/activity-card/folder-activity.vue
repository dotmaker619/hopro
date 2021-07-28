<template>
    <activity-block
      :mobile_view="mobile_view"
      :activity="activity"
    >
        <template #activity-description>
            <slot name="activity-description"></slot>
        </template>
        <template #activity-details>
            <sh-icon :file="'vault_sprite'" :name="'add-folder'" class="is-16x16" />
            <p :class="{'text--strike-through' : activity.verb.toLowerCase().includes('delete')}" class="is-medium-14-500-17 ml-5">{{ folder_name ? folder_name : (activity.attributes.name ? activity.attributes.name : activity.object.data.name)}}</p>
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
        folder_name: {
            type: String,
            required: false
        }
    },
    components: {
        ActivityBlock
    }
}
</script>