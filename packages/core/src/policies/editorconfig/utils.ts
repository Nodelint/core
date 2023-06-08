// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";

// Import Third-party Dependencies
import ini from "ini";
import { Ok, Err, Result } from "@openally/result";

export async function safeReadEditorConfig(
  location: string
): Promise<Result<any, Error>> {
  try {
    const editorConfigLocation = path.join(location, ".editorconfig");
    const rawStr = await fs.readFile(editorConfigLocation, "utf-8");
    const editorConfig = ini.parse(rawStr);

    return Ok(editorConfig);
  }
  catch (err) {
    return Err(err);
  }
}
