<template>
  <div class="share-file">
    <div v-if="loading">
      <img
        src="@/assets/icons/ellipsis-animation.svg"
        class="image is-64x64 margin-auto"
      />
    </div>
    <div class="share-file" v-else>
      <div class="logo">
        <img src="@/assets/logos/sensehawk-logo-inverted.svg" alt />
      </div>
      <div class="padding-20">
        <div class="no-results__text is-medium-20-500-24 has-opacity-8">
          <i class="fa fa-share-alt mr-5" ></i>
          Share Files
        </div>
        <p class="is-regular-14-00-17 has-text-blue-grey has-opacity-7 mt-5">
          Enter the ticket detials below to create a new ticket with the
          following shared files as attachments.
        </p>
        <div
          v-for="attachment in displayFiles"
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
              {{ attachment.name }}
            </div>
          </div>
        </div>
        <div
          class="ml-20 is-regular-14-00-17 has-text-blue-grey has-opacity-7"
          v-if="files && files.length > 5"
        >
          & {{ files.length - 5 }} more
        </div>
      </div>
      <create-new-ticket
        :small_viewer="true"
        :without_status="true"
        :element="asset_details ? asset_details.element : element"
        @ticket-created="storeOfflineData"
        :custom_class="'is-fixed'"
      ></create-new-ticket>
    </div>
  </div>
</template>
<script>
import CreateNewTicket from "@/desktop/tickets/components/tickets-list/components/create-new-ticket";
import { set, get } from "idb-keyval";
import { v4 as uuidv4 } from "uuid";
import { blobToBase64 } from "base64-blob";
import Compressor from "compressorjs";
import isOnline from "is-online";
import TicketDetailsMixin from "@/desktop/shared/mixins/ticket-details.mixin.vue";

export default {
  mixins: [TicketDetailsMixin],
  data() {
    return {
      files: null,
      loading: false,
    };
  },
  components: { CreateNewTicket },
  async mounted() {
    this.files = await get("imageShare");
    if (!(this.files && this.files.length > 0)) {
      this.$router.replace(`/tickets/`);
    } else {
      await set("imageShare", []);
    }
  },
  computed: {
    displayFiles() {
      return this.files ? this.files.slice(0, 5) : null;
    },
  },
  methods: {
    storeOfflineData(ticket) {
      this.loading = true;
      let compressedImages = [];
      this.files.forEach((file) => {
        compressedImages.push(this.imageCompression(file));
      });
      Promise.all(compressedImages).then(async (val) => {
        let attachments = await get("attachments");
        if (!attachments) attachments = {};
        if (!attachments[ticket.uid]) attachments[ticket.uid] = {};
        let b = [];
        val.forEach(async (c) => {
          let blob = blobToBase64(c);
          b.push(blob);
          attachments[ticket.uid][uuidv4()] = {
            data: await blob,
            file_name: c.name,
            status: "pending",
          };
        });
        Promise.all(b).then(async () => {
          await set("attachments", attachments);
          if (
            !(await isOnline) &&
            navigator.serviceWorker &&
            navigator.serviceWorker.controller
          ) {
            this.$router.replace(`/tickets/`);
          } else {
            await window.offlineAttachmentSync();
            this.open_ticket_details(ticket.uid);
            this.$router.replace(`/tickets/${ticket.uid}/details`);
          }
        });
      });
    },
    imageCompression(blob) {
      return new Promise(
        (res, rej) =>
          new Compressor(blob, {
            quality: 0.8,
            maxWidth: 1024,
            width: 1024,
            checkOrientation: false,
            convertSize: 0,
            success(result) {
              res(result);
            },
            error(err) {
              rej(err);
            },
          })
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.logo {
  width: 100%;
  height: 100px;
  img {
    width: 100%;
    height: 100%;
  }
}
.share-file {
  width: 100vw;
  height: 100vh;
  background: white;
}
.offline {
  &-data {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px;
  }
  &-file-name {
    margin: 0 30.5px 0 0;
    font-family: Barlow;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.17;
    letter-spacing: normal;
    text-align: left;
  }
}
</style>