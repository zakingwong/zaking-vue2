const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const resolve = (dir) => {
  return path.resolve(__dirname, dir);
};
module.exports = {
  entry: resolve("./src/app.js"),
  mode: "development",
  output: {
    filename: "bundle.js",
    path: resolve("dist"),
  },
  resolve: {
    extensions: [".js", ".vue", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        use: {
          options: {
            presets: ["@babel/preset-env"],
          },
          loader: "babel-loader",
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: resolve("./public/index.html"),
    }),
  ],
};
