// Import Node.js Dependencies
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";

// Import Third-party Dependencies
import Config from "@slimio/config";
import yn from "yn";
import set from "lodash.set";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kNodelintUserConfigSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "src", "configuration.schema.json"), "utf-8"));

// eslint-disable-next-line func-style
const isFilePath = (name) => name.startsWith(".");

async function loadStandalonePolicy(policyLocation) {
    try {
        const { default: policy } = await import(pathToFileURL(policyLocation));

        return policy;
    }
    catch (error) {
        console.log(error);

        throw error;
    }
}

async function parseExtension(extension, location) {
    if (typeof extension === "string") {
        extension = [extension];
    }

    const policyToLoad = [];
    for (const nameOrPath of extension) {
        const policyPath = isFilePath(nameOrPath) ?
            path.join(location, nameOrPath) :
            path.join(location, "node_modules", nameOrPath);

        policyToLoad.push(loadStandalonePolicy(path.join(policyPath, "index.js")));
    }

    const policies = (await Promise.allSettled(policyToLoad))
        .filter((_p) => _p.status === "fulfilled")
        .map((_p) => _p.value);

    return new Map(policies.map((policy) => [policy.name, policy]));
}

function applyPolicyConfiguration(policy, configuration) {
    const events = policy.eventsMap;
    const configurationByEventName = new Map();
    const keyToIgnore = new Set();

    for (const [key, value] of Object.entries(configuration)) {
        const isPropertySetter = key.includes(".");
        const [eventName] = key.split(".", 1);
        if (!events.has(eventName) || keyToIgnore.has(eventName)) {
            continue;
        }

        if (isPropertySetter) {
            const propertyPath = key.slice(eventName.length + 1);

            if (configurationByEventName.has(eventName)) {
                const ref = configurationByEventName.get(eventName);
                set(ref, propertyPath, value);
            }
            else {
                const ref = {};
                set(ref, propertyPath, value);
                configurationByEventName.set(eventName, ref);
            }
        }
        else if (!yn(value)) {
            keyToIgnore.add(eventName);
            events.get(eventName).enabled = false;
        }
    }

    console.log(configurationByEventName);
}

export async function load(location = process.cwd()) {
    const cfg = new Config(path.join(location, "nodelint"), {
        autoReload: false,
        createOnNoEntry: false,
        defaultSchema: kNodelintUserConfigSchema
    });

    await cfg.read();
    const nodeLintConfig = cfg.payload;

    const policies = await parseExtension(nodeLintConfig.extends, location);
    for (const [policyName, configuration] of Object.entries(nodeLintConfig.rules)) {
        if (policies.has(policyName)) {
            applyPolicyConfiguration(policies.get(policyName), configuration);
        }
    }
}
