<template>
  <div class="about">
    <h1>This is an about page</h1>
    <router-link to="/about/a">切换a</router-link>
    <router-link to="/about/b">切换b</router-link>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name:"About",
  mounted(){
    console.log(this.$router)
  }
}
</script>