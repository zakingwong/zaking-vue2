import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
function Vue(options) {
  // 这个this，指的的vm，也就是Vue的实例
  this._init(options);
}

initMixin(Vue);
initLifeCycle(Vue);
export default Vue;
