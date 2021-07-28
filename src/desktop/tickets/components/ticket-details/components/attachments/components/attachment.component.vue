<template>
  <div
    @click.shift.stop.exact="handle_attachment_click"
    @click.meta.exact="toggle_selection"
    @click.ctrl.exact="toggle_selection"
    @mouseenter.stop="hover = true"
    @mouseleave.stop="hover = false"
    :id="'attachment' + file.uid"
    class="attachment card"
    :style="{ 'border-radius': '6px', 'box-shadow': 'none', 'border': selected_attachments.includes(file.uid) ? '1.5px solid #2585d3' : '' }"
  >
    <div>
      <!-- favorite -->
      <div class="attachment--bookmark is-absolute is-pointer" @click.stop="toggle_favorite(file)">
        <sh-icon v-if="file.pinned" :class="'is-36x36'" :file="'tickets_sprite'" :name="'bookmark-attachment'"></sh-icon>
        <sh-icon v-if="hover && !file.pinned" :class="'is-36x36'" :file="'tickets_sprite'" :name="'unmarked-attachment'"></sh-icon>
      </div>

      <!-- thumbnail -->
      <div
        class="attachment--thumbnail is-flex align-center is-center"
        v-if="file"
        :class="{ 'thumbnail-background': hover || selected_attachments.includes(file.uid) }"
      >
        <!-- selection -->
        <div class="selection is-absolute is-pointer" @click.exact.stop="toggle_selection" @click.shift.stop.exact="handle_attachment_click">
          <div v-if="hover && !selected_attachments.includes(file.uid)" class="select-circle"></div>
          <sh-icon v-if="selected_attachments.includes(file.uid)" :class="'is-22x22'" :file="'tickets_sprite'" :name="'selection-circle'"></sh-icon>
        </div>

        <!-- eye -->
        <div v-if="hover">
          <div class="view-eye is-absolute is-pointer" @click.stop="$emit('init-pdftron', file)">
            <sh-icon :class="'is-30x30'" :file="'tickets_sprite'" :name="'attachment-eye'"></sh-icon>
          </div>
        </div>
        <!-- img -->
        <div v-if="file.thumbnails && file.thumbnails.small" :class="{ 'has-opacity-8': hover || selected_attachments.includes(file.uid) }">
          <img class="image thumbnail-image" :src="file.thumbnails.small" :alt="file.url" />

          <viewer @inited="inited" :options="options" style="display:none;">
            <div>
              <div>
                <img class="image" :data-source="file.thumbnails.large" :src="file.thumbnails.small" :key="file.url" />
              </div>
            </div>
          </viewer>
        </div>
        <div v-else>
          <img class="image is-64x64" :src="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(file.fileName) + '.svg')" />
          <viewer @inited="inited" :options="options" style="display:none;">
            <div>
              <div>
                <img
                  class="image is-64x64"
                  :data-source="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(file.fileName) + '.svg')"
                  :src="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(file.fileName) + '.svg')"
                />
              </div>
            </div>
          </viewer>
        </div>
      </div>

      <!-- avatar -->
      <figure v-if="hover" class="image is-36x36 is-absolute profile-icon">
        <user-avatar :user="file.owner" :pxsize="36" class="user_avatar_icon" :custom_class="'margin-x-auto user-style'"></user-avatar>
      </figure>
    </div>

    <div class="card-content">
      <div class="has-text-centered is-flex is-center align-center mt-10">
        <!-- <sh-icon class="is-14x14 mr-5" file="tickets_sprite" :name="hover?foreign_icon+'#foreign-active-'+file.foreignObjectType:foreign_icon+'#foreign-'+file.foreignObjectType"></sh-icon> -->
        <svg v-if="file.foreignObjectType !== 'ticket'" viewBox="0 0 16 16" class="is-14x14 mr-5">
          <use v-if="hover" :xlink:href="foreign_icon + '#foreign-active-' + file.foreignObjectType" />
          <use v-else :xlink:href="foreign_icon + '#foreign-' + file.foreignObjectType" />
        </svg>
        <input
          v-focus
          v-if="edit_filename == index"
          type="text"
          class="input is-medium-14-500-17 is-inline-input has-text-centered"
          v-model="file.fileName"
          style="width:25rem"
          :placeholder="file.fileName.substring(0, file.fileName.indexOf('.'))"
          @keyup.esc.stop="edit_filename = -1"
          @keyup.enter="update_filename(file)"
        />
        <p v-else class="is-medium-14-500-17 filename">{{ file.fileName | truncate-middle }}</p>
      </div>

      <div style="height:18px;">
        <!-- date -->
        <div class="date has-text-centered mt-10" v-if="!hover">
          <p class="is-regular-14-00-17 has-text-grey">{{ file.createdAt | dateFormat }}</p>
        </div>

        <!-- actions -->
        <div v-else class="actions is-flex has-space-around align-center mt-10">
          <p @click.stop="update_filename(file)" class="is-pointer" v-if="edit_filename == index">
            <sh-icon class="is-16x16" :file="'tickets_sprite'" :name="'tick-set-complete'"></sh-icon>
          </p>
          <p @click.stop="edit_filename = index" class="is-pointer" v-else>
            <sh-icon class="is-16x16" :file="'tickets_sprite'" :name="'edit'"></sh-icon>
          </p>
          <p @click.stop="download_file(file)" class="is-pointer">
            <sh-icon class="is-16x16" :file="'tickets_sprite'" :name="'download'"></sh-icon>
          </p>
          <p
            @click="
              delete_file = file.uid;
              $modal.show(file.uid);
            "
            class="is-pointer"
          >
            <sh-icon class="is-16x16" :file="'tickets_sprite'" :name="'remove-red'"></sh-icon>
          </p>
        </div>
      </div>
    </div>
    <prompt-modal
      v-if="delete_file == file.uid"
      :name="file.uid"
      :heading="file.fileName"
      :iconPath="require('@/assets/icons/prompt/delete.svg')"
      :footer="true"
      :cancelString="'Cancel'"
      :confirmString="'Delete'"
      @cancel="$modal.hide(file.uid)"
      @confirm="delete_attachment(file)"
      @closed="$modal.hide(file.uid)"
    >
      <div class="prompt-modal__content__text" slot="content">
        Are you sure you want to delete
        {{ file.fileName.charAt(0).toUpperCase() + file.fileName.slice(1) }}?
      </div>
    </prompt-modal>
    <doc-viewer
      @close="
        show_doc_viewer = false;
        show_preview = -1;
        hover = false;
      "
      class="google-doc-viewer"
      v-if="show_doc_viewer && show_preview == index"
      :link="link"
    ></doc-viewer>
  </div>
