<template>
  <div>
    <article class="media is-flex align-center">
      <figure>
        <p class="mr-10" v-if="info.image">
          <img v-tooltip="{ content: info.name , html: false}" class="tiny-user-avatar is-30x30" :src="info.image" />
        </p>
        <p class="is-30x30 mr-10" v-else-if="info.properties">
          <img v-tooltip="{ content: info.name, html: false }" v-if="info.properties.icon" class="tiny-user-avatar is-30x30" :src="info.properties.icon" />
          <span
            v-else
            class="tiny-user-avatar is-medium-14-500-17 is-30x30"
            :style="
              `background-color: ${
                info.properties.color ? info.properties.color : hashed_color(info.name, info.type ? info.type : 'projectManagement')
              }`
            "
            >{{ info.name.charAt(0) }}</span
          >
        </p>
        <span
          v-else
          class="tiny-user-avatar is-medium-14-500-17 is-30x30 mr-10"
          :style="`background-color: ${hashed_color(info.name, info.type ? info.type : 'projectManagement')}`"
          >{{ info.name.charAt(0) }}</span
        >
      </figure>
      <div class="media-content">
        <div class="content">
          <p>
            <span class="is-block" :class="[info.name_class ? info.name_class : '']">{{ info.name | truncate(truncate_value || 15) }}</span>
            <span :class="[info.subtext_class ? info.subtext_class : '']">{{ info.subtext }}</span>
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    mixins: [HashColor],
    props: ["info", "truncate_value", "type"],
  };
</script>

<style lang="scss" scoped></style>
