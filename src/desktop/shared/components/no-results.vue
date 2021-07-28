  <template>
  <div class="no-results">
    <div class="no-results__image">
      <slot name="image"></slot>
    </div>
    <div class="no-results__text">No results found</div>
    <div class="no-results__button">
      <slot name="button"></slot>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.no-results {
  width: 100%;
  background: $white;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0px 0px 10px 1px #eee;
  height: max-content;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
  padding: 2rem;
  &__text {
    font-size: 1.6rem;
    color: black;
    opacity: 0.7;
    margin: 2rem 0;
  }
}
</style>