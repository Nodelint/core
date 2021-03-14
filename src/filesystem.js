// Import Node.js dependencies
import path from "path";
import fs from "fs/promises";

// SYMBOLS
export const FILE = Symbol("symTypeFile");
export const DIR = Symbol("symTypeDir");

// CONSTANTS
const kExcludedDirectories = new Set(["node_modules", ".vscode", ".git"]);

export async function* getFilesRecursive(dir) {
    const dirents = await fs.opendir(dir);

    for await (const dirent of dirents) {
        if (kExcludedDirectories.has(dirent.name)) {
            continue;
        }

        if (dirent.isFile()) {
            yield [FILE, path.join(dir, dirent.name)];
        }
        else if (dirent.isDirectory()) {
            const fullPath = path.join(dir, dirent.name);
            yield [DIR, fullPath];
            yield* getFilesRecursive(fullPath);
        }
    }
}
