<template>
  <div class="delete-modal">
    <div class="delete-modal__header">
      <h1 class="delete-modal__header__text">{{ report.name }}</h1>
      <i @click="$modal.hide(name)" class="fa fa-times delete-modal__header__close" aria-hidden="true"></i>
    </div>
    <div class="delete-modal__icon">
      <sh-icon :name="'delete-100px'" class="is-96x96" />
    </div>
    <div class="delete-modal__content">
      <div class="delete-modal__content__text">Are you sure you want to delete the {{ type }}?</div>
    </div>
    <div class="delete-modal__footer">
      <div @click="$emit('close')" class="delete-modal__footer__button delete-modal__footer__button__cancel">
        Cancel
      </div>
      <div
        @click="
          complete();
          $emit('close');
        "
        class="delete-modal__footer__button delete-modal__footer__button__confirm"
      >
        Delete
      </div>
    </div>
  </div>
</template>
<script>
  import { reportService } from "@/desktop/shared/services/";

  export default {
    props: ["report", "type", "complete"],
  };
</script>
<style lang="scss" scoped>
  .delete-modal {
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
        font-family: Barlow-Regular;

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
