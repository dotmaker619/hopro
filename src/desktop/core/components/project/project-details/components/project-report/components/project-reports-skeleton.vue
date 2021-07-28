<template>
  <div>
    <skeleton-loading class="sh-skeleton">
        <row :gutter="{ top: '30px'}" v-for="item in 3" :key="item">
            <column :span="6">
                <square-skeleton
                    :boxProperties="{
                        top: '5px',
                        width: '80%',
                        height: '10px',
                    }"
                >
                </square-skeleton>
                <square-skeleton
                    :boxProperties="{
                        top: '8px',
                        width: '75%',
                        height: '8px',
                    }"
                >
                </square-skeleton>
            </column>
            <column :span="4">
                <square-skeleton
                    :boxProperties="{
                        top: '5px',
                        width: '80%',
                        height: '10px',
                    }"
                >
                </square-skeleton>
            </column>
            <column :span="6">
                <square-skeleton
                    :boxProperties="{
                        top: '5px',
                        width: '90%',
                        height: '10px',
                    }"
                >
                </square-skeleton>
            </column>
            <column :span="4">
                <square-skeleton
                    :boxProperties="{
                        top: '5px',
                        width: '95%',
                        height: '10px',
                    }"
                >
                </square-skeleton>
            </column>
            <column :span="4">
                <square-skeleton
                    :boxProperties="{
                        top: '5px',
                        width: '95%',
                        height: '10px',
                    }"
                >
                </square-skeleton>
            </column>
        </row>
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
    box-shadow: 5px 5px 10px 0px $skeleton-color;
  }
  &:hover &__item--icon {
    align-self: center;
    visibility: visible;
  }
}

</style>