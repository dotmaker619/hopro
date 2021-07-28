<template>
  <div :class="{ 'mt-10': !noTopMargin }">
    <div
      class="sh-primary-tag--group is-flex align-center"
      v-if="tags && tags.length"
      :style="[no_wrap ? { 'flex-wrap': 'nowrap' } : { 'flex-wrap': 'wrap' }]"
    >
      <div v-for="tag in tags.slice(0, tagsToShowCount)" :key="tag.uid">
        <div
          @click="no_access ? $emit('clicked_tag') : $router.push({ name: type + '-details', params: { id: tag.uid } })"
          v-if="tag"
          class="sh-primary-tag"
        >
          <img v-if="!hideIcon" :src="require(`@/assets/icons/primary-tag/${type}.svg`)" class="image is-16x16 mr-10" />
          <p
            class="truncate is-medium-14-500-17"
            v-tooltip="tag.name && (tag.name.length > truncate_length || tag.name.length > 10) ? tag.name : null"
          >
            {{ tag.name || "Unknown" | truncate(truncate_length || 10) }}
            <span v-if="canDelete" class="sh-primary-tag--close" @click.stop="$emit('onDelete', tag.uid)">
              <img src="@/assets/icons/delete-group.svg" alt="" srcset="" />
            </span>
          </p>
        </div>
      </div>
      <div class="sh-primary-tag sh-primary-tag--round" v-if="toShowCount && tags.length > tagsToShowCount">
        <p>+{{ tags.length - tagsToShowCount }}</p>
      </div>
    </div>
    <div v-else>
      <not-assigned :type="type" />
    </div>
  </div>
</template>

<script>
  import NotAssigned from "@/desktop/shared/components/not-assigned";

  export default {
    components: {
      NotAssigned,
    },
    props: ["type", "canDelete", "toShowCount", "tags", "hideIcon", "no_wrap", "truncate_length", "noTopMargin", "no_access"],

    computed: {
      src() {
        return require(`@/assets/icons/sprite.svg`);
      },
      tagsToShowCount() {
        if (this.toShowCount) {
          return this.toShowCount >= this.tags.length ? this.tags.length : this.toShowCount;
        } else {
          return this.tags.length;
        }
      },
      routeTo() {
        return this.type;
      },
    },
  };
</script>
<style lang="scss">
  .sh-primary-tag {
    font-family: Barlow-Medium;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.21;
    letter-spacing: normal;
    text-align: left;
    color: #171e48;
    border-radius: 14px;
    height: 28px;
    &--close {
      display: inline-flex;
      margin-left: 0.5rem;
      img {
        height: 12px;
        width: 12px;
      }
      :hover {
        cursor: pointer;
        color: $red;
      }
    }
    &--round {
      padding: 0 1rem;
      :hover {
        cursor: pointer;
      }
    }
  }
</style>
