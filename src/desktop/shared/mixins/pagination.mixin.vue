<script>
export default {
  data: function() {
    return {
      totalRecords: null,
      currentPage: 1,
      pageCount: 0,
      default_page_size: 10,
      visiblePagesCount: 10
    };
  },
  methods: {
    updatePagination(total) {
      this.totalRecords = total;
      this.pageCount = Math.ceil(total / this.default_page_size);
      if (this.$route.name === "mission-list")
        this.currentPage = parseInt(this.$route.query.pageNumber) || 1;
      else this.currentPage = parseInt(this.$route.query.page) || 1;

      if (this.pageCount <= this.visiblePagesCount)
        this.visiblePagesCount = Math.ceil(total / this.default_page_size);
      else this.visiblePagesCount = 10;
    },
    pageChangeHandle(value, search = this.$route.query.q) {
      switch (value) {
        case "next":
          this.currentPage += 1;
          break;
        case "previous":
          this.currentPage -= 1;
          break;
        default:
          this.currentPage = value;
      }

      if (this.currentPage > this.pageCount) this.currentPage -= 1;
      if (this.currentPage < 1) this.currentPage += 1;

      // change route and call methods
      if (
        this.$route.name === "mission-list" ||
        this.$route.name === "group-details-missions"
      )
        this.$router.push(
          {
            query: {
              ...this.$route.query,
              q: search,
              pageNumber: this.currentPage,
              pageSize: this.default_page_size
            }
          },
          () => {
            this.getData();
          }
        );
      else
        this.$router.push(
          {
            query: {
              ...this.$route.query,
              q: search,
              page: this.currentPage,
              page_size: this.default_page_size
            }
          },
          () => {
            this.getData();
          }
        );
    }
  }
};
</script>
