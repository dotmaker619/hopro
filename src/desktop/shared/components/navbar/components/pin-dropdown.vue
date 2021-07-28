<template>
  <div class="pin-container pb-20" @click.stop="">
      <div class="pin-container__header is-flex align-center">
        <h1
          class="pin-container__header__text"
        >Pinned</h1>
        <i @click="$emit('close_pin_dropdown')"
          class="fa fa-times has-text-grey"
          aria-hidden="true"
        ></i>
      </div>
      
      <div class="pin-list has-slim-scroll" v-if="PINNED_TABS && PINNED_TABS.length>0">
        <div v-for="(pin,index) in PINNED_TABS" :key="pin.path" >
          <pin :pin="pin"></pin>
          <hr style="margin: 0;" v-if="index<PINNED_TABS.length-1">
        </div>
      </div>

      <div class="no-pins mb-20 mx-20" v-else>
        <img src="@/assets/illustrations/no-pin-illustration.svg" alt />
        <h1 class="no-pins__text is-medium-20-500-24 mt-10">No pages pinned</h1>
        <p class="no-pins__description is-regular-14-00-22">Access pages directly with a single click by using pins. Go to a page and click on the 📌 (top-right) to access instantly.</p>
      </div>
  </div>
</template>

<script>
import Pin from './pin.component'
import { mapState } from "vuex";
export default {
    computed: {
      ...mapState(["PINNED_TABS"]),
    },
    components: {
      Pin
    }
}
</script>

<style lang="scss">
.pin-container {
  position: absolute;
  right: -10rem;
  top: 4rem;
  border-radius: 1rem;
  width: 370px;
  box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
  border: solid 1px rgba(23, 30, 72, 0.15);
  background-color: #ffffff;

  &__header {
    justify-content: space-between;
    padding: 2rem;
    &__text {
      font-family: Barlow-SemiBold;
      font-size: 1.8rem;
      font-weight: 600;
      color: $primary;
    }
  }
  .pin-list {
    height: 270px;
    overflow: auto;
    &__item {
      &:hover {
        background: #f4f7fc;
      }
      padding: 0.5rem 1.8rem;
      justify-content: space-between;
      &--text {
        margin: 0.3rem 0;
          .is-36x36 {
            height: 36px;
            width: 36px;
          }
          .input {
            &.is-inline-input {
              max-width: 20rem;
              border: none;
              box-shadow: none;
              padding: 0;
              height: 1.8rem;
              background-color: transparent;
            }
            :focus,
            :active {
              border: none;
              outline: transparent auto 0px !important;
            }
          }
      }
    }
  }
  .no-pins {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &__text {
      opacity: 0.8;
      text-align: center;
      color: #171e48;
    }
    &__description {
      opacity: 0.8;
      text-align: center;
      padding: 1rem;
    }
  }
}
</style>