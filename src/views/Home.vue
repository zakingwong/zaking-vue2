<template>
  <div class="home">
    Home Page
    <router-link to="/a">切换a</router-link>
    <router-link to="/b">切换b</router-link>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name:"Home",
  mounted(){
    console.log(this.$router)
  }
}
</script>