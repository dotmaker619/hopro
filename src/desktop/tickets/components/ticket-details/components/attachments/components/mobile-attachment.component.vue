<template>
<div class="is-relative mt-10">
    <!-- favorite -->
    <div v-if="!$store.state.is_offline" class="mobileattachment--favorite is-absolute  is-pointer" @click.stop="!$store.state.is_offline?toggle_favorite(file):'';">
        <sh-icon  v-if="file.pinned" :class="'is-18x18'" :file="'tickets_sprite'" :name="'bookmark-attachment'"></sh-icon>
        <sh-icon  v-if="!file.pinned" :class="'is-18x18'" :file="'tickets_sprite'" :name="'unmarked-attachment'"></sh-icon>
    </div>
    <!-- selection -->
    <div v-if="selected_attachments.includes(file.uid)" @click.stop="longtapHandler" class="mobileattachment--selection is-absolute is-pointer">
        <sh-icon :class="'is-16x16'" :file="'tickets_sprite'" :name="'selection-circle'"></sh-icon>
    </div>
    <div v-if="!selected_attachments.includes(file.uid) && selected_attachments.length" @click.stop="longtapHandler" class="mobileattachment--selection is-absolute is-pointer">
      <div class="mobileattachment-select-circle"></div>
    </div>
  <div
    v-touch:longtap.stop="longtapHandler"
    v-touch:tap.stop="touchHandler"
    :id="'attachment'+file.uid"
    class="mobileattachment card" 
    :class="{'ripple':selected_attachments.includes(file.uid)}"
    :style="{'border-radius':'2px','box-shadow':'none'}"
  >
    <div>
      <!-- thumbnail -->
      <div
        class="mobileattachment--thumbnail is-flex align-center is-center"
        v-if="file"
        :class="{'thumbnail-background':selected_attachments.includes(file.uid)}"
      >
        <!-- img -->
        <div
          v-if="file.thumbnails && file.thumbnails.small"
          :class="{'has-opacity-8':selected_attachments.includes(file.uid)}"
        >
          <img class="image thumbnail-image" :src="file.thumbnails.small" :alt="file.url">

        </div>
        <div v-else>
          <img
            class="image is-36x36 mb-10"
            :src="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(file.fileName) + '.svg')"
          />
          
        </div>
      </div>
      <!-- avatar -->
      <figure class="image is-absolute profile-icon">
        <user-avatar
          :user="file.owner"
          :pxsize="20"
          class="user_avatar_icon"
          :custom_class="'margin-x-auto tiny-user-avatar'"
        ></user-avatar>
      </figure>
    </div>

    <div class="card-content is-relative" :class="'is-paddingless'">
      <div style="justify-content:center" class="is-flex align-center mt-10">
        <svg v-if="file.foreignObjectType!=='ticket'"
          viewBox="0 0 10 10"
          class="is-10x10 mr-5"
        >
          <use v-if="hover" :xlink:href="foreign_icon+'#foreign-active-'+file.foreignObjectType" />
          <use v-else :xlink:href="foreign_icon+'#foreign-'+file.foreignObjectType" />
        </svg>
        <p class="is-medium-14-500-17  filename">{{file.fileName | truncate-middle(11) }}</p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import AttachmentMobileViewer from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-mobile-viewer";
import Vue from 'vue'

