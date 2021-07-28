<template>
  <div
    class="sh-comment is-flex"
    v-click-outside="() => (updating = false)"
    @contextmenu.prevent
    v-touch:touchhold="touchhold"
    @click.stop
  >
    <user-like
      :ticket="ticket"
      :channel="channel"
      :isEditing="showEditor || (comment && comment.type === 'deleted')"
      :comment="comment"
      :reaction="reaction"
      @send="sendReaction"
      @delete="deleteReaction"
    ></user-like>
    <div
      class="sh-comment-deleted"
      style="flex:1;border:2px dashed #ccc"
      v-if="comment && comment.type === 'deleted'"
    >
      <div class="sh-comment-box">
        <p class="sh-comment-text" role="textbox">This comment was deleted</p>
      </div>
    </div>
    <div v-else-if="!showEditor" style="flex:1">
      <div
        class="sh-comment-box"
        :pinned="comment.pinned"
        :class="
          this.$store.state.claims.user_id === comment.user.id
            ? 'comment-owner'
            : 'comment-not-owner'
        "
      >
        <options
          :ticket="ticket"
          :channel="channel"
          :isEditing="showEditor"
          :comment="comment"
          :option="option"
          @mobileEvent="mobileEvents=$event"
          @reply="$emit('reply', comment)"
          @edit="
            description = comment.text;
            updating = true;
          "
          @delete="deleteMessage"
          @pinned="
            option.pinned = true;
            updateComment({ pinned: !comment.pinned });
          "
        ></options>
        <p
          class="sh-comment-text ck ck-content ck-editor__editable ck-rounded-corners ck-blurred"
          role="textbox"
          v-html="dataHtml"
        ></p>
        <div v-if="attachment_files.length === 0&&dataHtml===''&&loadingAttachment" style="height:38px;">
           
        </div>
        <div
          style="color:#aaa;border:2px dashed #ccc;padding:5px;"
          v-else-if="attachment_files.length === 0&&dataHtml===''&&!loadingAttachment"
        >Attachments deleted</div>
        <div v-if="comment.id" v-touch:start.stop>
          <attachment-list
            :service="service"
            class="task-list-tab"
            v-if="comment.id && attachment_files && attachment_files.length > 0"
            id="task-tab"
            @delete_attachment="delete_attachment($event)"
            :existing_files="attachment_files"
            @refresh_attachments="getFiles"
            :deselect="false"
            :ticket="ticket"
          ></attachment-list>
        </div>
        <div
          v-else-if="
            comment.attachment_upload && comment.attachment_upload.length > 0
          "
        >{{ comment.attachment_upload.length }} Files Uploaded</div>
        <attachment v-if="comment.attachments" :comment="comment"></attachment>
      </div>
      <reply-count v-if="comment.reply_count" :comment="comment" @clicked="$emit('reply', comment)"></reply-count>
    </div>
    <editor
      @send="sendComment"
      ref="inlineEditor"
      v-model="description"
      :ticket="ticket"
      :attachment_files="attachment_files"
      :channel="channel"
      :attachments="attachments"
      :comment="comment"
      :showAttachments="true"
      :isMobile="isMobile"
      :action="editorAction"
      :service="service"
      :presence_members="presence_members"
      @attachment_upload="
        (attachments = $event.attachments), (custom_id = $event.id)
      "
      v-else
    ></editor>
    <div
      @click="sendZombieComment"
      v-if="showRetry"
      v-tooltip="'Retry sending this message'"
      class="sh-comments-comment--retry"
    >
      <i class="fa fa-redo mr-5" style="font-size:12px;" aria-hidden="true"></i>
    </div>
  </div>
</template>
<script>
import shMenu from "@/desktop/shared/components/menu";
import Editor from "./components/editor";
import UserLike from "./components/user-like";
import Options from "./components/options";
import ReplyCount from "./components/reply-count";
import Attachment from "./components/attachment";
import AttachmentList from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-list";
import { v4 as uuidv4 } from "uuid";

