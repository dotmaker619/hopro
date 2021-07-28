<template>
<div>
  <div v-if="selected.length" class="attachment-mobile-bulk-actions is-flex align-center has-space-between">
    <div class="is-flex align-center">
      <div
        @click.stop="deselect_all" v-if="!is_mobile"
        class="is-pointer is-semiBold-16-600-22 mr-10"
      >Clear All</div>
      <sh-icon v-else @click.native="deselect_all" 
        :name="'ticket-detail-close'" 
        class="is-pointer is-14x14 mr-10" />
      <div class="is-medium-14-500-17">Selected ({{selected.length}}):</div>
    </div>
    <div class="is-flex">
      <a @click="download_files('selected')">
        <sh-icon  class="mr-10 ml-10 is-pointer is-20x20" :file="'tickets_sprite'" :name="'download-attachments'"></sh-icon>
      </a>
      <img v-if="!is_mobile" style="height:20px" src="@/assets/icons/seperate.svg" alt/>
      <a @click="favorite_selected">
        <sh-icon  class="mr-10 ml-10 is-pointer is-20x20" :file="'tickets_sprite'" :name="'bookmark'"></sh-icon>
      </a>
      <img v-if="!is_mobile" style="height:20px" src="@/assets/icons/seperate.svg" alt/>
      <a @click="bulk_delete_attachments">
        <sh-icon  class="mr-10 ml-10 is-pointer is-20x20" :file="'tickets_sprite'" :name="'delete-2'"></sh-icon>
      </a>
    </div>
  </div>
  <div v-else-if="!is_mobile" class="is-relative is-pointer" @click="is_download_dropdown=true">
    <div class="attachment-download-button is-inline-flex align-center">
      <sh-icon  class="image is-pointer is-20x20 ml-10" :file="'tickets_sprite'" :name="'download-attachments'"></sh-icon>
      <span class="is-medium-14-500-17 ml-5 mr-10">Download</span>
      <img class style="height:34px" src="@/assets/icons/seperate.svg" alt />
      <sh-icon :name="`${is_download_dropdown?'expand':'collapse'}`" class="is-16x16 is-pointer ml-5"></sh-icon>
    </div>
    <div
      class="download-dropdown is-absolute"
      v-if="is_download_dropdown"
      v-click-outside="() => is_download_dropdown = false"
    >
      <div class="card">
        <a
          @click="download_files"
          class="button is-flex is-start is-white is-fullwidth is-medium-16-500-19"
        >
          <sh-icon  class="image is-pointer is-20x20 mr-10 sh-dropdown-content__item--icon my-5" :file="'tickets_sprite'" :name="'download-attachments'"></sh-icon>
          <a class="has-text-black btn-text">All</a>
        </a>
        <a
          @click="download_files('favorite')"
          class="button is-flex is-start is-white is-fullwidth is-medium-16-500-19"
        >
          <sh-icon  class="image is-pointer is-20x20 mr-10 sh-dropdown-content__item--icon my-5" :file="'tickets_sprite'" :name="'download-attachments'"></sh-icon>
          <a class="has-text-black btn-text">Favorites</a>
        </a>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import AttachmentsMixin from '@/desktop/tickets/components/ticket-details/components/attachments/attachments.mixin.vue';

export default {
  props: ['deselectUid','ticket','selected','existing_files'],
  mixins: [AttachmentsMixin],
  data(){
    return {
      is_download_dropdown: false,
    }
  },
  computed: {
    is_mobile() {
      return (window.screen.width < 900) ;
    },
  }
}
</script>

<style lang="scss">
.attachment-download-button {
  border-radius: 6px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px rgba(23, 30, 72, 0.1);
  color: #747891;
  width: 136px;
  height: 36px;
}
.attachment-mobile-bulk-actions {
  @include for-size(tablet){
    z-index: 999;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 46px;
    box-shadow: 0 -5px 10px 0 rgba(0, 0, 0, 0.16);
    background-color: white;
    color: #171e48;
    padding: 0 1.5rem;
  }
}
</style>