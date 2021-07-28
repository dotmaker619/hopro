<template>
  <div>
    <div :class="{'mobile-background-new': isMobile}" @click="$emit('close')"></div>
    <div class="add-more-tags" :class="{'tags-for-mobile': isMobile}">
      <div :class="`${isMobile? 'mobile-header':'is-hidden'}`">
        <p class="is-semiBold-16-600-00">Tags</p>
        <p @click="$emit('close')">
          <sh-icon :name="'close'" class="is-12x12"></sh-icon>
        </p>
      </div>
      <input @keyup.enter="create_tag" class="add-more-tags__tag-list__input" placeholder="Search/ create tags" v-model="searchQuery" />
      <ul class="add-more-tags__tag-list has-slimscroll" :class="{'mobile-tag-list': isMobile}">
        <li v-if="awaiting_addition_response" class="add-more-tags__tag-list__tag-item">
          <i class="fa fa-spinner fa-spin"></i>
          Adding...
        </li>
        <li v-if="awaiting_creation_response" class="add-more-tags__tag-list__tag-item--notags">
          Creating ...
        </li>
        <div v-if="filteredListOfTags.length">
          <li class="add-more-tags__tag-list__tag-item" v-for="tag in filteredListOfTags" :key="tag.uid">
            <div class="item--text tagname-truncate" :class="{'py-5' : isMobile}" :style="`color: ${tag.color}`" @click="assign_tag(tag)">
              {{ tag.name }}
            </div>
          </li>
        </div>
        <li v-else class="add-more-tags__tag-list__tag-item--notags">
          <span v-if="tagAlreadyAssigned">Tag already assigned</span>
          <p v-else>
            <span v-if="isMobile">No tags found</span>
            <span v-else>Press enter to create tag</span>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import { tagService } from "@/desktop/shared/services/";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

  export default {
    data() {
      return {
        searchQuery: "",
        awaiting_creation_response: false,
        awaiting_addition_response: false,
      };
    },

    mixins: [HashColor],
    props: ["tags", "service", "complete", "resourceId"],
    computed: {
      ...mapState(["TAGS"]),
      filteredListOfTags() {
        if (this.searchQuery && this.searchQuery.length) {
          return this.list_of_unassigned_tags.filter((tag) => tag.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
        }
        return this.list_of_unassigned_tags;
      },
      list_of_assigned_tags() {
        return this.tags ? this.tags.map((tagId) => this.TAGS[tagId]) : [];
      },
      tagAlreadyAssigned() {
        return this.list_of_assigned_tags.filter((tag) => tag.name.toLowerCase() === this.searchQuery.toLowerCase()).length;
      },
      list_of_unassigned_tags() {
        const full_list_of_tags = this.TAGS ? Object.values(this.TAGS) : [];
        return this.tags && this.tags.length ? full_list_of_tags.filter((tag) => !this.tags.includes(tag.uid)) : full_list_of_tags;
      },
    },
    methods: {
      async create_tag() {
        if (!this.searchQuery || !this.searchQuery.length || this.tagAlreadyAssigned || this.isMobile) {
          return;
        }
        this.awaiting_creation_response = true;

        let res = await tagService.create({
          color: this.colorPalette.tag[_.random(0, this.colorPalette.tag.length - 1)],
          name: this.searchQuery,
        });

        if (res) {
          this.assign_tag(this.TAGS[res]);
          this.searchQuery = "";
        }
        this.awaiting_creation_response = false;
      },
      async assign_tag(tag) {
        const list_of_assigned_tags = [...this.tags, tag.uid];
        if (!this.service) {
          this.awaiting_addition_response = true;
          await this.complete(tag.uid, list_of_assigned_tags);
          this.awaiting_addition_response = false;
          return;
        }
        this.awaiting_addition_response = true;
        let result = await this.service
          .patch({
            group_id: this.$route.params.group_id,
            id: this.resourceId ? this.resourceId : this.$route.params.id,
            body: { tags: list_of_assigned_tags },
          })
          .then(() => {
            if (this.complete) {
              this.complete({ uid: this.resourceId, tags: list_of_assigned_tags });
            }
          })
          .catch((err) => this.handleErrors(err));
        this.awaiting_addition_response = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .add-more-tags {
    z-index: 10;
    position: absolute;
    top: 100%;
    left: 0;
    box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
    border: solid 1px rgba(23, 30, 72, 0.15);
    background-color: #ffffff;
    border-radius: 10px;
    font-size: 1.4rem;
    font-weight: 500;
    margin-top: 0.5rem;
    width: 100%;
    min-width: 20rem;
    &__tag-list {
      max-height: 13rem;
      overflow: auto;
      &.mobile-tag-list{
        min-height: 40vh;
        max-height: 40vh;
      }

      &__input {
        width: 100%;
        padding: 1.4rem 1.3rem;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        border: none;
        border-bottom: 1px solid #e7e8ec;

        &:focus {
          outline: none;
        }

        &::placeholder {
          color: rgba(23, 30, 72, 0.5);
        }
      }

      &__tag-item {
        padding: 1rem 1.3rem;
        cursor: pointer;
        color: #171e48;

        &:hover {
          background-color: rgba(92, 126, 247, 0.1);
        }

        &--notags {
          padding: 1rem 1.3rem;
          color: rgba(23, 30, 72, 0.5);
        }
      }
    }
    // @include for-size("tablet") {
    //   position: fixed;
    //   bottom: 0;
    //   left: 0;
    //   width: 100%;
    //   z-index: 1000;
    //   top: auto;
    // }
    &.tags-for-mobile {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
      top: auto;
    }
    .mobile-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #aaa;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      padding: 1.5rem 1.2rem;
    }
  }
</style>
