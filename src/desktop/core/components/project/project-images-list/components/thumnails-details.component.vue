<template>
  <div class="card ressource-card">
    <div class="card-image">
      <figure class="image is-4by3 zoomIn">
        <img :src="image" @error="($event) => {default_image($event, details.filename)}"/>
      </figure>
    </div>
    <div class="card-content" v-if="details">
      <div class="columns">
        <div class="column">
          <h2 class="has-text-weight-semibold is-uppercase ">File Name</h2>
          <p>{{details.filename || "NA"}}</p>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="has-text-weight-semibold is-uppercase ">File Size (kb)</h2>
          <p>{{details.size || details.misc.size && (details.misc.size/1024).toFixed(2) || "NA"}}</p>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold ">Date Original</h2>
          <p>{{details.GPSDateStamp || details.exif && details.exif.GPSDateStamp || "NA"}}</p>
        </div>
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold ">Time Original</h2>
          <p>{{details.GPSTimeStamp || details.exif && details.exif.GPSTimeStamp && details.exif.GPSTimeStamp.join(":") || "NA"}}</p>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold ">Relative Altitude</h2>
          <p>{{details.GPSAltitude || details.exif && details.exif.GPSAltitude || "NA"}}</p>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold ">GPS Latitude</h2>
          <p>{{details.GPSLatitude || details.exif && details.exif.GPSLatitude || "NA"}}</p>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold ">GPS Longitude</h2>
          <p>{{details.GPSLongitude || details.exif && details.exif.GPSLongitude || "NA"}}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ImageLoadErrorMixin from '../mixins/image-load-error-mixin'

export default {
  props: ["details", "image"],
  mixins: [
    ImageLoadErrorMixin
  ],
  created() {}
};
</script>

