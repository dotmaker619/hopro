<template>
  <div :id="id">
    <div v-if="offline">
      <input
        type="file"
        ref="offline_input"
        multiple
        @change="storeOfflineData"
        accept="image/*"
        style="visibility:hidden:width:0px;height:0px;overflow:hiddendisplay:flex;z-index:-1;"
      />
      <div v-show="showOfflineLoading">
        <h4 style="text-align: center; font-size: 16px">
          <b>Please wait</b> <br />
          Uploading files in offline mode
        </h4>
        <img
          src="@/assets/icons/ellipsis-animation.svg"
          class="image is-64x64 margin-auto"
        />
      </div>
      <div v-show="!showOfflineLoading">
        <h4 class="mb-20" style="text-align: center; font-size: 18px">
          <b>Attachments - Offline mode</b> <br />
          Select
          <a
            style="text-decoration: underline; font-weight: bold"
            @click.prevent="$refs.offline_input.click()"
            >files</a
          >
          to upload
        </h4>
      </div>
      <!-- <div class="ThumbnailContainer">
        <div @click="$refs.offline_input.click()" id="open-thumbnail-modal">
          <slot>
            <button class="button">select file</button>
          </slot>
        </div>
      </div> -->
    </div>
    <div v-else>
      <div
        ref="input"
        style="
          visibility: hidden;
          width: 0px;
          height: 0px;
          overflow: hidden;
          display: flex;
        "
      ></div>
      <div class="ThumbnailContainer" v-if="isModal">
        <div id="open-thumbnail-modal">
          <slot>
            <button class="button">select file</button>
          </slot>
        </div>
      </div>
      <div class="DashboardContainer" v-else></div>
    </div>
  </div>
</template>

<script>
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import Dashboard from "@uppy/dashboard";
import FileInput from "@uppy/file-input";

import GoogleDrive from "@uppy/google-drive";
import Url from "@uppy/url";
import Dropbox from "@uppy/dropbox";
import OneDrive from "@uppy/onedrive";
import Screencast from "@uppy/screen-capture";
import Camera from "@uppy/webcam";
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import UppyImageCompressor from "./upload-file-compressor";
import { set, get } from "idb-keyval";
import { v4 as uuidv4 } from "uuid";
import { blobToBase64 } from "base64-blob";
import Compressor from "compressorjs";


// And their styles (for UI plugins)
import "@uppy/core/dist/style.css";
import "@uppy/url/dist/style.css";
import "@uppy/webcam/dist/style.css";
import "@uppy/dashboard/dist/style.css";

