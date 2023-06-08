import * as packageJson from "./package-json/index.js";
import * as gitIgnore from "./gitignore/index.js";
import * as editorConfig from "./editorconfig/index.js";
import * as eslintRc from "./eslint/index.js";

export type Configurations = {
  packageJson: packageJson.PackageJSONOptions,
  gitIgnore: gitIgnore.GitIgnoreOptions,
  editorConfig: editorConfig.EditorConfigOptions
  eslintRc: eslintRc.EslintOptions
}

export {
  packageJson,
  gitIgnore,
  editorConfig,
  eslintRc
};
