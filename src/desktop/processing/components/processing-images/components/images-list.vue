<template>
  <div class="images-list" id="images-list">
    <div v-if="raw_images">
      <div class="images-list__carousel">
        <div
          id="my-carousel"
          class="my-carousel has-slimscroll-xs has-full-width columns is-absolute"
        >
          <div class="column is-2" v-for="(image, i) of images" :key="i">
            <img
              class=" image is-bordered is-128x128"
              :src="raw_images[image.key]"
              alt="image"
            />
            <p class="slider-image-caption is-flex is-vcenter">
              <input
                :id="'input' + image.key"
                :disabled="start_processing_state"
                class="sh-custom-checkbox is-rounded"
                type="checkbox"
                v-model="selected_images"
                :value="image.key"
              />
              <label
                :id="image.key"
                :class="{ clicked: clicked == image.key }"
                class="is-medium-14-500-17 ml-10"
                :for="'input' + image.key"
              >
                {{ image.filename }}
              </label>
            </p>
          </div>
        </div>
      </div>
      <hr />
    </div>

    <!-- buttons -->
    <div class="images-filter mt-40">
      <div class="sh-buttons-group is-end is-flex">
        <div class="is-flex has-space-between">
          <div class="is-flex">
            <b-field class="file">
              <b-upload :accept="'.kml,.json,.geojson'" v-model="file">
                <span
                  class="is-flex is-center is-vcenter sh-button sh-button--inverted is-medium-14-500-17"
                >
                  <sh-icon
                    :name="'upload-active'"
                    class="is-16x16 mr-10"
                  ></sh-icon>
                  Choose kml or geojson
                </span>
              </b-upload>
            </b-field>

            <div class="control">
              <button
                class="sh-button is-flex is-vcenter is-medium-14-500-17"
                style="padding: 5px 8px"
                @click="select_every_nth_image(+$refs.every.value)"
              >
                <input
                  ref="every"
                  value="2"
                  class="input mr-10 is-small is-medium-14-500-17"
                  style="width: 35px; border-radius: 5px"
                  placeholder
                />Select every nth image
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-if="file" class="tag is-medium is-bordered mb-20 is-white">
        <span class="is-flex is-vcenter">
          {{ file.name }}
          <button
            @click="
              file = null;
              file_data = null;
            "
            class="delete is-small"
          ></button>
        </span>
      </p>
    </div>
    <!-- image list -->
    <table
      v-if="raw_images"
      style="margin-bottom: -2px"
      class="images-list__table images-list__table--header is-fullwidth table"
    >
      <thead>
        <tr>
          <th width="10%">
            <div class="field" style="padding-left: 4px">
              <b-checkbox
                :disabled="!start_processing_state"
                @input="
                  is_select_all
                    ? (selected_images = Object.keys(raw_images))
                    : (selected_images = [])
                "
                v-model="is_select_all"
                size="is-small"
                type="is-white"
              ></b-checkbox>
            </div>
          </th>
          <th
            width="50%"
            @click="sort_by == 'name' ? (sort_by = null) : (sort_by = 'name')"
          >
            Images with Name
            <i v-if="sort_by == 'name'" class="fa fa-sort"></i>
          </th>
          <th
            width="20%"
            @click="sort_by == 'size' ? (sort_by = null) : (sort_by = 'size')"
          >
            Size
            <i v-if="sort_by == 'size'" class="fa fa-sort"></i>
          </th>
          <th width="30%" @click="sort_by = null">
            Created At
            <!-- <i v-if="!sort_by" class="fa fa-sort"></i> -->
          </th>
        </tr>
      </thead>
    </table>

    <div style="height: 30rem; overflow: auto" class="has-slimscroll">
      <table
        v-if="images && images.length"
        class="images-list__table images-list__table--body is-fullwidth table"
        style="border-top: 2px solid #ddd"
      >
        <tbody>
          <tr v-for="(image, i) of images" :key="i">
            <td width="10%">
              <div class="field">
                <input
                  :disabled="start_processing_state"
                  class="sleek-checkbox"
                  type="checkbox"
                  v-model="selected_images"
                  :value="image.key"
                />
              </div>
            </td>
            <td width="50%">
              <span class="is-flex is-vcenter">
                <!-- <img :src="raw_images[image.filename]" width="50px" height="40px" style="border-radius:5px" /> -->
                <a
                  @click="scroll_to_image(image.filename)"
                  class="ml-10 has-text-dark is-semiBold-16-600-19"
                  >{{ image.filename }}</a
                >
              </span>
            </td>
            <td width="20%" class="no-whitespace-wrap is-medium-16-500-19">
              {{ $prettysize(image.misc.size) }}
            </td>
            <td
              width="30%"
              class="no-whitespace-wrap is-medium-16-500-19"
              :class="{ 'sh-text-normal-14 has-text-grey': !image.exif }"
            >
              {{
                image.exif && image.exif.GPSDateStamp
                  ? get_date_time_string(
                      image.exif.GPSDateStamp,
                      image.exif.GPSTimeStamp
                    )
                  : "*Not found"
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import togeojson from "@mapbox/togeojson";

export default {
  props: ["raw_images", "report_details", "images_report", "process"],
  data: function () {
    return {
      sort_by: null,
      processing_preview_popup: false,
      clicked: null,
      is_select_all: false,
      file: null,
      file_data: null,
    };
  },
  created() {
    // this.selected_images = [] || Object.keys(this.raw_images);

    this.is_select_all = true;

    // this.$parent.$on("select_image", (selected_from_map) => {
    //   this.selected_images = selected_from_map.map((f) => {
    //     return f;
    //   });
    //   if (this.raw_images && Object.keys(this.raw_images).length === this.selected_images.length) this.is_select_all = true;
    //   else this.is_select_all = false;
    // });
  },

  computed: {
    selected_images: {
      get() {
        return this.$store.state.processing.selected_images;
      },
      set(val) {
        this.$store.commit("processing/SET_SELECTED_IMAGES", val);
      },
    },

    images() {
      if (this.report_details) {
        Object.keys(this.report_details.datas).map((key) => {
          this.report_details.datas[key].key = key;
        });

        return Object.values(this.report_details.datas).splice(0, 20);

        let sorted_results = _.sortBy(
          Object.values(this.report_details.datas),
          [
            (o) => {
              if (this.sort_by == "name") return o.filename;
              else if (this.sort_by == "size") return o.misc.size;
              else if (o.exif.GPSDateStamp && o.exif.GPSTimeStamp)
                return new Date(
                  `${o.exif.GPSDateStamp.split(":").join(
                    ","
                  )} ${o.exif.GPSTimeStamp.slice(0, 3).join(":")}`
                ).getTime();
              return true;
            },
          ]
        );
        if (this.file_data) {
          var poly = turf.polygon(
            this.file_data.features[0].geometry.coordinates
          );
          let filtered_results = _.filter(sorted_results, (image) => {
            var pt = turf.point([
              image.exif.GPSLongitude,
              image.exif.GPSLatitude,
            ]);
            return turf.booleanPointInPolygon(pt, poly);
          });
          return filtered_results;
        } else {
          return sorted_results;
        }
      } else return [];
    },
    start_processing_state() {
      if (this.process && this.process == "pending") return false;
      return true;
    },
  },
  methods: {
    select_every_nth_image(n) {
      if (!n || 1 < 0) {
        return;
      }
      let selected = [];
      for (let i = 0; i < this.images.length; i = i + n) {
        selected.push(this.images[i].key);
      }
      this.selected_images = selected;
      this.$emit("onselect_images", this.selected_images);
    },
    readFile() {
      if (!this.file) {
        this.file_data = null;
        return;
      }
      if (
        !this.file.name.includes(".kml") &&
        this.file.name.includes(".json") &&
        this.file.name.includes(".geojson")
      ) {
        this.$toast.show(
          "Choose correct file extention",
          "",
          this.$store.state.izitoast_options.appWarning
        );
        return;
      }
      var name = this.file.name;
      var reader = new FileReader();
      reader.onload = (e) => {
        let json;
        if (this.file.name.includes(".kml")) {
          var dom = new DOMParser().parseFromString(reader.result, "text/xml");
          json = togeojson.kml(dom);
        } else {
          json = JSON.parse(reader.result);
        }
        this.file_data = json;
      };
      reader.readAsText(this.file, "UTF-8");
    },
    scroll_to_image(id) {
      this.clicked = id;
      location.hash = "#" + id;
      $("html,body").animate(
        { scrollTop: document.getElementById(id).offsetTop },
        "slow"
      );
      setTimeout(() => {
        this.clicked = null;
      }, 2000);
    },
    get_date_time_string(date, time) {
      if (date && time)
        return `${date.split(":").join("-")} ${time.slice(0, 3).join(":")}`;
      return "";
    },
  },
};
</script>
<style lang="scss">
.images-list {
  &__carousel {
    position: relative;
    height: 20rem;
  }

  &__table {
    thead {
      border-bottom: 1px solid #eee;
      border-top-left-radius: 1rem;
      box-shadow: 0px 0px 10px 1px #eee;
      border-top-right-radius: 1rem;

      tr {
        th {
          padding: 2rem;
          font-family: Barlow-Medium;
          font-size: 16px;
          font-weight: 500;
          font-stretch: normal;
          font-style: normal;
          line-height: 1.19;
          letter-spacing: normal;
          text-align: left;
          color: #171e48;
        }
      }
    }

    tbody {
      tr {
        td {
          padding: 2rem;
        }
      }
    }
  }
  .is-success--dark {
    background: rgb(3, 85, 3);
  }
  #my-carousel {
    overflow-x: scroll;
    .thumbnail {
      width: 20rem;
      height: 15rem;
      border-radius: 0.5rem;
    }
  }
  .clicked {
    animation: BLINK 1s infinite;
  }
  .slider-image-caption {
    display: flex;
    justify-content: left;
    font-size: 15px;
    margin-top: 10px;
    text-align: left;
    max-width: max-content;
  }
}

@-webkit-keyframes BLINK {
  0%,
  49% {
    background-color: #a00000;
    opacity: 0.8;
    color: white;
  }
  50%,
  100% {
    color: white;
    opacity: 1;
    background-color: #e50000;
  }
}
</style>
