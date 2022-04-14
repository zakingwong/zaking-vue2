import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";
function Vue(options) {
  this._init(options);
}

Vue.prototype.$nextTick = nextTick;

initMixin(Vue);
initLifeCycle(Vue);
initGlobalAPI(Vue);

// watch.1-1,最终的核心就是这个方法
Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
  // exprOrFn：
  // name 或者是 () => name，我们去Watcher里处理，user代表是用户创建的
  new Watcher(this, exprOrFn, { user: true }, cb);
};

export default Vue;
