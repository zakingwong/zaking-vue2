import { complierToFcuntion } from "./complier/index";
import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";
function Vue(options) {
  this._init(options);
}

initMixin(Vue);
initLifeCycle(Vue);
initGlobalAPI(Vue);
initStateMixin(Vue);

let render1 = complierToFcuntion(
  `<ul key="x" style="color:red;">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">d</li>
  </ul>`
);
let vm1 = new Vue({ data: { name: "zaking" } });
let prevVNode = render1.call(vm1);

let render2 = complierToFcuntion(
  `<ul key="x" style="background:blue;">
    <li key="b">b</li>
    <li key="m">m</li>
    <li key="a">a</li>
    <li key="p">p</li>
    <li key="c">c</li>
    <li key="q">q</li>
</ul>`
);
let vm2 = new Vue({ data: { name: "wong" } });
let nextVNode = render2.call(vm2);

let el = createElm(prevVNode);
document.body.appendChild(el);
let newEl = createElm(nextVNode);
setTimeout(() => {
  // el.parentNode.replaceChild(newEl, el);
  patch(prevVNode, nextVNode);
}, 1000);

export default Vue;
