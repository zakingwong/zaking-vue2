const base = require("./webpack.base");
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");
const path = require("path");
const resolve = (dir) => {
  return path.resolve(__dirname, dir);
};
module.exports = merge(base, {
  entry: {
    client: resolve("../src/client-entry.js"),
  },
  plugins: [
    new VueSSRClientPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: resolve("../public/index.html"),
      minify: false,
      excludeChunks: ["server"], // 排除引入文件
    }),
  ],
});
