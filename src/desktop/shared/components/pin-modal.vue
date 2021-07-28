<template>
  <prompt-modal
    :name="'pin-modal'"
    :heading="resourceName"
    :footer="true"
    :cancelString="'Cancel'"
    :confirmString="confirmString"
    @cancel="$emit('closed')"
    @confirm="toggle_tab_pinning"
    @closed="$emit('closed')"
  >
    <input
      v-if="!isPinned"
      v-model="pinName"
      v-focus
      class="prompt-modal__content__input"
      type="text"
      :placeholder="'Enter pin name'"
      slot="content"
    />
    <div v-else class="prompt-modal__content__text" slot="content">
      Are you sure you want to unpin
      the {{resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}}?
    </div>
  </prompt-modal>
</template>

<script>
import PromptModal from "@/desktop/shared/components/prompt-modal";
import PinMixin from '@/desktop/shared/mixins/pin.mixin';

export default {
  mixins: [PinMixin],
  components: {
    PromptModal
  },
  props: ["resourceName", "resourceType"],
  data() {
    return {
      pinName: this.resourceName,
      
    };
  },
  computed: {
    confirmString() {
      if (this.isPinned) return "Unpin";
      return "Pin";
    }
  },
  methods: {
    async toggle_tab_pinning() {
      if (this.isPinned) {
        // unpin
        let updated_pins = this.PINNED_TABS.filter(
              p => p.path !== this.$route.path
            )
        this.edit_or_unpin(updated_pins);
      } else {
        // create pin
        let pinObj = {
          name: this.pinName||this.resourceName,
          path: this.$route.path,
          type: this.resourceType
        };
        let pinnedList = [...this.PINNED_TABS];
        pinnedList.unshift(pinObj);
        this.edit_or_unpin(pinnedList.slice(0, this.maxPinnedTabs));
      }
    }
  }
};
</script>