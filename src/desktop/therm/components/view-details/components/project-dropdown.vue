<template>
  <div>
    <div class="select">
      <select @change="$emit('change',active)" v-model="active">
        <option value="all">All</option>
        <option v-for="project in sort(projects)" :value="project.uid" :key="project.uid">{{project.name}}</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  props: ["details"],
  data() {
    return { active: "all" };
  },
  computed: {
    projects() {
      let projects = [];
      if (this.details && this.details.groups)
        for (let group of this.details.groups) {
          for (let project of group.projects) {
            projects.push(project);
          }
        }
      return projects;
    }
  },
  methods:{
     sort(data) {
      if (!data) return [];
      return _.sortBy(data, [p => p.name.toLowerCase()]);
    }
  }
};
</script>

<style>
</style>