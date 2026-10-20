# Generation contract for host-loaded application modules

Return exactly one JSX/TSX source file. Default-export a React component named App. Define helper components and functions in this same file.

The build produces one ESM JavaScript file. The host owns HTML, dependency resolution, React mounting and disposal. Artifact Tailwind utilities are embedded in the JS and injected on import; shared reset/theme/library styles belong in the host.

- Target React 18 and Tailwind CSS 3, matching this checkout's locked dependency versions.
- Import browser-compatible npm libraries from the direct dependencies in package.json. A host import map must resolve every imported module/subpath. When runtime.json is supplied, use its exact available modules.
- Use standard DOM elements and external libraries. No built-in business components or business APIs are provided.
- Do not import relative files, local aliases such as @/components/ui, images, stylesheets, or other project files. Do not generate HTML, package.json, or configuration files.
- Use Tailwind className, inline style objects, or a style element inside the component for application styling. Write complete Tailwind class names rather than concatenating fragments.
- Do not call createRoot, query a root element, or auto-mount the application. The host imports the default export and renders it.
- Do not assume a router/provider is mounted unless the host explicitly documents it. Add required providers inside App otherwise.
- Do not use Node.js APIs or invent backend endpoints. Only use endpoints supplied by the user.
- Do not paste shared library implementations into the artifact.

Minimal valid shape:

```tsx
import { useState } from 'react';
export default function App() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}
```
