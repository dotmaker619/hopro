<template>
  <div @dragenter.prevent.stop="dragFile" class="sh-comment-section">
    <div v-if="channel && !dataError">
      <div
        v-if="
          !(start_conversation||small) &&
          !commentsLoading &&
          !(channel && channel.state.messages && channel.state.messages.length)
        "
        class="no-result"
      >
        <img src="@/assets/illustrations/no-comments-illustration.svg" alt />
        <div class="has-text-centered">
          <div class="mt-10">
            <p class="sh-text-normal-22 mb-10">No comments</p>
            <p style="width: 50rem; font-size: 1.4rem">
              Conversation help in better collaboration and getting instant
              feedback with realtime updates. You can @mention other users and
              attach files to a comment
            </p>
          </div>
          <div
            style="width: 20rem"
            class="sh-button ml-auto mr-auto mt-20"
            @click="
              start_conversation = true;
              scrollPageToBottom();
            "
          >
            <p class="is-flex">
              <sh-icon :name="'comments-white'" class="is-16x16"></sh-icon>
              <span class="is-regular-16-00-20">Start a conversation</span>
            </p>
          </div>
        </div>
      </div>
      <div v-else>
        <div
          @click="scrollToTop"
          v-show="!threads"
          class="sh-comment_scroll--top"
        >
          Scroll to top
          <i class="fas fa-arrow-up"></i>
        </div>
        <div
          class="sh-comment-header-section"
          style="height: auto; overflow: visible"
        >
          <comments-header
            @filter="search"
            @clearFilter="
              dataUid?null:filters = null;
              dataUid?search():showFilter = false;
              searchData=null;
              scrollToBottomComments();
            "
            :dataUid="dataUid"
            class="comments-header"
          ></comments-header>
        </div>
        <div class="sh-comments-div">
          <div
            class="sh-comments-all has-slimscroll-xs"
            ref="comment"
            :class="threads ? 'open' : ''"
          >
            <div class="sh-comment-only">
              <div class="sh-comments-loader" v-if="commentsLoading">
                <img
                  src="@/assets/icons/ellipsis-animation.svg"
                  class="image is-64x64 margin-auto"
                />
              </div>
              <div v-else>
                <comment
                  @reply="getReplies"
                  v-for="comment in channelData"
                  :presence_members="presence_members"
                  :key="comment.id"
                  :comment="comment"
                  :service="service"
                  :ticket="ticket"
                  :files="existing_files"
                  :channel="channel"
                  :dataUid="dataUid"
                  :small="small"
                  :zombie="false"
                ></comment>
                <comment
                  class="sh-zombie-comment"
                  v-for="comment in tempComments"
                  :key="comment"
                  :comment="comment"
                  :small="small"
                  :service="service"
                  :ticket="ticket"
                  :files="existing_files"
                  :channel="channel"
                  :dataUid="dataUid"
                  :zombie="true"
                ></comment>
              </div>
            </div>
          </div>
          <footer class="comment-regular-editor">
            <comment
              v-if="!threads"
              isEditing="true"
              :presence_members="presence_members"
              :ticket="ticket"
              :channel="channel"
              :small="small"
              :service="service"
              :dataUid="dataUid"
              :addAttachments="addAttachments"
              @sendMessage="pushToTemp"
              ref="commentEditor"
              @messageSent="popFromTemp"
            ></comment>
          </footer>
          <div v-if="threads" class="sh-comments-threads">
            <div class="is-flex align-center is-between padding-20">
              <div class="is-medium-18-500-22">Thread</div>
              <div
                @click="
                  threads = null;
                  replies = [];
                "
              >
                <sh-icon :name="'close'" class="is-pointer is-18x18"></sh-icon>
              </div>
            </div>
            <div
              ref="thread"
              class="has-slimscroll-xs sh-threads-div--scroll"
              style="flex: 1; overflow: auto"
            >
              <reply
                style="pointer-events: none"
                :comment="threads"
                :ticket="ticket"
                :channel="channel"
                class="pb-10"
              ></reply>
              <reply
                v-for="comment in replyData"
                :key="comment.id"
                :comment="comment"
                :ticket="ticket"
                :presence_members="presence_members"
                :parent="threads"
                :zombie="false"
                @reply-added="getReplies($event, true)"
                :channel="channel"
              ></reply>
              <div
                v-if="
                  this.offlineComments &&
                  this.offlineComments[threads.id] &&
                  this.offlineComments[threads.id].reply
                "
              >
                <reply
                  v-for="comment in this.offlineComments[threads.id].reply"
                  class="sh-zombie-comment"
                  :key="comment.id"
                  :comment="comment"
                  :ticket="ticket"
                  :channel="channel"
                  :zombie="true"
                ></reply>
              </div>
            </div>
            <div style="padding: 20px" v-if="threadsLoading">
              <loader></loader>
            </div>
            <reply
              @reply-added="getReplies"
              isEditing="true"
              :parent="threads"
              :comment="threads"
              :presence_members="presence_members"
              :ticket="ticket"
              :channel="channel"
              @add-reply="addOfflineReply"
            ></reply>
          </div>
        </div>
      </div>
    </div>
    <div class="sh-comment-error" v-else-if="channel">
      <b>Unable to connect to servers</b>
      <b>Please check if you are online and retry</b>
      <div class="btn button mt-20" @click="init">
        <i
          class="fa fa-redo mr-5"
          style="font-size: 12px"
          aria-hidden="true"
        ></i>
        {{small?init():'Retry.'}}
      </div>
    </div>
    <div class="sh-comment-error" v-else>
      <div class="sh-comments-loader" v-if="loading">
        <img
          src="@/assets/icons/ellipsis-animation.svg"
          class="image is-64x64 margin-auto"
        />
      </div>
      <div v-else>
        <b>Ooops!, Chat server is not initialised</b>
        <div>
          <br />Refresh the page and try again <br />OR <br />Contact support.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from "@/desktop/shared/services/";
