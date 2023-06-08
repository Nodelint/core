// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";

// Import Third-party Dependencies
import { Ok, Err, Result } from "@openally/result";
import { match } from "ts-pattern";

export type EslintRC = {
  extends?: string | string[];
  parserOptions?: {
    sourceType?: string;
    requireConfigFile?: boolean;
  };
  rules?: Record<string, any>;
};

export async function read(
  location: string
): Promise<Result<EslintRC, Error>> {
  const fileExt = path.extname(location);

  return match(fileExt)
    .with("", () => safeReadJSON(location))
    .with(".json", () => safeReadJSON(location))
    .with(".js", () => safeReadJavascript(location))
    .otherwise(() => Err(new Error(`Unknown file extension '${fileExt}'`)));
}

async function safeReadJSON(
  location: string
): Promise<Result<EslintRC, NodeJS.ErrnoException>> {
  try {
    const rawStr = await fs.readFile(location, "utf-8");
    const rc = JSON.parse(rawStr) as EslintRC;

    return Ok(rc);
  }
  catch (err) {
    return Err(err);
  }
}

async function safeReadJavascript(
  location: string
): Promise<Result<EslintRC, NodeJS.ErrnoException>> {
  try {
    const rc = await import(location);
    console.log(rc);

    return Ok(rc);
  }
  catch (err) {
    return Err(err);
  }
}
