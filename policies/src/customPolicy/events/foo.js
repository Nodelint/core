import { Event, CONSTANTS } from "@nodelint/policy";

const parameters = {
    type: "object",
    additionalProperties: false,
    properties: {
        burst: {
            type: "boolean",
            default: false
        }
    }
};

class Foo extends Event {
    constructor() {
        super({
            name: "foo",
            type: CONSTANTS.Events.Error,
            i18n: "path.to.key",
            parameters
        });

        this.burst = false;
    }
}
export default new Foo();
