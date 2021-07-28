<template>
  <div class="card lock-unlock-folder-card">
    <div class="card-header">
      <p class="card-header-title is-medium-16-500-22">{{item_type}}</p>
      <p class="card-header-icon" @click="$emit('close')">
        <svg viewBox="0 0 100 100" class="image" style="width:17px;height:17px">
          <use xlink:href="@/assets/icons/vault_sprite.svg#remove" />
        </svg>
      </p>
    </div>
    <div class="card-content">
      <!-- select users -->
      <div class="content-header">
        <p class="content-header-title has-text-centered mb-10">{{item_name}}</p>
        <svg viewBox="0 0 100 100" class="image" style="width:100px;height:100px">
          <use xlink:href="@/assets/icons/vault_sprite.svg#delete-100px" />
        </svg>
        <p class="content-header-title has-text-centered">
          <span
            class="has-text-weight-normal"
          >{{warning_text || "Are you sure you want to delete this item"}}</span>
        </p>
      </div>
      <input
        v-if="ask_password"
        v-focus
        @keyup.enter="onConfirm(password)"
        class="sh-form__content__input mb-20"
        type="password"
        v-model="password"
        placeholder="Enter Password"
      />
    </div>
    <div class="card-footer">
      <a @click="$emit('close')" class="button mr-10 is-large">Cancel</a>
      <a
        class="button is-info is-large"
        :class="{'is-loading':is_loading}"
        @click="onConfirm(password);$emit('close')"
      >Delete</a>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    "item_type",
    "item_name",
    "warning_text",
    "ask_password",
    "onConfirm"
  ],
  data() {
    return {
      password: ""
    };
  }
};
</script>

<style lang="scss">
.lock-unlock-folder-card {
  .generate-button {
    margin-top: 4rem;
    margin-bottom: 2rem;
  }
  .card-header {
    padding: 1rem;
    img {
      border-radius: 4px;
      width: 40px;
      height: 40px;
    }
  }
  .card-content {
    padding: 2rem 6rem;
  }
  .card-footer {
    padding-bottom: 3rem;
    padding: 2rem;
    display: flex;
    justify-content: center;
  }
  .content-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    &-title {
      margin-top: 1rem;
      font-family: Barlow;
      font-size: 18px !important;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.22;
      letter-spacing: normal;
      text-align: left;
      color: #171e48;
    }
  }
}
</style>

