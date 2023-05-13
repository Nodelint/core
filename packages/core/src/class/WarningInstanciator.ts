// Import Internal Dependencies
import { Warning } from "../types";

type TemplateStringFn = (...values: any[]) => string;

export default class WarningInstanciator<
  T extends Record<string, TemplateStringFn>
> {
  private warnings: T;
  private currentFile: string | null;

  constructor(warnings: T) {
    this.warnings = warnings;
  }

  set file(newValue: string) {
    this.currentFile = newValue;
  }

  getBaseWarningFromCode(
    code: Extract<keyof T, string>,
    ...args: any[]
  ): Warning {
    const message = this.warnings[code](...args);

    return {
      code, message, file: this.currentFile
    };
  }
}
