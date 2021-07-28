<template>
  <div class="task-attachment">
    <div class="task-list-attachments--top">
      <div
        :style="`position:relative;top:15px;z-index:1;right: 0;padding: 0;height:36px;`"
        class="attachments-top-section is-flex align-center has-space-between"
      >
        <div></div>
        <div class="attachments-top-section__right is-flex align-center">
          <attachment-bulk-actions
            @refresh_attachments="get_attachments"
            :existing_files="existing_files"
            :ticket="ticket"
            :selected="selected"
            :deselectUid="task.uid"
          ></attachment-bulk-actions>
        </div>
      </div>
    </div>
    <div v-if="is_loading">
      <div v-if="$route.meta.screen !== 'mobile'">
        <div class="columns" v-for="i in 2" :key="i">
          <attachment-skeleton
            v-for="i in 4"
            :key="i"
            class="column is-3"
          ></attachment-skeleton>
        </div>
      </div>
      <div v-else>
        <div
          class="columns is-flex"
          style="flex-wrap: none"
          v-for="i in 2"
          :key="i"
        >
          <attachment-skeleton
            v-for="i in 3"
            :key="i"
            class="column is-4"
            style="width: 33.33%; flex: none"
          ></attachment-skeleton>
        </div>
      </div>
    </div>
    <upload-file
      @dragleave.native.prevent.stop="show_dropzone = false"
      @uploaded_success="upload_completed"
      service="tickets"
      :name="ticket.name"
      type="ticket"
      class="padding-15"
      :offlineData="{ checklist_id: checklist.uid, item_id: task.uid }"
      @close-uppy="
        getOfflineData();
        $emit('update_checklist',$event);
      "
      :uploadMethod="uploadMethod"
      :uid="ticket.uid"
      :id="`ticket_attachments_${task.uid}`"
      v-else-if="
        showUploader ||
        show_dropzone ||
        !(
          (existing_files && Object.keys(existing_files).length) ||
          (offlineAttachments && Object.keys(offlineAttachments).length)
        )
      "
    ></upload-file>
    <div v-else>
      <attachment-list
        v-if="existing_files && Object.keys(existing_files).length"
        class="task-list-tab has-slimscroll-xs"
        id="task-tab"
        :service="service"
        :deselectUid="task.uid"
        :existing_files="existing_files"
        :ticket="ticket"
        :template="{
          isTemplate: checklist.isTemplate,
          checklist_id: checklist.uid,
          task_id: task.uid,
        }"
        @delete_attachment="delete_attachment($event)"
        @selection_change="selected = $event"
        @refresh_attachments="get_attachments"
      ></attachment-list>
      <attachment-offline
        v-if="offlineAttachments && offlineAttachments.length"
        @deleteOfflineAttachment="deleteOfflineAttachment"
        :offlineAttachments="offlineAttachments"
      >
      </attachment-offline>
    </div>
    <attachment-bulk-actions
      class="attachment-mobile-actions"
      v-if="selected.length"
      @refresh_attachments="get_attachments"
      :existing_files="existing_files"
      :ticket="ticket"
      :deselectUid="task.uid"
      :selected="selected"
    ></attachment-bulk-actions>
  </div>
</template>

<script>
import axios from "axios";
import AttachmentList from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-list";
import AttachmentOffline from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-offline";
import store from "@/store/";
import { mapGetters, mapState } from "vuex";
import PromptModal from "@/desktop/shared/components/prompt-modal";
import UploadFile from "@/desktop/shared/components/upload-file";
import AttachmentSkeleton from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-skeleton";
import AttachmentBulkActions from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-bulk-actions";
import { set, get } from "idb-keyval";

