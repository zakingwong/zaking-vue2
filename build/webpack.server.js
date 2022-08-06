const base = require("./webpack.base");
const { merge } = require("webpack-merge");
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");

const path = require("path");
const resolve = (dir) => {
  return path.resolve(__dirname, dir);
};
module.exports = merge(base, {
  entry: {
    server: resolve("../src/server-entry.js"),
  },
  target: "node",
  output: {
    libraryTarget: "commonjs2",
  },
  plugins: [new VueSSRServerPlugin()],
});
