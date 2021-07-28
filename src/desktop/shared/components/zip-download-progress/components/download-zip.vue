<template>
  <div class="download-zip" v-if="active">
    <div class="is-flex is-vcenter ml-5">
      <img class="download-zip-icon" src="@/assets/icons/download-1.svg" />
      <div class="is-semiBold-14-600-22">
        {{ action_type }}
        <template v-if="total">{{ completed }}/{{ total }}</template>
      </div>
    </div>
    <div class="download-zip-progress">
      <!-- v-if="show_progress" -->
      <RadialProgressBar
        v-if="total"
        :diameter="28"
        :completed-steps="completed"
        :total-steps="total"
        :stroke-width="3"
        :start-color="'#70d799'"
        :stop-color="'#70d799'"
        :inner-stroke-color="'#e7e8ec'"
        class="mr-5"
      />
    </div>
    <img @click="active = false" v-tooltip="'Download in background'" class="mr-20 is-pointer" src="@/assets/icons/download-close.svg" />
  </div>
</template>

<script>
  import RadialProgressBar from "vue-radial-progress";
  export default {
    props: ["zip_data"],
    data() {
      return {
        active: true,
        data: null,
        completed: 0,
        total: 0,
        action_type: "",
      };
    },
    components: {
      RadialProgressBar,
    },
    created() {
      this.data = Object.assign(this.zip_data);
      this.generate_zip();
    },
    methods: {
      close() {
        this.$destroy();
        // remove the element from the DOM
        this.$el.parentNode.removeChild(this.$el);
      },
      async generate_zip() {
        let self = this;
        this.action_type = "Downloading files";
        self.total = 0;

        function total_count_files(folder) {
          self.total += folder.files.length;
          if (folder.children && folder.children.length) {
            folder.children.forEach((f) => {
              total_count_files(f);
            });
          }
        }
        total_count_files(this.data);

        self.completed = 0;
        function urlToPromise(url) {
          return new Promise(function(resolve, reject) {
            JSZipUtils.getBinaryContent(url, {
              callback: function(err, data) {
                if (err) {
                  reject(err);
                } else {
                  resolve(data);
                }
              },
              progress: function(e) {
                if (e.percent === 100) self.completed++;
              },
            });
          });
        }
        var zip = new JSZip();
        // Add each file
        let add_files = async (folder, zip_folder) => {
          for (let i = 0; i < folder.files.length; i++) {
            try {
              let blob = await urlToPromise(folder.files[i].url);
              zip_folder.file(folder.files[i].name, blob, {
                binary: true,
              });
            } catch (err) {
              console.log(err);
              continue;
            }
          }
          if (folder.children && folder.children.length) {
            for (let i = 0; i < folder.children.length; i++) add_files(folder.children[i], zip_folder.folder(folder.children[i].name));
          } else {
            // "NO children
            return;
          }
        };
        await add_files(this.data, zip);
        // when everything has been downloaded, we can trigger the dl
        zip
          .generateAsync({ type: "blob" }, function updateCallback(metadata) {
            self.total = 0;
            self.completed = 0;
            self.action_type = "Zipping files...";

            var msg = "progression : " + metadata.percent.toFixed(2) + " %";
            if (metadata.currentFile) {
              msg += ", current file = " + metadata.currentFile;
            }
          })
          .then(
            function callback(blob) {
              saveAs(blob, self.data.name || "Folder");
              self.action_type = "Completed!";
              setTimeout(() => {
                self.close();
              }, 3000);
            },
            function(e) {
              console.log(e);
            }
          );
      },
    },
  };
</script>