import { ticketService } from "@/desktop/shared/services/";
import prettyFileIcons from "pretty-file-icons";
export default {
  props: ["file", "index", "ticket", "selected_attachments","template","service"],
  data() {
    return {
      is_attachment_popup_open: false,
      foreign_icon: require("@/assets/icons/tickets_sprite.svg"),
      prettyFileIcons,
      show_preview: -1,
      active: false,
      show_pinned: false,
      edit_filename: -1,
      delete_file: -1,
    };
  },
  components: {
    AttachmentMobileViewer
  },
  methods: {
    longtapHandler(){
      if(!this.$store.state.is_offline){
        this.$emit("toggle_selection", this.file.uid);
      }
    },
    touchHandler(){
      if(!this.$store.state.is_offline){
        if(!this.selected_attachments.length)
          this.$emit('init-pdftron',this.file)
        else 
        this.$emit("toggle_selection", this.file.uid);
      }
    },
    // async update_filename(file) {
    //   if(!this.ticket.uid && this.template.isTemplate){
    //     this.update_checklist_template_attachment(file,{fileName: this.file.fileName})
    //   }else {
    //     let res = await ticketService
    //       .update_attachment_data({
    //         id: this.ticket.uid,
    //         file_id: file.uid,
    //         body: {
    //           fileName: file.fileName
    //         }
    //       })
    //       .catch(err => this.handleErrors(err));
    //   }
    //   this.edit_filename = -1;
    // },
    // download_file(file) {
    //   window.open(file.url, "_blank");
    // },
    // async delete_attachment(file) {
    //   this.$modal.hide(file.uid);
    //   this.delete_file = -1;
    //   if(!this.ticket.uid && this.template.isTemplate){
    //     this.delete_checklist_template_attachment(file)
    //   }else {
    //     let res = await ticketService
    //       .delete_attachments({
    //         id: this.ticket.uid,
    //         file_id: file.uid
    //       })
    //       .then(() => {this.$emit("refresh_attachments")})
    //       .catch(err => this.handleErrors(err));
    //   }
    // },
    async update_checklist_template_attachment(file,body){
      let res = await this.service
        .update_checklist_template_attachment({
          checklist_id: this.template.checklist_id,
          task_id: this.template.task_id,
          file_id: file.uid,
          body: body
        })
        .then(() => {this.$emit("refresh_attachments")})
        .catch(err => this.handleErrors(err));
    },
 
    async toggle_favorite(file) {
    
      if(!this.ticket.uid && this.template.isTemplate){
        this.update_checklist_template_attachment(file,{pinned:!this.file.pinned})
      }else {
      let res = await this.service
        .update_attachment_data({
          id: this.ticket.uid,
          file_id: file.uid,
          body: {
            pinned: !file.pinned
          }
        })
        .then(() => this.$emit("refresh_attachments"))
        .catch(err => this.handleErrors(err));
      }
    },
    open_attachment_viewer() {
        let res = null;
        if (!this.is_attachment_popup_open) {
          res = this.$buefy.modal.open({
            props: {
              file: this.file,
              ticket: this.ticket
            },
            parent: this,
            component: AttachmentMobileViewer,
            destroyOnHide: true,
            hasModalCard: true,
            trapFocus: true,
            customClass: "attachment-details-popup",
            width: "100%",
            height: "100%",
            onCancel: () => this.is_attachment_popup_open = false,
            events: {
              close: () => {
                this.is_attachment_popup_open = false;
              },
            },
          });
          if (res) {
            this.is_attachment_popup_open = true;
          }
        }
      },
  }
};
</script>

<style lang="scss" scoped>

.thumbnail-background {
  background-color: rgba(23, 30, 72, 1);
  transition: background-color 1s;
}
.mobileattachment--selection {
    top: 0.7rem;
    left: 0.6rem;
    z-index: 3;
}
.mobileattachment-select-circle {
  width: 15px;
  height: 15px;
  border: 1.5px solid #a5a9bf;
  background: transparent;
  border-radius: 50%;
}
.mobileattachment--favorite {
    top: -0.7rem;
    right: -0.7rem;
    z-index: 2;
}

.mobileattachment {
  @include for-size(tablet){
    width: 90px;
    border: none;
    &--thumbnail {
      height: 55px;
      overflow: hidden;
      border-radius: 2px;
      object-fit: contain;
      img {
        z-index: 1;
        pointer-events: none;
        object-fit:contain;
      }
    }
    .card-content {
      .filename {
        font-size: 10px !important;
      }
    }
    .profile-icon {
      top: 4.3rem;
      left: 3.6rem;
      z-index: 3;
      img {
        pointer-events: none;
      }
    }
  }
}
.ripple {
  position: relative;
  overflow: hidden;
  transform: translate3d(0, 0, 0);

  &:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, #000 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10,10);
    opacity: 0;
    transition: transform 0.4s -0.6s, opacity 0.8s -0.3s;
  }

  &:active:after {
    transform: scale(0,0);
    opacity: .3;
    transition: 0s;
  }
}
</style>