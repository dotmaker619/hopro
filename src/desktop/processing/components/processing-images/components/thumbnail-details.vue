<template>
  <div class="card ressource-card" style="height: 100%">
    <div class="card-image">
      <figure class="image is-4by3 zoomIn">
        <img :src="image" />
      </figure>
    </div>
    <div class="card-content" v-if="details">
      <div class="columns">
        <div class="column">
          <h2 class="has-text-weight-semibold is-uppercase is-size-7">File Name</h2>
          <span>{{(details.filename || "NA") | truncate(20)}}</span>
        </div>
        <div class="column">
          <h2 class="has-text-weight-semibold is-uppercase is-size-7">File Size</h2>
          <span>{{ details.misc && details.misc.size ? $prettysize(details.misc.size) : "NA"}}</span>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold is-size-7">Date Original</h2>
          <span>{{ details.exif ? details.exif.GPSDateStamp : "NA"}}</span>
        </div>
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold is-size-7">Time Original</h2>
          <span>{{ details.exif && details.exif.GPSTimeStamp && details.exif.GPSTimeStamp.length ? details.exif.GPSTimeStamp.join("-") : "NA"}}</span>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold is-size-7">GPS Latitude</h2>
          <span>{{ details.exif ? details.exif.GPSLatitude : "NA"}}</span>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold is-size-7">GPS Longitude</h2>
          <span>{{details.exif ? details.exif.GPSLongitude : "NA"}}</span>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <h2 class="is-uppercase has-text-weight-semibold is-size-7">Relative Altitude</h2>
          <span>{{details.exif? details.exif.GPSAltitude : "NA"}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["details", "image"],
  created() {}
};
</script>


