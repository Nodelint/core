#!/usr/bin/env node
import * as Nodelint from "@nodelint/core";

async function main() {
    const policies = await Nodelint.load();

    await Nodelint.run(void 0, policies);
}
main().catch(console.error);