import PromptModal from "@/desktop/shared/components/prompt-modal";
import CommentsHeader from "./components/header/comments-header";
import Comment from "./components/comment/comment";
import Loader from "./components/comment/components/loader";
import Reply from "./components/comment/reply";
import VEmbed from "vue-embed";
import RadialProgressBar from "vue-radial-progress";

export default {
  props: ["ticket", "presence_members", "channelName", "service", "small","dataUid"],
  data() {
    return {
      allUsers: [],
      user_typing: null,
      threads: false,
      channel: null,
      replies: [],
      existing_files: [],
      start_conversation: false,
      filters: null,
      showFilter: false,
      commentsLoading: false,
      threadsLoading: false,
      searchData: null,
      tempComments: [],
      addAttachments: false,
      dataError: false,
      offlineComments: {},
      loading: false,
      connected: false,
    };
  },
  async beforeDestroy() {
    if (!this.connected) {
      return;
    }
    this.channel.off("message.deleted", this.searchOnUpdate);
    this.channel.off("message.new", this.onNewMessage);
    this.channel.off("message.updated", this.searchOnUpdate);
    this.channel.off("reaction.new", this.onNewReaction);
    this.channel.off("reaction.deleted", this.onDeleteReaction);
    await this.channel.stopWatching();
    // await this.$store.state.chat.client.disconnect();
  },
  mounted() {
    this.init();
  },
  components: {
    PromptModal,
    VEmbed,
    RadialProgressBar,
    CommentsHeader,
    Comment,
    Reply,
    Loader,
  },
  computed: {
    current_user() {
      return this.$store.state.claims.user_id;
    },
    channelData() {
      return this.showFilter
        ? this.filters
        : this.channel
        ? this.channel.state.messages
        : [];
    },
    replyData() {
      return this.replies;
    },
  },
  watch:{
    dataUid:function (newVal,oldVal){
      if(newVal){
        this.search(this.searchData);
      }
    },
  },
  methods: {
    async init() {
      try {
        await this.initialise();
      } catch (e) {
        this.dataError = true;
      }
    },
    async initialise() {
      this.dataError = false;
      // this.loading = true;
      // this.connected = await this.$store.dispatch("connect_stream_chat");
      // this.loading = false;
      // if (!this.connected) {
      //   return;
      // }
      this.commentsLoading = true;
      this.client = this.$store.state.chat.client;
      this.channel = this.client.channel("messaging", this.channelName, {
        name: this.ticket.name,
        members: [this.current_user],
      });
      this.state = await this.channel.watch();
      this.commentsLoading = false;
      this.scrollPageToBottom();
      this.channel.on("message.deleted", this.searchOnUpdate);
      this.channel.on("message.updated", this.searchOnUpdate);
      this.channel.on("message.new", this.onNewMessage);
      this.channel.on("reaction.new", this.onNewReaction);
      this.channel.on("reaction.deleted", this.onDeleteReaction);
      this.scrollToBottomComments();
    },
    dragFile(event) {
      try {
        this.$refs.commentEditor.$el
          .querySelector(".sh-attachment-btn")
          .click();
      } catch (e) {}
    },
    formatVal(val) {
      val.unprocessed = Object.assign({}, val);
      val.user = {
        id: this.$store.state.claims.user_id,
        email: this.$store.state.claims.email,
        name:
          this.$store.state.claims.firstname +
          " " +
          this.$store.state.claims.lastname,
      };
      val.created_at = new Date();
      return val;
    },
    pushToTemp(val) {
      if(!this.showFilter)
      this.tempComments.push(this.formatVal(val));
      this.scrollToBottomComments();
    },
    addOfflineReply({ data, comment }) {
      if (
        this.offlineComments[comment.id] &&
        this.offlineComments[comment.id].reply
      ) {
        this.offlineComments[comment.id].reply.push(this.formatVal(data));
        this.offlineComments = Object.assign({}, this.offlineComments);
      } else {
        this.offlineComments[comment.id] = {
          reply: [this.formatVal(data)],
        };
        this.offlineComments = Object.assign({}, this.offlineComments);
      }
      this.scrollToBottom(this.$refs.thread);
    },
    async removeOfflineReply({ data, commentID, failed }) {
      if (!failed) {
        this.replies = (await this.channel.getReplies(commentID)).messages;
        this.scrollToBottom(this.$refs.thread);
      }
      if (
        this.offlineComments[commentID] &&
        this.offlineComments[commentID] &&
        this.offlineComments[commentID].reply &&
        this.offlineComments[commentID].reply.length > 0
      ) {
        this.offlineComments[commentID].reply = this.offlineComments[
          commentID
        ].reply.filter((d) => d.uuid !== data.uuid);
        this.offlineComments = Object.assign({}, this.offlineComments);
      }
    },
    popFromTemp(val) {
      this.tempComments = this.tempComments.filter((d) => d.uuid !== val);
    },
    searchOnUpdate(e) {
      if (this.showFilter) {
        this.search(this.searchData);
      }
    },
    refreshReply(message) {
      if (this.threads && this.threads.id === message.parent_id) {
        this.removeOfflineReply({
          commentID: message.parent_id,
          data: message,
        });
      }
    },
    onNewMessage(event) {
      if (event.message.type === "regular") {
        this.popFromTemp(event.message.uuid);
        this.scrollToBottomComments();
        this.searchOnUpdate();
      } else if (event.message.type === "reply") {
        this.refreshReply(event.message);
      }
    },
    onNewReaction(e) {
      this.refreshReply(e.message);
    },
    onDeleteReaction(e) {
      this.refreshReply(e.message);
    },
    async getReplies(comment, updating = false) {
      try {
        this.threadsLoading = true;
        this.threads = comment;
        this.replies = (await this.channel.getReplies(comment.id)).messages;
        this.threadsLoading = false;
        if (!updating) {
          this.scrollToBottom(this.$refs.thread);
        }
      } catch (e) {
        this.threadsLoading = false;
      }
    },
    async search(messageFilter) {
      try {
        this.searchData = messageFilter;
        this.commentsLoading = this.showFilter ? false : true;
        this.showFilter = true;
        const filters = { id: this.channel.id };
        if(this.dataUid){
          if(!messageFilter){
            messageFilter = {dataUid:{ $eq:this.dataUid}};
          }
        }
        const search = await this.$store.state.chat.client.search(
          filters,
          messageFilter
        );
        this.filters = search.results
          .map((s) => s.message)
          .filter((s) =>s.type === "regular"&&(s.dataUid?s.dataUid===this.dataUid:true)).reverse();
        this.commentsLoading = false;
        this.scrollToBottomComments();
      } catch (e) {
        this.commentsLoading = false;
      }
    },
    scrollToBottomComments(timeout = 500) {
      setTimeout(() => {
        this.scrollToBottom(this.$refs.comment);
      }, timeout);
    },
    scrollPageToBottom() {
      let container = document.querySelector(".animation-content");
      this.scrollToBottom(container);
    },
    scrollToTop() {
      let container = document.querySelector(".animation-content");
      container.scrollTop = 0;
    },
    scrollToBottom(div) {
      if (div) {
        this.$nextTick(() => {
          div.scrollTop = div.scrollHeight;
        });
      }
    },
  },
};
</script>

