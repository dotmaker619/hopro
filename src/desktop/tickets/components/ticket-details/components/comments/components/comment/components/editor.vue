<template>
  <div :class="isFocused ? 'focused' : ''" class="sh-comment-action" ref="mentions">
    <attachment-list
      class="task-list-tab"
      v-if="attachment_files && attachment_files.length > 0"
      id="task-tab"
      :existing_files="attachment_files"
      @delete_attachment="delete_attachment($event)"
      @refresh_attachments="getFiles"
      :service="service"
      :deselect="false"
      :ticket="ticket"
    ></attachment-list>
    <textarea ref="editor" placeholder="Type something to comment"></textarea>
    <p @mousedown.prevent.stop class="is-flex is-vcenter sh-comment-action-bar">
      <sh-icon
        :name="'smiley'"
        class="is-pointer is-24x24 mr-10 comment-smiley"
        @mousedown.native.prevent.stop="emoji_keyboard = !emoji_keyboard"
      ></sh-icon>
      <v-emoji-picker
        @select="select_emoji"
        labelSearch="Search"
        lang="pt-BR"
        :emojiSize="30"
        v-click-outside="() => (emoji_keyboard = false)"
        style="position:absolute;bottom:10px;right:0;z-index:1;"
        v-show="emoji_keyboard"
      ></v-emoji-picker>
      <upload-file
        v-if="showAttachments && !offline"
        @initialised="uppy = $event"
        @uploaded_success="upload_completed"
        service="tickets"
        :name="ticket.name"
        type="comments"
        :uploadMethod="uploadMethod"
        :uid="ticket.uid"
        isModal="true"
        :id="`ticket_attachments_comments`"
      >
        <div class="sh-attachment-btn" style="position:relative;margin:0px 10px;">
          <sh-icon :name="'link'" class="is-pointer is-20x20 mr-10"></sh-icon>
          <span v-show="attachments.length" class="badge" v-text="attachments.length"></span>
        </div>
      </upload-file>
      <button
        class="sh-button sh-comment-send"
        :class="editorValue.length > 0 || attachments.length ? '' : 'disabled'"
        @click="sendComment"
        v-tooltip="{ content: `Ctrl + Enter to add the comment` }"
      >
        <span>
          <i
            v-if="editorValue.length > 0 || attachments.length"
            :class="action ? 'fa fa-spinner fa-spin is-size-4 mx-5' : 'far fa-paper-plane is-size-4 mr-5'"
          ></i>
          <i v-else :class="'fas fa-paper-plane is-size-4  mr-5'"></i>
        </span>
      </button>
    </p>
    <div class="sh-comment-typing-event">
      <div>
        <div v-if="typing && typeID !== $store.state.claims.user_id">
          <b>{{ typing }}</b> started typing ...
        </div>
      </div>
      <user-tag
        v-if="isMobile"
        :custom_class="'tiny-user-avatar '"
        :custom_size="18"
        :users="viewingMembers"
        :tagsCountToShow="3"
        :no_access="true"
        :is_precense_component="true"
      ></user-tag>
    </div>
  </div>
