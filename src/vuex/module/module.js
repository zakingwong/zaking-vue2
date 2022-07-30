import { forEachValue } from "../util";
export default class Module {
  constructor(module) {
    this._raw = module;
    this._children = {};
    this.state = module.state;
  }
  addChild(key, module) {
    this._children[key] = module;
  }
  getChild(key) {
    return this._children[key];
  }
  forEachMutation(cb) {
    if (this._raw.mutations) {
      forEachValue(this._raw.mutations, cb);
    }
  }
  forEachAction(cb) {
    if (this._raw.actions) {
      forEachValue(this._raw.actions, cb);
    }
  }
  forEachGetter(cb) {
    if (this._raw.getters) {
      forEachValue(this._raw.getters, cb);
    }
  }
  forEachModule(cb) {
    forEachValue(this._children, cb);
  }
}
