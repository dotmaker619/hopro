<template>
  <div class="asset-item is-relative">
    <div class="asset-menu-dropdown is-absolute" style="z-index:10">
      <asset-menu-dropdown
        @disable_asset="$emit('disable_asset', $event)"
        @open_modal="$emit('open_modal', $event)"
        @delete_asset="$emit('delete_asset', $event)"
        @transfer_ownership="$emit('transfer_ownership', $event)"
        @asset_form="$emit('asset_form', $event)"
        :asset="item"
      ></asset-menu-dropdown>
    </div>
    <div class="asset--card is-pointer" @click="$emit('open_modal', item)">
      <div class="asset--card__image">
        <img :src="item.properties.cover_image || require('@/assets/icons/png/asset-placeholder.png')" alt="cover_image" />
      </div>
      <div class="asset--card__icon">
        <div
          class="asset--card__icon--avatar is-semiBold-18-600-22 is-uppercase"
          :style="`background-color: ${hashed_color(item.name, 'projectManagement')}`"
        >
          {{ item.name.charAt(0) }}
        </div>
      </div>
      <div class="is-medium-16-500-19 has-primary-text is-center is-flex mt-20" v-tooltip="{ content: item.name , html: false}">
        <span>{{ item.name | truncate(22) }}</span>
      </div>
      <div class="is-flex align-center is-center my-10">
        <span class="asset--card__subtext is-medium-12-500-14">{{ item.asset_type ? item.asset_type : "*Type not found" }}</span>
      </div>
      <div class>
        <assigned-tags
          v-if="item.tags && item.tags.length"
          class="is-flex is-center"
          :tags="item.tags"
          :write_access="false"
          :number_of_tags_to_display="2"
        />
        <div v-else class="is-flex align-center is-center no-tags-text">
          <sh-icon :name="'tags'" class="is-20x20 mr-5 has-opacity-6"></sh-icon>
          <span class="is-regular-14-00-17 has-opacity-6">*No tags assigned</span>
        </div>
      </div>
      <div class="is-flex is-center mt-10 is-vcenter">
        <span class="has-text-light-grey is-regular-12-00-14 mr-3">Entity:</span>
        <span class="is-medium-14-500-17 has-primary-text" v-tooltip="{ content: item.entity.name , html: false}">{{
          item.entity && item.entity.name ? item.entity.name : "" | truncate(24)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import InfoBlock from "@/desktop/shared/components/info-block";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  import shDropdown from "../sh-dropdown";
  import AssetMenuDropdown from "./asset-menu-dropdown";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    mixins: [HashColor],
    components: {
      shDropdown,
      AssignedTags,
      InfoBlock,
      AssetMenuDropdown,
    },
    props: ["item"],
    data() {
      return {
        is_hover: false,
      };
    },
  };
</script>

<style lang="scss" scoped>
.no-tags-text {
  min-height: 2.4rem;
}
  .asset-item {
    padding: 1rem;
    .asset--card {
      background-color: $white;
      border-radius: 1rem;
      box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
      position: relative;
      padding-bottom: 2.3rem;
      &:hover {
        box-shadow: 0 3px 6px 0 rgba(92, 126, 247, 0.3);
      }

      &__image {
        img {
          height: 160px;
          width: 100%;
          border-radius: 1rem 1rem 0 0;
        }
      }
      &__icon {
        display: flex;
        justify-content: center;
        position: absolute;
        width: 100%;
        bottom: 14rem;
        &--avatar {
          width: 4rem;
          height: 4rem;
          border: 2px solid $white;
          border-radius: 50%;
          color: $white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      &__subtext {
        opacity: 0.7;
        border-radius: 10px;
        border: solid 1px rgba(23, 30, 72, 0.1);
        background-color: var(--white);
        padding: 0.2rem 0.4rem;
        display: inline;
        text-transform: capitalize;
      }
    }

    // .card {
    // box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
    // }
    // .card:hover {
    //     box-shadow: 0 3px 6px 0 rgba(92, 126, 247, 0.3);
    // }
    // .asset {
    //     margin-top: 2rem;
    // }
    // .asset-content {
    //     margin-top: 4rem;
    // }
    // .card-content {
    //     padding: 1.8rem;
    //     margin-bottom: 0;
    //     .card-title {
    //         font-size: 16px;
    //         font-weight: 600;
    //         font-family: Barlow-semibold;
    //         color: #171e48;
    //     }
    //     .card-details {
    //         margin-bottom: 1.5rem;
    //         display: flex;
    //         justify-content: space-between;
    //         align-items: baseline;
    //         &__title {
    //             color: #8d95aa;
    //         }
    //         .column {
    //             padding:0;
    //         }
    //     }
    // }
    // .card-image {
    //     height: 160px;
    //     img{
    //     border-top-left-radius: 10px;
    //     border-top-right-radius: 10px;
    //     height: 160px;
    //     }
    //     .image {
    //         position: relative;
    //     }
    //     .info {
    //         position: absolute;
    //         bottom: -6.5rem;
    //         left: 2rem;
    //     }
    // }
  }

  @media (min-width: 500px) {
    .asset-item {
      width: 50%;
    }
  }
  @media (min-width: 1000px) {
    .asset-item {
      width: 33.33%;
    }
  }

  @media (min-width: 1300px) {
    .asset-item {
      width: 25%;
    }
  }
  @media (min-width: 1600px) {
    .asset-item {
      width: 20%;
      max-width: 277px;
    }
  }
</style>
<style lang="scss">
  .asset-item {
    .asset-menu-dropdown {
      position: absolute;
      top: 9rem;
      right: 1rem;
      .asset-dropdown .sh-dropdown .sh-dropdown-selection {
        visibility: hidden;
      }
    }
    &:hover {
      .asset-menu-dropdown .asset-dropdown .sh-dropdown {
        .sh-dropdown-selection {
          visibility: visible;
        }
      }
    }
  }
</style>
