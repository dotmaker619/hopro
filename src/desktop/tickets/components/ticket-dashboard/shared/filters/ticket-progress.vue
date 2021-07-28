<template>
  <div class="ticket-progress is-pointer">
    <div
      v-tooltip="{ content: value + ' / ' + total , html: false}"
      :class="`ticket-value ${valueClass ? valueClass : ''} ticket-value-${color ? color : ''}`"
      :style="`${(value * 100) / total > 100 ? 'width:100%' : total > 0 ? 'width:' + (value * 100) / total + '%' : 'width:0'}`"
    ></div>
  </div>
</template>

<script>
  export default {
    props: ["color", "total", "value", "valueClass"],
  };
</script>

<style lang="scss" scoped>
  .upcoming-progress-value {
    background-color: $primary !important;
  }
  .member-progress-value {
    background-color: #3dd598 !important;
  }
  .tag-progress-value {
    background-color: #747891 !important;
  }
  .stale-progress-value {
    background-color: #f79c4b !important;
  }
  .overdue-progress-value {
    background-color: #ff7f89 !important;
  }
</style>
