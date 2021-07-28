<template>
  <div class="details-card">
    <header class="details-card__header is-flex is-vcenter">
      <slot name="header"></slot>
    </header>
    <div>
      <slot name="main"></slot>
    </div>
    <footer class="details-card__footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
<script>
// import shDropdown from "@/desktop/shared/components/shDropdown";
export default {
  components: {
    // shDropdown
  }
};
</script>
<style lang="scss" >
.details-card {
  justify-content: space-between;
  display: flex;
  flex-direction: column;
  padding: 2.5rem;
  min-width: 26rem;
  // max-width: 26rem;
  font-size: 1.6rem;
  //   height: 100vh;
  border-radius: 10px;
  box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
  background-color: #fff;
  &__header,
  &__footer {
    display: flex;
    justify-content: space-between;
    .info-block {
      align-items: flex-start !important;
      .name {
        white-space: normal;
        word-break: keep-all;
      }
    }
  }

  &__header {
    margin-bottom: 3rem;
  }
  &__content {
    font-size: 1.4rem;
    min-height: max-content;
    margin-bottom: 3rem;

    &-heading {
      font-family: Barlow-Regular;
      line-height: 1.21;
      font-style: normal;
      line-height: 1.21;
      font-size: 1.4rem;
      padding-bottom: 10px;
    }
    &-description {
      font-family: Barlow-Regular;
      font-size: 14px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: left;
      color: #8d95aa;
      cursor: pointer;
      &--icon {
        visibility: hidden;
        cursor: pointer;
        margin-left: 5px;
      }
    }
    &:hover {
      .details-card__content-description--icon {
        visibility: visible;
      }
    }

    &__plus {
      display: inline-flex;
      justify-content: center;
      margin: 0 1rem;
      color: #6e748f;
      font-size: 2rem;
      width: 2.2rem;
      height: 2.2rem;
      border-radius: 50%;
      border: 1px dashed #6e748f;
      line-height: 1.7rem;
      cursor: pointer;
    }
  }
}
</style>