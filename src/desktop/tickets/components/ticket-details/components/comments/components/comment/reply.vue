<template>
  <div>
    <div class="sh-comment is-flex" v-if="!(isEditing || updating)">
      <user-like
        :ticket="ticket"
        :channel="channel"
        :comment="comment"
        :reaction="reaction"
        @send="sendReaction"
        @delete="deleteReaction"
      >
      </user-like>
      <div style="flex:1;">
        <div class="sh-comment-box">
          <div
            class="sh-comment-name is-flex"
            style="justify-content:space-between;"
          >
            <div
              class="is-medium-18-500-22 sh-comment-name--text is-flex align-center"
            >
              {{ comment.user.name }}
              <p
                class="is-regular-14-00-17 has-text-theme-black has-opacity-6 sh-created-at ml-10"
              >
                {{ new Date(comment.created_at).toISOString() | prettyDate }}
              </p>
            </div>
            <div class="is-flex align-center sh-comment-option">
              <p
                v-if="this.comment.user.id === this.$store.state.claims.user_id"
                @click="
                  description = comment.text;
                  updating = true;
                "
              >
                <sh-icon
                  :name="'edit-2'"
                  class="is-pointer mr-20 is-18x18"
                ></sh-icon>
              </p>
              <p
                v-if="this.comment.user.id === this.$store.state.claims.user_id"
                @click="deleteMessage"
              >
                <sh-icon
                  :name="'trash'"
                  class="is-pointer mr-20 is-18x18"
                ></sh-icon>
              </p>
            </div>
          </div>
          <div
            class="sh-comment-text ck ck-content ck-editor__editable ck-rounded-corners ck-blurred"
            v-html="data"
          ></div>
        </div>
      </div>
    </div>
    <editor
      @send="sendReply"
      v-model="description"
      v-click-outside="() => (updating = false)"
      :ticket="ticket"
      :channel="channel"
      :action="editorAction"
      :showAttachments="false"
      :attachments="[]"
      v-else
    ></editor>
    <div
      @click="sendZombieComment"
      v-if="showRetry"
      v-tooltip="'Retry sending this message'"
      class="sh-comments-comment--retry"
      style="right:10px;"
    >
      <i class="fa fa-redo mr-5" style="font-size:12px;" aria-hidden="true"></i>
    </div>
  </div>
</template>
<script>
import shMenu from "@/desktop/shared/components/menu";
import UserLike from "./components/user-like";
import Editor from "./components/editor";
import { v4 as uuidv4 } from "uuid";

export default {
  components: {
    shMenu,
    UserLike,
    Editor
  },
  props: [
    "ticket",
    "comment",
    "isEditing",
    "channel",
    "parent",
    "presence_members",
    "zombie"
  ],
  data() {
    return {
      active: false,
      description: "",
      updating: false,
      addingComments: false,
      editorAction: false,
      reaction: { sent: false, delete: false },
      showRetry: false,
      showRetryTimeout: null
    };
  },
  beforeDestroy() {
    clearTimeout(this.showRetryTimeout);
  },
  mounted() {
    if (this.zombie) {
      this.showRetryTimeout = setTimeout(() => (this.showRetry = true), 5000);
    }
  },
  computed: {
    userAvatar() {
      return {
        uid: this.comment
          ? this.comment.user.id
          : this.$store.state.claims.user_id
      };
    },
    data() {
      let str = this.comment.text;
      if (str) {
        str = str.replace(/<p>&nbsp;<\/p>/g, "");
      }
      return str;
    }
  },
  methods: {
    getPresenceMembers() {
      try {
        return this.presence_members.map(d => {
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
    async sendReply() {
      try {
        if (this.description === "" || this.addingComments) {
          return;
        }
        this.addingComments = true;
        setTimeout(() => {
          this.addingComments = false;
        }, 1000);
        let data = {
          text: this.description,
          parent_id: this.parent.id,
          presence_members: this.getPresenceMembers(),
          show_in_channel: false,
          uuid: uuidv4()
        };
        if (this.updating) {
          this.updateComment(data);
          return;
        }
        let load = Object.assign({}, data);
        this.$emit("add-reply", { comment: this.parent, data: load });
        try {
          await this.channel.sendMessage(data);
        } catch (e) {
          this.$emit("reply-completed", {
            commentID: this.parent.id,
            data: load,
            failed: true
          });
        }
      } catch (e) {}
    },
    async deleteMessage() {
      await this.$store.state.chat.client.deleteMessage(this.comment.id);
      this.$emit("reply-added", this.parent);
    },
    async updateComment(prop) {
      try {
        const message = { ...this.comment, ...prop };
        this.editorAction = true;
        delete message.channel;
        const update = await this.$store.state.chat.client.updateMessage(
          message
        );
        this.$emit("reply-added", this.parent);
        this.editorAction = false;
        this.updating = false;
      } catch (e) {
        this.editorAction = false;
        this.updating = false;
      }
    },
    async sendReaction() {
      try {
        this.reaction.sent = true;
        await this.channel.sendReaction(this.comment.id, {
          type: "like",
          presence_members: this.getPresenceMembers()
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
    }
  }
};
</script>

<style lang="scss" scoped>
.sh-comment {
  padding: 2rem;
}

.sh-comment-name--text {
  font-family: Barlow;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.22;
  color: #171e48;
}

.sh-comment-box {
  border-radius: 0px 10px 10px 10px;
}

.sh-button {
  border-radius: 10rem;
  padding: 1.25rem 1rem;
}

.sh-comment-action {
  display: flex;
  border: 1px solid #ccc;
  padding: 10px;
}

.sh-comment-action-bar {
  position: relative;
  top: 5px;
}
</style>
