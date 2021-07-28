<template>
  <div v-if="existing_files">
    <div v-if="$route.meta.screen == 'mobile'">
      <div class="attachment-list mt-5">
        <div v-for="(file, index) in existing_files" :key="file.uid">
          <mobile-attachment
            :service="service"
            :ticket="ticket"
            :file="file"
            :index="index"
            :template="template"
            @init-pdftron="webViewerfile = $event"
            :selected_attachments="selected_attachments"
            @toggle_selection="TOGGLE_SELECTION"
            @attachment_card_click="ATTACHMENT_CARD_CLICK"
            @refresh_attachments="$emit('refresh_attachments')"
          ></mobile-attachment>
        </div>
      </div>
    </div>
    <div v-else>
      <drag-select-container @change="handle_drag_selection" selectorClass="attachment" class="attachment-list pt-20">
        <div v-for="(file, index) in existing_files" :key="file.uid" :data-file="file.uid">
          <attachment
            :service="service"
            :ticket="ticket"
            :file="file"
            :index="index"
            :template="template"
            :selected_attachments="selected_attachments"
            @init-pdftron="webViewerfile = $event"
            @delete_attachment="$emit('delete_attachment', $event)"
            @toggle_selection="TOGGLE_SELECTION"
            @attachment_card_click="ATTACHMENT_CARD_CLICK"
            @refresh_attachments="$emit('refresh_attachments')"
          ></attachment>
        </div>
      </drag-select-container>
    </div>
    <prompt-modal
      v-if="webViewerfileDelete"
      :name="webViewerfile.uid"
      :heading="webViewerfile.fileName"
      :iconPath="require('@/assets/icons/prompt/delete.svg')"
      :footer="true"
      :cancelString="'Cancel'"
      :confirmString="'Delete'"
      @cancel="webViewerfileDelete = false"
      @confirm="
        $emit('delete_attachment', webViewerfile);
        webViewerfileDelete = false;
        webViewerfile = null;
      "
      @closed="webViewerfileDelete = false"
    >
      <div class="prompt-modal__content__text" slot="content">
        Are you sure you want to delete
        {{ webViewerfile.fileName.charAt(0).toUpperCase() + webViewerfile.fileName.slice(1) }}?
      </div>
    </prompt-modal>
    <web-viewer
      v-if="webViewerfile"
      :url="webViewerfile.url"
      :name="webViewerfile.fileName"
      :bookmark="webViewerfile.bookmark"
      :icon="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(webViewerfile.fileName) + '.svg')"
      @close="webViewerfile = null"
      @delete="webViewerfileDelete = true"
    ></web-viewer>
  </div>
</template>

<script>
  import DragSelect from "vue-drag-select/src/DragSelect.vue";
  import { ticketService } from "@/desktop/shared/services/";
  import Attachment from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment.component";
  import MobileAttachment from "@/desktop/tickets/components/ticket-details/components/attachments/components/mobile-attachment.component";
  import webViewer from "@/desktop/shared/components/pdftron/web-viewer-tickets";
  import PromptModal from "@/desktop/shared/components/prompt-modal";

  import prettyFileIcons from "pretty-file-icons";

  export default {
    data() {
      return {
        selected_attachments: [],
        last_selected: -1,
        webViewerfileDelete: false,
        webViewerfile: null,
        prettyFileIcons,
      };
    },
    created() {
      this.$eventHub.$on(`deselect-${this.deselectUid}`, () => this.deselect_all());
    },
    beforeDestroy () {
      this.$eventHub.$off(`deselect-${this.deselectUid}`);
    },
    watch: {
      selected_attachments: function(val) {
        this.$emit("selection_change", this.selected_attachments);
      },
    },
    components: {
      Attachment,
      MobileAttachment,
      webViewer,
      PromptModal,
      "drag-select-container": DragSelect,
    },
    props: ["ticket", "existing_files", "deselectUid", "template", "service"],
    methods: {
      deselect_all() {
        this.selected_attachments = [];
        this.last_selected = -1;
        this.$emit("selection_change", this.selected_attachments);
      },
      handle_drag_selection(files) {
        let selected_arr = files.map((comp) => comp.file.uid);
        let index;
        this.SET_SELECTED(files.map((comp) => comp.file.uid));
        if (selected_arr.length > 0) {
          index = selected_arr[selected_arr.length - 1];
        } else {
          index = -1;
        }
        this.SET_LAST_SELECTED(index);
      },
      SET_SELECTED(list) {
        this.selected_attachments = list;
      },
      SET_FILTERED(list) {
        this.existing_files = list;
      },
      SET_LAST_SELECTED(val) {
        this.last_selected = val;
      },
      TOGGLE_SELECTION(uid) {
        let exists = this.selected_attachments.includes(uid);
        let selected = [...this.selected_attachments];
        if (exists) {
          _.remove(selected, (selecteduid) => selecteduid == uid);
          if (!this.selected_attachments.length > 0) {
            this.last_selected = -1;
          }
        } else {
          selected.push(uid);
          this.last_selected = uid;
        }
        this.selected_attachments = selected;
      },
      ATTACHMENT_CARD_CLICK(uid) {
        if (this.last_selected !== -1) {
          let lastIndex = this.existing_files.findIndex((f) => f.uid == this.last_selected);
          let currentIndex = this.existing_files.findIndex((f) => f.uid == uid);
          let min = Math.min(lastIndex, currentIndex);
          let max = Math.max(lastIndex, currentIndex);

          let selected = [];
          for (let i = min; i <= max && i < this.existing_files.length; i++) {
            selected.push(this.existing_files[i].uid);
          }

          this.selected_attachments = _.union(this.selected_attachments, selected);
          this.last_selected = uid;
        } else {
          this.TOGGLE_SELECTION(uid);
        }
      },
    },
  };
</script>

<style lang="scss">
  .attachment-list {
    justify-items: center;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    // grid-gap: 3rem;
    @include for-size("tablet") {
      grid-template-columns: repeat(3, 1fr);
    }
    @include for-size("smartphones") {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
