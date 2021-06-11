// Import Node.js Dependencies
import { fileURLToPath } from "url";
import path from "path";

// Import Third-party Dependencies
import { Policy, CONSTANTS } from "@nodelint/policy";

// Import Events
import * as events from "./events/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function* main(ctx) {
    console.log(ctx); // <-- from core
    console.log("execute!");

    yield events.foo.id;
}

// ESM with top level await
const i18n = await Policy.loadi18n(path.join(__dirname, "i18n"));

export default new Policy({
    name: "custom",
    mode: CONSTANTS.Mode.Asynchronous,
    defaultLang: "french",
    scope: [".eslintrc"],
    i18n,
    events,
    main
});