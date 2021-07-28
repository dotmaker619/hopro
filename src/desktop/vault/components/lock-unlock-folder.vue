<template>
  <div class="card lock-unlock-folder-card" v-if="folder">
    <div class="card-header">
      <p class="card-header-title is-semiBold-16-600-22">
        <svg viewBox="0 0 100 100" class="image" style="width:20px;height:24px">
          <use xlink:href="@/assets/icons/vault_sprite.svg#lock" />
        </svg>
        {{folder.passwordProtected?"Remove Password":"Set Password"}}
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
        <p class="is-semiBold-16-600-22">{{folder.name}}</p>
      </div>

      <input
        v-focus
        class="sh-form__content__input"
        type="password"
        v-model="password"
        @keyup.enter="folder.passwordProtected?unlock(folder):lock(folder)"
        :placeholder="folder.passwordProtected?'Enter Password':'Create Password'"
      />
      <div class="generate-button">
        <a
          class="button is-info is-fullwidth is-large"
          :class="{'is-loading':is_loading}"
          @click="folder.passwordProtected?unlock(folder):lock(folder)"
        >{{folder.passwordProtected?"Remove Password":"Set Password"}}</a>
      </div>
    </div>
  </div>
</template>

<script>
import { folderService } from "@/desktop/shared/services/";
import { mapMutations } from "vuex";
export default {
  props: ["folder"],
  data() {
    return {
      is_loading: false,
      is_error: false,
      password: ""
    };
  },
  beforeDestroy() {},
  created() {},
  methods: {
    ...mapMutations("vault", ["UPDATE_FOLDER_DETAILS"]),
    ...mapMutations(["SET_PASS_KEY"]),
    lock(item) {
      this.UPDATE_FOLDER_DETAILS({
        uid: item.uid,
        passwordProtected: true
      });

      folderService
        .set_password({ id: item.uid, body: { password: this.password } })
        .then(res => {
          delete res.data.owner;
          this.password = "";
          this.$emit("close");
        })
        .catch(err => {
          this.handleErrors(err);
          this.UPDATE_FOLDER_DETAILS({
            uid: item.uid,
            passwordProtected: false,
            rootFolder: item.rootFolder
          });
        });
    },
    unlock(item) {
      this.UPDATE_FOLDER_DETAILS({
        uid: item.uid,
        passwordProtected: false
      });

      folderService
        .remove_password({
          id: item.uid,
          body: { password: null },
          headers: this.get_password_header(this.password)
        })
        .then(res => {
          delete res.data.owner;
          this.password = "";
          this.$emit("close");
        })
        .catch(err => {
          this.handleErrors(err);
          this.UPDATE_FOLDER_DETAILS({
            uid: item.uid,
            passwordProtected: true,
            rootFolder: item.rootFolder
          });
        });
    }
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

