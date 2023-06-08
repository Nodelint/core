// Import Third-party Dependencies
import { Ok, Err, Result } from "@openally/result";

// Import Internal Dependencies
import * as types from "../../types.js";
import * as utils from "./utils.js";
import { Executor } from "../../class/Executor.js";

export const name = "gitignore";

export interface EditorConfigOptions {
  /**
   * @default true
   */
  failIfMissing?: boolean;
}

export async function main(
  workingDir: string,
  config: EditorConfigOptions,
  executor: Executor
): Promise<Result<types.Warning[], Error>> {
  const {
    failIfMissing = true
  } = config;

  if (executor.hasFile(".editorconfig")) {
    const result = await utils.safeReadEditorConfig(workingDir);
    console.log(result.val);

    return Ok([]);
  }
  else if (failIfMissing) {
    return Err(new Error("missing .editorconfig file"));
  }

  return Ok([]);
}