<style lang="scss">
.comments-header {
  padding: 1rem 6rem;
  border-bottom: 1px solid #e6e6e6;
}

.sh-threads-div--scroll > div:first-child {
  border-bottom: 1px solid #e6e6e6;
}

.sh-comments-all {
  overflow: auto;
  height: 100%;
  display: flex;
  flex: 1;
  flex-flow: column;
  justify-content: flex-end;
  position: relative;
  .sh-comment-box {
    padding: 1.5rem;
  }
  &.open {
    .sh-comment-only {
      margin: 15px 50px;
    }
    overflow: hidden;
  }
  padding-top: 2rem;
  .sh-comment-text {
    margin-top: 10px;
  }
}

.sh-comments-div {
  height: 80vh;
  flex-direction: column;
  display: flex;
  position: relative;
}

.sh-comment-only {
  margin: 15px auto;
  width: 70rem;
  min-height: 0;
  position: relative;
}

.sh-comments-threads {
  position: absolute;
  display: flex;
  flex-flow: column;
  right: 0;
  top: 0px;
  width: 40rem;
  height: 100%;
  background: white;
  border-left: 1px solid #eaeaea;
  .ck-editor {
    margin: 0 !important;
    .ck-editor__top {
      display: none !important;
    }
  }
  .sh-comment {
    margin: 0;
    padding-bottom: 0.5rem;
  }
  .sh-comment-action {
    align-items: center;
  }
  .sh-comment-text {
    margin-top: 20px;
  }
}

