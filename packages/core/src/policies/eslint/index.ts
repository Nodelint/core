// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import { Err, Result, None, Some, Option } from "@openally/result";

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
  private rc: rc.EslintRC;

  constructor(
    rc: rc.EslintRC,
    options: EslintOptions,
    i18n: string | null
  ) {
    super(
      i18n === null ? warningsI18n.english : (warningsI18n?.[i18n] ?? warningsI18n.english)
    );

    this.config = Object.assign(EslintRC.DEFAULT, options);
    this.rc = rc;
  }

  private hasRule(): Option<types.Warning> {
    const numberOfRules = Object.keys(this.rc?.rules ?? {}).length;

    if (!this.config.allowRules && numberOfRules > 0) {
      return Some(this.getBaseWarningFromCode("NORULES"));
    }

    return None;
  }

  getWarnings(): types.Warning[] {
    return [
      this.hasRule()
    ].flatMap((option) => (option.some ? [option.safeUnwrap()] : []));
  }
}

export const name = "eslint";

export async function main(
  workingDir: string,
  config: EslintOptions,
  executor: Executor
): Promise<Result<types.Warning[], Error>> {
  const { i18n } = executor;

  const rcFileName = [".eslintrc", ".eslintrc.js", ".eslintrc.json"]
    .find((fileName) => executor.hasFile(fileName));
  if (!rcFileName) {
    return Err(new Error("Unable to found any eslint runtime configuration file"));
  }

  return (await rc.read(path.join(workingDir, rcFileName)))
    .map((rc) => {
      const eslintRc = new EslintRC(rc, config, i18n);
      eslintRc.file = rcFileName;

      return eslintRc.getWarnings();
    });
}
