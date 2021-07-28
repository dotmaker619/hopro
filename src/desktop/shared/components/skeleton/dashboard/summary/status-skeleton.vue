<template>
  <div>
    <skeleton-loading>
      <row v-for="item in 3" :key="item" :gutter="{ top: '50px', bottom: '10px' }">
        <column :span="20">
          <square-skeleton
            :boxProperties="{
              top: '5px',
              width: '50%',
              height: '15px',
            }"
          >
          </square-skeleton>
          <square-skeleton
            :boxProperties="{
              top: '25px',
              width: '90%',
              height: '5px',
            }"
          >
          </square-skeleton>
        </column>
        <column :span="4">
          <square-skeleton
            :boxProperties="{
              top: '5px',
              width: '75%',
              height: '15px',
            }"
          >
          </square-skeleton>
        </column>
      </row>
    </skeleton-loading>
  </div>
</template>
