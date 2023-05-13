// Import Internal Dependencies
import { Severity } from "../types";

export type ConfigField<T> = T | {
  severity: Severity;
  value: T;
};

export default class ConfigTransformer<T extends Record<string, any>> {
  static isConfigField(field: any): boolean {
    if (typeof field !== "object" || field === null) {
      return false;
    }

    return "severity" in field || "value" in field;
  }

  private config: T;

  constructor(config: T) {
    this.config = config;
  }

  #transform() {
    const finalizedConfig = Object.create(null);

    for (const [key, value] of Object.entries(this.config)) {
      finalizedConfig[key] = ConfigTransformer.isConfigField(value)
        ? value : { value };
    }

    return finalizedConfig;
  }

  getFinalized() {
    return this.#transform() as Required<T>;
  }
}
