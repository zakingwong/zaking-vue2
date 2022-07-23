import createMatcher from "./create-matcher";
import install, { Vue } from "./install";
import HashHistory from "./history/hash";
import BrowserHistory from "./history/history";
class VueRouter {
  constructor(options) {
    let routes = options.routes || [];
    this.beforeEachHooks = [];
    this.matcher = createMatcher(routes);
    let mode = options.mode;
    if (mode === "hash") {
      this.history = new HashHistory(this);
    } else if (mode === "history") {
      this.history = new BrowserHistory(this);
    }
  }
  match(location) {
    return this.matcher.match(location);
  }
  push(location) {
    return this.history.push(location);
  }
  beforeEach(cb) {
    this.beforeEachHooks.push(cb);
  }
  init(app) {
    let history = this.history;
    history.transitionTo(history.getCurrentLocation(), () => {
      history.setupListener();
    });
    history.listen((newRoute) => {
      app._route = newRoute;
    });
  }
}

VueRouter.install = install;
export default VueRouter;
