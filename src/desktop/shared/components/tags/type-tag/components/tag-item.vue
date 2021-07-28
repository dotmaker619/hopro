<template>
    <div
    class="sh-type-tag"
    @mouseenter="display_ellipsis = true" 
    @mouseleave="display_ellipsis = false"
    :style="tag_background()"
    >
        <span class="is-pointer" v-if="tag_to_display.name && !tag_rename">
            <span class="is-semiBold-14-600-17 no-whitespace-wrap" :class="{ 'translucent-tag': display_ellipsis}">
                  {{ tag_to_display.name | truncate(truncate_length,"...") }}
            </span>
            <span v-if="display_ellipsis" class="tag-ellipsis">
              <template v-if="tag_in_loading_state">
                  <i class="fa fa-spinner fa-spin mr-10"></i>
              </template>
              <template v-else>
                  <sh-icon :name="'ellipsis'" class="is-16x16 margin-auto" @click.native="dropdown_active = true"></sh-icon>
              </template>
              <div @click="unassign_tag(tag)" class="tag-close" :style="`background-color: ${tag_to_display.color}`">
                  <i class="fa fa-times is-absolute tag-close--icon" aria-hidden="true" />
              </div>
            </span>
        </span>
        <input
        v-focus
        v-else-if="tag_to_display.name"
        v-click-outside="() => {tag_rename = false}"
        v-model="input_tag_name"
        type="text"
        class="input-rename"
        @keyup.enter="rename_tag"
        />
        <!-- This block represents the dropdown that can be used to perform operations on the tag -->
        <div v-if="dropdown_active" v-click-outside="() => {dropdown_active = false}">
        <ul class="edit-tag-dropdown">
            <li
            class="edit-tag-dropdown__row"
            @click="
                tag_rename = true;
                dropdown_active = false;
                input_tag_name = tag_to_display.name;
            "
            >
                <img class="edit-tag-dropdown__row__icon" src="@/assets/icons/type-tag/edit.svg" />
                <span>Rename</span>
            </li>
            <li class="edit-tag-dropdown__row" @click="unassign_tag()">
                <img class="edit-tag-dropdown__row__icon" src="@/assets/icons/type-tag/delete.svg" />
                <span>Delete</span>
            </li>
            <li
            @click="color_dropdown = true"
            class="edit-tag-dropdown__row"
            :class="{ 'edit-tag-dropdown__row--selected': color_dropdown }"
            >
                <div class="edit-tag-dropdown__row__change-color">
                    <img class="edit-tag-dropdown__row__icon" src="@/assets/icons/type-tag/change-color.svg" />
                    <span>Change color</span>
                </div>
                <div v-if="color_dropdown" class="change-color-dropdown">
                    <div v-for="(color, i) in colorPalette.tag" :key="i">
                    <div class="change-color-dropdown__color-div" @click="update_color(color)">
                        <div
                        class="change-color-dropdown__color-div__color"
                        :class="{ 'change-color-dropdown__color-div__color--selected': selected_color === color }"
                        :style="`background-color: ${color}`"
                        >
                        <i v-if="selected_color=== color" class="fa fa-check change-color-dropdown__color-div__color__check" aria-hidden="true"></i>
                        </div>
                    </div>
                    </div>
                </div>
            </li>
        </ul>
        </div>
    </div>
</template>

<script>
import { tagService } from "@/desktop/shared/services/";
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

