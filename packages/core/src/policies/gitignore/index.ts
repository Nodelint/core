// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";

// Import Third-party Dependencies
import { Ok, Err, Result } from "@openally/result";

// Import Internal Dependencies
import * as types from "../../types.js";
import { nodejs as nodeTemplate } from "./templates/nodejs.js";
import { Executor } from "../../class/Executor.js";

export const name = "gitignore";

export interface GitIgnoreOptions {
  /**
   * @default true
   */
  failIfMissing?: boolean;
}

export async function main(
  workingDir: string,
  config: GitIgnoreOptions,
  executor: Executor
): Promise<Result<types.Warning[], Error>> {
  const {
    failIfMissing = true
  } = config;

  if (executor.hasFile(".gitignore")) {
    const missingLines = await getMissingGitIgnoreLines(workingDir);
    const warnings: types.Warning[] = [];
    if (missingLines.length > 0) {
      warnings.push({
        code: "MISSING-CONFIG",
        message: `Missing file: ${missingLines.join(" - ")}`,
        file: ".gitignore"
      });
    }

    return Ok(warnings);
  }
  else if (failIfMissing) {
    return Err(new Error("missing .gitignore file"));
  }

  return Ok([]);
}

async function getMissingGitIgnoreLines(
  location: string
) {
  const fileHandle = await fs.open(path.join(location, ".gitignore"));
  const gitIgnoreLines = nodeTemplate.split("\n");

  try {
    for await (const line of fileHandle.readLines({ encoding: "utf-8" })) {
      const index = gitIgnoreLines.indexOf(line);
      if (index !== -1) {
        gitIgnoreLines.splice(index, 1);
      }
    }
  }
  finally {
    await fileHandle.close();
  }

  return gitIgnoreLines
    .filter((line) => line.trim() !== "");
}
