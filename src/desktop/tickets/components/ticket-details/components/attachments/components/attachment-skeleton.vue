<template>
  <div>
    <skeleton-loading  v-if="$route.meta.screen!=='mobile'">
      <row :key="item" :gutter="{top:'20px'}">
        <column :span="24" :gutter="40">
          <square-skeleton
            :count="1"
            :boxProperties="{ top: '12px', bottom: '12px', width: '100%', height: '13rem' }"
          ></square-skeleton>
          <square-skeleton :boxProperties="{
                            bottom: '10px',
                            width: '100%',
                            height: '15px',
                        }">
          </square-skeleton>
          <square-skeleton :boxProperties="{
                            bottom: '10px',
                            height: '15px',
                        }">
          </square-skeleton>
        </column>
      </row>
    </skeleton-loading>
    <skeleton-loading v-else>
      <row :gutter="{top:'10px'}" >
        <column :span="24" :gutter="10">
          <square-skeleton
            :count="1"
            :boxProperties="{ top: '5px', bottom: '5px', width: '100%', height: '5rem' }"
          ></square-skeleton>
          <square-skeleton :boxProperties="{
                            bottom: '5px',
                            height: '5px',
                        }">
          </square-skeleton>
          <square-skeleton :boxProperties="{
                            bottom: '5px',
                            height: '5px',
                        }">
          </square-skeleton>
        </column>
      </row>
    </skeleton-loading>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>