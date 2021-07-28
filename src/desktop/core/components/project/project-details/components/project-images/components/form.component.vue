<template>
  <div class="columns is-multiline">
    <div class="column is-full">
      <input @input="$emit('input',form)" class="input" disabled value="RawData" />
    </div>
    <div class="column is-full">
      <select
        :disabled="project_report.service"
        class="input"
        v-model="form.service"
        @change="form.region=form.service.regions[0].name;$emit('input',form)"
      >
        <option v-for="(service,i) in services" :value="service" :key="i">{{service.label}}</option>
      </select>
    </div>
    <div class="column is-full">
      <select
        :disabled="project_report.service"
        v-if="form.service"
        class="input is-pointer"
        v-model="form.region"
        @change="$emit('input',form)"
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

export default {
  props: ["project_report"],
  data() {
    return {
      services: null,
      report_types: null,
      form: {
        service: null,
        report_type: "images",
        region: ""
      }
    };
  },
  async created() {
    this.services = await uploadService.get_services({});
    this.report_types = await uploadService.get_report_types({});
    this.form.service = this.services[0];
    this.form.region = this.services[0].regions[0].name;

    this.form.report_type = "images";
    // Restrict to previously select service and region
    console.log(this.project_report)
    if (this.project_report && this.project_report.service) {
      this.form.service = this.services.find(
        s => s.name == this.project_report.service.name
      );
      this.form.region = this.project_report.service.region;
    }
    this.$emit("input", this.form);
  }
};
</script>

