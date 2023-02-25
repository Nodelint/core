// Import Third-party Dependencies
import { expect } from "chai";

// Import Internal Dependencies
import { Event, EventOptions } from "../src/index.js";

// CONSTANTS
const kDummyEventOptions: EventOptions = {
  i18n: "path.to.key",
  name: "dummy",
  enabled: true,
  parameters: {
    foo: "bar"
  },
  type: Event.Severities.Log
};

describe("Event", () => {
  describe("static sanitizeName() method", () => {
    it("should throw with an Empty string", () => {
      expect(() => Event.sanitizeName("")).to.throw(TypeError, "value can not be an empty string");
    });

    it("should throw with a value that is not a string", () => {
      expect(() => Event.sanitizeName(null as any)).to.throw();
    });

    it("should change the string case to param-case", () => {
      expect(Event.sanitizeName("fooBar")).to.equal("foo-bar");
      expect(Event.sanitizeName("foo_bar")).to.equal("foo-bar");
    });
  });

  describe("constructor", () => {
    it("should throw with an invalid type", () => {
      const dummyType = { type: null } as any;

      expect(() => new Event({ ...kDummyEventOptions, ...dummyType })).to.throw(
        TypeError, "options.type must be a valid Event type!"
      );
    });

    it("should create a new Event instance", () => {
      const instance = new Event(kDummyEventOptions);

      expect(instance.enabled).to.equal(kDummyEventOptions.enabled);
      expect(typeof instance.id).to.equal("symbol");
      expect(instance.type).to.equal(kDummyEventOptions.type);
      expect(instance.i18n).to.equal(kDummyEventOptions.i18n);
      expect(instance.parametersJSONSchema).to.deep.equal(kDummyEventOptions.parameters);
      expect(instance.resolutionDescription).to.equal(null);

      expect(instance[Event.Symbol]).to.equal(true);
    });

    it("should sanitize the event name and set the name as the id symbol description", () => {
      const instance = new Event({
        ...kDummyEventOptions,
        name: "FooBar"
      });

      expect(instance.name).to.equal("foo-bar");
      expect(instance.id.description).to.equal("foo-bar");
    });

    it("should set the .enabled property to boolean value 'true' by default if no value provided", () => {
      const instance = new Event({
        ...kDummyEventOptions,
        enabled: undefined
      });

      expect(instance.enabled).to.equal(true);
    });

    it("should set the .type property to Symbol CONSTANTS Events.Warning by default if no value provided", () => {
      const instance = new Event({
        i18n: "path.to.key",
        name: "dummy",
        enabled: true,
        parameters: {
          foo: "bar"
        }
      });

      expect(instance.type).to.equal(Event.Severities.Warning);
    });

    it("should set the .parametersJSONSchema property to empty plainObject by default if no value provided", () => {
      const instance = new Event({
        i18n: "path.to.key",
        name: "dummy",
        enabled: true
      });

      expect(instance.parametersJSONSchema).to.deep.equal({});
    });

    it("expect the Constructor Options parameters to be an Object like", () => {
      const options = { ...kDummyEventOptions, parameters: null };

      expect(() => new Event(options as any)).to.throw(
        TypeError, "value must be an object"
      );
    });

    it("expect a non-empty primitve string for i18n property", () => {
      const options = { ...kDummyEventOptions, i18n: "" };

      expect(() => new Event(options)).to.throw(
        TypeError, "value can not be an empty string"
      );
    });
  });

  describe("resolution", () => {
    it("should set the resolution description to 'hello world!'", () => {
      const instance = new Event(kDummyEventOptions);

      instance.resolution = {
        description: "hello world!",
        main: () => true
      };

      expect(instance.resolutionDescription).to.equal("hello world!");
    });
  });
});
