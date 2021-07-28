<template>
  <div class="">
    <div class="is-flex has-space-between align-center attachment-filters">
      <div class="show-filter is-inline-flex">
        <div class="is-medium-14-500-17 has-opacity-7 mr-5">Show:</div>
        <div class="sh-dropdown" v-click-outside="() => (show_active = false)">
          <div v-if="show_active" @click="show_active = !show_active" class="backdrop"></div>
          <div @click.stop="show_active = !show_active" class="is-semiBold-14-600-17 is-pointer mr-40 ml-5">
            <p class="is-flex is-vcenter">
              <span>{{ filter_by.name }}</span>
              <sh-icon :name="'chevron-down'" class="is-10x10 ml-5"></sh-icon>
            </p>
          </div>
          <ul class="sh-dropdown-content" v-if="show_active" >
            <li
              v-for="option in show_select"
              :key="option.name"
              class="sh-dropdown-content__item"
              @click="
                $emit('filter_by', option);
                filter_by = option;
                show_active = false;
              "
            >
              <div class="sh-dropdown-content__item--text is-medium-16-500-19 is-capitalized">{{ option.name }}</div>
            </li>
          </ul>
        </div>
      </div>
      <div class="sort-filter is-inline-flex">
        <div class="is-medium-14-500-17 has-opacity-7 mr-5">Sort by:</div>
        <div class="sh-dropdown" v-click-outside="() => (sortby_active = false)">
          <div v-if="sortby_active" @click="sortby_active = !sortby_active" class="backdrop"></div>
          <div @click.stop="sortby_active = !sortby_active" class="is-semiBold-14-600-17 is-pointer ml-5">
            <p class="is-flex is-vcenter">
              <span>{{ sort_by.name }}</span>
              <sh-icon :name="'chevron-down'" class="is-10x10 ml-5"></sh-icon>
            </p>
          </div>
          <ul class="sh-dropdown-content" v-if="sortby_active" >
            <li
              v-for="option in sortby_select"
              :key="option.name"
              class="sh-dropdown-content__item"
              @click="
                $emit('sort_by', option);
                sort_by = option;
                show_active = false;
              "
            >
              <div class="sh-dropdown-content__item--text is-medium-16-500-19 is-capitalized">{{ option.name }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        filter_by: { name: "All", value: "" },
        sort_by: { name: "Uploaded Time", value: "createdAt" },
        show_active: false,
        show_select: [
          {
            name: "All",
            value: "",
          },
          {
            name: "Favorite",
            value: "favorite",
          },
          {
            name: "Ticket",
            value: "ticket",
          },
          {
            name: "Checklist",
            value: "checklist",
          },
          {
            name: "Comment",
            value: "comment",
          },
        ],
        sortby_active: false,
        sortby_select: [
          {
            name: "Uploaded Time",
            value: "createdAt",
          },
          {
            name: "Name",
            value: "fileName",
          },
          {
            name: "Size",
            value: "fileSize",
          },
        ],
      };
    },
  };
</script>

<style lang="scss">
  .attachment-filters {
    @include for-size(tablet) {
      width: 100%;
    }
    .show-filter {
      .sh-dropdown-content {
        left: -3.5rem;
      }
    }
    .sort-filter {
      .sh-dropdown-content {
        right: 0;
      }
    }
    .sh-dropdown-content {
      top: 2.5rem;
      box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
      border: solid 1px rgba(23, 30, 72, 0.15);
      width: 15rem;
      // @include for-size(smartphones){
      //   position: fixed;
      //   transform: translate(120%,120%)
      // }
    }
  }
  .attachment-filters {
    @include for-size(tablet) {
      .sh-dropdown {
        position: relative;
        .backdrop {
          position: fixed;
          background: #000;
          opacity: 0.6;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 201;
        }
        .sh-dropdown-content {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 0.5rem;
          position: fixed;

          -webkit-box-shadow: 1px 1px 6px 2px #eee;
          box-shadow: 1px 1px 6px 2px #eee;
          z-index: 202;
          box-shadow: none;
          width: 80vw;
          left: 10vw !important;
          right: unset !important;
          top: 30vh;
          font-family: Barlow-Medium;
          li {
            padding: 1.4rem;
            // border-bottom: 1px solid #eee;
          }
        }
      }
    }
  }
</style>
