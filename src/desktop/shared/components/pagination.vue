<template>
  <div class="pagination-box" v-if="pageCount>1">
    <!-- <pre>
      visiblePagesCount :: {{visiblePagesCount}}
      currentPage :: {{currentPage}}
      pageCount :: {{pageCount}} 
      totalRecords :: {{totalRecords}}
    </pre> -->

    <section>
      <p class="pagination-text">
        Showing
        <span v-if="currentPage*default_page_size-default_page_size+1 == totalRecords ">last</span>
        <span
          v-else
        >{{ currentPage*default_page_size-default_page_size+1}} to {{currentPage*default_page_size >= totalRecords ? totalRecords : currentPage*default_page_size}}</span>
        of {{totalRecords}} enteries
      </p>
    </section>
    <nav class="pagination" role="navigation" aria-label="pagination">
      <a class="pagination-previous" :disabled="isPreviousButtonDisabled" @click="previousPage">
        <i class="fas fa-chevron-left"></i>
      </a>

      <ul class="pagination-list">
        <li v-for="(paginationTrigger,i) of paginationTriggers" :key="i">
          <a v-if="!paginationTrigger" @click="onLoadPage(paginationTriggers[i-1]+1)">
            <span style="width:0;height:0" class="pagination-ellipsis">&hellip;</span>
          </a>
          <a
            @click="onLoadPage(paginationTrigger)"
            class="pagination-link"
            :class="{'is-current':paginationTrigger==currentPage}"
            v-else
          >{{ paginationTrigger }}</a>
        </li>
      </ul>
      <a class="pagination-next" :disabled="isNextButtonDisabled" @click="nextPage">
        <i class="fas fa-chevron-right"></i>
      </a>
    </nav>
  </div>
</template>
<script>
export default {
  props: ["visiblePagesCount", "currentPage", "pageCount", "totalRecords","default_page_size"],
  computed: {
    paginationTriggers() {
      let currentPage = this.currentPage;
      let currentPageIndex = this.currentPage - 1;
      let edgeFillingLimit = this.visiblePagesCount - 2;
      let midFillingLimit = this.visiblePagesCount - 4;
      let paginationArray = [];
      let arrayFillingCount = 0;
      let count = 0;

      if (this.pageCount <= this.visiblePagesCount) {
        for (let i = 1; i <= this.pageCount; i++) paginationArray[i - 1] = i;
        return paginationArray;
      } else {
        paginationArray = [];
      }

      if (currentPage <= Math.floor(this.visiblePagesCount / 2)) {
        //Left Edge Case
        while (arrayFillingCount < edgeFillingLimit) {
          if (count && currentPageIndex - count >= 0) {
            paginationArray[currentPageIndex - count] = currentPage - count;
            arrayFillingCount++;
          }
          if (
            currentPageIndex + count < this.pageCount &&
            arrayFillingCount < edgeFillingLimit
          ) {
            paginationArray[currentPageIndex + count] = currentPage + count;
            arrayFillingCount++;
          }
          count++;
        }
        paginationArray.push(0, this.pageCount);
      } else if (
        currentPage >=
        this.pageCount - Math.ceil(this.visiblePagesCount / 2)
      ) {
        //Right Edge Case
        while (arrayFillingCount < edgeFillingLimit) {
          if (
            count &&
            this.pageCount - currentPageIndex + count <= edgeFillingLimit
          ) {
            paginationArray[
              this.visiblePagesCount - this.pageCount + currentPageIndex - count
            ] = currentPage - count;
            arrayFillingCount++;
          }
          if (
            currentPageIndex + count < this.pageCount &&
            arrayFillingCount < edgeFillingLimit
          ) {
            paginationArray[
              this.visiblePagesCount - this.pageCount + currentPageIndex + count
            ] = currentPage + count;
            arrayFillingCount++;
          }
          count++;
        }
        paginationArray[0] = 1;
      } else {
        //Mid Case
        while (arrayFillingCount < midFillingLimit) {
          if (count) {
            paginationArray[Math.floor(midFillingLimit / 2) - count] =
              currentPage - count;
            arrayFillingCount++;
          }
          paginationArray[Math.floor(midFillingLimit / 2) + count] =
            currentPage + count;
          arrayFillingCount++;
          count++;
        }
        paginationArray.unshift(1, 0);
        paginationArray.push(0, this.pageCount);
      }
      return paginationArray;
    },

    isPreviousButtonDisabled() {
      return this.currentPage === 1;
    },
    isNextButtonDisabled() {
      return this.currentPage === this.pageCount;
    }
  },
  methods: {
    nextPage() {
      this.$emit("nextPage");
    },
    previousPage() {
      this.$emit("previousPage");
    },
    onLoadPage(value) {
      this.$emit("loadPage", value);
    }
  }
};
</script>
<style lang="scss">
.pagination {
  margin-bottom: 8rem;
  &-box {
    margin: 1rem 0;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
  }
  &-text {
    font-weight: 500;
    color: $light-black;
    font-size: 1.8rem;
  }

  &-list {
    order: 2 !important;
    flex-grow: unset;

    .is-current {
      background-color: $primary !important;
      border-color: $primary !important;
      color: #fff;
    }
  }

  &-link,
  &-previous,
  &-next {
    border-radius: 5px;
    background: $white;
    font-weight: 600;
    color: $light-black;
    border: 1px solid $white !important;
    box-shadow: 0px 0px 1px 1px #eee !important;
  }
}
</style>