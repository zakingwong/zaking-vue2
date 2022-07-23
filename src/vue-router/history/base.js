function createRoute(record, location) {
  let matched = [];
  if (record) {
    while (record) {
      matched.unshift(record);
      record = record.parent;
    }
  }
  return {
    ...location,
    matched,
  };
}
function runQueue(queue, from, to, cb) {
  function next(index) {
    if (index >= queue.length) return cb();
    let hook = queue[index];
    hook(from, to, () => next(index + 1));
  }
  next(0);
}
class Base {
  constructor(router) {
    this.router = router;
    this.current = createRoute(null, {
      path: "/",
    });
  }
  transitionTo(location, listener) {
    let record = this.router.match(location);
    let route = createRoute(record, { path: location });
    if (
      location === this.current.path &&
      route.matched.length === this.current.matched.length
    ) {
      return;
    }
    let queue = [].concat(this.router.beforeEachHooks);
    runQueue(queue, this.current, route, () => {
      this.current = route;
      listener && listener();
      this.cb && this.cb(route);
    });
  }
  listen(cb) {
    this.cb = cb;
  }
}

export default Base;
