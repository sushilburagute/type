# security

## reporting a vulnerability

please do not open a public issue for security problems. report privately through one of:

- [github private vulnerability reporting](https://github.com/sushilburagute/type/security/advisories/new)
- email: security@sush.dev

include steps to reproduce, the browser and version, and the impact you see. you will get a reply within a few days, and a fix or a mitigation as soon as one is ready. credit is given in the changelog unless you ask otherwise.

## scope

`type` is a static single-page app. there is no backend, no api, no accounts and no server-side storage. everything you type stays in your browser's localStorage under `type:editors` and `type:settings`, and nothing is sent anywhere by the app itself.

the only optional third-party request is google analytics, which loads only when the deploy sets `VITE_GA_MEASUREMENT_ID`, only after the first interaction, and never receives editor content.

things that are in scope:

- cross-site scripting through pasted or formatted text, titles or diff output
- anything that could exfiltrate editor content
- problems in the pre-hydration script in `index.html` or in the persisted state migrations
- supply chain issues in the dependency tree

things that are out of scope:

- issues that require a compromised browser, extension or device
- localStorage being readable by other code on the same origin, which is by design of the platform

## supported versions

only the latest deploy at [type.sush.dev](https://type.sush.dev) and the `main` branch are supported.
