<script>
  import { mapState } from "vuex";

  export default {
    computed: {
      ...mapState("vault", ["search_keys"]),
    },
    watch: {
      search_keys(val) {
        this.search_keyword = val;
      },
    },
    data() {
      return {
        search_keyword: "",
      };
    },
    created() {
      this.search_keyword = this.$route.query.q || "";
    },
    methods: {
      search: _.debounce(function() {
        this.$emit("search", this.search_keyword.length ? this.search_keyword : "");
      }, 500),
    },
  };
</script>
