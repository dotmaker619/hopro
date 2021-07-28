<script>
  export default {
    data() {
      return {
        colorPalette: {
          tag: ["#ffa22f", "#ff5722", "#f9306d", "#4169e1", "#7b69ee", "#5f81ff", "#0ab5ff", "#07c7e0", "#07a192", "#2ea62d", "#202020"],
          avatar: ["$primary", "#53cae0", "#ffa16c", "#8dbd8c", "#de6f92"],
          userManagement: ["#A461D8", "#FFA22F", "#FF5722", "#0AB5FF", "#FF01FC"],
          projectManagement: ["#454B6C", "#5F81FF", "#F9306D", "#07A192", "#82C43C"],
        },
      };
    },
    methods: {
      hash_code(s) {
        if (s && s.length) {
          for (var i = 0, h = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
          return Math.abs(h);
        }
      },

      hashed_color(text, category) {
        return this.colorPalette[category][this.hash_code(text) % (this.colorPalette[category].length - 1)];
      },
    },
  };
</script>