.comment-regular-editor {
  width: 70rem;
  margin: 0 auto;
  background: white;
  padding: 0px 0px 20px 0px;
  position: relative;
  left: -2px;
}

.sh-comment {
  margin: 15px auto;
  position: relative;
  .sh-dropdown-content__Box {
    height: auto;
  }
  .sh-unlike,
  .sh-comment-option > * {
    display: none;
  }
  .sh-comment-option.active > * {
    display: flex;
  }
  .sh-comment-option.active > .sh-created-at {
    display: none;
  }
  .sh-created-at {
    display: flex;
  }
  &:not(.sh-zombie-comment):hover {
    .sh-unlike,
    .sh-comment-option > * {
      display: flex;
    }
    .sh-comment-option > .sh-created-at {
      display: none;
    }
  }
}
.sh-comment-name {
  max-height: 20px;
  &--text {
    font-family: Barlow;
    font-size: 18px;
    font-weight: 500;
    line-height: 1.22;
    color: #171e48;
  }
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
  font-size: 14px;
}
.sh-comment-box {
  word-break: break-all;
  border-radius: 0px 10px 10px 10px;
  position: relative;
  &[pinned]::before {
    content: " ";
    width: 4px;
    height: 100%;
    left: 0px;
    top: 0;
    opacity: 0.6;
    position: absolute;
    background-color: #fd9c0f;
  }
  &.comment-owner {
    background-color: #fff;
    border: solid 1px #d0d2da;
  }
  &.comment-not-owner {
    background-color: #f3f8fc;
  }
  .sh-comment-text {
    padding: 0;
  }
}

