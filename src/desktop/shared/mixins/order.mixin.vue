<script>
  export default {
    methods: {
      maintain_order(uids, data) {
        if (!uids.length || !data.length) return [];

        let groupBy = (data) => {
          let keyed = {};
          data.forEach((d) => {
            keyed[d.uid] = d;
          });
          return keyed;
        };
        let data_obj = groupBy(data);
        return uids.reduce((results, u) => {
          if (data_obj[u]) results.push(data_obj[u]);

          return results;
        }, []);
      },
    },
  };
</script>
