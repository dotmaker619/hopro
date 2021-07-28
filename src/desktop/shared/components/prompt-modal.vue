<template>
  <modal
    :name="name"
    transition="nice-modal-fade"
    classes="demo-modal-class"
    :min-width="100"
    :min-height="100"
    :adaptive="true"
    :scrollable="false"
    :reset="true"
    :width="$route.meta.screen=='mobile'?'320px':isLogoutModal ? '40%' : '30%'"
    height="auto"
    @closed="$emit('closed')"
  >
    <div class="prompt-modal">
      <div class="prompt-modal__header">
        <h1
          class="prompt-modal__header__text"
          :class="{'prompt-modal__header__text--logout' : isLogoutModal}"
        >{{heading}}</h1>
        <i
          @click="$modal.hide(name)"
          class="fa fa-times prompt-modal__header__close"
          aria-hidden="true"
        ></i>
      </div>
      <div class="prompt-modal__icon">
        <img :src="iconPath" />
      </div>
      <div class="prompt-modal__content">
        <slot name="content"></slot>
      </div>
      <div v-if="footer" class="prompt-modal__footer">
        <div
          @click="$emit('cancel')"
          class="prompt-modal__footer__button prompt-modal__footer__button__cancel"
          :class="{'prompt-modal__footer__button prompt-modal__footer__button--logout' : isLogoutModal}"
        >{{cancelString}}</div>
        <div
          @click="$emit('confirm')"
          class="prompt-modal__footer__button prompt-modal__footer__button__confirm"
          :class="{'prompt-modal__footer__button prompt-modal__footer__button--logout' : isLogoutModal}"
        >{{confirmString}}</div>
      </div>
    </div>
  </modal>
</template>

<script>
export default {
  props: [
    "name",
    "heading",
    "iconPath",
    "footer",
    "cancelString",
    "confirmString",
    "isLogoutModal"
  ],
  mounted() {
    this.$modal.show(this.name);
  }
};
</script>

<style lang="scss">
.prompt-modal {
  border-radius: 10px;
  box-shadow: 0 15px 50px 0 rgba(0, 0, 0, 0.3);
  background-color: #fafcff;
  padding: 2rem;

  &__header {
    color: #171e48;
    display: flex;
    justify-content: space-between;

    &__text {
      font-family: Barlow-SemiBold;
      font-size: 1.8rem;
      font-weight: 600;
      text-transform: capitalize;

      &--logout {
        font-size: 2rem;
        margin-left: 2rem;
        margin-top: 0.3rem;
      }
    }

    &__close {
      font-size: 1.8rem;
      cursor: pointer;
    }
  }

  &__icon {
    padding-top: 3rem;
    display: flex;
    justify-content: center;
  }

  &__content {
    display: flex;
    justify-content: center;

    &__input {
      width: 100%;
      border: 0;
      color: #171e48;
      font-size: 1.6rem;
      line-height: 4rem;
      // border-bottom: 1px solid rgba(23, 30, 72, 0.1);
      margin: 2rem;
      background-color: #fafcff;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: rgba(23, 30, 72, 0.4);
      }
    }

    &__text {
      padding: 2rem 6rem 4rem 6rem;
      text-align: center;
      font-size: 1.6rem;
      font-weight: 500;
      line-height: 1.75;
      color: rgba(23, 30, 72, 0.7);

      &--logout {
        font-family: Barlow-Medium;
        font-size: 2rem;
      }
    }
  }

  &__footer {
    padding-top: 3rem;
    padding-bottom: 1rem;
    display: flex;
    justify-content: center;
    border-top: 2px solid #eef1f5;
    font-size: 1.6rem;
    font-weight: 600;

    &__button {
      min-width: 11rem;
      height: 5rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &--logout {
        padding: 0 3rem;
      }

      &__cancel {
        background-color: #ffffff;
        border: solid 1px rgba(23, 30, 72, 0.2);
        margin-right: 1rem;
        color: #5c617e;
      }

      &__confirm {
        background-color: $primary;
        color: #ffffff;
      }
    }
  }
}
</style>