export default {
  props: [
    "task",
    "ticket",
    "checklist",
    "upload_more",
    "showUploader",
    "service",
  ],
  data() {
    return {
      selected: [],
      is_loading: false,
      is_download_dropdown: false,
      existing_files: [],
      dropFiles: [],
      can_upload: false,
      dropzone: null,
      presigned_urls: null,
      hover: -1,
      show_dropzone: false,
      offlineAttachments: [],
      options: {
        url: "https://test.com/",
        paramName: "file",
        maxFilesize: 100,
        sending: this.sending,
        addedfiles: this.addedFiles,
        autoProcessQueue: false,
        addRemoveLinks: true,
        parallelUploads: 10,
        method: "put",
        queuecomplete: this.on_success,
        params: {},
      },
    };
  },
  components: {
    PromptModal,
    UploadFile,
    AttachmentList,
    AttachmentSkeleton,
    AttachmentBulkActions,
    AttachmentOffline,
  },
  async created() {
    this.is_loading = !this.showUploader;
    await this.get_attachments();
    await this.getOfflineData();
    this.is_loading = false;
    this.$on("refresh_attachments", this.get_attachments);
  },
  beforeDestroy() {
    this.$off("refresh_attachments", this.get_attachments);
  },
  methods: {
    async get_attachments() {
      let req = {
        id: this.ticket.uid,
        checklist_id: this.checklist.uid,
        item_id: this.task.uid,
      };
      if (this.checklist.isTemplate) {
        this.existing_files = await this.service
          .get_template_task_attachments(req)
          .catch((err) => this.handleErrors(err));
      } else {
        this.existing_files = await this.service
          .get_task_attachments(req)
          .catch((err) => this.handleErrors(err));
      }
    },
    async getOfflineData() {
      let attachment = await get("attachments");
      this.setOfflineData(attachment);
    },
    async setOfflineData(attachment) {
      this.offlineAttachments = attachment[this.ticket.uid]
        ? Object.keys(attachment[this.ticket.uid])
            .map((d) => {
              attachment[this.ticket.uid][d].key = d;
              return attachment[this.ticket.uid][d];
            })
            .filter((d) => this.checklist.uid === d.checklist_id&&d.item_id ===this.task.uid )
        : [];
    },
    async deleteOfflineAttachment(key) {
      let attachment = await get("attachments");
      delete attachment[this.ticket.uid][key];
      await set("attachments", attachment);
      this.setOfflineData(attachment);
    },
    upload_completed(attachments) {
      this.get_attachments();
      // if (this.task.attachments && this.task.attachments.length) {
      //   this.$set(this.task, "attachments", [
      //     ...this.task.attachments,
      //     ...attachments
      //   ]);
      // } else {
      //   this.$set(this.task, "attachments", attachments);
      // }
      this.$emit("added_attachments", attachments.length);
      this.show_dropzone = false;
    },
    uploadMethod(serviceObject) {
      let req = {
        body: {
          serviceObject: serviceObject,
        },
        id: this.ticket.uid,
        checklist_id: this.checklist.uid,
        item_id: this.task.uid,
      };
      if (!this.checklist.isTemplate) {
        return this.service.upload_task_attachment(req);
      } else {
        return this.service.upload_template_task_attachment(req);
      }
    },
    download_file(file) {
      window.open(file.url, "_blank");
    },
    async delete_checklist_template_attachment(file) {
      let res = await this.service
        .delete_checklist_template_attachment({
          checklist_id: this.checklist.uid,
          item_id: this.task.uid,
          file_id: file.uid,
        })
        .then(() => this.get_attachments())
        .catch((err) => this.handleErrors(err));
    },
    async delete_checklist_attachment(file) {
      let res = await this.service
        .delete_checklist_attachment({
          id: this.ticket.uid,
          checklist_id: this.checklist.uid,
          item_id: this.task.uid,
          file_id: file.uid,
        })
        .then(() => this.get_attachments())
        .catch((err) => this.handleErrors(err));
    },
    delete_attachment(file) {
      if (!this.ticket.uid && this.checklist.isTemplate) {
        this.delete_checklist_template_attachment(file);
      } else {
        this.delete_checklist_attachment(file);
      }
    },
  },
};
</script>

<style lang="scss">
.task-list-tab .attachment-list .attachment {
  margin: 2rem 0rem;
}
.task-list-attachments--top {
  position: relative;
}
</style>
