# 宿主内置目录

将整个 `host/` 目录一起部署，保留相对路径。此目录没有业务组件、业务 API 或应用实现；每个应用另行交付一个 `app.js`。

```text
host/
├── index.html       固定 HTML、挂载点、内联 import map
├── bootstrap.js     选择并加载应用的示例入口
├── loader.js        mountApp(element, url)，返回卸载函数
├── base.css         公共 reset 和主题变量
├── runtime.json     可供构建校验的相同 import map
├── versions.json    共享依赖的精确版本
└── vendor/          本地 ESM 库、共享 chunks 和许可注释文件
```

所有库文件已经在本地构建，不引用 CDN。映射覆盖原模板的 49 个可直接导入的 npm 包根入口，以及 3 个 React 子路径，共 52 项。`@babel/runtime` 是内部 helper 包，没有可用的包根入口，不在映射中；其需要的代码已进入共享 vendor 构建。新的包子路径（例如 `date-fns/format`、`@hookform/resolvers/zod`）需要单独增加构建入口，当前请使用 runtime.json 明确列出的导入路径。

只在运行时按应用 import 加载需要的模块和共享 chunks；准备在目录里不代表全部预加载。React 与组件库共用同一份 React 实现。

## 本地查看

在项目根目录执行：

```sh
npm run build:host
npm run build:external -- tests/fixtures/App.tsx --runtime host/runtime.json --out dist/app.js
python3 -m http.server 8000
```

打开 http://localhost:8000/host/ 。换应用时可使用 `/host/?app=/apps/another-app.js`；也可在自己的宿主入口调用 loader.js 的 mountApp。此示例默认加载 `../dist/app.js`，该应用文件不属于宿主内置目录。

## 集成

- index.html 中的 import map 必须先于模块脚本生效；直接拷贝 loader.js 不会自动配置依赖映射。
- 将模板嵌入不同 HTML 路径时，应相应调整内联 import map 和样式路径。映射地址相对于 HTML 文档解析，不是相对于 runtime.json。
- 使用 HTTP(S) 或支持 ESM 的本地 WebView 资源协议加载，确保 JS MIME 类型和跨域配置正确。
- loader.js 返回的卸载函数调用 React root.unmount()。应用生成的样式保留在文档中以便复用；需要严格隔离时使用不同 iframe 文档。
- 更新依赖后重新执行 build:host，并将 index.html、runtime.json、versions.json 和 vendor/ 作为一套同步部署。

不要把原项目中的 src/components/ui 复制进宿主；它们没有进入这条外部运行时构建链。
