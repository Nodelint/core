# policy
Nodelint policy

## 🚧 Requirements

- [Node.js](https://nodejs.org/en/) LTS 16.x or higher
- Top Level Await

## 💃 Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodelint/policy
# or
$ yarn add @nodelint/policy
```

## 👀 Usage example

Create your own policy, an example:

```ts
import url from "node:url";
import path from "node:path";
import { Policy, CONSTANTS } from "@nodelint/policy";

// Import an Array of Nodelint events
import * as events from "./events/index.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

async function* main(ctx) {
    console.log(ctx); // <-- from core
    console.log("execute!");

    yield events.foo.id;
}

const i18n = await Policy.loadi18n(path.join(__dirname, "i18n"));

export default new Policy({
    name: "custom",
    mode: CONSTANTS.Mode.Asynchronous,
    defaultLang: "french",
    scope: [".eslintrc"],
    i18n,
    events,
    main
});
```

Then create create your own Event in a `./events` folder

```ts
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

class foo extends Event {
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
export default new foo();
```

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/Nodelint/policy/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/Nodelint/policy/commits?author=fraxken" title="Documentation">📖</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/Nodelint/policy/commits?author=fraxken" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/Kawacrepe"><img src="https://avatars.githubusercontent.com/u/40260517?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vincent Dhennin</b></sub></a><br /><a href="https://github.com/Nodelint/policy/commits?author=Kawacrepe" title="Code">💻</a> <a href="https://github.com/Nodelint/policy/commits?author=Kawacrepe" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
