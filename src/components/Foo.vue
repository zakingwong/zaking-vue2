<template>
  <div class="foo">
    <h2>Foo</h2>
    <button @click="handlerClick">Click Foo</button>
  </div>
</template>
<script>
export default {
  methods: {
    handlerClick() {
      console.log("I am Foo");
    },
  },
};
</script>
<style>
.foo h2 {
  color: blue;
}
</style>
