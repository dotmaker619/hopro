<template>
  <div>
    <skeleton-loading>
      <row v-for="item in 4" :key="item" :gutter="{ top: '40px' }" class="activities-skeleton">
        <column :span="24">
            <row>
                <column :span="8">
                    <square-skeleton
                        :boxProperties="{
                            height: '10px',
                            left: '10px'
                        }"
                    >
                    </square-skeleton>
                </column>
            </row>
            <row v-for="item in 3" :key="item" :gutter="{ top: '40px' }">
                <column :span="1"></column>
                <column :span="1">
                    <circle-skeleton></circle-skeleton>
                </column>
                <column :span="22" :gutter="10">
                    <row>
                        <column :span="6">
                            <square-skeleton
                                :boxProperties="{
                                top: '5px',
                                width: '100%',
                                height: '10px',
                                }"
                            >
                            </square-skeleton>
                        </column>
                        <column :span="12">
                        </column>
                        <column :span="6">
                            <square-skeleton
                                :boxProperties="{
                                top: '5px',
                                width: '100%',
                                height: '10px',
                                }"
                            >
                            </square-skeleton>
                        </column>
                    </row>
                    <square-skeleton
                        :boxProperties="{
                        width: '30%',
                        height: '12px',
                        top: '10px',
                        }"
                    >
                    </square-skeleton>
                </column>
            </row>
        </column>
      </row>
    </skeleton-loading>
  </div>
</template>

<script>
  export default {};
</script>

<style lang="scss" scoped>
  .activities-skeleton {
    @include box-shadow;
    background-color: $white;
    border-radius: 1rem;
    margin-bottom: 1.5rem;
    padding: 15px;
  }
</style>
