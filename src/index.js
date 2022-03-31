import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";
function Vue(options) {
  // 这个this，指的的vm，也就是Vue的实例
  this._init(options);
}

Vue.prototype.$nextTick = nextTick;

initMixin(Vue);
initLifeCycle(Vue);
export default Vue;
