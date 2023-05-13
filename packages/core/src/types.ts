// Import Internal Dependencies
import * as policies from "./policies/policies.js";

export type PoliciesName = keyof typeof policies;

export type Severity = "info" | "warning" | "critical";

export interface Warning {
  code: string;
  /**
   * @default warning
   */
  severity?: Severity;
  policy?: string;
  file: string | null;
  message: string;
}
