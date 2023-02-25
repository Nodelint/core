// Import Node.js Dependencies
import { pathToFileURL } from "url";
import fs from "fs/promises";
import path from "path";

// Import third-party dependencies
import oop from "@slimio/oop";
import rosetta, { Rosetta } from "rosetta";

// Import internal dependencies
import { Event, EventMessage } from "./event.js";

export type PolicyContext = {
  /**
   * Absolute root location of the project under analysis
   */
  rootLocation: string;
  /**
   * Absolute location of current scope.
   * If scope is null scopeLocation and rootLocation are strictly equal.
   *
   * ex: src/workspace/
   */
  scopeLocation: string;
  /**
   * The detected file (or nothing if null).
   */
  scope: string | null;
}

export type PolicyEventMessage = symbol | EventMessage;
export type PolicyExecutor = (ctx: PolicyContext) => AsyncIterableIterator<PolicyEventMessage>;

export interface PolicyOptions<T> {
  /** Name of the policy */
  name: string;
  /**
   * Default language to pick for i18n.
   * Languages must be available under the policy /i18n/ directory and loaded with static loadi18n() method.
   *
   * @default english
   */
  defaultLang?: string;
  /**
   * Scope of execution for the policy.
   * This is a list of files, for example ".eslintrc", ".eslintignore" etc..
   *
   * null mean global scope (can be useful for policies who need to enforce rules on directories)
   *
   * @default null
   */
  scope?: Iterable<string> | null;
  i18n: Rosetta<T>;
  /**
   * Main executor for the policy (Asynchronous generator).
   */
  main: PolicyExecutor;
  /**
   * List of events attached to the policy.
   */
  events: Record<string, Event>;
}

export type i18nEntry = Record<string, any>;

export class Policy<T> {
  static DataEventSymbol = Symbol.for("NodeLintDataEvent");
  static DefaultI18nLanguage = "english";

  public name: string;
  public mode: symbol;
  public defaultLang: string | null;
  public scope: Set<string> | null;
  public events: Map<string, Event>;
  public main: PolicyExecutor;
  public i18n: Rosetta<T>;

  constructor(options: PolicyOptions<T>) {
    const finalOptions = Object.assign(
      {},
      { defaultLang: Policy.DefaultI18nLanguage, scope: null },
      options
    );

    this.name = oop.toString(finalOptions.name, { allowEmptyString: false });
    this.defaultLang = oop.toNullableString(finalOptions.defaultLang);
    this.scope = finalOptions.scope === null ? null : new Set(oop.toIterable(finalOptions.scope));
    this.events = new Map(Object.entries(finalOptions.events));
    this.main = finalOptions.main;

    this.i18n = finalOptions.i18n;
    this.i18n.locale(this.defaultLang);
  }

  static async loadi18n<T>(i18nDir: string): Promise<Rosetta<T>> {
    const filesInDir = (await fs.readdir(i18nDir, { withFileTypes: true }))
      .filter((dirent) => dirent.isFile() && path.extname(dirent.name) === ".js");

    const dictArr: i18nEntry[] = [];
    for (const dirent of filesInDir) {
      const i18nLang = await import(
        pathToFileURL(path.join(i18nDir, dirent.name)).toString()
      );

      dictArr.push({ ...i18nLang });
    }

    // @ts-ignore
    return rosetta(Object.assign(...dictArr));
  }

  static createMessage(id: symbol, data: any): EventMessage {
    if (typeof id !== "symbol") {
      throw new TypeError("id must be a valid Event symbol!");
    }

    const payload = { id, data };
    Object.defineProperty(payload, Policy.DataEventSymbol, {
      value: true,
      enumerable: false
    });

    return payload;
  }
}
