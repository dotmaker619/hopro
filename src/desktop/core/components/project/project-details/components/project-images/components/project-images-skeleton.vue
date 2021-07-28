<template>
  <div>
    <skeleton-loading class="sh-skeleton">
        <row :gutter="{ top: '40px'}">
            <column :span="6" v-for="item in 4" :key="item" :gutter="{ top: '30px' }">
                <row>
                    <column :span="3"></column>
                    <column :span="20">
                        <square-skeleton
                            :boxProperties="{
                                top: '5px',
                                width: '100%',
                                height: '10px',
                            }"
                        >
                        </square-skeleton>
                        <square-skeleton
                            :boxProperties="{
                                top: '10px',
                                width: '90%',
                                height: '8px',
                            }"
                        >
                        </square-skeleton>
                    </column>
                </row>
            </column>
        </row>
        <row :gutter="{ top: '50px' }">
            <column :span="6" v-for="item in 2" :key="item" :gutter="{ top: '30px' }">
                <row>
                    <column :span="3"></column>
                    <column :span="20">
                        <square-skeleton
                            :boxProperties="{
                                top: '5px',
                                width: '100%',
                                height: '10px',
                            }"
                        >
                        </square-skeleton>
                        <square-skeleton
                            :boxProperties="{
                                top: '10px',
                                width: '90%',
                                height: '8px',
                            }"
                        >
                        </square-skeleton>
                    </column>
                </row>
            </column>
        </row>
        <row :gutter="{ top: '40px'}">
            <column :span="24">
                <hr class="divider" />
            </column>
        </row>
        <row :gutter="{ top: '35px' }">
            <column :span="1"></column>
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
        <row :gutter="{ top: '10px' }">
            <column :span="1"></column>
            <column :span="3" v-for="item in 3" :key="item">
                <square-skeleton
                    :boxProperties="{
                        top: '5px',
                        width: '90%',
                        height: '60px',
                    }"
                >
                </square-skeleton>
            </column>
        </row>
        <row :gutter="{ top: '55px' }"></row>
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