// Import third-party dependencies
import oop from "@slimio/oop";
import changeCase from "change-case";

// Import internal dependencies
import { Events, EventSymbol } from "./Constants.js";

// CONSTANTS
const kEventSymSet = new Set(Object.values(Events));
const kDefaultOptions = { type: Events.Warning, parameters: {}, enabled: true };

export default class Event {
    #resolution = null;

    static sanitizeName(name) {
        return changeCase.paramCase(oop.toString(name, { allowEmptyString: false }));
    }

    constructor(options = Object.create(null)) {
        options = Object.assign({}, kDefaultOptions, options);
        if (!kEventSymSet.has(options.type)) {
            throw new TypeError("options.type must be a valid Event type!");
        }

        this.name = Event.sanitizeName(options.name);
        this.id = Symbol(this.name);
        this.enabled = options.enabled ?? true;
        this.type = options.type;
        this.i18n = oop.toString(options.i18n);
        this.parametersJSONSchema = oop.toPlainObject(options.parameters);

        Reflect.defineProperty(this, EventSymbol, { value: true, enumerable: false });
    }

    set resolution(options = Object.create(null)) {
        // TODO: validate function entry
        const description = oop.toNullableString(options.description);
        const assertion = options.assertion ?? (() => true);
        const main = options.main;

        this.#resolution = Object.freeze({ description, assertion, main });
    }

    get resolution() {
        return this.#resolution?.description ?? null;
    }
}
