function Vue(options) {
  let data = options.data;
  const vm = this;
  data = typeof data === "function" ? data.call(vm, vm) : data;
  vm._data = data;
  // console.log(Object.prototype.toString.call(data));
  // console.log(data.call(this).a());
  // console.log(data.call({ age: 100 }).a());
}

const vm = new Vue({
  data(vm) {
    setTimeout(() => {
      console.log(vm, "vm---");
      console.log(vm._data);
    }, 0);
    return {
      name: "zf",
      age: 20,
      a: function () {
        return this.age;
      },
    };
  },
});
