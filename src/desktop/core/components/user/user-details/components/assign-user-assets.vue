<template>
  <div class="assign-assets" v-if="!isLoading">
    <div class="assign-assets__header">
      <span class="assign-assets__header__title">Assign Assets</span>
      <i @click="hide_modal" class="fa fa-times assign-assets__header__close" aria-hidden="true" />
    </div>
    <div class="assign-assets__content__select">
      <img :src="require('@/assets/icons/form-search-icon.svg')" class="mr-10" />
      <input v-model="assetInput" class="assign-assets__content__select__text" type="text" placeholder="Search Asset Name" />
    </div>
    <div class="assign-assets__content has-slimscroll">
      <div class="assign-assets__content__heading">
        <div class="ml-50 mr-auto">Assets</div>
        <div>Read</div>
        <div>Write</div>
      </div>
      <div class="assign-assets__content__body">
        <div v-for="(asset, i) in filteredAllAssets" :key="i" class="assign-assets__content__body__row">
          <div class="assign-assets__content__body__row__main">
            <div class="image is-24x24 mr-10" v-if="asset.properties && asset.properties.icon">
              <img :src="asset.properties.icon" class="image is-24x24 is-rounded" />
            </div>
            <div
              v-else
              class="assign-assets__content__body__row__main__icon"
              :style="
                `background-color: ${
                  asset.properties && asset.properties.color ? asset.properties.color : hashed_color(asset.name, 'projectManagement')
                }`
              "
            >
              {{ asset.name.charAt(0).toUpperCase() }}
            </div>
            <span class="assign-assets__content__body__row__main__name">{{ asset.name }}</span>
          </div>
          <span
            style="cursor: pointer"
            :class="{
              'sh-access-tag--read':
                selectedAssets[asset.uid] && (selectedAssets[asset.uid].access === 'read' || selectedAssets[asset.uid].access === 'write'),
            }"
            @click="select_asset(asset.uid, 'read')"
            class="sh-access-tag"
          >
            <i class="fa fa-check" aria-hidden="true" />
          </span>
          <span
            style="cursor: pointer"
            @click="select_asset(asset.uid, 'write')"
            class="sh-access-tag"
            :class="{ 'sh-access-tag--write': selectedAssets[asset.uid] && selectedAssets[asset.uid].access === 'write' }"
          >
            <i class="fa fa-check" aria-hidden="true" />
          </span>
        </div>
      </div>
      <!-- <div class="assign-assets__content__footer">
        <div @click="add_assets" class="assign-assets__content__footer__button">Assign Assets</div>
      </div> -->
    </div>
    <div class="add-item__footer">
      <div v-if="is_saving" class="add-item__footer__button button is-pulled-right">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div v-else @click="add_assets" class="add-item__footer__button button has-text-white  is-pulled-right is-medium-16-500-19">Save</div>
      <div @click="$emit('close')" class="add-item__footer__button__cancel button is-pulled-right is-medium-16-500-19 mr-10">Cancel</div>
    </div>
  </div>
  <modal-skeleton v-else />
</template>

<script>
  import { assetService, userService } from "@/desktop/shared/services/";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

  export default {
    mixins: [HashColor],
    data() {
      return {
        assetInput: "",
        allAssets: null,
        selectedAssets: {},
        isLoading: false,
        isSaving: false,
      };
    },

    computed: {
      filteredAllAssets() {
        if (this.allAssets) return this.allAssets.filter((f) => f.name.toLowerCase().startsWith(this.assetInput.toLowerCase()));
      },
    },

    created() {
      this.get_assets();
    },

    methods: {
      hide_modal() {
        this.$emit("close");
      },
      async get_assets() {
        this.isLoading = true;
        let result = await assetService
          .getAll({ query: `exclude_user=${this.$route.params.id}&access=write` })
          .catch((err) => this.handleErrors(err));
        this.allAssets = result.results;
        this.isLoading = false;
      },
      select_asset(assetUid, access) {
        if (this.selectedAssets[assetUid])
          if (access === "read") delete this.selectedAssets[assetUid];
          else if (this.selectedAssets[assetUid].access === "read") this.selectedAssets[assetUid].access = "write";
          else this.selectedAssets[assetUid].access = "read";
        else this.selectedAssets[assetUid] = { uid: assetUid, access: access };

        this.selectedAssets = { ...this.selectedAssets };
      },
      async add_assets() {
        this.isSaving = true;
        await userService
          .post({
            id: this.$route.params.id,
            attribute: "assets/assign",
            body: Object.values(this.selectedAssets),
          })
          .then((res) => {
            this.show_success(res.message);
            this.$eventHub.$emit("refresh-asset-list");
            this.isSaving = false;
            this.$emit("close");
          })
          .catch((err) => {
            this.handleErrors(err);
            this.isSaving = false;
            this.$emit("close");
          });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .assign-assets {
    height: 100%;
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.8rem 3rem;
      background-color: $white;
      color: #171e48;
      border-bottom: 2px solid rgb(234, 237, 243);
      &__title {
        font-size: 2rem;
        font-weight: 500;
      }
      &__close {
        font-size: 2rem;
        cursor: pointer;
      }
    }
    &__content {
      background-color: #f4f7fc;
      padding: 0 3rem 3rem 3rem;
      height: 77%;
      overflow: auto;
      position: relative;

      &__select {
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        padding-bottom: 0.5rem;
        padding-top: 2rem;
        margin: auto 3rem;
        position: sticky;
        top: 0;
        background-color: #f4f7fc;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        z-index: 50000;

        &__text {
          width: 100%;
          border: 0;
          color: #171e48;
          font-size: 1.6rem;
          line-height: 4rem;
          background-color: #f4f7fc;
          &:focus {
            outline: none;
          }
          &::placeholder {
            color: rgba(23, 30, 72, 0.4);
          }
        }
      }

      &__heading {
        display: grid;
        grid-template-columns: auto 10% 10%;
        margin-top: 2rem;
        color: #8d95aa;
        font-size: 1.4rem;
        justify-items: center;
      }

      &__body {
        padding: 2rem 0 14rem 0;
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        &__row {
          display: grid;
          grid-template-columns: auto 10% 10%;
          justify-items: center;
          align-items: center;
          padding: 1rem 0;
          &__main {
            display: flex;
            justify-self: flex-start;
            align-items: center;
            &__icon {
              width: 2.4rem;
              height: 2.4rem;
              line-height: 2.4rem;
              border-radius: 50%;
              // background-color: #ffa16c;
              color: $white;
              font-size: 1.2rem;
              font-weight: 600;
              text-align: center;
              margin-right: 1rem;
              user-select: none;
            }
            &__name {
              color: #171e48;
              font-size: 1.6rem;
              font-weight: 500;
            }
          }
        }
      }

      &__footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 2rem;
        &__button {
          color: $white;
          background-color: $primary;
          width: 12.8rem;
          height: 5rem;
          text-align: center;
          line-height: 5rem;
          font-size: 1.4rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
        }
      }
    }
  }
</style>
