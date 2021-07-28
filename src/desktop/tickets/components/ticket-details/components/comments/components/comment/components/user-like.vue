<template>
  <div class="sh-user">
    <user-avatar
      :user="userAvatar"
      :pxsize="40"
      class="user_avatar_icon"
      :custom_class="'margin-x-auto user-style'"
    ></user-avatar>
    <div v-if="!isEditing&&!comment.channel">
      <span
        v-if="!(comment.own_reactions && comment.own_reactions.length > 0)"
        @click="$emit('send')"
      >
        <div
          class="comment-user-liked is-flex mt-10 align-center"
          v-if="comment.reaction_counts&&comment.reaction_counts.like > 0"
        >
          <sh-icon
            :name="'unlike'"
            class="is-pointer  mr-5 is-18x18"
            :class="reaction.sent ? 'sh-comment-like-wiggle' : ''"
          ></sh-icon>
          {{ comment.reaction_counts.like }}
        </div>
        <sh-icon
          v-else
          :name="'unlike'"
          class="is-pointer mt-10 is-18x18 sh-unlike"
          :class="reaction.sent ? 'sh-comment-like-wiggle' : ''"
        ></sh-icon>
      </span>
      <div @click="$emit('delete')" v-else class="comment-user-liked is-flex mt-10 align-center">
        <sh-icon
          :name="'liked'"
          class="is-pointer mr-5 is-18x18"
          :class="
            reaction.delete || reaction.sent ? 'sh-comment-like-wiggle' : ''
          "
        ></sh-icon>
        {{ comment.reaction_counts.like }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["ticket", "comment", "isEditing", "channel", "reaction"],
  computed: {
    userAvatar() {
      return {
        uid: this.comment
          ? this.comment.user.id
          : this.$store.state.claims.user_id,
        email: this.comment
          ? this.comment.user.email
          : this.$store.state.claims.email
      };
    }
  },
  data() {
    return {
      reactionSent: false,
      reactionDelete: false,
      items: [
        {
          icon: "assignee",
          text: "Assign all to...",
          action: () => {
            this.assign_all = true;
          }
        }
      ]
    };
  }
};
</script>
