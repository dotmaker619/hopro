<template>
  <div>
    <p class="is-regular-14-00-17 has-text-light-grey">Asset</p>
    <primary-tags
      @click.native="$emit('close')"
      :tags="elementData ? [elementData] : null"
      :type="'asset'"
      v-if="elementData && elementData.type == 'asset'"
    ></primary-tags>
    <p v-else class="is-regular-14-00-17 as-text-light-grey">*Asset not assigned</p>
    <p class="is-regular-14-00-17 has-text-light-grey mt-25">Location</p>
    <div class="is-flex mt-10">
      <div v-for="(name, i) in nameArray" :key="i" class="is-flex is-vcenter">
        <span
          style="white-space: nowrap;"
          class="is-medium-14-500-17"
          v-tooltip="name"
          :class="[name == '*Not found' ? 'has-text-light-grey' : 'has-text-theme-black']"
          >{{ name | truncate(15) }}</span
        >
        <p v-if="i != nameArray.length - 1">
          <sh-icon :name="'collapse'" class="is-16x16" style="transform: rotate(-90deg);"></sh-icon>
        </p>
      </div>
    </div>
  </div>
</template>
<script>
  import PrimaryTags from "@/desktop/shared/components/tags/primary-tag";
  import { apiService } from "@/desktop/shared/services/";

  export default {
    props: ["stage", "element_id"],
    components: {
      PrimaryTags,
    },
    data() {
      return {
        nameArray: [],
        elementData: null,
      };
    },
    created() {
      this.get_element();
    },
    watch: {
      element_id() {
        this.get_element();
      },
    },
    methods: {
      async get_element() {
        this.nameArray = [];
        let res = await apiService
          .get_element_hierarchy({
            id: this.element_id,
            stage: this.stage,
          })
          .catch((err) => {
            console.log(err);
            this.nameArray = ["*Not found"];
          });
        this.elementData = res;
        if (this.elementData) this.getName(this.elementData);
      },
      getName(dataObject) {
        if (dataObject[`name`]) {
          this.nameArray.push(dataObject[`name`]);
        }
        if (dataObject[`child`] && dataObject[`child`].uid) return this.getName(dataObject[`child`]);
        return null;
      },
    },
  };
</script>
