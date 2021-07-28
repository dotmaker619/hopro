<template>
  <div class="sh-skeleton">
    <skeleton-loading>
      <row :gutter="{top: '15px'}">
        <column :span="4">
          <circle-skeleton></circle-skeleton>
        </column>
        <column :span="20" :gutter="20">
          <square-skeleton :boxProperties="{
                            top: '5px',
                            width: '70px',
                            height: '10px'
                        }">
          </square-skeleton>
          <square-skeleton :boxProperties="{
                            width: '100%',
                            height: '10px',
                            top: '10px'
                        }">
          </square-skeleton>
        </column>
      </row>
      <row :gutter="{top: '35px'}">
        <square-skeleton :boxProperties="{
                        bottom: '10px',
                        width: '70px',
                        height: '10px',
                    }">
        </square-skeleton>
      </row>
      <row>
        <square-skeleton :boxProperties="{
                        bottom: '10px',
                        height: '10px',
                    }">
        </square-skeleton>
      </row>
      <row :gutter="{top: '35px'}">
        <square-skeleton :boxProperties="{
                        bottom: '10px',
                        width: '70px',
                        height: '10px',
                    }">
        </square-skeleton>
      </row>
      <row>
        <square-skeleton :boxProperties="{
                        bottom: '10px',
                        height: '15px',
                    }">
        </square-skeleton>
      </row>
      <row :gutter="{top: '35px'}">
        <square-skeleton :boxProperties="{
                        bottom: '10px',
                        width: '70px',
                        height: '10px',
                    }">
        </square-skeleton>
      </row>
      <row>
        <column :span="12">
          <square-skeleton :boxProperties="{
                        bottom: '10px',
                        height: '25px',
                    }">
          </square-skeleton>
        </column>
        <column :span="12" :gutter="10">
          <square-skeleton :boxProperties="{
                        bottom: '10px',
                        height: '25px',
                    }">
          </square-skeleton>
        </column>
      </row>
      <row :gutter="{top: '35px'}">
        <square-skeleton :boxProperties="{
                        bottom: '10px',
                        width: '70px',
                        height: '10px',
                    }">
        </square-skeleton>
      </row>
      <row>
        <column :span="5" :gutter="5">
          <circle-skeleton></circle-skeleton>
        </column>
        <column :span="5" :gutter="5">
          <circle-skeleton></circle-skeleton>
        </column>
        <column :span="5" :gutter="5">
          <circle-skeleton></circle-skeleton>
        </column>
        <column :span="5" :gutter="5">
          <circle-skeleton></circle-skeleton>
        </column>
      </row>
      <row :gutter="{top: '35px'}">
        <square-skeleton :count="1" :boxProperties="{
                        bottom: '10px',
                        width: '70px',
                        height: '10px',
                    }">
        </square-skeleton>
      </row>
      <row :gutter="{bottom: '25px'}">
        <column :span="6" :gutter="5">
          <square-skeleton :boxProperties="{
                        bottom: '10px',
                        height: '25px',
                    }">
          </square-skeleton>
        </column>
        <column :span="6" :gutter="5">
          <square-skeleton :boxProperties="{
                        bottom: '10px',
                        height: '25px',
                    }">
          </square-skeleton>
        </column>
        <column :span="6" :gutter="5">
          <square-skeleton :boxProperties="{
                        bottom: '10px',
                        height: '25px',
                    }">
          </square-skeleton>
        </column>
        <column :span="6" :gutter="5">
          <square-skeleton :boxProperties="{
                        bottom: '10px',
                        height: '25px',
                    }">
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