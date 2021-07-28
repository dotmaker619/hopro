<template>
  <div class="application-dropdown">
    <!-- core -->
    <router-link v-if="access('core')" :to="{ name: 'dashboard' }" class="application-dropdown__item">
      <div class="application-dropdown__item--icon">
        <img class src="@/assets/icons/png/core.png" alt="core" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Core</p>
    </router-link>
    <a v-else @click="no_access_popup('core')" class="application-dropdown__item">
      <div class="application-dropdown__item--icon disable-app">
        <img class src="@/assets/icons/png/core.png" alt="core" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Core</p>
    </a>

    <!-- terra -->
    <router-link v-if="access('terra')" :to="{ name: 'terra-list' }" class="application-dropdown__item">
      <div class="application-dropdown__item--icon">
        <img class src="@/assets/icons/png/terra.png" alt="terra" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Terra</p>
    </router-link>
    <a v-else @click="no_access_popup('terra')" class="application-dropdown__item">
      <div class="application-dropdown__item--icon disable-app">
        <img class src="@/assets/icons/png/terra.png" alt="terra" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Terra</p>
    </a>

    <!-- therm -->
    <router-link v-if="access('therm')" :to="{ name: 'therm-view-list' }" class="application-dropdown__item">
      <div class="application-dropdown__item--icon">
        <img class src="@/assets/icons/png/thermal.png" alt="thermal" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Thermal</p>
    </router-link>
    <a v-else @click="no_access_popup('therm')" class="application-dropdown__item disable-link">
      <div class="application-dropdown__item--icon disable-app">
        <img class src="@/assets/icons/png/thermal.png" alt="thermal" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Thermal</p>
    </a>

    <!-- missions -->
    <router-link v-if="access('missions')" :to="{ name: 'mission-list' }" class="application-dropdown__item">
      <div class="application-dropdown__item--icon">
        <img class src="@/assets/icons/png/missions.png" alt="missions" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Missions</p>
    </router-link>
    <a v-else @click="no_access_popup('missions')" class="application-dropdown__item">
      <div class="application-dropdown__item--icon disable-app">
        <img class src="@/assets/icons/png/missions.png" alt="missions" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Missions</p>
    </a>

    <!-- Processing -->
    <router-link v-if="access('processing')" :to="{ name: 'process-list' }" class="application-dropdown__item">
      <div class="application-dropdown__item--icon">
        <img class src="@/assets/icons/png/processing.png" alt="processing" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Processing</p>
    </router-link>
    <a v-else @click="no_access_popup('processing')" class="application-dropdown__item">
      <div class="application-dropdown__item--icon disable-app">
        <img class src="@/assets/icons/png/processing.png" alt="processing" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Processing</p>
    </a>

    <!-- tickets -->
    <router-link v-if="access('tickets')" :to="{ name: 'tickets', query: null }" @click.native="$store.commit('tickets/SET_SELECTED_ASSET', []);" class="application-dropdown__item">
      <div class="application-dropdown__item--icon">
        <img class src="@/assets/icons/png/tickets.png" alt="tickets" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Tickets</p>
    </router-link>
    <a v-else @click="no_access_popup('tickets')" class="application-dropdown__item">
      <div class="application-dropdown__item--icon disable-app">
        <img class src="@/assets/icons/png/tickets.png" alt="tickets" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Tickets</p>
    </a>

    <!-- vault -->
    <router-link v-if="access('vault')" :to="{ name: 'vault' }" class="application-dropdown__item">
      <div class="application-dropdown__item--icon">
        <img class src="@/assets/icons/png/vault.png" alt="vault" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Vault</p>
    </router-link>
    <a v-else @click="no_access_popup('vault')" class="application-dropdown__item">
      <div class="application-dropdown__item--icon disable-app">
        <img class src="@/assets/icons/png/vault.png" alt="vault" />
      </div>
      <p class="application-dropdown__item--name is-medium-16-500-19 has-text-theme-black has-opacity-7">Vault</p>
    </a>
  </div>
</template>

<script>
  export default {};
</script>

<style lang="scss">
  .application-dropdown {
    cursor: default;
    background: $white;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    position: absolute;
    padding: 1.5rem;
    right: -3rem;
    top: 4rem;
    border-radius: 1rem;
    border: 1px solid #ddd;
    box-shadow: 0px 0px 10px 0px #ddd;
    &__item {
      height: 8rem;
      width: 8rem;
      margin: 1.5rem 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      cursor: pointer;
      &--icon {
        :hover {
          transform: scale(1.1);
        }
        img {
          height: 5.4rem;
          width: 5.4rem;
        }
      }
      &--name {
        margin-top: 1rem;
      }
    }
  }
  .disable-app {
    :hover {
      cursor: not-allowed;
    }
    img {
      height: 5.4rem;
      width: 5.4rem;
      filter: grayscale(75%);
    }
  }
</style>
