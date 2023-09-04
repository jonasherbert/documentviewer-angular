/* eslint-disable import/exports-last, func-style, prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-use-before-define */

/*
 * ###############
 * Loads environment variables depending on the Angular configuration into a target object translating the key.
 * See load-env-vars-config.ts for configuration.
 * ###############
 */

import { ENV_VARS_CONFIG } from "./load-env-vars-config";

export type EnvVarsConfig = Record<string, Array<EnvVarItem>>;
export type EnvVarItem = {
  key: string;
  target: string;
  required: boolean;
  valueIfNotSet?: any;
};

/**
 * Loads environment variables depending on the Angular configuration into a target object translating the key.
 * Throws an error if the configuration is unknown or a required key is not present.
 * @param configuration An Angular configuration
 * @returns An object containing the mapped keys and environment values
 */
export function loadEnvVars(configuration: string): Record<string, string> {
  const envVarItems: Array<EnvVarItem> | undefined =
    loadEnvVarItems(configuration);
  if (envVarItems) {
    return loadVarsFromEnv(envVarItems, configuration);
  }

  return {};
}

function loadEnvVarItems(configuration: string): Array<EnvVarItem> | undefined {
  if (configuration in ENV_VARS_CONFIG) {
    return ENV_VARS_CONFIG[configuration];
  }

  return undefined;
}

function loadVarsFromEnv(
  envVarItems: Array<EnvVarItem>,
  configuration: string,
): Record<string, string> {
  const resultVars: Record<string, string> = {};
  let error = false;
  for (const envVarItem of envVarItems) {
    const envVarVal: string | undefined = process.env[envVarItem.key];
    if (envVarVal) {
      resultVars[envVarItem.target] = `"${envVarVal}"`;
      // eslint-disable-next-line no-prototype-builtins
    } else if (envVarItem.hasOwnProperty("valueIfNotSet")) {
      resultVars[envVarItem.target] = envVarItem.valueIfNotSet;
    } else if (envVarItem.required) {
      console.error(`\nEnvironment variable "${envVarItem.key}" is required`);
      error = true;
    }
  }
  if (error) {
    throw new Error(
      `Missing environment variables for configuration "${configuration}"`,
    );
  }

  return resultVars;
}
