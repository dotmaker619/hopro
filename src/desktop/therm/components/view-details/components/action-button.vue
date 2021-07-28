<template>
  <div class="action-buttons">
    <!-- v-if="access('therm', 'can_download_report')" -->
    <button class="download-btn px-2 is-flex align-center" @click="download_csv">
      <sh-icon :name="'download-white'" :file="'helper_sprite'" class="is-18x18 mr-10"></sh-icon>
      <span class="is-semiBold-14-600-17">Download CSV</span>
    </button>
    <!-- <button
      v-else
      @click="no_access_popup('therm', 'can_download_report')"
      class="download-btn px-2 is-flex align-center disabled-link is-not-allowed"
    >
      <svg viewBox="0 0 100 100" class="image is-18x18 mr-10">
        <use xlink:href="@/assets/icons/helper_sprite.svg#download-white" />
      </svg>
      <span class="is-semiBold-14-600-17">Download CSV</span>
    </button>-->
    <!-- <a class="button sh-button is-size-3" @click="download_csv">
      <svg viewBox="0 0 100 100" class="image is-16x16 mr-10">
        <use xlink:href="@/assets/icons/helper_sprite.svg#download-white" />
      </svg>
      <span class="is-semiBold-14-600-17">Download CSV</span>
    </a>-->
    <!-- target="_blank" -->
    <!-- v-if="access('terra', 'can_view_viewer')" -->
    <router-link
      :to="{name:'therm-viewer',params:{id:details.uid}}"
      class="is-semiBold-14-600-17"
      tag="a"
    >
      <button class="is-flex align-center map-btn">
        <img class="mr-10" src="@/assets/icons/map-icon.svg" alt srcset />
        <div class="is-semiBold-14-600-17">Go to Map</div>
      </button>
    </router-link>
    <!-- <a
      v-else
      @click="no_access_popup('terra', 'can_view_viewer')"
      class="is-semiBold-14-600-17 is-not-allowed disabled-link"
      tag="a"
    >
      <button class="is-flex align-center map-btn">
        <img class="mr-10" src="@/assets/icons/map-icon.svg" alt srcset />
        <div class="is-semiBold-14-600-17">Go to Map</div>
      </button>
    </a>-->
  </div>
</template>

<script>
import { viewService } from "@/desktop/shared/services/";
export default {
  props: ["details"],
  methods: {
    async download_csv() {
      this.is_loading = true;
      let data = await viewService.download_csv({ id: this.details.uid });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${this.details.name.replace(" ", "-")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      this.is_loading = false;
    }
  }
};
</script>

<style lang="scss">
.action-buttons {
  display: flex;
  justify-content: space-between;
}
.download-btn {
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: 1.25rem 2rem;
  text-align: center;
  white-space: nowrap;
  /* // margin-bottom: 1rem; */
  border: none;
  cursor: pointer;
  border-radius: 0.6rem;
  box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  font-weight: 500;
  line-height: 1.21;
  letter-spacing: normal;
  background-color: $primary;
  color: #fff;
}
.is-18x18 {
  height: 18px;
  width: 18px;
}
</style>