</template>

<script>
  import DocViewer from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-doc-viewer";
  import "viewerjs/dist/viewer.css";
  import Viewer from "v-viewer";
  import Vue from "vue";
  Vue.use(Viewer, {
    defaultOptions: {
      zIndex: 9999,
    },
  });
  import { ticketService } from "@/desktop/shared/services/";
  import PromptModal from "@/desktop/shared/components/prompt-modal";
  import prettyFileIcons from "pretty-file-icons";
  export default {
    props: ["file", "index", "ticket", "selected_attachments", "template", "service"],
    data() {
      return {
        foreign_icon: require("@/assets/icons/tickets_sprite.svg"),
        prettyFileIcons,
        show_preview: -1,
        active: false,
        show_pinned: false,
        edit_filename: -1,
        delete_file: -1,
        hover: false,
        link: "",
        show_doc_viewer: false,
        options: {
          inline: false,
          button: false,
          navbar: false,
          title: false,
          toolbar: false,
          tooltip: false,
          movable: false,
          zoomable: true,
          rotatable: false,
          scalable: true,
          transition: true,
          fullscreen: true,
          keyboard: false,
          url: "data-source",
        },
      };
    },
    components: {
      PromptModal,
      DocViewer,
    },
    created() {
      this.link = `https://docs.google.com/viewer?url=${encodeURIComponent(this.file.url)}&embedded=true`;
    },
    methods: {
      inited(viewer) {
        this.$viewer = viewer;
      },
      handle_attachment_click() {
        this.$emit("attachment_card_click", this.file.uid);
      },
      toggle_selection() {
        this.$emit("toggle_selection", this.file.uid);
      },
      async update_filename(file) {
        if (!this.ticket.uid && this.template.isTemplate) {
          this.update_checklist_template_attachment(file, {
            fileName: this.file.fileName,
          });
        } else {
          let res = await this.service
            .update_attachment_data({
              id: this.ticket.uid,
              file_id: file.uid,
              body: {
                fileName: file.fileName,
              },
            })
            .catch((err) => this.handleErrors(err));
        }
        this.edit_filename = -1;
      },
      download_file(file) {
        window.open(file.url, "_blank");
      },
      async delete_attachment(file) {
        this.$modal.hide(file.uid);
        this.delete_file = -1;
        this.$emit("delete_attachment", file);
      },
      async update_checklist_template_attachment(file, body) {
        let res = await this.service
          .update_checklist_template_attachment({
            checklist_id: this.template.checklist_id,
            item_id: this.template.task_id,
            file_id: file.uid,
            body: body,
          })
          .then(() => {
            this.$emit("refresh_attachments");
          })
          .catch((err) => this.handleErrors(err));
      },
      async toggle_favorite(file) {
        if (!this.ticket.uid && this.template.isTemplate) {
          this.update_checklist_template_attachment(file, {
            pinned: !this.file.pinned,
          });
        } else {
          let res = await this.service
            .update_attachment_data({
              id: this.ticket.uid,
              file_id: file.uid,
              body: {
                pinned: !file.pinned,
              },
            })
            .then(() => this.$emit("refresh_attachments"))
            .catch((err) => this.handleErrors(err));
        }
      },
    },
  };
</script>

<style lang="scss">
  .attachment {
    width: 200px;
    color: #171e48;
    border: solid 1.5px rgba(116, 120, 145, 0.15);
    box-shadow: none;
    &:hover {
      box-shadow: 0 3px 6px 0 rgba(23, 30, 72, 0.1);
    }
    .profile-icon {
      top: 10.4rem;
      left: 8.2rem;
      z-index: 3;
    }

    &--thumbnail {
      height: 124px;
      overflow: hidden;
      border-radius: 6px;
      object-fit: contain;
      .thumbnail-image {
        // height:124px;
        // width:200px;
        object-fit: contain;
      }

      img {
        z-index: 1;
      }
      .selection {
        top: 1rem;
        left: 1rem;
        z-index: 2;
        .select-circle {
          width: 20px;
          height: 20px;
          border: 1.5px solid #a5a9bf;
          background: transparent;
          border-radius: 50%;
        }
      }

      .view-eye {
        top: 4.3rem;
        left: 8.5rem;
        z-index: 3;
      }
    }
    &--bookmark {
      top: -1.8rem;
      right: -1.8rem;
      z-index: 2;
    }
    .card-content {
      .input {
        border: 0px;
        border-bottom: 1px dotted rgba(23, 30, 72, 0.2);
        width: 13rem !important;
      }
      .input:focus {
        border: 0px !important;
        border-bottom: 1px dotted rgba(23, 30, 72, 0.2) !important;
      }
    }
  }
  .thumbnail-background {
    background: rgba(23, 30, 72, 1);
  }
  .google-doc-viewer {
    z-index: 999999;
  }
</style>
