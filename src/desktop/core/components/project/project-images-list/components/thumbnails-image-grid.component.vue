<template>
  <div class="columns">
    <div class="column is-8" v-if="raw_images">
      <div class="columns is-multiline">
        <div
          v-for="(key, i) in Object.keys(raw_images).slice(0, page_no * per_page)"
          :key="i"
          @click="active_thumbnail = key"
          class="column project-thumbnails-icon is-2"
        >
          <img
            style="width:128px;height:128px"
            :class="{ 'active': active_thumbnail == key }"
            :src="raw_images[key]"
            @error="($event) => {default_image($event, key)}"
          />
        </div>
      </div>
      <div class="column has-text-centered" v-if="page_no * per_page < Object.keys(raw_images).length" @click="page_no++">
        <button class="sh-button">
          <span class="heading is-marginless">
            Load more
            <i class="fas fa-sync-alt ml-5"></i>
          </span>
        </button>
      </div>
    </div>

    <div class="column is-4" v-if="report_details && raw_images">
      <thumbnail-details :image="raw_images[active_thumbnail]" :details="report_details.datas[active_thumbnail]"></thumbnail-details>
    </div>
  </div>
</template>
<script>
  import ThumbnailDetails from "./thumnails-details.component";
  import ImageLoadErrorMixin from '../mixins/image-load-error-mixin'

  export default {
    props: ["report_details", "raw_images"],
    data: function() {
      return {
        active_thumbnail: null,
        page_no: 3,
        per_page: 8,
      };
    },
    mixins: [
      ImageLoadErrorMixin
    ],
    components: {
      ThumbnailDetails,
    },
    created() {
      window.addEventListener("keydown", this.navigateImages);
      if (this.raw_images) this.active_thumbnail = Object.keys(this.raw_images)[0];
    },
    beforeDestroy() {
      window.removeEventListener("keydown", this.navigateImages);
    },
    watch: {
      raw_images: function() {
        if (this.raw_images) this.active_thumbnail = Object.keys(this.raw_images)[0];
      },
    },
    methods: {
      navigateImages(e) {
        // if (e.key === "ArrowLeft")
        //   this.active_thumbnail =
        //     this.active_thumbnail - 1 >= 0
        //       ? this.active_thumbnail - 1
        //       : this.total - 1;
        // else if (e.key === "ArrowUp")
        //   this.active_thumbnail =
        //     this.active_thumbnail - 4 >= 0
        //       ? this.active_thumbnail - 4
        //       : this.total - 1;
        // else if (e.key === "ArrowRight")
        //   this.active_thumbnail =
        //     this.active_thumbnail + 1 < this.total
        //       ? this.active_thumbnail + 1
        //       : 0;
        // else if (e.key === "ArrowDown")
        //   this.active_thumbnail =
        //     this.active_thumbnail + 4 < this.total
        //       ? this.active_thumbnail + 4
        //       : 0;
      },
    },
  };
</script>
<style lang="scss" scoped>
  .active {
    border: 3px solid gray;
  }

  .loading {
    animation: loading 5s infinite normal linear both 0s;
  }

  @keyframes loading {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
