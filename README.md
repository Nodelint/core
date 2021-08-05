# core
Nodelint core

## Requirements
- [Node.js](https://nodejs.org/en/) v14 or higher

## Getting Started

To install this project in local you need to clone the followings repositories :

- [CLI](https://github.com/Nodelint/CLI)
- [Core](https://github.com/Nodelint/core)
- [Policies](https://github.com/Nodelint/policies)
- [Policy](https://github.com/Nodelint/policy)

After that, you'll need to install dependencies in the differents repositories, then run the following command to create symlink between the differents parts.

```bash
$ npm link
# or
$ yarn link
```

## Files needed
```js
// nodelint.json
{
    "extends": [
        "./customPolicy"
    ],
    "rules": {
        "customPolicy": {
            "foo.burst": true
        }
    }
}
// eslint.rc
{
  ...
}
```

# Usage example

We just need to run the following command.

```bash
nodelint
```