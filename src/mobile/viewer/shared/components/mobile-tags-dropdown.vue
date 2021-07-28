<template>
  <div class="tags-mobile-dropdown">
    <span @click="active = !active" class="is-flex is-vcenter">
      <span>
        <sh-icon :file="'terra_sprite'" :name="'terra-filter-add-tags'" class="is-20x20 mr-5 "></sh-icon>
      </span>
      <span v-if="!filter.length" class=" is-medium-14-500-17 has-opacity-5 has-text-theme-black">Select Tags</span>
      <div v-else class="is-flex align-center" style="flex-wrap: wrap;">
        <span v-for="tag_uid in filter" :key="tag_uid">
          <div class="filtered__tags">
            <div :style="`color: ${tags_options[tag_uid].color}`">{{ tags_options[tag_uid].name | truncate(10) }}</div>
            <span class="mx-5 has-opacity-4 filtered-split">|</span>
          </div>
        </span>
      </div>
    </span>
    <div class="mobile-background-new" v-if="active"></div>
    <div v-click-outside="() => (active = false)" class="tags-mobile-dropdown--list " :class="{ 'is-active': active }" v-if="active">
      <div>
        <div class="filter-card">
          <div class="filter-card__header">
            <span>
              <span class="is-medium-16-500-19 mr-15 is-capitalized">Tags</span>
              <span
                class="is-medium-14-500-17 has-accent-text"
                @click="
                  filter = [];
                  $emit('input', []);
                "
                >Clear All</span
              >
            </span>
            <span @click="active = false">
              <sh-icon :file="'terra_sprite'" :name="'terra-filter-close'" class="is-12x12"></sh-icon>
            </span>
          </div>

          <div class="filter-card__content has-slimscroll-xs">
            <div>
              <div v-for="tag in tags_options" :key="tag.value" class="filter-card__content--item" @click="update_filter(tag.uid)">
                <div class="is-flex align-center">
                  <div class="is-capitalized is-medium-12-500-00" :style="`color: ${tag.color}`">{{ tag.name | truncate(25) }}</div>
                </div>
                <div>
                  <sh-icon v-if="filter.includes(tag.uid)" :name="'ticket-show-tick'" class="is-14x14" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["initial_value", "search_layout"],
    data() {
      return {
        filter: this.initial_value || [],
        active: false,
        tags_options: this.$store.state.TAGS,
      };
    },
    watch: {
      initial_value() {
        this.filter = this.initial_value;
      },
    },
    methods: {
      update_filter(value) {
        if (!this.filter.includes(value)) {
          this.filter.push(value);
        } else {
          let arr = this.filter.indexOf(value);
          this.filter.splice(arr, 1);
        }
        this.$emit("input", this.filter);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .tags-mobile-dropdown {
    position: relative;

    &--list {
      z-index: 10;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
    }
  }
  .filter-card {
    border-radius: 0.5rem;
    background-color: $white;
    margin: 0 auto;
    height: 50vh;
    padding: 0.5rem 0;
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(23, 30, 72, 0.1);
      padding: 0.75rem 1.5rem;
    }
    &__search {
      border-bottom: 1px solid rgba(23, 30, 72, 0.1);
      align-items: center;
      display: flex;
      input {
        width: 100%;
        border: none;
        height: 4rem;
        margin-right: 1rem;
        text-transform: lowercase;
        &:focus {
          outline: none;
        }
        &::placeholder {
          text-transform: capitalize;
          color: rgba(23, 30, 72, 0.4);
        }
        &--error {
          border-color: rgba(255, 87, 34, 0.5);
        }
      }
    }
    &__content {
      max-height: 43vh;
      overflow: auto;
      padding: 0 1.5rem;
      &--item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0;
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        &--icon {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $white;
          border-radius: 50%;
          margin-right: 0.5rem;
          font-size: 1.2rem;
          line-height: 2rem;
        }
        &--img {
          margin-right: 0.5rem;
          img {
            height: 2rem;
            width: 2rem;
          }
        }
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }

  .filtered__card {
    width: 2.4rem;
    height: 2.4rem;
    background-color: #fff;
    box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
    border: solid 1px rgba(23, 30, 72, 0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.5rem;
  }

  .filtered__tags {
    display: flex;
  }
</style>
