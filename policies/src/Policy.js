// Import Node.js Dependencies
import { pathToFileURL } from "url";
import fs from "fs/promises";
import path from "path";

// Import third-party dependencies
import oop from "@slimio/oop";
import rosetta from "rosetta";

// Import internal dependencies
import { Mode, DataEventSymbol } from "./Constants.js";

// CONSTANTS
const kModeSymSet = new Set(Object.values(Mode));
const kDefaultOptions = { mode: Mode.Asynchronous, defaultLang: "english" };

export default class Policy {
    static async loadi18n(i18nDir) {
        const filesInDir = (await fs.readdir(i18nDir, { withFileTypes: true }))
            .filter((dirent) => dirent.isFile() && path.extname(dirent.name) === ".js");

        const allImportPromises = filesInDir
            .map((dirent) => import(pathToFileURL(path.join(i18nDir, dirent.name))));
        const allTranslations = await Promise.all(allImportPromises);

        return rosetta({ ...allTranslations });
    }

    static dataEvent(id, data) {
        if (typeof id !== "symbol") {
            throw new TypeError("id must be a valid Event symbol!");
        }

        const payload = { id, data };
        Reflect.defineProperty(payload, DataEventSymbol, { value: true, enumerable: false });

        return payload;
    }

    constructor(options = Object.create(null)) {
        options = Object.assign({}, kDefaultOptions, options);
        if (!kModeSymSet.has(options.mode)) {
            throw new TypeError("options.mode must be a valid Policy mode (Asynchronous or Synchronous).");
        }

        this.name = oop.toString(options.name, { allowEmptyString: false });
        this.mode = options.mode;
        this.defaultLang = oop.toNullableString(options.defaultLang);
        this.scope = new Set(oop.toIterable(options.scope));

        this.eventsMap = new Map();
        for (const [eventName, event] of Object.entries(options.events)) {
            this.eventsMap.set(eventName, event.default);
        }
        this.events = [...this.eventsMap.values()];
        this.i18n = options.i18n;
        this.main = options.main;

        this.i18n.locale(this.defaultLang);
    }
}
