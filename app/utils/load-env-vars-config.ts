import type { EnvVarsConfig } from "./load-env-vars";

export const ENV_VARS_CONFIG: EnvVarsConfig = {
  production: [
    {
      key: "PDFTRON_LICENSE_KEY",
      target: "__PDFTRON_LICENSE_KEY__",
      required: true,
    },
  ],
  development: [
    {
      key: "PDFTRON_LICENSE_KEY",
      target: "__PDFTRON_LICENSE_KEY__",
      required: true,
    },
  ],
  local: [
    {
      key: "PDFTRON_LICENSE_KEY",
      target: "__PDFTRON_LICENSE_KEY__",
      required: true,
    },
  ],
};
