<template>
  <div class="sh-comment-name is-flex is-between">
    <div class="is-medium-18-500-22 sh-comment-name--text is-flex align-center">
      {{ comment.user.name }}
      <div
        class="is-flex ml-20 align-center sh-comment-pin"
        v-if="comment.pinned"
      >
        <sh-icon :name="'pinned-yellow'" class="is-18x18 mr-5"></sh-icon>
        Pinned
      </div>
    </div>
    <div
      :class="active ? 'active' : ''"
      class="is-flex align-center sh-comment-option"
    >
      <img
        @click="$emit('pinned')"
        src="@/assets/icons/pin.svg"
        v-if="!comment.pinned"
        class="is-pointer mr-20"
        :class="option.pinned ? 'sh-comment-pinned' : ''"
      />
      <span @click="$emit('pinned')" v-else>
        <sh-icon
          :class="option.pinned ? 'sh-comment-pinned' : ''"
          :name="'pinned-yellow-active'"
          class="is-24x24 is-pointer mr-20"
        ></sh-icon>
      </span>
      <p
        v-if="this.comment.user.id === this.$store.state.claims.user_id"
        @click="$emit('edit')"
      >
        <sh-icon :name="'edit-2'" class="is-pointer mr-20 is-18x18"></sh-icon>
      </p>
      <p @click="$emit('reply')" class=" align-center mr-20 is-pointer">
        <sh-icon
          :name="'ticket-tab-comments'"
          class="is-pointer mr-5  is-18x18"
        ></sh-icon>
        Reply
      </p>
      <sh-menu
        :items="items"
        @clicked-outside="active = false"
        :active="active"
        :width="'25.6rem'"
        @item-clicked="
          active = false;
          $emit($event);
        "
      >
        <sh-icon
          @click.native="active = !active"
          :name="'3dots-menu-horizontal'"
          class="is-24x24 is-pointer"
        />
      </sh-menu>
      <p
        class="is-regular-14-00-17 has-text-theme-black has-opacity-6 sh-created-at"
        :class="active ? 'active' : ''"
      >
        {{ new Date(comment.created_at).toISOString() | prettyDate }}
      </p>
    </div>
  </div>
</template>
<script>
import shMenu from "@/desktop/shared/components/menu";

export default {
  components: { shMenu },
  props: ["ticket", "comment", "isEditing", "channel", "option"],
  data() {
    return {
      active: false,
      items: []
    };
  },
  computed:{
    pinned(){
      return this.comment.pinned;
    }
  },
  watch:{
    pinned:function(val){
      this.items[0]={
        icon: this.comment.pinned?"pinned":"pinned-active",
        text: this.comment.pinned?"Un-pin comment":"Pin to this conversation",
        action: "pinned"
      }
    }
  },
  mounted() {
    this.$emit("mobileEvent", () => {
      this.active = true;
    });
    this.items.push(
      {
        icon: this.comment.pinned?"pinned":"pinned-active",
        text: this.comment.pinned?"Un-pin comment":"Pin to this conversation",
        action: "pinned"
      },
      {
        icon: "ticket-tab-comments",
        text: "Reply to this comment",
        action: "reply"
      }
    );
    if (this.comment.user.id === this.$store.state.claims.user_id) {
      this.items.push(
        {
          icon: "edit-2",
          text: "Edit this comment",
          action: "edit"
        },
        {
          icon: "trash",
          text: "Delete this comment",
          action: "delete"
        }
      );
    }
  }
};
</script>
