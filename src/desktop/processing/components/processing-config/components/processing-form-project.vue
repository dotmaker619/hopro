<template>
  <div class="processing-card">
    <div class="processing-card__header">
      <p class="is-semiBold-16-600-19 mb-20 mt-35">Project Type</p>
    </div>
    <div class="processing-card__body">
      <div class="processing-card__body__content" :class="{ 'is-disabled': process_details.resume }">
        <div>
          <div v-if="access('processing', 'can_process_topo')" class="processing-card__body__content--item">
            <input type="radio" class="processing-custom-checkbox" id="general" value="general" v-model="process_details.project_type" />
            <!-- @input="$emit('update_type',  {'type' :  $event.target.value})" -->
            <label class="is-medium-14-500-17 has-opacity-7 ml-10" for="general">General Topography</label>
          </div>
          <div
            v-else
            @click="no_access_popup('processing', 'can_process_topo')"
            class="processing-card__body__content--item is-not-allowed disabled-link"
          >
            <input
              type="radio"
              class="processing-custom-checkbox is-not-allowed"
              id="general"
              value="general"
              v-model="process_details.project_type"
            />
            <!-- @input="$emit('update_type',  {'type' :  $event.target.value})" -->
            <label class="is-medium-14-500-17 has-opacity-7 ml-10 is-not-allowed" for="general">General Topography</label>
          </div>
        </div>
        <div>
          <div v-if="access('processing', 'can_process_topo')" class="processing-card__body__content--item">
            <input type="radio" class="processing-custom-checkbox" id="visual" value="visual" v-model="process_details.project_type" />
            <!-- @input="$emit('update_type', {'type' :  $event.target.value})" -->
            <label class="is-medium-14-500-17 has-opacity-7 ml-10" for="visual">Visual</label>
          </div>
          <div
            v-else
            @click="no_access_popup('processing', 'can_process_topo')"
            class="processing-card__body__content--item is-not-allowed disabled-link"
          >
            <input type="radio" class="processing-custom-checkbox is-not-allowed" id="visual" value="visual" v-model="process_details.project_type" />
            <!-- @input="$emit('update_type', {'type' :  $event.target.value})" -->
            <label class="is-medium-14-500-17 has-opacity-7 ml-10 is-not-allowed" for="visual">Visual</label>
          </div>
        </div>
        <div>
          <div v-if="access('processing', 'can_process_thermal')" class="processing-card__body__content--item">
            <input type="radio" class="processing-custom-checkbox" id="thermal" value="thermal" v-model="process_details.project_type" />
            <label class="is-medium-14-500-17 has-opacity-7 ml-10" for="thermal">Thermal</label>
          </div>
          <div
            v-else
            @click="no_access_popup('processing', 'can_process_thermal')"
            class="processing-card__body__content--item is-not-allowed disbaled-link"
          >
            <input
              type="radio"
              class="processing-custom-checkbox is-not-allowed"
              id="thermal"
              value="thermal"
              v-model="process_details.project_type"
            />
            <label class="is-medium-14-500-17 has-opacity-7 ml-10 is-not-allowed" for="thermal">Thermal</label>
          </div>
        </div>
      </div>
      <div class="processing-card__body__content" v-if="process_details.project_type == 'thermal'">
        <div class="processing-card__body__content--item">
          <input type="checkbox" class="processing-custom-checkbox is-small" name="preprocess" id="preprocess" v-model="config.preprocess" />
          <label for="preprocess" class="ml-10 is-medium-14-500-17 has-opacity-7">Preprocess</label>
        </div>
      </div>
      <div class="info-card is-regular-14-500-24 has-text-left has-text-theme-black">
        For projects like surveying forests, rivers, houses, stock-piles, roads, bridges etc..
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    computed: {
      process_details: {
        get() {
          return this.$store.state.processing.process_details;
        },
        set(val) {
          this.$store.commit("processing/SET_PROCESS_DETAILS", val);
        },
      },
      config: {
        get() {
          return this.$store.state.processing.config;
        },
        set(val) {
          this.$store.commit("processing/SET_CONFIG", val);
        },
      },
    },
  };
