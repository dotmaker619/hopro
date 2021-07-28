<template>
  <div class="terra-card">
    <div class="terra-card__header is-medium-18-500-22 is-flex align-center">
      <p class>Raster</p>
    </div>
    <div v-if="is_group_loading">
      <terra-group-skeleton></terra-group-skeleton>
    </div>
    <div v-else>
      <div class="terra-card__body has-slimscroll-xs scrollbox card-height-750" v-if="details">
        <div class="terra-card__body--card scrollbox-content">
          <div
            class="list-card"
            v-for="(group) in sort(details.groups)"
            :key="group.uid"
            :class="{'is-active' :  active_group.uid == group.uid }"
          >
            <div
              class="list-card__header"
              :class="{'active_color is-semiBold-16-600-19' : active_group.uid == group.uid}"
              @click="active_group.uid!=group.uid?active_group=group:active_group={}"
            >
              <span class="list-card__header--text">{{group.name}}</span>
              <span
                class="list-card__header--icon is-pointer"
              >
                <i
                  class="fas"
                  :class="[active_group.uid == group.uid ? 'fa-chevron-up active_color' : 'fa-chevron-down ']"
                ></i>
              </span>
            </div>
            <project
              v-if="active_group.uid == group.uid"
              :group="group"
              :active_project="active_project"
              @select-active-project="active_project=$event"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import project from "./components/project";
import TerraGroupSkeleton from "@/desktop/shared/components/skeleton/terra/group.vue";
export default {
  props: ["details", 'is_group_loading'],
  components: {
    project,
    TerraGroupSkeleton
  },

  data() {
    return {
      active_project: {},
      active_group: {},
    };
  },
  // watch: {
  //   details() {
  //     if (
  //       this.details &&
  //       this.details.groups &&
  //       this.details.groups.length &&
  //       this.details.groups[0].projects &&
  //       this.details.groups[0].projects.length
  //     ) {
  //       this.active_project = this.details.groups[0].projects[0];
  //     }
  //   }
  // },
  created() {
    if (!this.details || !this.details.groups || !this.details.groups.length) {
    }

    if (
      this.details &&
      this.details.groups &&
      this.details.groups.length &&
      this.details.groups[0].projects &&
      this.details.groups[0].projects.length
    ) {
      this.active_project = this.details.groups[0].projects[0];
    }
    if (this.details && this.details.groups && this.details.groups.length) {
      this.active_group = this.details.groups[0];
    }
  },
  methods: {
    sort(data) {
      if (!data) return [];
      return _.sortBy(data, [p => p.name.toLowerCase()]);
    }
  },
};
</script>

<style lang="scss">
.terra-card {
  position: relative;

  &__header {
    height: 4rem;

    font-weight: 600;
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .active_color {
    color: $primary;
  }
  &__body {
    min-height: auto;
    overflow: inherit;

    &--card {
      border-radius: 1rem;
      border: none;
      // min-height: 6rem;
      .list-card {
        background: $white;
        margin-bottom: 1rem;
        border: none;
        border-radius: 1rem;
        box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
        &.is-active {
          box-shadow: 0 3px 6px 0 rgba(92, 126, 247, 0.3);
        }
        &__header {
          display: flex;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #eee;
          line-height: 1.9rem;
          &--text {
            font-family: Barlow-Medium;
            font-size: 1.6rem;
            // padding: 0 1rem;
            line-height: 1.9rem;
          }
        }
        &__body {
          max-height: 30rem;
          overflow: auto;
          &--item {
            margin: 0rem 2rem;
            padding: 1rem 0rem;
            // border-bottom: 1px solid #E7E8EC;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 4rem;

            &-text {
              font-size: 1.7rem;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}
</style>