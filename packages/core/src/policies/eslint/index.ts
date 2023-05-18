// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import { Ok, Err, Result } from "@openally/result";

// Import Internal Dependencies
import WarningInstanciator from "../../class/WarningInstanciator.js";
import * as warningsI18n from "./warnings/index.js";
import * as types from "../../types.js";
import * as rc from "./rc.js";
import { Executor } from "../../class/Executor.js";

export interface EslintOptions {
  extends?: string[];
  allowRules?: boolean;
}

export class EslintRC extends WarningInstanciator<typeof warningsI18n.english> {
  static DEFAULT: Required<EslintOptions> = {
    extends: [],
    allowRules: true
  };

  private config: Required<EslintOptions>;
  private rc: any;

  constructor(
    rc: any,
    options: EslintOptions,
    i18n: string | null
  ) {
    super(
      i18n === null ? warningsI18n.english : (warningsI18n?.[i18n] ?? warningsI18n.english)
    );
    this.file = "package.json";

    this.config = Object.assign(EslintRC.DEFAULT, options);
    this.rc = rc;
  }

  getWarnings(): types.Warning[] {
    return [];

    // return [

    // ].flatMap((result) => (result.err ? [result.val] : []));
  }
}

export const name = "eslint";

export async function main(
  workingDir: string,
  config: EslintOptions,
  executor: Executor
): Promise<Result<types.Warning[], Error>> {
  // const { i18n } = executor;

  const rcFileName = [".eslintrc", ".eslintrc.js", ".eslintrc.json"]
    .find((fileName) => executor.hasFile(fileName));
  if (!rcFileName) {
    return Err(new Error("Unable to found any eslint runtime configuration file"));
  }
  const eslintRc = await rc.read(path.join(workingDir, rcFileName));
  if (eslintRc.err) {
    return Err(eslintRc.val);
  }

  return Ok([]);
}
