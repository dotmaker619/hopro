<template>
  <div class="email ">
    <div v-for="(item, i) in items" :key="item" class="is-flex is-vcenter mt-15 ml-30">
      <input class="radio" name="radio" :value="item + i" type="radio" />
      <label class="ml-10" :for="item + i">{{ item }}</label>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        showPopup: false,
        id: 0,
        items: ["red", "green", "blue"],
      };
    },
    methods: {
      showPopupFunc() {
        if (this.showPopup) {
          this.showPopup = false;
        } else {
          this.showPopup = true;
        }
      },
      addOption() {
        this.items.push("checkbox");
      },
      addOption() {
        this.id++;
        this.items.push({ tyep: "checkbox", icon: false, id: this.id });
        console.log(this.items);
      },
      showIcon(id) {
        for (var i = 0; i < this.items.length; i++) {
          this.items[i].icon = false;
        }
        for (var i = 0; i < this.items.length; i++) {
          if (this.items[i].id == id) {
            this.items[i].icon = true;
          }
        }
      },
      clearIcon() {
        for (var i = 0; i < this.items.length; i++) {
          this.items[i].icon = false;
        }
      },
      delElement(id) {
        for (var i = 0; i < this.items.length; i++) {
          if (this.items[i].id == id) {
            this.items.splice(i, 1);
          }
        }
      },
    },
  };
</script>

<style scoped>
  .option {
    border-top: 1px solid #000;
    padding: 10px;
    display: flex;
    justify-content: flex-end;
  }
  .optionArrange {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 20%;
    border: 3px solid rgb(65, 41, 201);
    border-radius: 10px;
    padding-left: 10px;
    padding-right: 10px;
    position: relative;
  }
  .popup {
    position: absolute;
    background-color: #fff;
    top: 45px;
    right: -85px;
    box-shadow: 1px 1px 3px;
    border-radius: 3px;
    align-items: center;
    padding: 5px;
  }
  .popup > p:hover {
    background-color: thistle;
    cursor: pointer;
  }
  .addBtn {
    position: absolute;
    border: 3px solid rgb(65, 41, 201);

    top: 94%;
    left: 45%;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 10px;
    padding-right: 10px;
  }
  .borderStyle {
    border: 3px solid rgb(65, 41, 201);
  }
  .border {
    border-top: 1px dashed #000;
  }
  .middlesub {
    display: flex;
    align-items: center;
  }
  .subArrange {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 30%;
  }
  .subArrange1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
  }
  .arrange {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 38%;
    margin-left: 30px;
    padding-bottom: 20px;
  }
  .imgSize {
    width: 10px !important;
    cursor: pointer;
  }
  .flexEnd {
    display: flex;
    align-items: flex-end;
  }
  /* .email {
    position: relative;
    width: 800px;
    background: white;
    box-shadow: 0px 2px 4px #171e481a;
    margin-bottom: 25px;
    box-sizing: border-box;
  } */
  .title {
    border-bottom: 1px dashed #5b607e;
    opacity: 1;
    width: 300px;
  }
  #input {
    border: 0px;
    box-shadow: none;
    padding: 2px;
  }
  .column {
    padding: 20px;
  }
  .text {
    position: absolute;
    margin-left: 5px;
    display: inline;
  }
  img {
    width: 24px;
    height: 24px;
  }
</style>
