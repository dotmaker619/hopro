<template>
  <div class="truncate is-flex is-vcenter" :class="info.is_block">
    <div class="info-block__image" :class="[info.image_class, { 'is-hidden': hideImage }]">
      <div class="info-block__image__container">
        <template v-if="unknown">
          <sh-icon
            v-if="info.name == 'Sensehawk'"
            v-tooltip="{ content: info.name, html: false }"
            :file="'users_sprite'"
            :name="'sensehawk-created-36px'"
            class="info-block__image__container__picture"
            :class="info.image_class"
          ></sh-icon>
          <sh-icon
            v-else
            v-tooltip="{ content: info.name , html: false}"
            :file="'users_sprite'"
            :name="'unknown-user-36px'"
            class="info-block__image__container__picture"
            :class="info.image_class"
          ></sh-icon>
        </template>
        <template v-else>
          <img
            v-tooltip="{ content: info.name , html: false}"
            v-if="info.image"
            class="info-block__image__container__picture"
            :src="info.image"
            :class="[[info.image_class ? info.image_class : 'is-36x36'], info.is_border]"
          />
          <div
            v-else
            v-tooltip="info.name"
            class="info-block__image__container__picture info-block__image__container__picture__icon"
            :class="[[info.image_class ? info.image_class : 'is-36x36'], info.is_border]"
            :style="`background-color: ${info.color ? info.color : hashed_color(info.name, info.type)}`"
          >
            {{ info.name.charAt(0) }}
          </div>
        </template>
      </div>
    </div>
    <div class="info-block__info">
      <div class="info-block__info--type is-regular-14-00-17" :class="info.top_class">{{ info.top }}</div>
      <div class="info-block__info--name-block">
        <span
          :class="[info.name_class ? info.name_class : null]"
          class="name"
          v-tooltip="info.name.length > truncate_value || info.name.length > 18 ? info.name : null"
          >{{ info.name | truncate(truncate_value || 15) }}</span
        >
        <br />
        <span class="sidetext" :class="info.subtext_class">{{ info.sidetext | sinceDays }}</span>
        <span class="subtext" :class="info.subtext_class" v-if="info.subtext">{{ info.subtext }}</span>
      </div>
      <div class="info-block__info--title" :class="info.bottom_class ? info.bottom_class : 'has-text-theme-black'" v-tooltip="info.bottom">
        {{ info.bottom | truncate(18) }}
      </div>
    </div>
  </div>
</template>

<script>
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    mixins: [HashColor],
    props: ["info", "hideImage", "truncate_value", "unknown"],
  };
</script>

<style lang="scss" scoped>
  .info-block {
    display: flex;
    align-items: center;
    max-width: fit-content;
    :hover {
      cursor: pointer;
      .name {
        color: $primary;
      }
    }
    &__image {
      margin-right: 1rem;
      height: 4rem;
      min-width: 4rem;

      &__container {
        display: flex;

        &__picture {
          object-fit: cover;
          // height: 3.6rem;
          // width: 3.6rem;
          border-radius: 50%;

          &__icon {
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ffffff;
            font-weight: 600;
            font-size: 1.6rem;
            line-height: 1.9rem;
            font-weight: 600;
            height: 3.6rem;
            width: 3.6rem;
            font-family: Barlow-SemiBold;
            text-transform: capitalize;
          }
        }
      }
    }

    &__info {
      max-width: fit-content;
      &--type {
        font-family: Barlow;
        font-size: 14px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.21;

        color: #8d95aa;
      }
      &--name-block {
        font-weight: 600;
        font-size: 1.8rem;
        display: contents;

        .name {
          margin-right: 1.5rem;
          font-family: Barlow-Medium;
          font-size: 16px;
          font-weight: 500;
          font-stretch: normal;
          font-style: normal;
          line-height: 19px;
          letter-spacing: normal;
          text-align: left;
          color: #171e48;
        }

        .sidetext {
          font-size: 1.4rem;
          font-weight: 500;
          color: $light-grey-text;
        }
        .subtext {
          border: 1px solid;
          padding: 0 0.5rem;
          border-radius: 1rem;
          font-size: 1.4rem;
          font-weight: 500;

          &--owner {
            color: $primary;
            border-color: $primary;
          }

          &--manager {
            color: #ed7836;
            border-color: #ed7836;
          }

          &--guest {
            color: #f9306d;
            border-color: #f9306d;
          }
        }
      }
    }
  }
  .has-border {
    border: 2px solid white;
  }

  .is-36x36 {
    height: 3.6rem;
    width: 3.6rem;
  }
</style>
