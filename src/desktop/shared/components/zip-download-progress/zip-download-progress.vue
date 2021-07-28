<template>
  <div ref="zip" id="download-zip-container" class="download-zip-container"></div>
</template>

<script>
import { folderService, fileService } from "@/desktop/shared/services/";
import DownloadZip from "./components/download-zip";
import Vue from "vue";

export default {
  data() {
    return { data: null };
  },
  created() {
    this.$eventHub.$on("download_zip", data => {
      this.data = data;
      if (data.type === "vault") this.vault_download();
      else if (data.type === "ticket") this.ticket_attachment_download();
    });
  },
  beforeDestroy() {
    this.$eventHub.$off("download_zip");
  },
  methods: {
    vault_download() {
      let query = "";
      if (this.data.files)
        query = this.data.files.map(f => "uids=" + f).join("&");
      else query = "children=true";
      let self = this;
      folderService
        .get_files_download_url({
          id: this.data.folder.uid,
          query: query,
          headers: this.get_password_header(
            this.data.folder.rootFolder
              ? this.data.folder.rootFolder
              : this.data.folder.uid
          )
        })
        .then(res => {
          this.zip_files(res.data);
        });
    },
    ticket_attachment_download() {
      let download_files = {
        name: this.data.name,
        files: this.data.attachments
      };

      this.zip_files(download_files);
    },
    zip_files(files) {
      const downloadZip = Vue.extend(DownloadZip);
      const vm = new downloadZip({
        propsData: {
          zip_data: files
        }
      }).$mount();
      this.$refs.zip.appendChild(vm.$el);
    }
  }
};
</script>

<style lang="scss">
.download-zip-container {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  .download-zip {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 292px;
    height: 50px;
    border-radius: 6px;
    box-shadow: 0 3px 6px 0 rgba(134, 139, 162, 0.3);
    border: solid 1px #868ba2;
    background-color: #f4f7fc;
  }
}
</style>