<template>
  <div v-if="offlineAttachments && offlineAttachments.length > 0">
    <h1 class="offline-heading">Offline Attachments</h1>
    <div
      v-for="attachment in offlineAttachments"
      :key="attachment.file_name"
      class="offline-data"
    >
      <div>
        <sh-icon
          :name="'offline-attachment-icon'"
          class="is-30x30 mr-10"
        ></sh-icon>
      </div>
      <div style="flex: 1">
        <div class="offline-file-name">
          {{ attachment.file_name }}
        </div>
        <div class="offline-date">{{ attachment.data.type }}</div>
      </div>
      <div
        style="width: 150px; text-align: center; display: flex"
        class="offline-status"
      >
        <sh-icon
          :name="
            attachment.status === 'pending'
              ? 'offline-attachment-pending'
              : 'offline-attachment-done'
          "
          class="is-14x14 mr-10"
        ></sh-icon>
        {{
          attachment.status === "pending"
            ? "Waiting for the internet"
            : "uploaded"
        }}
      </div>
      <div
        @click="deleteOfflineAttachment(attachment.key)"
        v-show="attachment.status === 'pending'"
      >
        <sh-icon :name="'trash'" class="is-18x18 mr-10"> </sh-icon>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props:["offlineAttachments"],
  methods: {
    async deleteOfflineAttachment(key) {
        this.$emit("deleteOfflineAttachment",key);
    },
  },
};
</script>

<style scoped lang="scss">
.offline {
  &-heading {
    margin: 15px 182px 0 15px;
    font-family: Barlow;
    font-size: 14px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.21;
    letter-spacing: normal;
    text-align: left;
    color: black;
  }
  &-data {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 16px;
  }
  &-file-name {
    margin: 0 30.5px 0 0;
    font-family: Barlow;
    font-size: 12px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.17;
    letter-spacing: normal;
    text-align: left;
  }
  &-date {
    margin: 5px 48.5px 1px 0;
    opacity: 0.7;
    font-family: Barlow;
    font-size: 10px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.2;
    letter-spacing: normal;
    text-align: left;
  }
  &-status {
    margin: 0 0 0 8.5px;
    opacity: 0.7;
    font-family: Barlow;
    font-size: 10px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.2;
    letter-spacing: normal;
    text-align: left;
  }
  &-disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}
</style>