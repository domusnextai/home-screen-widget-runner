import { mountApp } from './loader.js';

// The app is the only per-application deliverable. The default is the build fixture.
const appUrl = new URLSearchParams(location.search).get('app') || '../dist/app.js';
try {
  await mountApp(document.getElementById('root'), appUrl);
} catch (error) {
  document.getElementById('root').textContent = `Application failed to load: ${error.message}`;
  console.error(error);
}
