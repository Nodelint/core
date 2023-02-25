// Import third-party dependencies
import oop from "@slimio/oop";
import changeCase from "change-case";

export interface EventMessage {
  /** Unique id of the event */
  id: symbol;
  /** Any data attached to the message */
  data: any;
}

export interface ResolutionOptions {
  /** Description of the resolution */
  description: string | null;
  /** Assertion (verification) of the resolution */
  assertion?: () => boolean | (() => Promise<boolean>);
  /** Main executor to resolve the issue */
  main: any;
}
export type EventResolution = Readonly<ResolutionOptions> | null;

export interface EventOptions {
  name: string;
  /** Path to i18n key. For example `path.to.key` (like lodash.get or lodash.set) */
  i18n: string;
  /**
   * Events severity (Log, Information, Warning or Error).
   *
   * @default Warning
   */
  type?: symbol;
  /**
   * Enable the event
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * JSON Schema for event parameters. This will be used to validate the configuration within the core.
   */
  parameters?: object;
}

export class Event {
  static Symbol = Symbol.for("NodeLintEvent");
  static Severities = Object.freeze({
    Log: Symbol("logEvent"),
    Information: Symbol("informationEvent"),
    Warning: Symbol("warningEvent"),
    Error: Symbol("errorEvent")
  });

  public name: string;
  public id: symbol;
  public enabled: boolean;
  public type: symbol;
  public i18n: string;
  public parametersJSONSchema: any;

  /** Note: when `null` it mean the event has not automatic resolution */
  #resolution: EventResolution = null;

  static sanitizeName(name: string): string {
    return changeCase.paramCase(oop.toString(name, { allowEmptyString: false }));
  }

  constructor(options: EventOptions) {
    const finalOptions = Object.assign(
      {},
      { type: Event.Severities.Warning, parameters: {}, enabled: true },
      options
    );

    const severities = new Set(Object.values(Event.Severities));
    if (!severities.has(finalOptions.type)) {
      throw new TypeError("options.type must be a valid Event type!");
    }

    this.name = Event.sanitizeName(finalOptions.name);
    this.id = Symbol(this.name);
    this.enabled = finalOptions.enabled ?? true;
    this.type = finalOptions.type;
    this.i18n = oop.toString(finalOptions.i18n, { allowEmptyString: false });
    this.parametersJSONSchema = oop.toPlainObject(finalOptions.parameters);

    Object.defineProperty(this, Event.Symbol, {
      value: true,
      enumerable: false
    });
  }

  set resolution(options: ResolutionOptions) {
    // TODO: validate function entry
    const description = oop.toNullableString(options.description);
    const assertion = options.assertion ?? (() => true);
    const main = options.main;

    this.#resolution = Object.freeze({ description, assertion, main });
  }

  get resolutionDescription(): string | null {
    return this.#resolution?.description ?? null;
  }
}
