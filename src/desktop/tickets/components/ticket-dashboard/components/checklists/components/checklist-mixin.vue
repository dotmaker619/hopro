

<script>

export default {
    methods: {
        get_assignees(checklist){
            if(!checklist.items.length){
                return;
            }else {
                checklist.items.forEach(item=>{
                this.get_children(item)
                    if(!item.assignee){
                        return;
                    }else {
                        this.assignees.push(item.assignee)
                    }
                })
            }
        },
        get_children(item){
            if(!item.children){
                return;
            }else {
                item.children.forEach(item=>{
                    this.get_children(item);
                    if(!item.assignee){
                        return ;
                    }else {
                        this.assignees.push(item.assignee);
                    }
                })
            }
        },
        async update_checklist(obj){
            this.checklist.bookmark = obj.bookmark;
            await this.service.update_checklist_template({
                checklist_id: this.checklist.uid,
                body: obj,
            })
            .then(()=>{
                // this.$emit('refresh_checklist_template')
            })
            .catch(err => console.log(err));
        },
        getUsers(){
            return _.uniqBy(this.assignees,(a)=>a.uid)
        }
    }
}
</script>

<style>

</style>