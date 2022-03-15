function initState(vm) {}

function Vue(options) {
  console.log(this);
  this._init(options);
}
Vue.prototype._init = function (options) {
  const vm = this;
  vm.$options = options;
  initState(vm);
};
var vm = new Vue({
  data: 1,
});
