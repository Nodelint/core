import * as packageJson from "./package-json/index.js";
import * as gitIgnore from "./gitignore/index.js";

export type Configurations = {
  packageJson: packageJson.PackageJSONOptions,
  gitIgnore: gitIgnore.GitIgnoreOptions
}

export {
  packageJson,
  gitIgnore
};
