<template>
  <!-- <b-modal :active="active" :width="400" @close="password=''"> -->
  <div class="card ask-for-password" >
    <div class="card-header">
      <p class="card-header-title">
        <svg viewBox="0 0 100 100" class="image" style="width:20px;height:24px">
          <use xlink:href="@/assets/icons/vault_sprite.svg#lock" />
        </svg>
        Protected Resource
      </p>
      <p class="card-header-icon" @click="$emit('close')">
        <svg viewBox="0 0 100 100" class="image" style="width:17px;height:17px">
          <use xlink:href="@/assets/icons/vault_sprite.svg#remove" />
        </svg>
      </p>
    </div>
    <div class="card-content">
      <!-- select users -->
      <div class="content-header">
        <svg viewBox="0 0 100 100" class="image" style="width:100px;height:100px">
          <use xlink:href="@/assets/icons/vault_sprite.svg#folder-100px-bg" />
        </svg>
        <!-- <p class="content-header-title">{{item.name}}</p> -->
      </div>

      <!-- v-model="form.name" -->
      <input
        v-focus
        @keyup="error=false"
        class="sh-form__content__input"
        type="password"
        v-model="password"
        @keyup.enter="on_submit"
        placeholder="Enter Password"
      />
      <label v-if="error" class="has-text-danger">Enter Password</label>
      <!-- :class="{ 'sh-form__content__input--error' : validationError.name }" -->
      <div class="generate-button">
        <a class="button is-info is-fullwidth is-large" @click="on_submit">Unlock Now</a>
        <!-- :class="{'is-loading':is_loading}" -->
      </div>
    </div>
  </div>
  <!-- </b-modal> -->
</template>

<script>
export default {
  props: ["item", "inputPassword"],
  data() {
    return {
      active: true,
      password: "",
      error: false
    };
  },
  methods: {
    on_submit() {
      if (this.password) {
        this.inputPassword(this.password);
        this.password = "";
        this.$emit("close")
      } else {
        this.error = true;
      }
    }
  }
};
</script>

<style lang="scss">
.ask-for-password {
  .generate-button {
    margin-top: 4rem;
    margin-bottom: 2rem;
  }
  .card-header {
    font-size: 16px;
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
  .content-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    &-title {
      margin-top: 1rem;
      font-family: Barlow;
      font-size: 18px;
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

