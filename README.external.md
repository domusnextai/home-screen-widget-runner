# Single application JS module, shared host runtime

This extension compiles one JSX/TSX artifact into **one browser ESM file**. The host owns HTML, import maps, library files, providers, mounting and unmounting. No business components or business SDKs have been added.

## Build

```sh
npm ci
npm run build:external -- /absolute/path/App.tsx --out dist/app.js
```

The input must default-export a React component. The output preserves that default export. npm imports remain bare ESM imports; the build does not embed libraries, library URLs, HTML, ReactDOM, or mounting code. Artifact-specific Tailwind utilities are embedded as a string and injected into a style element when the module is imported. No separate CSS or HTML file is emitted. Identical generated styles are injected once per document.

Only direct dependencies listed in package.json are allowed by default. Use versions compatible with this checkout's package-lock.json when preparing the host. An explicit runtime.json mapping can allow other external modules. The build prints all external module specifiers used by the generated application.

## Host example

`host/` now contains the complete self-hosted runtime: fixed HTML, loader, base styles, import map, locked versions and locally bundled ESM libraries. No CDN is required. See [host/README.md](host/README.md). Regenerate it with `npm run build:host` after changing dependencies. The host template is not part of the per-application output.

```sh
npm run build:external -- tests/fixtures/App.tsx --out dist/app.js
python3 -m http.server 8000
```

Open http://localhost:8000/host/. The important host code is:

```js
import React from 'react';
import { createRoot } from 'react-dom/client';
const { default: App } = await import('../dist/app.js');
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
// root.unmount() when disposing the application.
```

Loading the application means importing an ES module, not adding a classic script. Your host must already have an import map or another compatible module resolution mechanism. Import maps must be available before module loading starts.

## Validate against your host's import map

```sh
npm run build:external -- App.tsx --runtime runtime.example.json --out dist/app.js
```

`runtime.json` contains an `imports` object matching the host import map. When supplied, every import used by the application must have an exact mapping; a missing entry fails the build. This file only validates the available modules and allows additional external packages. It is not embedded in the output, does not rewrite imports, and does not install the map into the host. The host must actually configure the same map. Host-only modules such as react-dom/client need no artifact mapping unless the artifact itself imports them. Transitive imports inside host library files are the host's responsibility.

Shared libraries should use compatible versions and the same React instance. Serve ESM with correct JavaScript MIME types and CORS headers when cross-origin. UMD/CommonJS files and parent-window globals are not substitutes for ESM modules. An iframe has its own document/module environment.

## Styles and lifecycle

- Only artifact Tailwind utilities are compiled. Global reset, base theme variables, library stylesheets, fonts and other shared CSS belong in the host. Preflight and upstream global theme rules are not included.
- Utility classes must be complete literals or safelisted in tailwind.config.mjs. Custom application CSS can be expressed through inline styles or a style element inside the component.
- Generated CSS is document-global. Style elements stay after React unmount so they can be reused. For independent apps with conflicting styles use separate iframe documents, or add a host-managed style lifecycle. Shadow DOM targets need their own style handling.
- The module needs a browser document at import time when it contains generated CSS. This is not an SSR bundle.
- The host's CSP must permit injected styles (or the host must adapt style handling to its nonce policy). This is not an execution sandbox.

## Source restrictions

Use AGENT.external.md as the generation contract. Existing upstream shadcn source components are not part of this runtime. Imports of local files or aliases such as @/components/ui are rejected. Use standard HTML elements, external npm UI libraries, or helper components defined in the single artifact file. External stylesheet imports are rejected; load library CSS from host HTML. Routing and any required providers are supplied by the host or explicitly inside App.

The output parent directory is created, unrelated output files are not deleted, and the requested JS is written only after a successful build. Existing HTML outputs from older builds are not application deliverables and can be removed.

## Verification and upstream commands

```sh
npm run test:external
```

Integration checks cover a single ESM output, preserved default export, injected Tailwind CSS, external library imports, host-map validation, and rejection of local files and unsupported dependencies/stylesheets. The fixture is a technical interaction test, not a business component.

Upstream commands retain their original behavior. In particular, `npx run-claude-artifact` clones upstream and does not run this extension. Use `npm run build:external` from this checkout.
