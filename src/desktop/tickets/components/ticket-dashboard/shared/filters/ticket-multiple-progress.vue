<template>
  <div class="is-flex">
    <div class="custom-progress">
      <div
        @click="$emit('filter_by', name)"
        v-for="(item, name) in total"
        :key="name"
        class="custom-progress-bar"
        :class="name"
        v-tooltip="{
          content: `<p class='is-capitalized'>${name}</p><div style='width: 6px;height: 6px;background-color:#${colors[name]};display: inline-block;border-radius: 50%;margin-right: 5px;background-color:#${colors[name]}'></div><span style='color:#${colors[name]}'>${item.count}</span>`,
          html: true,
        }"
        :style="{ width: item.percent + '%' }"
      ></div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["values"],
    data() {
      return {
        colors: {
          rejected: "f85859",
          pending: "ffad43",
          inprogress: "3dd598",
          resolved: "8578cd",
          closed: "dbddeb",
        },
      };
    },
    computed: {
      total() {
        let total = _.sumBy(this.values, function(o) {
          return o.count;
        });
        let percent = {};
        this.values.map((element) => {
          percent[element.type] = {
            percent: Math.round((element.count * 100) / total),
            count: element.count,
          };
        });

        const sortObject = (o) =>
          Object.keys(o)
            .sort()
            .reduce((r, k) => ((r[k] = o[k]), r), {});
        return sortObject(percent);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .custom-progress {
    display: flex;
    height: 0.6rem;
    overflow: hidden; // force rounded corners by cropping it
    line-height: 0;
    width: 100%;
    background: #dbddeb;
  }

  .custom-progress-bar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    text-align: center;
    white-space: nowrap;
    background-color: lightgray;
    cursor: pointer;
  }
  .rejected {
    background-color: #f85859;
  }
  .pending {
    background-color: #ffad43;
  }
  .inprogress {
    background-color: #3dd598;
  }
  .resolved {
    background-color: #8578cd;
  }
  .rejected {
    background-color: #747891;
  }
  .progress-circle {
    width: 6px;
    height: 6px;
    background-color: #dbddeb;
    display: inline-block;
    border-radius: 50%;
    margin-right: 5px;
  }
</style>
