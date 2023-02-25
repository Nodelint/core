// Import Node.js Dependencies
import url from "node:url";
import path from "node:path";

// Import Third-party Dependencies
import { expect } from "chai";
import rosetta from "rosetta";

// Import Internal Dependencies
import { Policy, PolicyOptions } from "../src/index.js";

// CONSTANTS
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const kFixturesDir = path.join(__dirname, "fixtures");

function getDummyPolicyOptions() {
  async function* main() {
    yield Symbol("foo");
  }

  const options: PolicyOptions<any> = {
    name: "dummyPolicy",
    main,
    defaultLang: "english",
    scope: [".eslintrc"],
    i18n: rosetta(),
    events: {}
  };

  return options;
}

describe("Policy", () => {
  describe("static createMessage() method", () => {
    it("should throw with a value that is not a Symbol", () => {
      expect(() => Policy.createMessage(null as any, {})).to.throw();
    });

    it("should create a new policy message", () => {
      const sym = Symbol("foo");
      const message = Policy.createMessage(sym, "hello-world");

      expect(message.id).to.equal(sym);
      expect(message.data).to.equal("hello-world");
      expect(message[Policy.DataEventSymbol]).to.equal(true);
    });
  });

  describe("static loadi18n() method", () => {
    it("should load fixtures/i18n and return a rosetta class", async() => {
      const rosetta = await Policy.loadi18n(path.join(kFixturesDir, "i18n"));

      const i18nKey = "intro.welcome";
      const i18nData = { username: "fraxken" };

      rosetta.locale("english");
      expect(rosetta.t(i18nKey, i18nData)).to.equal("welcome fraxken!");
      expect(rosetta.t(i18nKey, i18nData, "french")).to.equal("bienvenue fraxken!");
    });
  });

  describe("constructor", () => {
    it("should create a new Policy instance", async() => {
      const policy = new Policy(getDummyPolicyOptions());

      expect(policy.name).to.equal("dummyPolicy");
      expect(policy.defaultLang).to.equal(Policy.DefaultI18nLanguage);
      expect(policy.events.size).to.equal(0);

      const iterator = policy.main();
      const { value } = await iterator.next();
      expect(typeof value).to.equal("symbol");
      expect(value.description).to.equal("foo");
    });
  });
});
