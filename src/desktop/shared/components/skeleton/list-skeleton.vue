<template>
  <skeleton-loading>
   
    <row class="sh-skeleton is-flex align-center" v-for="i in items.row_count" :key="i"
      :gutter="{ top: '25px', bottom: '20px' }">
      <!-- START - name -->
      <column v-for="i in items.name" :key="'name'+i" :span="24 / items.col_count" :gutter="5">
        <row class="is-flex align-center">
          <column :span="4">
            <circle-skeleton></circle-skeleton>
          </column>
          <column :span="20" :gutter="10">
            <row>
              <column :span="10">
                <square-skeleton :boxProperties="{
                    bottom: '10px',
                    width: '100%',
                    height: '10px',
                  }"></square-skeleton>
              </column>
            </row>

            <row>
              <column :span="20">
                <square-skeleton :boxProperties="{
                    bottom: '10px',
                    height: '20px',
                  }"
                ></square-skeleton>
              </column>
            </row>
          </column>
        </row>
      </column>
      <!-- END - name -->

      <!-- START - teams -->
      <column v-for="item in items.team" :key="'teams'+item" :span="24 / items.col_count">
        <row>
          <column :span="8">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                width: '100%',
                height: '10px',
              }"></square-skeleton>
          </column>
        </row>

        <row>
          <column :span="8">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '25px',
              }"
            ></square-skeleton>
          </column>
          <column :span="12" :gutter="5">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '25px',
              }"
            ></square-skeleton>
          </column>
        </row>
      </column>
      <!-- END - teams -->

      <!-- START - assets -->
      <column v-for="item in items.assets" :key="item" :span="24 / items.col_count">
        <row>
          <column :span="8">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                width: '100%',
                height: '10px',
              }"></square-skeleton>
          </column>
        </row>

        <row>
          <column :span="8">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '25px',
              }">
            </square-skeleton>
          </column>
          <column :span="12" :gutter="5">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '25px',
              }">
            </square-skeleton>
          </column>
        </row>
      </column>
      <!-- END - assets -->

      <!-- START - application -->
      <column v-for="item in items.application" :key="item" :span="24 / items.col_count" :gutter="10">
        <row>
          <column :span="8">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '10px',
              }">
            </square-skeleton>
          </column>
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
      </column>
      <!-- END - application -->

      <!-- START - tags -->
      <column
        v-for="item in items.tags"
        :key="'tags'+item"
        :span="24 / items.col_count"
        :gutter="10"
      >
        <row>
          <column :span="8">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                width: '100%',
                height: '10px',
              }"></square-skeleton>
          </column>
        </row>

        <row>
          <column :span="4">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '25px',
              }"
            ></square-skeleton>
          </column>
          <column :span="8" :gutter="5">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '25px',
              }"
            ></square-skeleton>
          </column>
          <column :span="6" :gutter="5">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '25px',
              }"
            ></square-skeleton>
          </column>
        </row>
      </column>
      <!-- END - tags -->

      <!-- START - user -->
      <column
        v-for="item in items.user"
        :key="'user'+item"
        :span="24 / items.col_count"
        :gutter="10"
      >
        <row>
          <column :span="8">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '10px',
              }"
            ></square-skeleton>
          </column>
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
      </column>
      <!-- END - user -->

      <!-- START - text -->
      <column v-for="item in items.text" :key="item" :span="24 / items.col_count" :gutter="10">
        <row>
          <column :span="8">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                width: '100%',
                height: '10px',
              }"></square-skeleton>
          </column>
        </row>

        <row>
          <column :span="20">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '25px',
              }">
            </square-skeleton>
          </column>
        </row>
      </column>
      <!-- END - text -->

      <!-- START - Status -->
      <column
        v-for="item in items.status"
        :key="'status'+item"
        :span="24 / items.col_count"
        :gutter="10"
      >
        <row justify="center">
          <column :span="8">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '10px',
              }"
            ></square-skeleton>
          </column>
        </row>
        <row justify="center">
          <column :span="12">
            <square-skeleton :boxProperties="{
                bottom: '10px',
                height: '25px',
              }"
            ></square-skeleton>
          </column>
        </row>
      </column>
      <!-- END - status -->
    </row>
  </skeleton-loading>
</template>

<script>
export default {
  props: {
    options: {
      type: Object,
      default: function() {
        return {
          row_count: 5,
          col_count: 4,
          name: 2,
          team: 1,
          user: 0,
          tags: 1,
          status: 0
        };
      }
    }
  },
  data() {
    return {
      items: this.options
    };
  }
};
</script>

<style lang="scss">
.sh-skeleton {
  @include box-shadow;
  background-color: $white;
  border-radius: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  align-items: center;
  &:hover {
    box-shadow: 5px 5px 10px 0px $skeleton-color;
  }
  &:hover &__item--icon {
    align-self: center;
    visibility: visible;
  }
}
.skeleton-bac-animation {
  background-size: 80% !important;
}
</style>
