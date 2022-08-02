<template>
  <div class="bar">
    <h2>Bar</h2>
    <button @click="handlerClick">Click Bar</button>
  </div>
</template>
<script>
export default {
  methods: {
    handlerClick() {
      console.log("I am Bar");
    },
  },
};
</script>
<style>
.bar h2 {
  color: red;
}
</style>