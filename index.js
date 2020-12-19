// Import Node.js Dependencies
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Import Third-party Dependencies
import Config from "@slimio/config";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kNodelintUserConfigSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "src", "configuration.schema.json"), "utf-8"));

export async function load(location = process.cwd()) {
    const cfg = new Config(path.join(location, "nodelint"), {
        autoReload: false,
        createOnNoEntry: false,
        defaultSchema: kNodelintUserConfigSchema
    });

    await cfg.read();

    const content = cfg.payload;
    console.log(content);
}
