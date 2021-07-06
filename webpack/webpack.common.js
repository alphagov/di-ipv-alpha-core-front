const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const MomentTimezoneDataPlugin = require("moment-timezone-data-webpack-plugin");

const serverConfig = {
  entry: ["./app/server.ts"],
  target: "node",
  output: {
    path: path.resolve(__dirname, "../build"),
    filename: "[name].js",
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
        exclude: /node_modules/,
      },
    ],
  },
};

const clientConfig = {
  entry: ["./client/main.ts", "./app/assets/scss/application.scss"],
  watch: true,
  target: "web",
  output: {
    path: path.resolve(__dirname, "../build"),
    filename: "all.js",
  },
  resolve: {
    extensions: [".ts", ".js", "scss"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.scss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
          "style-loader",
          MiniCSSExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new MomentTimezoneDataPlugin({
      matchZones: "Europe/London",
    }),
    new CopyWebpackPlugin([
      { from: path.resolve("static/"), to: "" },
      {
        from: path.resolve("node_modules/govuk-frontend/govuk/assets/"),
        to: "assets",
      },
      { from: path.resolve("app/assets/images/"), to: "assets/images" },
    ]),
    new MiniCSSExtractPlugin({
      filename: "style.css",
    }),
  ],
};

const commonConfig = {
  server: serverConfig,
  client: clientConfig,
};

module.exports = commonConfig;
