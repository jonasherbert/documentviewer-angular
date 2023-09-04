import * as webpack from "webpack";
import {
  CustomWebpackBrowserSchema,
  TargetOptions,
} from "@angular-builders/custom-webpack";
import CopyPlugin from "copy-webpack-plugin";
import { loadEnvVars } from "./utils/load-env-vars";

// Read .env file, parse the contents, assign it to process.env
require("dotenv").config();

// Edit/extend webpack configuration
export default (
  config: webpack.Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  const envVars = loadEnvVars(targetOptions.configuration || "");

  config.plugins = config.plugins || [];
  config.plugins.push(
    // Replaces variables in the code with other values or expressions at compile time
    new webpack.DefinePlugin(envVars),
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
