<script>
import prettyFileIcons from "pretty-file-icons";

export default {
    methods: {
      default_image ($event, file_name) {
        $event.target.src=require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(file_name) + '.svg');
      }
    }
}
</script>