</script>

<style lang="scss">
  .processing-card {
    background: $white;
    border: 1px solid #ddd;
    box-shadow: 0px 0px 5px 0px #eee;
    border-radius: 1rem;
    width: 70rem;
    margin: 5rem auto;
    padding: 3.5rem;
    text-align: center;
    position: relative;
    &:before {
      position: absolute;
      left: 7rem;
      top: -0.7rem;
      content: "";
      height: 1.5rem;
      width: 1.5rem;
      background: $white;
      border: 1px solid #ddd;
      transform: rotate(45deg);
      border-right-color: transparent;
      border-bottom-color: transparent;
    }
    &__header {
      margin-bottom: 1rem;
    }
    &__body {
      &--element {
        max-width: 40%;
        margin: auto;
        text-align: left;
        margin-bottom: 3rem;
        .selection_input {
          background: white;
          padding: 1.5rem 0.5rem 1rem 0;
          border-bottom: 1px solid rgba(23, 30, 72, 0.2);
          border-top: none;
          border-left: none;
          border-right: none;
          width: 100%;
          font-family: Barlow-Medium;
          font-size: 14px;
          font-weight: 500;
          font-stretch: normal;
          font-style: normal;
          line-height: 1.21;
          letter-spacing: normal;
          text-align: left;
          color: #171e48;
        }

        select option {
          background-color: $white;
          padding: 1rem 2rem;
          line-height: 1.4rem;
          font-size: 1.4rem;
        }
      }
      &__content {
        display: flex;
        justify-content: space-evenly;
        margin-bottom: 4rem;
        &--header {
          display: block;
        }
        &--item {
          display: flex;
          align-items: center;
        }
      }

      .info-card {
        background: $primary-background;
        border-left: 3px solid $primary;
        font-size: 1.4rem;
        font-weight: 500;
        opacity: 0.8;
        padding: 2rem;
        max-width: 70%;
        margin: 3rem auto;
      }
    }

    .info-content {
      display: none;
      background-color: hsl(0, 0%, 29%);
      color: white;
      padding: 1rem 1rem 1rem 2.5rem;
      font-size: 1.4rem;
      text-transform: lowercase;
      font-weight: 400;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      clip-path: polygon(5% 0, 100% 0%, 100% 100%, 2% 99%, 2% 10%, 0 0, 0 0);
      z-index: 100;
      word-spacing: 1px;
      line-height: 2rem;
      border-radius: 3px;
      position: absolute;
      width: 35rem;
      &::first-letter {
        text-transform: capitalize;
      }
      ul {
        flex-direction: column;
      }
      li {
        margin-left: 5px;
        list-style-type: disc;
        &::first-letter {
          text-transform: capitalize;
        }
        strong {
          color: white;
        }
      }
    }

    i:hover {
      .info-content {
        display: inherit;
      }
    }
  }

  .processing-custom-checkbox {
    position: relative;
    height: 1.5rem;
    width: 1.5rem;
    visibility: hidden;
    margin-right: 0.5rem;
    vertical-align: middle;
    cursor: pointer;
    z-index: 5;

    &::before {
      content: "";
      position: absolute;
      visibility: visible;
      border-radius: 4px;
      width: 1.5rem;
      height: 1.5rem;
      z-index: 2;
      background-color: $white;
      // border-radius: 1.5rem;
      border: 1px solid $light-grey-text;
      border-radius: 1.5rem;
    }

    &:hover::before {
      background-color: $white;
    }

    &::after {
      border-width: 0px 0px 0px 0px;
      visibility: visible;
    }

    &:checked::before {
      background-color: $white;
      border: 1px solid $primary;
      // border-radius: 1.5rem;
      overflow: hidden;
      visibility: visible;

      backface-visibility: none;
    }

    &:checked::after {
      position: absolute;
      content: "";
      z-index: 3;
      visibility: visible;
      left: 4px;
      top: 4px;
      border: solid $primary;
      border-width: 4px;
      border-radius: 5px;
    }
  }
</style>
