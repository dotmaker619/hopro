<template>
    <div class="sh-type-tag--group is-relative column is-paddingless">
        <div v-for="(tag, index) in tags_to_display" v-tooltip="`${tag.name}`" :key="tag.uid" class="margin-y-auto is-inline-block">
          <tag-item :truncate_length="truncate_length" :class="[[!write_access ? 'has-no-access' : null], [index !== tags_to_display.length - 1 ? 'tag-outline': '']]" :complete="complete" :assigned_tags="tags" :tag="tag" :resourceId="resourceId" :service="service"/>
        </div>
        <!-- Displaying tags that were hidden with the help of a tooltip-->
        <div
          v-tooltip="`${hidden_tags}`"
          class="more-count is-pointer is-semiBold-12-600-14"
          v-if="number_of_hidden_tags && tags_to_display.length"
        >
          +{{ number_of_hidden_tags }}
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import tagItem from './tag-item'

export default {
    components: {
      tagItem
    },
    props: {
      tags: {
        default: []
      },
      write_access: {
        type: Boolean,
        default: true
      },
      truncate_length: {
        type: Number,
        default: 10
      },
      service: {
        default: null
      },
      resourceId: {
        default: null
      },
      number_of_tags_to_display: {
        type: Number,
        default: 4
      },
      complete: {
        default: null
      }
    },
    computed: {
      ...mapState(['TAGS']),
      tags_to_display () {
        if (this.number_of_tags_to_display && this.list_of_assigned_tags.length > this.number_of_tags_to_display) {
            return this.list_of_assigned_tags.slice(0, this.number_of_tags_to_display);
        }
        return this.list_of_assigned_tags;
      },
      hidden_tags () {
        let tooltip_string = '';
        for (let tag_index = this.number_of_tags_to_display; tag_index < this.list_of_assigned_tags.length; tag_index++) {
          tooltip_string = `${tooltip_string}${tag_index !== this.number_of_tags_to_display ? ',' : ''} ${this.list_of_assigned_tags[tag_index].name}`;
        }
        return tooltip_string;
      },
      number_of_hidden_tags () {
        return this.tags && this.tags.length ? this.tags.length - this.tags_to_display.length : 0;
      },
      list_of_assigned_tags () {
        if (this.tags && this.TAGS) {
          const list_of_assigned_tags = [];
          this.tags.forEach(tag_uid => {
            if (this.TAGS[tag_uid]) {
              list_of_assigned_tags.push(this.TAGS[tag_uid]);
            }
          });
          return list_of_assigned_tags;
        }
        return [];
      }
    }
}
</script>

<style lang="scss" scoped>
  .more-count {
    height: 2.4rem;
    width: 2.4rem;
    background: #e7eaf4;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 7px;
    @include for-size(portrait-tablets) {
      background: transparent;
      color: #747891;
    }
  }
  .is-visible {
    visibility: visible!important;
  }
  .tag-outline {
    border-right: 1px solid #eee;
    border-radius: 0;
    padding-right: 5px;
  }
</style>