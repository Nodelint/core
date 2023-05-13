// Import Internal Dependencies
import * as policies from "../policies/policies.js";
import { Warning, PoliciesName } from "../types.js";

export interface ExecutorError {
  error: Error;
  policy: string;
}

export interface ExecutorWarningsOptions {
  /**
   * Stop the Async Iterator and throw an error when a policy fail
   *
   * @default false
   */
  throwOnPolicyFailure?: boolean;
}

export interface ExecutorPolicyOptions {
  i18n: string | null;
}

export interface ExecutorOptions<T extends PoliciesName> {
  policies?: [T, policies.Configurations[T]][];
  i18n?: string;
}

export class Executor<T extends PoliciesName = PoliciesName> {
  public errors: ExecutorError[] = [];

  #workingDir: string;
  #policies: Map<T, policies.Configurations[T]> = new Map();
  #executed = false;
  #i18n: string | null = null;

  constructor(
    workingDir: string,
    options: ExecutorOptions<T> = {}
  ) {
    const { policies, i18n = null } = options;

    this.#workingDir = workingDir;
    this.#i18n = i18n;
    if (policies) {
      policies.forEach((pair) => this.loadPolicy(...pair));
    }
  }

  get executed() {
    return this.executed;
  }

  get hasErrors() {
    return this.errors.length > 0;
  }

  loadPolicy(
    name: T,
    config: policies.Configurations[T]
  ) {
    this.#policies.set(name, config);

    return this;
  }

  async* getWarnings(
    options: ExecutorWarningsOptions = {}
  ): AsyncIterableIterator<Required<Warning>> {
    const { throwOnPolicyFailure = false } = options;

    if (this.#executed) {
      throw new Error("An executor can only be used once");
    }

    try {
      for (const [name, config] of this.#policies) {
        const policy = policies[name];
        const result = await policy.main(this.#workingDir, config, {
          i18n: this.#i18n
        });

        if (result.ok) {
          yield* result.val.map(
            (warning) => Object.assign({ policy: name, severity: "warning" }, warning)
          );
          continue;
        }
        if (throwOnPolicyFailure) {
          throw result.val;
        }

        this.errors.push({
          error: result.val,
          policy: name
        });
      }
    }
    finally {
      this.#executed = true;
    }
  }
}