export default {
  props: {
    service: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isModal: {
      type: Boolean,
      default: false,
    },
    uploadMethod: {
      type: Function,
      required: true,
    },
    offlineData:{
      type:Object,
      default: {},
    }
  },

  data() {
    return {
      uppy: null,
      attachments: [],
      showOfflineLoading: false,
      isMobile: this.$route.meta.screen == "mobile",
      providerOptions: {
        target: Dashboard,
        companionUrl: process.env.VUE_APP_STORAGE_COMPANION_URL,
        companionHeaders: {
          key: this.$cookies.get("access_token"),
        },
      },
      dashboardModalOptions: {
        id: "Dashboard",
        target: `#${this.id}   .ThumbnailContainer`,
        trigger: "#open-thumbnail-modal",
        proudlyDisplayPoweredByUppy: false,
        showProgressDetails: false,
        closeAfterFinish: true,
        browserBackButtonClose: true,
        onRequestCloseModal: () => this.closeModal(),
        disablePageScrollWhenModalOpen: false,
      },
      dashboardOptions: {
        id: "Dashboard",
        inline: true,
        height: 330,
        target: `#${this.id}   .DashboardContainer`,
        proudlyDisplayPoweredByUppy: false,
        showProgressDetails: false,
        browserBackButtonClose: true,
        replaceTargetContent: true,
      },
    };
  },
  computed: {
    offline() {
      return this.$store.state.is_offline;
    },
  },
  beforeDestroy() {
    if (this.uppy) this.uppy.close();
  },
  mounted() {
    try {
      this.initialize();
    } catch (err) {
      console.log(err);
    }
  },
  methods: {
    closeModal() {
      this.uppy.close();
      this.initialize();
    },
    storeOfflineData() {
      this.showOfflineLoading = true;
      let compressedImages = [];
      this.$refs.offline_input.files.forEach((file) => {
        compressedImages.push(this.imageCompression(file));
      });
      Promise.all(compressedImages).then(async (val) => {
        let attachments = await get("attachments");
        if (!attachments) attachments = {};
        if (!attachments[this.uid]) attachments[this.uid] = {};
        let b = [];
        val.forEach(async (c) => {
          let blob = blobToBase64(c);
          b.push(blob);
          attachments[this.uid][uuidv4()] = {
            data: await blob,
            file_name: c.name,
            status: "pending",
            ...this.offlineData
          };
        });
        Promise.all(b).then(() => {
          set("attachments", attachments);
          this.$emit("close-uppy",compressedImages.length);
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
    initialize() {
      if (this.offline) {
        this.$refs.offline_input.click();
        return;
      }
      this.uppy = Uppy({
        id: this.id,
        autoProceed: this.isMobile,
        logger: Uppy.debugLogger,
        debug: false,
        meta: {
          stage: this.service,
          resource: JSON.stringify({
            type: this.type,
            uid: this.uid,
            name: this.name,
          }),
        },
      });

      this.uppy.use(UppyImageCompressor);

      if (this.isModal) {
        this.uppy.use(Dashboard, this.dashboardModalOptions);
      } else {
        this.uppy.use(Dashboard, this.dashboardOptions);
      }

      if (!this.isMobile) {
        this.uppy.use(Url, this.providerOptions);

        if (this.$store.getters.upload_third_party_providers) {
          this.uppy.use(GoogleDrive, this.providerOptions);

          this.uppy.use(OneDrive, this.providerOptions);

          this.uppy.use(Dropbox, this.providerOptions);
        }

        this.uppy.use(Camera, this.providerOptions);

        this.uppy.use(Screencast, this.providerOptions);

        this.uppy.use(AwsS3Multipart, {
          limit: 4,
          companionUrl: process.env.VUE_APP_STORAGE_COMPANION_URL,
          companionHeaders: {
            key: this.$cookies.get("access_token"),
          },
        });
      } else {
        this.uppy.use(FileInput, {
          target: this.$refs.input,
          pretty: true,
        });
        if (this.isModal) {
          this.uppy.on("dashboard:modal-open", () =>
            this.$refs.input.querySelector(".uppy-FileInput-btn").click()
          );
        } else {
          this.$refs.input.querySelector(".uppy-FileInput-btn").click();
        }
        this.uppy.use(AwsS3Multipart, {
          limit: 4,
          companionUrl: process.env.VUE_APP_STORAGE_COMPANION_URL,
          companionHeaders: {
            key: this.$cookies.get("access_token"),
          },
        });
      }

      this.uppy.on("dashboard:modal-open", () => {
        console.log("Modal is open");
      });

      this.uppy.on("upload-success", (file, response) => {
        this.updateService(file, response);
      });

      this.uppy.on("complete", (data) => {
        Promise.all(this.attachments).then((val) => {
          this.attachments = [];
          this.show_success("Files uploaded");
          const attachments = val
            .map((d) => {
              return d && d.data && d.data[0] ? d.data[0] : null;
            })
            .filter((d) => d !== null);
          this.$emit("uploaded_success", attachments);
          analytics.track("File(s) Uploaded");
        });
      });
      this.$emit("initialised", this.uppy);
    },

    async updateService(file, { uploadURL }) {
      uploadURL = decodeURIComponent(uploadURL);
      let pattern = /https:\/\/(.*)\.s3\.(.*)\.amazonaws.com\/(.*)/g;
      let [_, bucket, region, key] = pattern.exec(uploadURL);
      const serviceObj = {
        stage: this.service,
        name: "aws_s3",
        key: key,
        bucket: bucket,
        region: region,
      };
      const promise = this.uploadMethod(
        {
          service: serviceObj,
          fileName: file.name,
        },
        file
      );
      this.attachments.push(promise); //For Calling promise.all.  Once all the sync is complete  update the UI.
      await promise;
    },
  },
};
</script>
<style lang="scss">
.DashboardContainer .uppy-Dashboard-inner {
  background: transparent;
  // margin: 0 auto;
}
</style>
