<template>
  <div v-click-outside="clickOutsideHandler" class="form-dropdown" :class="{ 'form-dropdown--error': validationError }">
    <div class="form-dropdown__select">
      <img :src="require('@/assets/icons/form-search-icon.svg')" class="mr-10" />
      <input
        v-model="userInput"
        class="form-dropdown__select__text"
        type="text"
        :placeholder="selectText"
        @focus="dropdown = true"
        @input="dropdown = true"
        v-on:keyup.enter.stop="enterKeyPressed"
        v-on:keyup.down="nextItem"
        v-on:keyup.up="previousItem"
        :disabled="disabled"
      />
      <span @click="dropdown = !dropdown" class="form-dropdown__select__icon">
        <i v-if="dropdown" class="fas fa-chevron-up" />
        <i v-else class="fas fa-chevron-down" />
      </span>
    </div>
    <div v-if="dropdown" class="form-dropdown__options has-slimscroll">
      <div v-if="filteredOptions.length">
        <div
          v-for="(item, i) in filteredOptions"
          :key="i"
          @click="itemSelected(item)"
          class="form-dropdown__options__item"
          :class="{ 'form-dropdown__options__item--selected': currentItem.uid === item.uid }"
        >
          <div
            v-if="multi"
            class="form-dropdown__options__item__checkbox"
            :class="[multiInput[item.uid] ? 'form-dropdown__options__item__checkbox--selected' : '']"
          >
            <i v-if="multiInput[item.uid]" class="fa fa-check" aria-hidden="true"></i>
          </div>
          <div
            v-if="showIcon"
            class="form-dropdown__options__item__icon"
            :style="
              `background-color: ${item.properties && item.properties.color ? item.properties.color : hashed_color(item.name, 'projectManagement')}`
            "
          >
            {{ item ? item.name[0].toUpperCase() : "" }}
          </div>
          <div :style="`color: ${item.color}`" class="form-dropdown__options__item__text">{{ item.name }}</div>
        </div>
      </div>
      <div v-else-if="isTag" class="form-dropdown__options__item form-dropdown__options__item--new-tag">Press enter to create tag</div>
      <div v-else class="form-dropdown__options__item form-dropdown__options__item--new-tag">*Not found</div>
    </div>
  </div>
</template>

