<template>
  <div>
    <skeleton-loading>
      <row :gutter="{ top: '15px', bottom: '10px' }">
        <column :span="20">
          <square-skeleton
            :boxProperties="{
              top: '5px',
              width: '100%',
              height: '15px',
            }"
          >
          </square-skeleton>
          <square-skeleton
            :boxProperties="{
              top: '5px',
              width: '50%',
              height: '15px',
            }"
          >
          </square-skeleton>
        </column>
      </row>
    </skeleton-loading>
  </div>
</template>