export default {
    data: () => ({
        display_ellipsis: false,
        tag_rename: false,
        dropdown_active: false,
        color_dropdown: false,
        selected_color: '',
        tag_in_loading_state: false
    }),
    mixins: [ HashColor ],
    props: {
      tag: {
        required: true
      },
      truncate_length: {
        type: Number,
        default: 10
      },
      resourceId: {
        default: null
      },
      assigned_tags: {
        default: []
      },
      service: {
        default: null
      },
      complete: {
        default: null
      }
    },
    methods: {
      hide_dropdown () {
        this.dropdown_active = false;
        this.display_ellipsis = false;
        this.color_dropdown = false;
      },
      tag_background_hex_to_rgba (hex) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
          c = hex.substring(1).split("");
          if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
          }
          c = "0x" + c.join("");
          return "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + ",0.1)";
        }
      },
      tag_background () {
        let backgroundRgba = this.tag_background_hex_to_rgba(this.tag_to_display.color);
        if (this.display_ellipsis) {
          return `background-color: ${backgroundRgba}; color: ${this.tag_to_display.color}`;
        } else {
          return `color: ${this.tag_to_display.color}`;
        }
      },
      async unassign_tag() {
          let listOfAssignedTags = _.cloneDeep(this.assigned_tags);
          listOfAssignedTags.splice(listOfAssignedTags.indexOf(this.tag_to_display.uid), 1);
          if (!this.service) {
              this.tag_in_loading_state = true;
              await this.complete(this.tag_to_display.uid, listOfAssignedTags);
              this.tag_in_loading_state = false;
              return;
          }
          this.tag_in_loading_state = true;
          let result = await this.service
              .patch({
                  group_id: this.$route.params.group_id,
                  id: this.resourceId ? this.resourceId : this.$route.params.id,
                  body: {
                    tags: listOfAssignedTags
                  }
              })
              .then(() => {
                if(this.complete) {
                  this.complete({uid: this.resourceId, tags: listOfAssignedTags});
                }
              })
              .catch((err) => {
                  this.handleErrors(err);
              });
          this.tag_in_loading_state = false;
      },
      async rename_tag() {
          if (this.input_tag_name === "") {
              this.$buefy.toast.open({
                  type: "is-warning",
                  message: "Tag name cannot be empty",
              });
          } else {
                await tagService
                    .update({
                      id: this.tag_to_display.uid,
                      name: this.input_tag_name,
                      color: this.tag_to_display.color,
                    })
                    .then((res) => {
                      this.tag_to_display = res;
                      this.input_tag_name = "";
                    })
                    .catch((err) => this.handleErrors(err));
                this.hide_dropdown();
                this.tag_rename = false;
          }
      },
      async update_color (color) {
          this.selected_color === color ? (this.selected_color = "#202020") : (this.selected_color = color);
          await tagService
          .update({
              id: this.tag_to_display.uid,
              name: this.tag_to_display.name,
              color: this.selected_color,
          })
          .then((res) => (this.tag_to_display = res))
          .catch((err) => this.handleErrors(err));
          this.hide_dropdown();
      } 
    },
    computed: {
        tag_to_display: {
            get () {
                return this.tag;
            },
            set (tag) {
                this.tag_to_display = tag;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
  .tag-ellipsis {
    cursor: pointer;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .translucent-tag {
    opacity: 0.1;
  }

  .tag-close {
    padding: 8px;
    color: #ffffff;
    font-size:10px;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
    height: 16px;
    &--icon {
      transform: translate(-55%, -50%);
    }
  }

  .edit-tag-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
    border: solid 1px rgba(23, 30, 72, 0.15);
    background-color: #ffffff;
    width: 16rem;
    margin-top: 0.5rem;
    color: #171e48;
    border-radius: 10px;

    &__row {
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      font-size: 1.4rem;
      font-weight: 500;
      cursor: pointer;

      &__icon {
        margin-right: 1rem;
      }

      &:hover,
      &--selected {
        background-color: rgba(92, 126, 247, 0.1);
      }

      &__change-color {
        position: relative;
        display: flex;
        align-items: center;
      }
    }
  }

  .change-color-dropdown {
    position: absolute;
    z-index: 1;
    border-radius: 10px;
    box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
    border: solid 1px rgba(23, 30, 72, 0.15);
    background-color: #ffffff;
    top: 100%;
    left: 0;
    margin-top: 0.5rem;
    width: 22rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;

    &__color-div {
      width: 4.2rem;
      height: 4.7rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;

      &:hover {
        background-color: rgba(92, 126, 247, 0.1);
      }

      &__color {
        width: 1.6rem;
        height: 1.6rem;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;

        &--selected {
          width: 3rem;
          height: 3rem;
        }

        &__check {
          color: #ffffff;
        }
      }
    }
  }

  .input-rename {
    width: 9rem;
    height: 3rem;
    border-radius: 4px;
    border: solid 1px rgba(23, 30, 72, 0.2);
    background-color: #ffffff;
    padding: 0.7rem 1.1rem;
    font-size: 1.4rem;
    font-weight: 500;
    color: rgba(23, 30, 72, 0.6);

    &:focus {
      outline: none;
    }
  }
</style>