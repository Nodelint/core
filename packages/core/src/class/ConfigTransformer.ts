/* eslint-disable @typescript-eslint/ban-types */

// Import Internal Dependencies
import { Severity } from "../types";
import * as utils from "../utils.js";

export type DualConfigField<T> = T | ConfigField<T>;

export type ConfigField<T> = {
  $severity: Severity;
  $value: T;
};

export type DeepTransformField<T> = TransformDeepConfigField<ExcludeConfigField<T>>;

type TransformDeepConfigField<T> = {
  [K in keyof T]: T[K] extends ConfigField<infer U> ?
    ConfigField<U> : ConfigField<T[K]>;
};

type ExcludeConfigField<T> = {
  [K in keyof T]: ConfigField<Exclude<T[K], ConfigField<any>>>;
};

type foo = DeepTransformField<{
  foo: string | ConfigField<string>,
  scripts: {
    bar: boolean;
  }
}>;


export default class ConfigTransformer<
  T extends Object
> {
  private config: T;

  constructor(config: T) {
    this.config = config;
  }

  #transform(obj: Record<string, any>) {
    const finalObject = {};

    for (const [key, value] of Object.entries(obj)) {
      if (utils.isPlainObject(value)) {
        finalObject[key] = "$severity" in value || "$value" in value ?
          value : this.#transform(value);
      }
      else {
        finalObject[key] = { value };
      }
    }

    return finalObject;
  }

  getFinalized() {
    return this.#transform(this.config) as Required<DeepTransformField<T>>;
  }
}