.sh-comment-replies__button {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.19;
  text-align: left;
  color: #2585d3;
}

.sh-comment-section {
  font-family: Barlow-Medium;
  position: relative;
  .sh-comment-send {
    border-radius: 10rem;
    padding: 1 rem 0.8rem;
  }
  .sh-comment-send.disabled {
    background-color: #fff;
    box-shadow: none;
    color: #ccc;
    pointer-events: none;
  }
}

.sh-comment-attachments {
  margin: 10px;
  padding-left: 5px;
  border-left: 3px solid #eaeaea;
  img {
    width: 360px;
  }
}

.sh-comment-section {
  .ck-editor {
    flex: 1;
    .ck-toolbar,
    .ck-content,
    .ck-focused {
      border: 0 !important;
      background: #fff;
      box-shadow: none !important;
      outline: none !important;
    }
    border: 0 !important;
    box-shadow: none !important;
    margin-bottom: 30px;
    position: relative;
    .ck-editor__top {
      display: none;
      position: absolute;
      bottom: -30px;
    }
  }
}

.sh-comments-loader {
  position: relative;
  height: 70vh;
  display: flex;
  flex-flow: column;
}

.sh-comment-pinned {
  animation: comment-like-wiggle 1.25s ease forwards infinite;
}

.sh-comment-like-wiggle {
  animation: comment-like-wiggle 1.25s ease forwards infinite;
}

@keyframes comment-like-wiggle {
  0% {
    transform: rotate(-15deg);
  }
  20% {
    transform: rotate(15deg);
  }
  40% {
    transform: rotate(-10deg);
  }
  60% {
    transform: rotate(10deg);
  }
  80% {
    transform: rotate(-5deg);
  }
  80% {
    transform: rotate(5deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.sh-comment-section .has-slimscroll-xs,
.animation-content {
  scroll-behavior: smooth;
}

.sh-comments-div .attachment-list {
  padding: 0;
  .attachment.card {
    margin: 0.5rem;
    // width: 19rem;
  }
}
.sh-comment-action.focused {
  .ck-editor__top {
    display: block;
  }
}
.sh-comment_scroll--top {
  position: absolute;
  bottom: 20px;
  right: 30px;
  cursor: pointer;
  z-index: 1;
  border: 1px solid #ccc;
  border-radius: 50px;
  padding: 6px;
  font-weight: bold;
  font-size: 12px;
  text-align: center;
  &:hover {
    background: #efefef;
    color: #000;
  }
}

.comments-header .watchers-dropdown > div:first-child > div:first-child {
  flex-wrap: wrap;
}
.sh-zombie-comment {
  opacity: 0.6;
  pointer-events: none;
  position: relative;
}

.sh-comment-error {
  height: 30vh;
  width: 100%;
  flex-flow: column;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
  font-size: 2rem;
  text-align: center;
  .sh-comments-loader {
    width: 70%;
    top: 100px;
  }
}

.comment-regular-editor,
.sh-comment-only {
  .sh-comment-action {
    flex-flow: column;
    align-items: flex-start;
    .ck-editor {
      margin: 0;
      width: 100%;
      .ck-editor__top {
        bottom: -35px;
      }
    }
  }

  .sh-comment-action-bar {
    align-self: flex-end;
    top: -5px;
    right: 5px;
  }
}
.sh-comments-comment--retry {
  position: absolute;
  top: 20%;
  right: -10px;
  opacity: 0.75;
  background: white;
  pointer-events: all;
  cursor: pointer;
}

.ck .ck-link_selected,
.ck-content .mention {
  color: #2585d3;
  background: none;
}
</style>
