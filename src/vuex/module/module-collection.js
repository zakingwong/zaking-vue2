import { forEachValue } from "../util";
import Module from "./module";

export default class ModuleCollection {
  constructor(options) {
    this.root = null;
    this.register([], options);
  }
  register(path, rootModule) {
    let newModule = new Module(rootModule);
    if (this.root == null) {
      this.root = newModule;
      console.log(this.root, "this.root");
    } else {
      let parent = path.slice(0, -1).reduce((start, current) => {
        // return start._children[current];
        return start.getChild(current);
      }, this.root);
      // parent._children[path[path.length - 1]] = newModule;
      parent.addChild(path[path.length - 1], newModule);
    }
    if (rootModule.modules) {
      forEachValue(rootModule.modules, (moduleName, moduleValue) => {
        this.register(path.concat(moduleName), moduleValue);
      });
    }
  }
}