export default {
  components: {
    shMenu,
    Editor,
    UserLike,
    Options,
    ReplyCount,
    Attachment,
    AttachmentList,
  },
  props: [
    "ticket",
    "comment",
    "isEditing",
    "channel",
    "files",
    "presence_members",
    "zombie",
    "service",
    "small",
    "dataUid"
  ],
  data() {
    return {
      addingComments: false,
      description: "",
      updating: false,
      editorAction: false,
      attachments: [],
      attachment_files: [],
      loadingAttachment: true,
      reaction: { sent: false, delete: false },
      option: { pinned: false },
      custom_id: undefined,
      showRetry: false,
      showRetryTimeout: null,
      isMobile: false,
      mobileEvents: () => {},
    };
  },
  watch: {
    attachmentUploads: {
      handler: "getFiles",
      immediate: true,
    },
  },
  computed: {
    attachmentUploads() {
      return this.comment ? this.comment.attachment_upload : undefined;
    },
    dataHtml() {
      let str = this.comment.text;
      if (str) {
        str = str.replace(/<p>&nbsp;<\/p>/g, "");
      }
      return str;
    },
    showEditor() {
      return this.isEditing || this.updating;
    },
  },
  beforeDestroy() {
    clearTimeout(this.showRetryTimeout);
  },
  mounted() {
    this.isMobile = this.$route.meta.screen === "mobile"||this.small;
    if (this.zombie) {
      this.showRetryTimeout = setTimeout(() => (this.showRetry = true), 5000);
    }
  },
  methods: {
    async delete_attachment(file) {
      let res = await this.service.delete_comment_attachment({
          id: this.ticket.uid,
          comment_id: this.comment.custom_id,
          file_id: file.uid,
        })
        .then(() => this.getFiles())
        .catch((err) => this.handleErrors(err));
    },
    touchhold() {
      this.mobileEvents();
    },
    async getFiles() {
      if (this.comment && this.comment.custom_id !== undefined) {
        this.attachment_files = await this.getAttachments(
          this.comment.custom_id
        );
        this.loadingAttachment = false;
      }
    },
    getPresenceMembers() {
      try {
        return this.presence_members.map((d) => {
          return { email: d.email, uid: d.uid };
        });
      } catch (e) {
        return [];
      }
    },
    async sendZombieComment() {
      try {
        this.showRetry = false;
        await this.channel.sendMessage(this.comment.unprocessed);
      } catch (e) {
        this.showRetry = true;
      }
    },
    async sendComment(comment) {
      try {
        if (
          (this.description === "" && !this.custom_id) ||
          this.addingComments
        ) {
          return;
        }
        this.addingComments = true;
        setTimeout(() => {
          this.addingComments = false;
        }, 1000);
        let mentions = Array.prototype.map.call(
          this.$refs.inlineEditor.$refs.mentions.querySelectorAll(
            "[data-mention]"
          ),
          (e) => {
            return {
              uid: e.getAttribute("ref"),
              email: e.getAttribute("email"),
            };
          }
        );
        let data = {
          text: this.description,
          mentioned_user_list: mentions,
          attachment_upload: this.attachments,
          owner: this.$store.state.claims.user_id,
          custom_id: this.custom_id,
          presence_members: this.getPresenceMembers(),
          uuid: uuidv4(),
        };
        this.attachments = [];
        this.custom_id = undefined;
        if(this.dataUid){
          data.dataUid=this.dataUid;
        }
        if (this.updating) {
          this.updateComment(data);
          return;
        }
        let load = Object.assign({}, data);
        this.$emit("sendMessage", load);
        this.description = "";
        await this.channel.sendMessage(data);
        analytics.track("New Comment");
      } catch (e) {
        this.description = "";
        this.attachments = [];
        this.custom_id = undefined;
      }
    },
    async getAttachments(id) {
      return await this.service.get_file_download_comments({
        id: this.ticket.uid,
        comment_id: id,
      });
    },
    async updateComment(prop) {
      try {
        const message = { ...this.comment, ...prop };
        this.editorAction = true;
        delete message.channel;
        const update = await this.$store.state.chat.client.updateMessage(
          message
        );
        this.editorAction = false;
        this.updating = false;
        this.option.pinned = false;
      } catch (e) {
        this.editorAction = false;
        this.updating = false;
        this.option.pinned = false;
      }
    },
    async deleteMessage() {
      await this.$store.state.chat.client.deleteMessage(this.comment.id);
    },
    async sendReaction() {
      try {
        this.reaction.sent = true;
        await this.channel.sendReaction(this.comment.id, {
          type: "like",
          presence_members: this.getPresenceMembers(),
        });
        this.reaction.sent = false;
      } catch (e) {
        this.reaction.sent = false;
      }
    },
    async deleteReaction() {
      try {
        if (this.comment.own_reactions.length === 0) {
          this.sendReaction();
          return;
        }
        this.reaction.delete = true;
        await this.channel.deleteReaction(this.comment.id, "like");
        this.reaction.delete = false;
      } catch (e) {
        this.reaction.delete = false;
      }
    },
  },
};
</script>
