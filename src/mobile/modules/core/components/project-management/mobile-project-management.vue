<template>
  <div>
    <div>
      <assets-list></assets-list>
    </div>
  </div>
</template>
<script>
  import AssetsList from "./components/mobile-assets-list";

  export default {
    components: {
      AssetsList,
    },
    created () {
      analytics.page("Home");
    }
  };
</script>
