import React from 'react';
import { createRoot } from 'react-dom/client';

/** Load one application into a host-owned element. Returns its disposal function. */
export async function mountApp(element, url) {
  if (!(element instanceof HTMLElement)) throw new Error('A host mount element is required');
  const { default: App } = await import(new URL(url, document.baseURI).href);
  if (!App) throw new Error('Application must default-export a React component');
  const root = createRoot(element);
  root.render(React.createElement(App));
  return () => root.unmount();
}
