// Import Node.js Dependencies
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";

// Import Third-party Dependencies
import Config from "@slimio/config";
import Ajv from "ajv";
import yn from "yn";
import set from "lodash.set";

// Import Internal Dependencies
import * as FileSystem from "./src/filesystem.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kNodelintUserConfigSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "src", "configuration.schema.json"), "utf-8"));

// eslint-disable-next-line new-cap
const ajv = new Ajv.default({ allErrors: true });

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
        const policiesPath = path.join(path.dirname(location), "policies");
        const policyPath = isFilePath(nameOrPath) ?
            path.join(policiesPath, nameOrPath) :
            path.join(location, "node_modules", nameOrPath);
        policyToLoad.push(loadStandalonePolicy(path.join(policyPath, "index.js")));
    }

    const policies = (await Promise.allSettled(policyToLoad))
        .filter((_p) => _p.status === "fulfilled")
        .map((_p) => _p.value);

    return new Map(policies.map((policy) => [policy.name, policy]));
}

function loadOnePolicyConfiguration(policy, configuration) {
    const events = policy.eventsMap;
    const configurationByEventName = new Map();
    const keyToIgnore = new Set();

    // Search for custom configuration
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
        else {
            const enabledKey = yn(value);
            if (!enabledKey) {
                keyToIgnore.add(eventName);
            }
            events.get(eventName).enabled = enabledKey;
        }
    }

    // Apply custom configuration to events!
    for (const [eventName, eventCustomConfig] of configurationByEventName) {
        const event = events.get(eventName);
        const validate = ajv.compile(event.parametersJSONSchema);

        if (!validate(eventCustomConfig)) {
            console.log(validate.errors);
            event.enabled = false;
            continue;
        }
        Object.assign(event, eventCustomConfig);
    }
}

export async function load(location = process.cwd()) {
    const cfg = new Config(path.join(location, "nodelint"), {
        autoReload: false,
        createOnNoEntry: false,
        defaultSchema: kNodelintUserConfigSchema
    });

    await cfg.read();
    const nodeLintConfig = cfg.payload;
    await cfg.close();

    const policies = await parseExtension(nodeLintConfig.extends, location);
    for (const [policyName, configuration] of Object.entries(nodeLintConfig.rules)) {
        if (policies.has(policyName)) {
            loadOnePolicyConfiguration(policies.get(policyName), configuration);
        }
        else {
            console.error(`Unable to found any policy with name: '${policyName}'`);
        }
    }

    return policies;
}

export async function run(location = process.cwd(), policies) {
    console.log("run at location, ", location);
    const scopedPolicies = new Map();
    for (const policy of policies.values()) {
        for (const scopeName of policy.scope) {
            if (scopedPolicies.has(scopeName)) {
                scopedPolicies.get(scopeName).push(policy);
            }
            else {
                scopedPolicies.set(scopeName, [policy]);
            }
        }
    }

    console.log(scopedPolicies);
    for await (const [type, filePath] of FileSystem.getFilesRecursive(location)) {
        switch (type) {
            case FileSystem.DIR:
                console.log(filePath);
                break;
            case FileSystem.FILE: {
                const basename = path.basename(filePath);

                if (scopedPolicies.has(basename)) {
                    console.log(basename);
                }
            }
        }
    }
}
