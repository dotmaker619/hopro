<template>
  <div>
    <div v-if="apps.length" class="mt-5">
      <p v-for="(app, i) in apps.slice(0, howManyToShow)" :key="i" class :class="[show_name ? 'app-tag bordered-tag is-flex' : 'is-inline']">
        <router-link v-if="app && access(app.application.name) && app_link(app)" :to="app_link(app)" :class="{ 'is-flex is-vcenter': show_name }">
          <img class="sh-app-tag is-pointer" :class="{ 'image is-24x24 is-inline': show_name }" :src="getIconPath(app.application.name)" />
          <span v-if="show_name" v-tooltip="app.name.length > 15 ? app.name : null" class="is-medium-14-500-17 has-text-blue-grey">
            {{ app.name | truncate(15) }}
          </span>
        </router-link>
        <a v-else @click="no_access_popup(app && app.application.name)" :class="{ 'is-flex is-vcenter': show_name }">
          <img class="sh-app-tag is-pointer" :class="{ 'image is-24x24 is-inline': show_name }" :src="getIconPath(app.application.name)" />
          <span v-if="show_name" v-tooltip="app.name.length > 15 ? app.name : null" class="is-medium-14-500-17 has-text-blue-grey">
            {{ app.name | truncate(15) }}
          </span>
        </a>
      </p>

      <div
        v-if="apps.length > howManyToShow"
        class="sh-more-tag"
        v-tooltip="{ content: `${apps.slice(howManyToShow, apps.length).map((t) => ' ' + t.name)}` , html: false}"
      >
        +{{ apps.length - howManyToShow }}
      </div>
    </div>
    <not-assigned v-else :type="'application'" />
  </div>
</template>

<script>
  import NotAssigned from "@/desktop/shared/components/not-assigned";

  export default {
    components: {
      NotAssigned,
    },

    props: ["apps", "howManyToShow", "item_id", "show_name"],

    methods: {
      getIconPath(app) {
        return require(`@/assets/icons/app-tag/${app}-circle.svg`);
      },
      goToApp(app) {
        switch (app.application.name) {
          case "terra":
            this.$router.push({
              name: "terra-viewer",
              params: { id: this.item_id },
            });
            break;
          case "therm":
            this.$router.push({
              name: "therm-details",
              params: { id: this.item_id },
            });
            break;
          case "missions":
            this.$router.push({
              name: "mission-details",
              params: { id: this.item_id },
            });
            break;
          case "qc":
            console.log("qc");
            break;
          default:
            console.log("dont know");
        }
      },
      app_link(app) {
        switch (app.application.name) {
          case "terra":
            return {
              name: "terra-viewer",
              params: { id: this.item_id },
            };
            break;
          case "therm":
            return {
              name: "therm-viewer",
              params: { id: this.item_id },
            };
            break;
          case "missions":
            return {
              name: "missions-viewer",
              params: { id: this.item_id },
            };
            break;
          case "qc":
            return {
              name: "qc-viewer",
              params: { id: this.item_id },
            };
            break;
          default:
            return false;
        }
      },
    },
  };
</script>

<style lang="scss">
  .bordered-tag {
    display: flex;
    border: 1px solid #aaa;
    border-radius: 2rem;
    justify-content: center;
    align-items: center;
    padding: 0.2rem 0.4rem 0.2rem 0.1rem;
    width: max-content;
    margin-bottom: 0.5rem;
  }
</style>