</template>
<script>
  import UploadFile from "@/desktop/shared/components/upload-file";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import { v4 as uuidv4 } from "uuid";
  import VEmojiPicker, { emojisDefault, categoriesDefault } from "v-emoji-picker";
  import AttachmentList from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-list";

  export default {
    components: { UploadFile, VEmojiPicker, AttachmentList, UserTag },
    props: ["value", "ticket", "attachments", "channel", "action", "showAttachments", "comment", "attachment_files", "presence_members", "service","isMobile"],
    data() {
      return {
        typing: null,
        typeID: null,
        clicked: false,
        emoji_keyboard: false,
        editor: null,
        uppy: null,
        editorValue: "",
        isFocused: false,
        custom_id: null,
        isMobile: false,
      };
    },
    computed: {
      offline() {
        return this.$store.state.is_offline;
      },
      viewingMembers: function() {
        return this.presence_members ? this.presence_members.filter((user) => user.uid != this.$store.state.claims.user_id) : [];
      },
    },
    beforeDestroyed() {
      this.channel.off("typing.start", this.startTyping);
      this.channel.off("typing.stop", this.stopTyping);
    },
    mounted() {
      this.createCustomID();
      this.channel.on("typing.start", this.startTyping);
      this.channel.on("typing.stop", this.stopTyping);
      ClassicEditor.create(this.$refs.editor, {
        extraPlugins: [this.MentionLinks],
        mediaEmbed: { previewsInData: true },
        toolbar: ["bold", "italic", "link", "bulletedList", "numberedList", "blockQuote", "todoList"],
        mention: {
          feeds: [
            {
              marker: "@",
              feed: this.getFeedItems(),
              timer: null,
            },
          ],
        },
      })
        .then((editor) => {
          this.editor = editor;
          editor.setData(this.value || "");
          this.editorValue = "";
          // editor.editing.view.focus();
          editor.editing.view.document.on(
            "keydown",
            (evt, data) => {
              if (data.keyCode == 13 && !this.isMobile) {
                data.stopPropagation();
                data.preventDefault();
                evt.stop();
                if (data.shiftKey) {
                  editor.execute("enter");
                  return;
                }
                this.sendComment();
              }
            },
            { priority: "highest" }
          );
          editor.editing.view.document.on("change:isFocused", (evt, data, isFocused) => {
            this.isFocused = isFocused;
          });
          editor.model.document.on("change:data", () => {
            let data = editor.getData();
            this.$emit("input", data);
            this.editorValue = data;
            this.channel.keystroke();
            clearTimeout(this.timer);
            this.timer = setTimeout(async () => {
              await this.channel.stopTyping();
            }, 1000);
          });
        })
        .catch((error) => {
          console.error(error);
        });
    },
    methods: {
      async delete_attachment(file) {
        let res = await this.service
          .delete_comment_attachment({
            id: this.ticket.uid,
            comment_id: this.comment.custom_id,
            file_id: file.uid,
          })
          .then(() => {})
          .catch((err) => this.handleErrors(err));
      },
      createCustomID() {
        if (this.comment && this.comment.custom_id) {
          this.custom_id = this.comment.custom_id;
        } else {
          this.custom_id = uuidv4();
        }
      },
      async sendComment() {
        this.$emit("send", this.editorValue);
        if (this.comment) {
          return;
        }
        setTimeout(() => {
          this.editorValue = "";
          this.editor.setData("");
        }, 200);
      },
      select_emoji(emoji) {
        if (emoji) {
          const view = this.editor.data.processor.toView(emoji.data);
          const modelFragment = this.editor.data.toModel(view);
          this.editor.model.insertContent(modelFragment, this.editor.model.document.selection);
        }
        this.emoji_keyboard = false;
      },
      startTyping(event) {
        this.typeID = event.user.id;
        this.typing = `${event.user.name} `;
      },
      stopTyping(event) {
        this.typing = ``;
      },
      upload_completed(attachments) {
        this.uppy.reset();
        this.$emit("attachment_upload", { attachments, id: this.custom_id });
        this.createCustomID(); // To reset uuid after each upload otherwise will duplicate the checklist
      },
      uploadMethod(serviceObject) {
        return this.service.upload_comments_attachment({
          body: {
            serviceObject: serviceObject,
          },
          id: this.ticket.uid,
          comment_id: this.custom_id,
        });
      },
      getFeedItems() {
        return this.$store.state.users
          .filter((user) => user.uid !== this.$store.state.claims.user_id)
          .map((user) => {
            return {
              uid: user.uid,
              email: user.email,
              id: "@" + (user.first_name ? user.first_name + " " + user.last_name : user.email.split("@")[0]),
            };
          });
      },
      MentionLinks(editor) {
        editor.conversion.for("upcast").elementToAttribute({
          view: {
            name: "a",
            key: "data-mention",
            classes: "mention",
            attributes: {
              ref: true,
            },
          },
          model: {
            key: "mention",
            value: (viewItem) => editor.plugins.get("Mention").toMentionAttribute(viewItem),
          },
          converterPriority: "high",
        });
        editor.conversion.for("downcast").attributeToElement({
          model: "mention",
          view: (modelAttributeValue, viewWriter) => {
            if (!modelAttributeValue) {
              return;
            }
            return viewWriter.createAttributeElement(
              "a",
              {
                class: "mention",
                "data-mention": modelAttributeValue.id,
                ref: modelAttributeValue.uid,
                email: modelAttributeValue.email,
              },
              {
                priority: 20,
                id: modelAttributeValue.uid,
              }
            );
          },
          converterPriority: "high",
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .sh-comment {
    margin: 15px auto;
    .sh-unlike,
    .sh-comment-option > * {
      display: none;
    }
    .sh-created-at {
      display: flex;
    }
    &:hover {
      .sh-unlike,
      .sh-comment-option > * {
        display: flex;
      }
      .sh-comment-option > .sh-created-at {
        display: none;
      }
    }
  }
  .sh-comment-name--text {
    font-family: Barlow;
    font-size: 18px;
    font-weight: 500;
    line-height: 1.22;
    color: #171e48;
  }
  .sh-comment-pin {
    opacity: 0.7;
    font-family: Barlow;
    font-size: 14px;
    line-height: 1.21;
    text-align: left;
    color: #171e48;
  }
  .sh-user {
    display: flex;
    flex-flow: column;
    align-items: center;
    padding: 0 1rem;
  }
  .sh-comment-box {
    min-height: 138px;
    background-color: #f3f8fc;
    padding: 1.5rem;
    border-radius: 0px 10px 10px 10px;
    &.comment-owner {
      background-color: #fff;
      border: solid 1px #d0d2da;
    }
  }

  .sh-comment-replies__button {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.19;
    text-align: left;
    color: #2585d3;
  }

  .sh-button {
    border-radius: 10rem;
    padding: 1.25rem 1rem;
  }

  .sh-comment-attachments {
    margin: 10px;
    padding-left: 5px;
    border-left: 3px solid #eaeaea;
    img {
      width: 360px;
    }
  }

  .sh-comment-action {
    display: flex;
    word-break: break-all;
    border: 1px solid #ccc;
    padding: 0px 5px 5px 0px;
    align-items: flex-end;
    flex: 1;
  }

  .sh-comment-action-bar {
    position: relative;
    top: 5px;
  }

  .badge {
    position: absolute;
    top: -5px;
    right: 5px;
    background: lightcoral;
    color: white;
    border-radius: 100px;
    width: 15px;
    height: 15px;
    font-size: 10px;
    text-align: center;
  }

  .sh-comment-typing-event {
    position: absolute;
    bottom: -20px;
    font-size: 14px;
    opacity: 0.7;
  }
</style>
