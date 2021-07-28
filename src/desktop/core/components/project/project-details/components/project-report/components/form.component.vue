<template>
  <div class="columns is-multiline pt-20" style="padding-left:8rem;padding-right:8rem;padding-top:">
    <div class="column is-full pt-10 pb-20">
      <input
        @input="$emit('input',form)"
        v-model="form.name"
        placeholder="Enter Name"
        type="text"
        class="input"
      />
    </div>
    <div class="column is-full pt-10 pb-20">
      <select @change="$emit('onchange_filetype')" class="select" v-model="form.report_type">
        <template v-for="(report,i) in report_typess">
          <option :hidden="report.name===''" :disabled="report.name===''"  :value="report.name" :key="i">{{report.label}}</option>
        </template>
      </select>
    </div>
    <div class="column is-full pt-10 pb-20">
      <select
        :disabled="report_details"
        class="input"
        v-model="form.service"
        @change="form.region=form.service.regions[0].name;$emit('input',form)"
      >
        <option v-for="(service,i) in services" :value="service" :key="i">{{service.label}}</option>
      </select>
    </div>
    <div class="column is-full pt-10 pb-20">
      <select v-if="!form.service" class="input"></select>
      <select
        :disabled="report_details"
        v-if="form.service"
        class="input"
        v-model="form.region"
        @input="$emit('input',form)"
      >
        <option
          v-for="region in form.service.regions"
          :value="region.name"
          :key="region.name"
        >{{region.label}}</option>
      </select>
    </div>
    <!-- </div> -->
  </div>
</template>
<script>
import { uploadService } from "@/desktop/shared/services/";

import Treeselect from "@riophae/vue-treeselect";

export default {
  props: ["report_details"],
  components: { Treeselect },
  data() {
    return {
      services: null,
      report_types: null,
      form: {
        name: "",
        service: null,
        report_type: "",
        region: ""
      }
    };
  },
  async created() {
    this.services = await uploadService.get_services({});
    this.report_types = await uploadService.get_report_types({});
    this.report_types.unshift({ name: "", label: "Select Report" });
    this.form.service = this.services[0];
    this.form.region = this.services[0].regions[0].name;

    this.form.report_type = "";

    this.$emit("input", this.form);
  },
  computed: {
    report_typess() {
      return _.filter(this.report_types, r => {
        return r.name !== "images";
      });
    }
  },
  methods: {
    report_custom_keys(node) {
      return {
        id: node.name,
        label: node.label
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.input {
  border: none;
  box-shadow: none;
  border-bottom: 1px solid #ddd;
  border-radius: 0;
}
.select {
  border: none;
  box-shadow: none;
  border-bottom: 1px solid #ddd;
  border-radius: 0;
  width: 100%;
  background-color: $white;
  cursor: pointer;
  font-size: 16px;
  font-family: Barlow-Regular;
  line-height: 22px;

  option {
    font-size: 16px;
    font-family: Barlow-Regular;
    line-height: 22px;
  }
}
</style>
