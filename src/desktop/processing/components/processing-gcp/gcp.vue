<template>
  <div class="gcp">
    <section v-if="!dropFile && !csvs" class="margin-auto" :class="{ 'is-disabled': is_resume }">
      <b-field class="upload_file">
        <b-upload v-model="dropFile" drag-drop @input="readFile" accept=".csv">
          <section class="section">
            <div class="content has-text-centered">
              <sh-icon :name="'upload'" class="is-36x36 margin-auto mb-10"></sh-icon>
              <p class=" is-medium-16-500-19 has-text-grey has-opacity-7">Drop file here or click to upload</p>
            </div>
          </section>
        </b-upload>
      </b-field>

      <div class="tag is-primary" v-if="dropFile">
        {{ dropFile.name }}
        <button class="delete " type="button" @click="deleteDropFile()"></button>
      </div>
      <div></div>
      <div class="has-text-centered mt-30">
        <p class="is-full  is-medium-16-500-19 has-text-grey">No data available. Upload file to see details</p>
      </div>
    </section>

    <section class="csv-table" v-else>
      <div class="csv-table__buttons">
        <div class="csv-table__buttons--view">
          <button class="action-buttons mr-10" @click="tableView = false" :class="{ 'action-buttons--active': !tableView }">
            <i class="fas fa-map-marker mr-10"></i>
            <span class="is-medium-14-500-17">
              Map
            </span>
          </button>
          <button class="action-buttons" @click="tableView = true" :class="{ 'action-buttons--active': tableView }">
            <i class="fas fa-list-alt mr-10"></i>
            <span class="is-medium-14-500-17">
              List
            </span>
          </button>
        </div>

        <div class="csv-table__buttons--actions">
          <div class="action-buttons mr-10" title="Get mars">
            <a :href="get_marks_api + '/process/' + $route.params.id + '/mark-gcps/'" target="_blank">
              <i class="fas fa-thumbtack"></i>
            </a>
          </div>

          <div class="action-buttons mr-10">
            <div>
              <i class="fas fa-sync-alt is-size-4" :class="{ 'process has-text-success': refreshing }"></i>
            </div>
          </div>
          <div class="action-buttons " :class="{ 'is-disabled': is_resume }">
            <b-field class="file  ">
              <b-upload v-model="dropFile" @input="readFile" accept=".csv">
                <span class="is-medium-14-500-17">
                  <i class="fas fa-cloud-upload-alt is-size-4 mr-10"></i>
                  Upload a different file
                </span>
              </b-upload>
              <span class="file-name is-size-6 ml-5 " v-if="dropFile">{{ dropFile.name }}</span>
            </b-field>
          </div>
        </div>
      </div>

      <table v-if="tableView" class="csv-table__data">
        <thead class="csv-table__data--header">
          <th class="csv-table__data--header-item">Name</th>
          <th class="csv-table__data--header-item">X</th>
          <th class="csv-table__data--header-item">Y</th>
          <th class="csv-table__data--header-item">Z</th>
          <th class="csv-table__data--header-item">Type</th>
          <th class="csv-table__data--header-item"># Marks</th>

          <th class="csv-table__data--header-item"></th>
        </thead>
        <tbody class="csv-table__data--body">
          <tr v-for="(csv, i) in csv_file" :key="i" class="csv-table__data--body-item">
            <td class="csv-table__data--body-item--value" v-if="edit !== i">{{ csv.name }}</td>
            <td class="csv-table__data--body-item--value" v-else>
              <input required type="text" class="input " v-model="csv.name" placeholder="Name" />
            </td>
            <td class="csv-table__data--body-item--value" v-if="edit !== i">{{ csv.x || 0 }}</td>
            <td class="csv-table__data--body-item--value" v-else>
              <input required type="number" name="x" min="1" step="1" class="input " v-model.number="csv.x" placeholder="X Value" />
            </td>
            <td class="csv-table__data--body-item--value" v-if="edit !== i">{{ csv.y || 0 }}</td>
            <td class="csv-table__data--body-item--value" v-else>
              <input required type="number" name="y" min="1" step="1" class="input " v-model.number="csv.y" placeholder="Y Value" />
            </td>
            <td class="csv-table__data--body-item--value" v-if="edit !== i">{{ csv.z || 0 }}</td>
            <td class="csv-table__data--body-item--value" v-else>
              <input required type="number" name="z" min="1" step="1" class="input " v-model.number="csv.z" placeholder="Z Value" />
            </td>
            <td class="csv-table__data--body-item--value" v-if="edit !== i">{{ csv.type || "3DGCP" }}</td>
            <td class="csv-table__data--body-item--value" v-else>
              <div class="is-relative input">
                <p class="is-flex is-vcenter is-pointer" @click="type_active = !type_active">
                  {{ csv.type || "3DGCP" }}
                  <sh-icon :name="`${type_active ? 'expand' : 'collapse'}`" class="is-16x16 ml-5 is-pointer"></sh-icon>
                </p>
                <div style="top:4rem" class="is-absolute has-background-white border-radius-10 box-shadow  is-bordered" v-if="type_active">
                  <p
                    class="is-pointer padding-10 hover-background"
                    v-for="option in ['3DGCP', '2DGCP', 'CheckPoint', 'MTP']"
                    :selected="option == csv.type"
                    :key="option"
                    :value="option"
                    @click="
                      csv.type = option;
                      type_active = false;
                    "
                  >
                    {{ option }}
                  </p>
                </div>
              </div>
            </td>

            <td class="csv-table__data--body-item--value">
              <span class="pr-10">{{ csv_marks[csv.name] ? csv_marks[csv.name].length : 0 }}</span>
            </td>

            <td class="csv-table__data--body-item--action">
              <sh-icon
                :name="'edit-box'"
                class="is-20x20 mr-10"
                :class="[add_new_row ? 'is-not-allowed' : 'is-pointer']"
                v-if="edit != i"
                @click.native="editRow(i)"
              >
              </sh-icon>

              <i
                class="fa fa-save has-text-success is-pointer mr-10"
                v-else
                @click="
                  edit = -1;
                  csvs = Object.assign([], csvs);
                "
              ></i>
              <sh-icon :name="'delete-2'" class="is-20x20" :class="[add_new_row ? 'is-not-allowed' : 'is-pointer']" @click.native="deleteCSV(i)">
              </sh-icon>
            </td>
          </tr>
          <tr class="csv-table__data--body-item">
            <td
              colspan="100"
              v-if="!add_new_row"
              @click="add_new_row = true"
              class="csv-table__data--body-item--add-new"
              :class="[edit != -1 ? 'has-text-grey is-not-allowed' : null]"
            >
              <p class="sh-button sh-button--inverted has-text-dark sh-button--small">
                <i class="fas fa-plus mr-10"></i>
                <span>Add More</span>
              </p>
            </td>
          </tr>
          <tr class="csv-table__data--body-item" v-if="add_new_row">
            <td class="csv-table__data--body-item--value">
              <input required type="text" class="input " placeholder="Name" v-model="new_row.name" />
            </td>
            <td class="csv-table__data--body-item--value">
              <input required type="number" name="x" min="1" step="1" class="input " placeholder="X Value" v-model="new_row.x" />
            </td>
            <td class="csv-table__data--body-item--value">
              <input required type="number" name="y" min="1" step="1" class="input " placeholder="Y Value" v-model="new_row.y" />
            </td>
            <td class="csv-table__data--body-item--value">
              <input required type="number" name="z" min="1" step="1" class="input " placeholder="Z Value" v-model="new_row.z" />
            </td>
            <div class="is-relative input">
              <p class="is-flex is-vcenter is-pointer" @click="type_active = !type_active">
                {{ new_row.type }}
                <sh-icon :name="`${type_active ? 'expand' : 'collapse'}`" class="is-16x16 ml-5 is-pointer"></sh-icon>
              </p>
              <div style="top:4rem" class="is-absolute has-background-white border-radius-10 box-shadow  is-bordered" v-if="type_active">
                <p
                  class="is-pointer padding-10 hover-background"
                  v-for="option in ['3DGCP', '2DGCP', 'CheckPoint', 'MTP']"
                  :selected="option == csv.type"
                  :key="option"
                  :value="option"
                  @click="
                    new_row.type = option;
                    type_active = false;
                  "
                >
                  {{ option }}
                </p>
              </div>
            </div>
            <td class="csv-table__data--body-item--value">
              <input required type="number" name="marks" min="1" disabled step="1" class="input " placeholder="Marks" v-model="new_row.marks" />
            </td>

            <td class="csv-table__data--body-item--action">
              <i
                class="fas fa-check"
                v-tooltip="{ content: can_add_csv ? null : 'Please fill in all the fields', html: false }"
                :class="[can_add_csv ? 'has-text-info is-pointer' : 'has-text-grey is-not-allowed']"
                @click="addCSV"
              ></i>

              <i class="fas fa-times is-pointer has-text-danger" @click="add_new_row = false"></i>
            </td>
          </tr>
        </tbody>
      </table>
      <keep-alive v-else>
        <gcpmap :gcp.sync="csv_file" :process.sync="process"></gcpmap>
      </keep-alive>
      <div class="is-flex is-end mt-20">
        <div class="sh-buttons-group">
          <button
            class="sh-button sh-button--inverted"
            @click="$emit('resume-processing')"
            :class="{ 'is-disabled': process_status != 'finished' && process_status != 'failed' }"
            v-if="is_resume"
          >
            <i class="fa fa-play mr-5"></i>
            Resume Processing
          </button>
          <button
            v-else
            class="sh-button sh-button--inverted"
            @click="$emit('start-processing', no_of_images || 0)"
            :class="[
              { 'is-disabled': process_status != 'pending' && gcp_status == 'mark' },
              { 'is-disabled': process_status == 'finished' || process_status == 'failed' },
            ]"
          >
            <i class="fa fa-play mr-5"></i>
            Start Processing
          </button>
          <button class="sh-button" @click="saveFileChanges" :class="{ 'is-disabled': is_resume }">
            <i class="fa fa-save mr-5"></i>
            Save Changes
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import { processingService, uploadService } from "@/desktop/shared/services/";

  import gcpmap from "./map";

  export default {
    props: ["process_status", "gcp_status", "is_resume", "process", "no_of_images"],
    components: {
      gcpmap,
    },
    data() {
      return {
        tableView: true,
        dropFile: null,
        refreshing: false,
        edit: -1,
        csvs: null,
        success_msg: null,
        marks: 0,
        data_updated: false,
        add_new_row: false,

        type_active: false,
        new_row: {
          name: null,
          x: null,
          y: null,
          z: null,
          marks: 0,
          type: "3DGCP",
        },
        get_marks_api: process.env.VUE_APP_PROCESSING_API_HOST,
      };
    },

    async created() {
      let result = await processingService.get_gcp({ id: this.$route.params.id }).catch((err) => this.handleErrors(err));
      this.csvs = result.gcp;

      let { marks } = await processingService.get_marks({ id: this.$route.params.id }).catch((err) => this.handleErrors(err));
      this.marks = marks;

      this.get_image_report();
    },

    methods: {
      async get_image_report() {
        if (this.$store.state.processing.image_report) return;

        let { results } = await uploadService.get_reports({
          id: this.process.project_id,
        });

        let image_report = results.find((r) => r.report_type == "images");
        this.$store.commit("processing/SET_IMAGE_REPORT", image_report);
      },
      deleteDropFile() {
        this.dropFile = null;
      },
      deleteCSV(i) {
        if (this.edit == -1 && !this.add_new_row) {
          this.csvs.splice(i, 1);
        }
      },
      addCSV() {
        if (this.edit == -1 && this.can_add_csv) {
          this.csvs.push(this.new_row);
          this.edit = -1;
          this.new_row = {
            name: null,
            x: null,
            y: null,
            z: null,
            marks: 0,
            type: "3DGCP",
          };
          this.add_new_row = false;
        }
      },

      editRow(row) {
        if (!this.add_new_row) this.edit = row;
      },

      readFile() {
        const Papa = require("papaparse");
        Papa.parse(this.dropFile, {
          delimiter: "", // auto-detect
          newline: "", // auto-detect
          quoteChar: '"',
          escapeChar: '"',
          error: undefined,
          download: false,
          header: true,
          skipEmptyLines: true,
          comments: true,

          delimitersToGuess: [",", "\t", "|", ";", Papa.RECORD_SEP, Papa.UNIT_SEP],

          complete: (results) => {
            this.csvs = results.data;
          },
        });
      },
      async saveFileChanges() {
        let saved = await processingService
          .post_gcp({
            id: this.$route.params.id,
            body: {
              gcp: this.csvs,
            },
          })
          .catch((err) => this.handleErrors(err));
        if (saved) this.$toast.show("Updated Sucessfully", "", this.$store.state.izitoast_options.appSuccess);
        this.data_updated = true;
      },

      async refresh_data() {
        if (this.dropFile && !this.data_updated) {
          this.$toast.show("Please save the changes first", "", this.$store.state.izitoast_options.appWarning);
        } else {
          this.refreshing = true;
          let { data } = await processingService.get_gcp({ id: this.$route.params.id }).catch((err) => this.handleErrors(err));

          this.csvs = data.gcp;
          this.$toast.show("Data Updated", "", this.$store.state.izitoast_options.appSuccess);
          this.refreshing = false;
        }
      },
    },
    computed: {
      csv_file() {
        return this.csvs;
      },
      csv_marks() {
        return _.groupBy(this.marks, "gcp_name");
      },
      can_add_csv() {
        if (this.new_row.name && this.new_row.x && this.new_row.y && this.new_row.z) {
          return true;
        } else {
          return false;
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
  .upload_file {
    width: max-content;
    margin: auto;
  }

  .is-not-allowed {
    cursor: not-allowed;
  }

  .marks_cell {
    color: black;
    &:hover {
      i {
        color: $red;
      }
    }
  }

  .has-background-transparent {
    background-color: transparent;
  }
  .gcp {
    background: $white;
    border-radius: 1rem;
    padding: 5rem;

    .upload_file {
      background: #f9fafd;
    }
  }

  .csv-table {
    &__buttons {
      padding: 2rem 0;
      display: flex;
      justify-content: space-between;
      &--view,
      &--actions {
        display: flex;
        align-items: center;
      }
      &--actions {
        display: flex;
        align-items: center;
        .action-buttons {
          background: $white;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1.4rem;
        }
      }
      &--view {
        padding: 1rem 2rem;
        background: $white;
        border: 1px solid #ddd;
        border-radius: 5px;
        .action-buttons {
          background: $white;
          border: none;
          font-size: 1.4rem;
          color: $secondary-text;
          display: flex;
          align-items: center;

          padding: 0.5rem 0.8rem;
          &:hover {
            cursor: pointer;
          }
          &--active {
            background: $secondary-text;
            color: $white;
            border-radius: 0.5rem;
          }
        }
      }
    }
    &__data {
      background: $white;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 1rem;
      width: 100%;
      &--header {
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
        border-bottom: 1px solid #ddd;
        &-item {
          padding: 1.5rem;
          font-size: 1.6rem;
          font-weight: 600;
        }
      }
      &--body {
        &-item {
          &--value {
            height: 1.9rem;
            font-family: Barlow-Medium;
            font-size: 1.6rem;
            font-weight: 500;
            line-height: 1.19;
            color: $primary-text;
            padding: 1.5rem;
            width: 16%;
            text-transform: capitalize;
            input {
              padding: 1rem;
              &::placeholder {
                font-size: 1.6rem;
              }
            }
          }
          &--action {
            font-size: 1.8rem;
            padding: 1.5rem;
            display: flex;
            justify-content: space-evenly;
            i:hover {
              color: $primary;
            }

            .i-edit {
              font-weight: 400 !important;
            }
          }
          &--add-new {
            padding: 2rem;
            p {
              display: block;
              width: 13rem;
            }
          }
        }
      }
    }
  }

  .process {
    animation: processing 5s infinite normal linear both 0s;
  }

  @keyframes processing {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