<script>
  import { tagService } from "@/desktop/shared/services/";
  import { mapState } from "vuex";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

  export default {
    mixins: [HashColor],
    props: ["selected", "selectText", "selectOptions", "multi", "removeItem", "closeDropdown", "showIcon", "disabled", "isTag", "validationError"],
    data() {
      return {
        input: {},
        multiInput: {},
        dropdown: false,
        userInput: "",
        filteredOptions: null,
        currentItem: {},
      };
    },
    computed: {
      ...mapState(["TAGS"]),
    },
    created() {
      this.filteredOptions = this.selectOptions;
      this.fill_input_fields();
    },
    watch: {
      selectOptions() {
        this.filteredOptions = this.selectOptions;
      },
      userInput(value) {
        if (value && this.selectOptions)
          this.filteredOptions = this.selectOptions.filter((option) => option.name.toLowerCase().startsWith(value.toLowerCase()));
        //when deleted to empty string
        else this.filteredOptions = this.selectOptions;
      },
      removeItem(value) {
        delete this.multiInput[value];
        this.multiInput = { ...this.multiInput };
        this.$emit("inputChange", Object.values(this.multiInput));
      },
      closeDropdown() {
        this.dropdown = false;
      },
      selected() {
        this.fill_input_fields();
      },
    },
    methods: {
      fill_input_fields() {
        if (this.multi) {
          if (this.selected)
            this.selected.forEach((element) => {
              this.multiInput[element.uid] = element;
            });
          this.multiInput = { ...this.multiInput };
        } else {
          this.input = this.selected;
          this.input = { ...this.input };
          this.userInput = this.input && this.input.name;
        }
      },
      async enterKeyPressed() {
        if (this.multi) {
          if (this.currentItem.uid)
            if (this.multiInput[this.currentItem.uid]) delete this.multiInput[this.currentItem.uid];
            else this.multiInput[this.currentItem.uid] = { ...this.currentItem };
          else if (!this.filteredOptions.length && this.isTag) {
            let newTag = await this.create_tag();
            this.selectOptions.unshift(newTag);
            this.multiInput[newTag.uid] = newTag;
            this.userInput = "";
            this.multiInput = { ...this.multiInput };
          } else
            this.multiInput[this.filteredOptions[0].uid] = {
              ...this.filteredOptions[0],
            };
          this.multiInput = { ...this.multiInput };
          this.$emit("inputChange", Object.values(this.multiInput));
        } else {
          this.input = this.currentItem.uid ? { ...this.currentItem } : { ...this.filteredOptions[0] };
          this.userInput = this.input.name;
          this.$emit("inputChange", this.input);
          this.dropdown = false;
          this.filteredOptions = this.selectOptions;
        }
      },

      async create_tag() {
        let result;
        await tagService
          .create({
            color: this.colorPalette.tag[_.random(0, this.colorPalette.tag.length - 1)],
            name: this.userInput,
          })
          .then((res) => {
            result = this.TAGS[res];
            this.userInput = "";
          })
          .catch((err) => this.handleErrors(err));
        return result;
      },
      itemSelected(item) {
        if (this.multi) {
          if (this.multiInput[item.uid]) {
            delete this.multiInput[item.uid];
            this.multiInput = { ...this.multiInput };
          } else {
            this.multiInput[item.uid] = item;
            this.multiInput = { ...this.multiInput };
          }
          this.$emit("inputChange", Object.values(this.multiInput));
        } else {
          this.input = { ...item };
          this.$emit("inputChange", this.input);
          this.userInput = this.input.name;
          this.dropdown = false;
        }
      },
      clickOutsideHandler() {
        if (!this.multi) this.dropdown = false;
      },
      nextItem() {
        let index = this.filteredOptions.indexOf(this.currentItem);
        if (index > -1 && index < this.filteredOptions.length - 1) {
          this.currentItem = this.filteredOptions[++index];
        } else this.currentItem = this.filteredOptions[0];
      },
      previousItem() {
        let index = this.filteredOptions.indexOf(this.currentItem);
        if (index > 0 && this.filteredOptions.length - 1) this.currentItem = this.filteredOptions[--index];
        else this.currentItem = this.filteredOptions[this.filteredOptions.length - 1];
      },
    },
  };
</script>

<style lang="scss">
  .form-dropdown {
    width: 100%;
    border-bottom: 1px solid;
    border-color: rgba(23, 30, 72, 0.1);
    position: relative;

    &--error {
      border-color: rgba(255, 87, 34, 0.5);
    }

    &__select {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      &__text {
        width: 100%;
        border: 0;
        color: #171e48;
        font-size: 1.6rem;
        line-height: 4rem;
        background-color: #fafcff;
        // text-transform: capitalize;

        &:focus {
          outline: none;
        }
        &::placeholder {
          color: rgba(23, 30, 72, 0.4);
        }
      }

      &__icon {
        color: #5c617e;
        font-size: 1.4rem;
      }
    }

    &__options {
      background-color: #fafcff;
      position: absolute;
      z-index: 11; //max z-index count for user-card is 10
      width: 100%;
      max-height: 16rem;
      overflow-y: auto;
      box-shadow: 0 30px 30px 0 rgba(0, 0, 0, 0.16);
      border: solid 0.5px rgba(23, 30, 72, 0.3);
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      &__item {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;

        padding: 1.5rem 3rem;
        cursor: pointer;
        &:hover,
        &--selected {
          background-color: #eef2ff;
        }
        &--new-tag {
          cursor: default;
          color: rgba(23, 30, 72, 0.5);

          &:hover {
            background-color: #fafcff;
          }
        }

        &__checkbox {
          width: 2rem;
          height: 2rem;
          margin-right: 2rem;
          border-radius: 2px;
          border: solid 1.5px rgba(23, 30, 72, 0.4);
          &--selected {
            color: $primary;
            border-color: $primary;
            border-radius: 4px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            font-size: 1rem;
          }
        }
        &__icon {
          width: 2.25rem;
          height: 2.25rem;
          line-height: 2.25rem;
          font-size: 1.4rem;
          font-weight: 600;
          margin-right: 0.75rem;
          color: $white;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          user-select: none;
        }
        &__text {
          font-size: 1.6rem;
          color: #171e48;
          font-weight: 500;
          // text-transform: capitalize;
        }
      }
    }
  }
</style>
