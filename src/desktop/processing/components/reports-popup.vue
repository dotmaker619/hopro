<template>
  <div>
    <div class="background"></div>
    <div class="processing-report-popup" v-click-outside="() => $emit('close')">
      <div class="card">
        <div class="card-header">
          <div class="card-header-title is-card-header-centered">Download Reports</div>
          <a href="#" class="card-header-icon" aria-label="more options">
            <span class="icon">
              <i class="fas fa-times has-text-dark" @click="$emit('close')" aria-hidden="true"></i>
            </span>
          </a>
        </div>
        <div class="card-content is-paddingless">
          <div v-if="reports && reports.length">
            <div v-for="(report, i) of reports" :key="i" class="card-row level">
              <div class="is-capitalized">{{ pretty_name(report.report_type) }}</div>
              <div>
                <a @click="download_report(report.uid)">
                  <svg viewBox="0 0 100 100" class="image is-24x24 mr-10">
                    <use xlink:href="@/assets/icons/helper_sprite.svg#download-active" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div v-else>
            <no-results />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { uploadService } from "@/desktop/shared/services/";

  export default {
    props: ["process", "reports", "project_id"],

    methods: {
      async download_report(report_uid) {
        let { url } = await uploadService
          .download_report({
            id: this.project_id,
            report_uid,
          })
          .catch((err) => console.log(err));
        window.open(url, "_blank");
      },
      pretty_name(name) {
        if (!name) return "";
        return name.replace("_", " ");
      },
    },
  };
</script>

<style lang="scss" scoped>
  .background {
    height: 100vh;
    width: 100vw;
    position: fixed;
    background: #000;
    opacity: 0.5;
    z-index: 10;
    top: 0;
    left: 0;
  }
  .processing-report-popup {
    border-radius: 0.5rem;
    position: absolute;
    width: 30%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    border: 1px solid #fff;
    background: $primary-background;
    .card {
      border: none;
      box-shadow: none;
      overflow: hidden;
    }

    .card-header {
      padding: 1rem 2rem;
      font-size: 2rem;
    }

    .card-row {
      padding: 1rem 2rem;
      &:hover {
        background-color: $primary-background;
      }
    }
  }
</style>
