import * as webpack from "webpack";
import {
  CustomWebpackBrowserSchema,
  TargetOptions,
} from "@angular-builders/custom-webpack";
import CopyPlugin from "copy-webpack-plugin";

// Edit/extend webpack configuration
export default (
  config: webpack.Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  config.plugins = config.plugins || [];
  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: "./node_modules/@pdftron/webviewer/public/core/",
          to: "assets/pdftron",
        },
      ],
    })
  );
  return config;
};
