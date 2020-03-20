<template>
   <div :style="{ height: pageHeight + 'px'}">
      <router-view/>
   </div>
</template>
<script>
   import { mapState } from "vuex";
    export default {
       computed: {
          ...mapState([
            "pageHeight",
          ])
       },
       data(){
         return{

         }
       }
    }
</script>



