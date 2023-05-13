// Import Third-party Dependencies
import { Ok, Err, Result } from "@openally/result";
import * as npm from "@npm/types";

// Import Internal Dependencies
import WarningInstanciator from "../../class/WarningInstanciator.js";
import * as warningsI18n from "./warnings/index.js";
import * as types from "../../types.js";
import * as utils from "./utils.js";
import { ExecutorPolicyOptions } from "../../class/Executor.js";

type PackageJsonExtended = npm.PackageJson & {
  type?: "script" | "module";
}

export interface PackageJSONOptions {
  /**
   * Authorize SemVer 0.x.x
   * @default true
   */
  authorizeSemverZero?: boolean;
  /**
   * @default any
   */
  type?: "any" | "module" | "script";
  scripts?: Record<string, string | null>;
}

export class PackageJSON extends WarningInstanciator<typeof warningsI18n.english> {
  static DEFAULT: Required<PackageJSONOptions> = {
    authorizeSemverZero: true,
    type: "any",
    scripts: {}
  };

  private config: Required<PackageJSONOptions>;
  private packageJSON: PackageJsonExtended;

  constructor(
    packageJSON: npm.PackageJson,
    options: PackageJSONOptions,
    i18n: string | null
  ) {
    super(
      i18n === null ? warningsI18n.english : (warningsI18n?.[i18n] ?? warningsI18n.english)
    );
    this.file = "package.json";

    this.config = Object.assign(PackageJSON.DEFAULT, options);
    this.packageJSON = packageJSON;
  }

  private assertVersion() {
    if (this.config.authorizeSemverZero) {
      return Ok(void 0);
    }

    return this.packageJSON.version.startsWith("0.") ?
      Err(this.getBaseWarningFromCode("VERO")) :
      Ok(void 0);
  }

  private assertType(expectedType = "any") {
    const type = this.packageJSON.type ?? "script";
    if (expectedType === "any" || type === expectedType) {
      return Ok(void 0);
    }

    return Err(
      this.getBaseWarningFromCode("TYPE", { expectedType, type })
    );
  }

  private* assertScripts() {
    const expectedScripts = new Map(Object.entries(this.config.scripts));
    if (expectedScripts.size === 0) {
      return;
    }

    const scripts = this.packageJSON.scripts ?? {};
    for (const [expectedScriptName, expectedScriptValue] of expectedScripts) {
      if (expectedScriptName in scripts) {
        if (expectedScriptValue === null) {
          continue;
        }
        const scriptValue = scripts[expectedScriptName];

        if (!expectedScriptValue.match(scriptValue)) {
          yield Err(this.getBaseWarningFromCode("INVALID_SCRIPT", { expectedScriptName }));
        }
      }
      else {
        yield Err(this.getBaseWarningFromCode("MISSING_SCRIPT", { expectedScriptName }));
      }
    }
  }

  getWarnings(): types.Warning[] {
    return [
      this.assertVersion(),
      this.assertType(this.config.type),
      ...this.assertScripts()
    ].flatMap((result) => (result.err ? [result.val] : []));
  }
}

export const name = "package-json";

export async function main(
  workingDir: string,
  config: PackageJSONOptions,
  executorOptions: ExecutorPolicyOptions
): Promise<Result<types.Warning[], Error>> {
  const { i18n } = executorOptions;

  return (await utils.safeReadPackageJSON(workingDir))
    .mapErr((cause) => new Error("Unable to read and/or parse package.json", { cause }))
    .map((json) => (new PackageJSON(json, config, i18n)).getWarnings());
}
