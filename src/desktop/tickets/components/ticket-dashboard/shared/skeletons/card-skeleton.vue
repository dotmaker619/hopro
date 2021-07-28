<template>
  <div>
    <skeleton-loading >
      <row :key="item" :gutter="{top:'20px'}" class="dashboard-template">
        <column :span="24">
          <square-skeleton :boxProperties="{
                            bottom: '10px',
                            height: '15px',
                        }">
          </square-skeleton>
          <square-skeleton :boxProperties="{
                            bottom: '10px',
                            width: '50%',
                            height: '10px',
                        }">
          </square-skeleton>
          <row
          :key="i"
          :gutter="{top: '5px', bottom: '5px'}"
          >
            <column :span="3" :gutter="2">
                <circle-skeleton></circle-skeleton>
            </column>
            <column :span="3" :gutter="2">
                <circle-skeleton></circle-skeleton>
            </column>
            <column :span="3" :gutter="2">
                <circle-skeleton></circle-skeleton>
            </column>
          </row>
          <square-skeleton :boxProperties="{
              top: '10px',
              bottom: '10px',
              height: '10px',
          }">
          </square-skeleton>
        </column>
      </row>
      <!-- <row class="sh-skeletn" :gutter="{ top: '10px' }">
        <column v-for="i in 3" :key="i" :span="20" :gutter="40">
          <square-skeleton
            :count="2"
            :boxProperties="{ top: '12px', bottom: '12px', width: '100%', height: '1rem' }"
          ></square-skeleton>
        </column>
      </row>
      <row
      :gutter="{top: '5px', bottom: '5px'}"
      >
        <column v-for="i in 3" :key="i" :span="20" :gutter="40">
            <circle-skeleton></circle-skeleton>
        </column>
      </row>
      <row class="sh-skeletn" :gutter="{ top: '10px' }">
        <column v-for="i in 3" :key="i" :span="20" :gutter="40">
          <square-skeleton
            :count="1"
            :boxProperties="{ top: '12px', bottom: '12px', width: '100%', height: '1.5rem' }"
          ></square-skeleton>
        </column>
      </row> -->
    </skeleton-loading>
  </div>
</template>

<script>
  export default {};
</script>

<style lang="scss">
  .sh-skeleton {
    @include box-shadow;
    background-color: $white;
    border-radius: 1rem;
    margin-bottom: 1rem;
    &:hover {
      box-shadow: 5px 5px 10px 0px #dedeec;
    }

    &:hover &__item--icon {
      align-self: center;
      visibility: visible;
    }
  }

  .dashboard-template{
    @include box-shadow;
    background-color: $white;
    border-radius: 1rem;
    margin-bottom: 1.5rem;
    padding: 15px;
  }
</style>