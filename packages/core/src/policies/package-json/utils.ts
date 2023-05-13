// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";

// Import Third-party Dependencies
import * as npm from "@npm/types";
import { Ok, Err, Result } from "@openally/result";

export async function safeReadPackageJSON(
  location: string
): Promise<Result<npm.PackageJson, NodeJS.ErrnoException>> {
  try {
    const packageJSONLocation = path.join(location, "package.json");
    const rawPackageStr = await fs.readFile(packageJSONLocation, "utf-8");
    const packageJSON = JSON.parse(rawPackageStr) as npm.PackageJson;

    return Ok(packageJSON);
  }
  catch (err) {
    return Err(err);
  }
}
