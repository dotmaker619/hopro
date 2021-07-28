<template>
  <div @mouseover="hover_state = true" @mouseout="hover_state = false" class="is-sh-dropdown align-center is-inline-flex">
    <!-- Displaying the list of tags tied to a resource -->
    <assigned-tags
      :truncate_length="truncate_length"
      :write_access="write_access"
      :complete="complete"
      :number_of_tags_to_display="number_of_tags_to_display"
      :resourceId="resourceId"
      :service="service"
      :tags="tags"
    />
    <div
      v-if="write_access"
      :class="{ 'is-vhidden': display_on_hover && !hover_state }"
      @click="dropdown_active = !dropdown_active"
      class="is-flex is-vcenter is-pointer"
    >
      <!-- content to toggle the dropdown (can be customized using the slot) -->
      <slot name="toggle-dropdown">
        <sh-icon v-tooltip="'Add Tags'" v-if="tags && tags.length" :name="'add-more-tags'" class="is-24x24"></sh-icon>
        <div v-else class="is-inline-flex align-center">
          <sh-icon :name="'add-more-tags'" class="is-24x24"></sh-icon>
          <span class="ml-10 is-medium-14-500-17 has-opacity-5 has-text-theme-black">Add tags</span>
        </div>
      </slot>
    </div>

    <dropdown-list
      v-click-outside="() => (dropdown_active = false)"
      :resourceId="resourceId"
      :service="service"
      :complete="complete"
      :tags="tags"
      v-if="dropdown_active"
      @close="dropdown_active = false"
    />
  </div>
</template>

<script>
  import DropdownList from "./components/dropdown-list";
  import AssignedTags from "./components/assigned-tags";

  export default {
    data() {
      return {
        dropdown_active: false,
        hover_state: false,
      };
    },

    components: {
      DropdownList,
      AssignedTags,
    },

    props: {
      tags: {
        default: [],
      },
      service: {
        default: null,
      },
      complete: {
        default: null,
      },
      resourceId: {
        default: null,
      },
      number_of_tags_to_display: {
        type: Number,
        default: null,
      },
      write_access: {
        type: Boolean,
        default: true,
      },
      display_on_hover: {
        type: Boolean,
        default: true,
      },
      truncate_length: {
        type: Number,
        default: 10,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .is-sh-dropdown {
    position: relative;
  }

  .toggle-dropdown {
    visibility: hidden;
    &:hover .toggle-dropdown {
      visibility: visible;
    }
  }
</style>
