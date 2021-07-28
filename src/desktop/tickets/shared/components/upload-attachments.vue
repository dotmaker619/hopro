<template>
  <div id="attachments-dropzone" ref="dropzone">
    <slot></slot>
  </div>
</template>

<script>
  import { ticketService } from "@/desktop/shared/services/";
  import axios from "axios";

  export default {
    props: ["params", "get_method", "update_method", "destroyDropzone"],
    data() {
      return {
        dropzone: null,
        presigned_urls: null,
        options: {
          url: "https://test.com/",
          paramName: "file",
          maxFilesize: 100,
          sending: this.sending,
          addedfiles: this.addedFiles,
          autoProcessQueue: false,
          addRemoveLinks: true,
          parallelUploads: 10,
          method: "put",
          queuecomplete: this.on_success,
          params: {},
        },
      };
    },
    beforeDestroy() {
      if (this.destroyDropzone) {
        this.dropzone.destroy();
      }
    },
    mounted() {
      this.init_dropzone();
    },
    methods: {
      sending(file, xhr, fileData) {
        let _send = xhr.send;
        xhr.send = () => {
          _send.call(xhr, file);
        };
      },
      async addedFiles(e) {
        let files = Object.values(e);
        this.presigned_urls = await ticketService[this.get_method]({
          body: {
            fileNames: files.map((file) => file.name),
          },
          ...this.params,
        });

        this.presigned_urls = _.keyBy(this.presigned_urls, "fileName");
        this.dropzone.processQueue();
      },
      init_dropzone() {
        setTimeout(() => {
          this.dropzone = new Dropzone(this.$refs.dropzone, this.options);
          this.dropzone.on("processing", (file) => {
            if (this.presigned_urls[file.name]) {
              this.dropzone.options.url = this.presigned_urls[file.name].url;
            }
          });
          this.dropzone.on("dragover", () => {
            this.$emit("file_drag_over");
          });
          this.dropzone.on("dragleave", () => {
            this.$emit("file_drag_leave");
          });
          this.dropzone.on("drop", () => {
            this.$emit("file_drop");
          });
          this.dropzone.on("complete", (file) => {
            this.$emit("file_upload_complete", file);
          });
          this.dropzone.on("queuecomplete", (file) => {
            this.$emit("queue_complete");
          });
        }, 500);
      },
      async on_success() {
        let data;

        if (this.dropzone.files.length > 1) {
          let body = { serviceObjects: [] };
          for (let file of this.dropzone.files) {
            if (this.presigned_urls[file.name]) {
              body.serviceObjects.push({
                service: this.presigned_urls[file.name].service,
                fileName: file.name,
              });
            }
          }
          data = await ticketService[this.update_method]({
            body,
            ...this.params,
          });
        } else if (this.dropzone.files.length == 1) {
          data = await ticketService[this.update_method]({
            body: {
              serviceObject: {
                service: this.presigned_urls[this.dropzone.files[0].name].service,
                fileName: this.dropzone.files[0].name,
              },
            },
            ...this.params,
          });
        }
        this.show_success("File uploaded");
        this.$emit("refetch_files", data);
        this.dropzone.removeAllFiles();
      },
    },
  };
</script>
