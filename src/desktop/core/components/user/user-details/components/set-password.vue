<template>
  <prompt-modal
    class="set-password"
    :name="'set-password'"
    :heading="'Set Password'"
    :iconPath="require('@/assets/icons/prompt/set-password.svg')"
    :footer="passwordsValidated"
    :cancelString="'No'"
    :confirmString="'Confirm'"
    @cancel="passwordsValidated = false; confirm = ''"
    @confirm="set_password"
    @closed="$emit('closed')"
  >
    <div slot="content">
      <div v-if="passwordsValidated" class="prompt-modal__content__text">
        Are you sure you want to confirm
        the set password?
      </div>
      <div v-else>
        <div class="set-password__password">
          <input
            v-model="password"
            class="set-password__password__input"
            :type="passwordType"
            placeholder="Password"
          />
          <img
            v-if="passwordType==='text'"
            @click="changeType('password', passwordType)"
            class="is-pointer"
            src="@/assets/icons/prompt/hide-password.svg"
          />
          <img
            v-else
            @click="changeType('password', passwordType)"
            class="is-pointer"
            src="@/assets/icons/prompt/show-password.svg"
          />
        </div>
        <div class="set-password__password">
          <input
            v-model="confirm"
            class="set-password__password__input"
            :type="confirmType"
            placeholder="Confirm Password"
          />
          <img
            v-if="confirmType==='text'"
            @click="changeType('confirm', confirmType)"
            class="is-pointer"
            src="@/assets/icons/prompt/hide-password.svg"
          />
          <img
            v-else
            @click="changeType('confirm', confirmType)"
            class="is-pointer"
            src="@/assets/icons/prompt/show-password.svg"
          />
        </div>
        <div @click="check_password" class="set-password__button">Set Password</div>
      </div>
    </div>
  </prompt-modal>
</template>

<script>
import PromptModal from "@/desktop/shared/components/prompt-modal";
import { userService } from "@/desktop/shared/services/";

export default {
  components: {
    PromptModal
  },
  data() {
    return {
      password: "",
      confirm: "",
      passwordType: "password",
      confirmType: "password",
      passwordsValidated: false
    };
  },
  methods: {
    changeType(type, value) {
      if (value === "text") this[`${type}Type`] = "password";
      else this[`${type}Type`] = "text";
    },
    check_password() {
      if (this.password === "")
        this.$buefy.toast.open({
          type: "is-warning",
          message: "Password cannot be empty!"
        });
      else if (this.password === this.confirm) this.passwordsValidated = true;
      else
        this.$buefy.toast.open({
          type: "is-warning",
          message: "Passwords do not match!"
        });
    },
    async set_password() {
      let result = await userService
        .put({
          id: this.$route.params.id,
          attribute: "credentials/set_password",
          body: { password: this.password }
        })
        .catch(err => this.handleErrors(err));
      if (result) {
        this.$buefy.toast.open({
          type: "is-success",
          message: "Password update successful."
        });
      }
      this.$emit("closed");
    }
  }
};
</script>

<style lang="scss">
.set-password {
  &__password {
    display: flex;
    align-content: center;
    padding-top: 3rem;
    padding-bottom: 1.3rem;
    border-bottom: 2px solid #f0f2f4;

    &__input {
      border: none;
      font-size: 1.6rem;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: rgba(23, 30, 72, 0.5);
      }
    }
  }

  &__button {
    color: white;
    font-size: 1.6rem;
    font-weight: 600;
    background-color: $primary;
    display: flex;
    justify-content: center;
    border-radius: 6px;
    padding: 1.5rem;
    margin-top: 4rem;
    margin-bottom: 1rem;
    cursor: pointer;
  }
}
</style>