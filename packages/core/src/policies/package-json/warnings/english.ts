// Import Internal Dependencies
import { taggedString } from "../../../utils.js";

export const english = Object.freeze({
  VERO: taggedString`SemVer 0.x.x is not allowed, please bump to 1.x.x`,
  TYPE: taggedString`Invalid property <type>, expected '${"expectedType"}' but got '${"type"}' instead`,
  MISSING_SCRIPT: taggedString`Missing script '${"expectedScriptName"}'`,
  INVALID_SCRIPT: taggedString`Invalid script value for '${"expectedScriptName"}'`
});
