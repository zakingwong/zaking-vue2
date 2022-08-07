<template>
  <div class="bar">
    <h2>Bar</h2>
    <button @click="handlerClick">Click Bar</button>
    <p>store:{{ $store.state.name }}</p>
  </div>
</template>
<script>
export default {
  asyncData(store) {
    return store.dispatch("changeName", "wong");
  },
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