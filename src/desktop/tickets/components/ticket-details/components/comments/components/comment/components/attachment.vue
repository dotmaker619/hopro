<template>
  <div v-if="comment&&comment.attachments&&comment.attachments.length>0" class="sh-comment-attachments">
    <div :key="attachment.title" v-for="(attachment,i) in comment.attachments">
      <div v-if="attachment.type === 'image'">
        <a :href="attachment.title_link"> {{ attachment.title }} </a>
        <div>{{ attachment.text }}</div>
        <img :src="attachment.thumb_url" />
      </div>
      <div v-else-if="attachment.type === 'video'">
        <a :href="attachment.title_link"> {{ attachment.title }} </a>
        <div>{{ attachment.text }}</div>
        <div style="position:relative;" v-if="!play[i]">
          <img :src="attachment.thumb_url" />
          <i
            @click="$set(play,i,true)"
            class="fa fa-play sh-attachment-video--play"
          ></i>
        </div>
        <iframe
          v-else
          width="400"
          height="225"
          style="height:225px;width:400px;"
          :src="attachment.asset_url"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen=""
        ></iframe>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["ticket", "comment"],
  data() {
    return {
      play: {}
    };
  }
};
</script>

<style lang="scss" scoped>
.sh-attachment-video--play {
  color: #ccc;
  font-size: 30px;
  position: absolute;
  top: 40%;
  left: 160px;
  cursor: pointer;
}
.sh-attachment-video--play:hover {
  color: #eaeaea;
}
</style>
