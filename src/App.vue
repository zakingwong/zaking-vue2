<template>
  <div id="app">
    <Foo></Foo>
    <Bar></Bar>
  </div>
</template>
<script>
import Foo from "./components/Foo";
import Bar from "./components/Bar";

export default {
  components: {
    Foo,
    Bar,
  },
};
</script>