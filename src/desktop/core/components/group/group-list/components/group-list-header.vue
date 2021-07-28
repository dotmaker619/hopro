<template>
  <div class="sh-list-header columns is-regular-14-00-17 is-marginless bb-1">
    
    <div class="column is-3">Groups</div>
    <div class="column " :class="[$route.name !== 'asset-details-groups' ? 'is-3' : 'is-4']">Owner</div>
    <div class="column" v-if="$route.name !== 'asset-details-groups'">Assets</div>
    <div class="column" v-if="$route.name !== 'container-details'">Container</div>
    <div class="column">Tags</div>
  </div>
</template>

<script>
  export default {};
</script>
