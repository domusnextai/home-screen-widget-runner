# Home Screen Widget Runner

A fork of [claudio-silva/claude-artifact-runner](https://github.com/claudio-silva/claude-artifact-runner), adapted for host-managed dependencies and a single-file React widget workflow. Original MIT license and attribution are retained.

## Install from Git

Requires Node.js 22.14+ and npm. Pin a release commit instead of a mutable branch:

```sh
npm install --prefix ./widget-tools 'git+https://github.com/domusnextai/home-screen-widget-runner.git#<commit>'
./widget-tools/node_modules/.bin/home-screen-widget --version
./widget-tools/node_modules/.bin/home-screen-widget Widget.tsx --out widget.js
```

The package is installed from Git; it is not currently published to the npm registry. npm-shrinkwrap.json locks the dependency graph. Compiler dependencies are runtime dependencies, so the CLI also works with production-only installation.

## CLI capabilities

- Type-check a single TSX and ensure its default export is a React component without required props.
- Compile JSX and Tailwind 3 utilities, inject generated CSS into the output JavaScript, and emit exactly one browser ESM JS file.
- Keep React and declared libraries external. Reject local file imports, unmapped dependencies and separate library CSS imports.
- Validate a supplied host manifest with `--host /path/to/host` (runtime.json and versions.json); otherwise use the package's bundled host contract.
- Enforce a 2 MiB JS limit; report size, SHA-256, dependency manifest hashes, and compatibility status.
- `--host-dir` prints the bundled host directory; `--preview-script` prints the Python helper used to preview the final JS with an existing Playwright page; `--version` prints the package version.

The CLI does not upload files, edit dashboard configuration, provide business APIs, or claim visual verification. Those remain caller responsibilities. Upload only the final JS; host HTML and shared libraries are separately provided by the host application.

## Preview

Load the script returned by `--preview-script` with Python importlib, then call `await preview.mount(page, app_path, runner_root=<package-root>)`. It serves the widget and local vendor modules through Playwright route fulfillment inside a script-only iframe. Reuse an existing Playwright browser session; no publicly exposed HTTP server is required. Browser automation dependencies are supplied by the caller.

## Development

`npm ci` installs the locked toolchain. `npm run test:external` and `npm run test:cli` validate builds and CLI contract checks. `npm run build:host` rebuilds host assets; do not regenerate them casually because deployed hosts must use matching dependency versions.
