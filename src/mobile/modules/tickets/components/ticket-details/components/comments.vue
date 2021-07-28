<template>
    <comments :class="{'is_vertical_window':is_vertical_window}" :dataUid="dataUid" :small="is_vertical_window" id="mobile-comments" :commentsUnread="(commentsUnread = 0)" :presence_members="presence_members" :ticket="ticket"  :channelName="channelName" :service="apiService"></comments>
</template>
<script>
  import Comments from "@/desktop/tickets/components/ticket-details/components/comments/comments-section";
  import { ticketService } from "@/desktop/shared/services/";

  export default {
    props: ["ticket", "presence_members", "commentsUnread","channelName","is_vertical_window","dataUid"],
    components: {
      Comments,
    },  
    data() {
    return {
      apiService: ticketService,
    };
  },
  };
</script>
<style lang="scss">
  .animation-content {
    .modal-close {
      display: none;
    }
  }

  #mobile-comments {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    > div {
      height: 100%;
      > div {
        height: 100%;
        display:flex;
        flex-flow:column;
        .sh-comments-div {
          flex:1;
        }
      }
    }

    .mobileattachment .card-content .filename {
      font-size: 1rem !important;
    }

    .watchers-dropdown .add-followers {
      visibility: visible;
    }
    &.is_vertical_window .sh-dropdown{
       .sh-dropdown-content {
         top:3rem;
         left:-30px;
         right:unset;
       }
    }
    &:not(.is_vertical_window) .sh-dropdown {
      position: relative;
      .backdrop {
        position: fixed;
        background: #000;
        opacity: 0.6;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 201;
      }
      .sh-dropdown-content {
        background: #fff;
        border: 0.1rem solid #ddd;
        border-radius: 0.5rem;
        position: fixed;

        -webkit-box-shadow: 0.1rem 0.1rem 0.6rem 0.2rem #eee;
        box-shadow: 0.1rem 0.1rem 0.6rem 0.2rem #eee;
        z-index: 202;
        box-shadow: none;
        width: 80%;
        left: 10% !important;
        right: unset !important;
        top: 30%;
        font-family: Barlow-Medium;
        li {
          padding: 1rem;
        }
      }
    }
    .comments-header {
      width: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      flex-wrap: wrap;
      .sh-dropdown {
        > div {
          margin: 0;
        }
      }
      .level-left {
        width:100%;
        border-bottom: 0.1rem solid #e6e6e6;
        .field{
          width:100%;
        }
      }
      .level-right {
        * {
          font-size: 1.2rem !important;
        }
        .is-options-list{
          left:-40px;
        }
        width: 100%;
        display: flex;
        margin-top: 0rem;
        padding: 1rem 1.5rem;
        align-items: center;
        justify-content: space-between;
        > div:last-child {
          order: -1;
        }
        label {
          margin: 0;
        }
      }
      .searchbar {
        width: 100%;
      }
    }
    .sh-comment-name {
      > div {
        font-size: 1.3rem !important;
      }
    }
    .sh-comment-header-section {
      margin: 0;
    }
    .sh-comments-div {
      margin: 0;
      overflow: hidden;
      height: calc(100% - 12rem);
    }

    .sh-user {
      padding-left: 0;
      font-size: 1.2rem;
      .comment-user-liked {
        margin-top: 0.7rem;
      }
      .user_avatar_icon {
        > div {
          width: 2.4rem;
          height: 2.4rem;
        }
      }
      svg {
        width: 1.4rem;
        height: 1.4rem;
      }
    }
    .sh-comments-all {
      overflow-x: hidden;
      font-size: 1.3rem;
      padding: 0;
      .sh-comment-box {
        padding: 1rem;
      }
      .sh-comment-option {
        > p:last-child {
          display: block;
          font-size: 1.3rem !important;
        }
        > p:not(:last-child),
        > img,
        > span {
          display: none;
        }
        > div .sh-dropdown > div:first-child {
          display: none;
        }
        .sh-dropdown-content {
          position: fixed;
          bottom: -0.5rem;
          left: 0 !important;
          padding: 0 0;
          width: 100% !important;
          top: unset;
          li {
            display: flex;
            align-items: center;
            padding: 0.5rem 1.5rem;
            svg {
              width: 1.8rem;
              height: 1.8rem;
            }
            span {
              margin-left: 1rem;
              font-size: 1.3rem !important;
            }
          }
        }
      }
    }
    .sh-comment-pin {
      font-size: 1.2rem;
      svg {
        width: 1.4rem;
        height: 1.4rem;
        margin-right: 0.2rem;
      }
    }
    .sh-comment-attachments img {
      width: 100%;
    }
    .sh-unlike,
    .sh-like {
      display: block;
    }
    .sh-comment_scroll--top {
      display: none;
    }
    .sh-comments-threads {
      width: 100%;
      position: fixed;
      font-size: 1.3rem;
      top: 0;
      z-index: 100;
      .sh-comment-name--text {
        > p {
          font-size: 1.3rem !important;
        }
      }
      .sh-comment-text {
        margin-top: 1rem;
      }
      .sh-comment-option {
        display: none !important;
      }
    }
    .comment-regular-editor {
      z-index: 41;
      width: 100%;
      left: 0;
      padding: 0;
      box-shadow: 0 -0.5rem 1rem 0 rgba(0, 0, 0, 0.16);
      .sh-user {
        display: none;
      }
      .sh-comment {
        margin: 0;
      }
    }
    .ck-toolbar__items {
      button {
        min-height: 2.2rem;
        min-width: 2.2rem;
      }
      .ck.ck-icon {
        font-size: 1.4rem;
        width: 1.8rem;
        height: 1.8rem;
      }
    }
    .sh-comment-only .sh-comment-action .ck-editor .ck-editor__top {
      bottom: -3rem;
    }
    .sh-comments-div .attachment-list {
      grid-template-columns: repeat(2, 1fr);
    }
    .sh-comment-only,
    .comment-regular-editor {
      .sh-comment-action:not(.focused) {
        display: flex;
        flex-wrap: wrap !important;
        align-items: center;
        padding-top: 0.5rem;
        flex-flow: row;
        .task-list-tab {
          width: 100%;
        }
        .sh-comment-action-bar {
          position: static;
          .comment-smiley,
          .ThumbnailContainer .sh-attachment-btn {
            display: none;
          }
        }
        .ck-editor__top {
          display: none;
        }
      }
    }
    .ck-content {
      font-size: 1.3rem;
    }
    .comment-smiley {
      display: none;
    }

    .sh-comment-typing-event {
      top: -2.5rem;
      opacity: 1;
      left:0;
      bottom: unset;
      width: 100%;
      border-bottom:0px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: none;
      padding: 2px 1.5rem;
      font-size: 1.2rem;
    }

    .sh-comment-only {
      width: 100%;
      padding: 0rem 1.5rem;
      margin: 0;
    }
    .sh-comment-error {
      .btn {
        height: 3rem;
      }
      .sh-comments-loader {
        width: 90%;
        top: 10px;
        height:400px;
      }
    }
    .no-result {
      img {
        width: 50%;
      }
      p + p {
        width: 85% !important;
        margin: 0 auto;
      }
    }
  }
</style>
