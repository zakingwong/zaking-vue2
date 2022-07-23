import Base from "./base";

class BrowserHistory extends Base {
  constructor(router) {
    super(router);
  }
  setupListener() {
    window.addEventListener("popstate", () => {
      this.transitionTo(window.location.pathname);
    });
  }
  getCurrentLocation() {
    return window.location.pathname;
  }
  push(location) {
    this.transitionTo(location, () => {
      window.history.pushState({}, "", location);
    });
  }
}

export default BrowserHistory;
