<template>
  <div>
    <div
      class="columns py-15 is-marginless is-flex align-center"
      style="border-bottom: 1px solid #eee"
      v-for="i in 8"
      :key="i"
    >
      <div class="column is-1 is-paddingless"></div>
      <div class="column is-4 is-paddingless">
        <article class="media align-center">
          <figure class="media-left">
            <p class="image is-30x30">
              <b-skeleton width="30px" height="30px"></b-skeleton>
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <b-skeleton class="pb-5" height="10px" width="75%"></b-skeleton>
                <b-skeleton height="15px" width="50%"></b-skeleton>
              </p>
            </div>
          </div>
        </article>
      </div>
      <div class="column is-3 is-paddingless">
        <b-skeleton height="10px" width="50%"></b-skeleton>
      </div>
      <div class="column is-2 is-paddingless">
        <b-skeleton height="10px" width="50%"></b-skeleton>
      </div>
    </div>
  </div>
</template>