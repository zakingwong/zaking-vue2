import { observe } from "./observe/index";
export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    // 我们再看初始化Data。后续这里还会有一堆初始化
    initData(vm);
  }
}
// 我们先来看proxy，其实啥也没干，就是通过defineProperty
// 在vm实例上，绑定了_data，也就是data中的所有的属性，
// 这样之后我们就可以直接在vm上拿到data中的数据了。
// 这也是为什么我们在vue项目里，可以通过this.xxx拿到data中的xxx的原因了。
// 我们来分析下proxy这个方法。
// 我们传入的是vm，_data,以及_data中的key
function proxy(vm, target, key) {
  // 此时，我们给vm上绑定key
  Object.defineProperty(vm, key, {
    // 那么我们取值的时候，实际上是取得vm._data[key]上的值
    get() {
      return vm[target][key];
    },
    set(nv) {
      // 我们设置值得时候，实际上也是给vm._data[key]上，设置值
      // 这样，我们就形成了vm.xxx实际上是vm._data.xxx得代理
      // 修改实例上中data内的属性，实际上就是修改了vm._data中的属性
      vm[target][key] = nv;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;
  // 这里做了一个有趣的事情，也就是说，你可以在data中有一个参数，这个参数就是vm
  // 但是，会有一些神奇的事情，比如，你打印vm.name是undefined，打印vm却是有的。
  // 这是为啥呢？
  // 继续说，这里的data.call。就执行了data()方法，但是执行的时候，下面的observe和proxy都没执行呢，所以vm上肯定没有属性吖。
  // 如果data是函数，那么就执行下，把它赋值给data变量。
  data = typeof data === "function" ? data.call(vm, vm) : data;
  vm._data = data;
  // 然后，我们通过observe来观测它
  observe(data);
  // 然后，我们通过proxy，在vm上，绑定data中的属性
  for (let key in data) {
    proxy(vm, "_data", key);
  }
}
