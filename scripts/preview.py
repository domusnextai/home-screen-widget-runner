"""Serve a sandbox widget to an existing remote Playwright page through route fulfillment."""
import json
from pathlib import Path
from urllib.parse import unquote, urlparse

async def mount(page, app_path, runner_root='/opt/nori/widget-runner', width=924, height=558):
    root = Path(runner_root).resolve()
    app = Path(app_path).resolve()
    if not app.is_file() or app.stat().st_size > 2 * 1024 * 1024:
        raise ValueError('Missing or oversized widget JS')
    mapping = json.loads((root / 'host/runtime.json').read_text())
    mapping['imports'] = {key: '/host/' + value.removeprefix('./') for key, value in mapping['imports'].items()}
    frame = ('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/host/base.css">'
             '<style>html,body,#root{width:100%;height:100%;margin:0;overflow:hidden}</style>'
             '<script type="importmap">' + json.dumps(mapping) + '</script><div id="root"></div>'
             '<script type="module">import React from "react";import{createRoot}from"react-dom/client";'
             'try{const{default:App}=await import("/widget.js");createRoot(document.getElementById("root")).render(React.createElement(App))}'
             'catch(e){document.body.textContent=String(e);console.error(e)}</script>')
    html = ('<!doctype html><meta charset="utf-8"><style>html,body,iframe{border:0;margin:0;width:100%;height:100%;display:block;overflow:hidden}</style>'
            '<iframe sandbox="allow-scripts" src="/frame.html"></iframe>')
    async def serve(route):
        path = unquote(urlparse(route.request.url).path)
        body, mime, status = b'Not found', 'text/plain', 404
        if path in ('/', '/index.html'):
            body, mime, status = html.encode(), 'text/html', 200
        elif path == '/frame.html':
            body, mime, status = frame.encode(), 'text/html', 200
        elif path == '/widget.js':
            body, mime, status = app.read_bytes(), 'text/javascript', 200
        elif path.startswith('/host/'):
            resource = (root / path.lstrip('/')).resolve()
            if resource.is_relative_to(root / 'host') and resource.is_file() and resource.suffix in ('.js', '.css'):
                body = resource.read_bytes()
                mime = 'text/css' if resource.suffix == '.css' else 'text/javascript'
                status = 200
        await route.fulfill(status=status, content_type=mime, body=body,
                            headers={'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store'})
    await page.unroute('https://widget-preview.invalid/**')
    await page.route('https://widget-preview.invalid/**', serve)
    await page.set_viewport_size({'width': width, 'height': height})
    await page.goto('https://widget-preview.invalid/index.html', wait_until='domcontentloaded')
