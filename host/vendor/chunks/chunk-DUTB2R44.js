import{a as b}from"./chunk-3AGIJ2SA.js";import{d as m}from"./chunk-FRNGIS5F.js";var J=function(e){if(typeof document>"u")return null;var r=Array.isArray(e)?e[0]:e;return r.ownerDocument.body},l=new WeakMap,x=new WeakMap,_={},j=0,k=function(e){return e&&(e.host||k(e.parentNode))},X=function(e,r){return r.map(function(t){if(e.contains(t))return t;var n=k(t);return n&&e.contains(n)?n:(console.error("aria-hidden",t,"in not contained inside",e,". Doing nothing"),null)}).filter(function(t){return!!t})},Y=function(e,r,t,n){var o=X(r,Array.isArray(e)?e:[e]);_[t]||(_[t]=new WeakMap);var a=_[t],c=[],i=new Set,O=new Set(o),h=function(u){!u||i.has(u)||(i.add(u),h(u.parentNode))};o.forEach(h);var s=function(u){!u||O.has(u)||Array.prototype.forEach.call(u.children,function(f){if(i.has(f))s(f);else try{var v=f.getAttribute(n),I=v!==null&&v!=="false",D=(l.get(f)||0)+1,N=(a.get(f)||0)+1;l.set(f,D),a.set(f,N),c.push(f),D===1&&I&&x.set(f,!0),N===1&&f.setAttribute(t,"true"),I||f.setAttribute(n,"true")}catch(U){console.error("aria-hidden: cannot operate on ",f,U)}})};return s(r),i.clear(),j++,function(){c.forEach(function(u){var f=l.get(u)-1,v=a.get(u)-1;l.set(u,f),a.set(u,v),f||(x.has(u)||u.removeAttribute(n),x.delete(u)),v||u.removeAttribute(t)}),j--,j||(l=new WeakMap,l=new WeakMap,x=new WeakMap,_={})}},de=function(e,r,t){t===void 0&&(t="data-aria-hidden");var n=Array.from(Array.isArray(e)?e:[e]),o=r||J(e);return o?(n.push.apply(n,Array.from(o.querySelectorAll("[aria-live]"))),Y(n,o,t,"aria-hidden")):function(){return null}};var p=function(){return p=Object.assign||function(r){for(var t,n=1,o=arguments.length;n<o;n++){t=arguments[n];for(var a in t)Object.prototype.hasOwnProperty.call(t,a)&&(r[a]=t[a])}return r},p.apply(this,arguments)};function B(e,r){var t={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&r.indexOf(n)<0&&(t[n]=e[n]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,n=Object.getOwnPropertySymbols(e);o<n.length;o++)r.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(t[n[o]]=e[n[o]]);return t}function he(e,r,t){if(t||arguments.length===2)for(var n=0,o=r.length,a;n<o;n++)(a||!(n in r))&&(a||(a=Array.prototype.slice.call(r,0,n)),a[n]=r[n]);return e.concat(a||Array.prototype.slice.call(r))}var g="right-scroll-bar-position",w="width-before-scroll-bar",R="with-scroll-bars-hidden",C="--removed-body-scroll-bar-size";var E=m(b());function S(e,r){return typeof e=="function"?e(r):e&&(e.current=r),e}var z=m(b());function G(e,r){var t=(0,z.useState)(function(){return{value:e,callback:r,facade:{get current(){return t.value},set current(n){var o=t.value;o!==n&&(t.value=n,t.callback(n,o))}}}})[0];return t.callback=r,t.facade}var Z=typeof window<"u"?E.useLayoutEffect:E.useEffect,L=new WeakMap;function $(e,r){var t=G(r||null,function(n){return e.forEach(function(o){return S(o,n)})});return Z(function(){var n=L.get(t);if(n){var o=new Set(n),a=new Set(e),c=t.current;o.forEach(function(i){a.has(i)||S(i,null)}),a.forEach(function(i){o.has(i)||S(i,c)})}L.set(t,e)},[e]),t}var V=m(b()),F=function(e){var r=e.sideCar,t=B(e,["sideCar"]);if(!r)throw new Error("Sidecar: please provide `sideCar` property to import the right car");var n=r.read();if(!n)throw new Error("Sidecar medium not found");return V.createElement(n,p({},t))};F.isSideCarExport=!0;function ee(e,r){return e.useMedium(r),F}function te(e){return e}function re(e,r){r===void 0&&(r=te);var t=[],n=!1,o={read:function(){if(n)throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");return t.length?t[t.length-1]:e},useMedium:function(a){var c=r(a,n);return t.push(c),function(){t=t.filter(function(i){return i!==c})}},assignSyncMedium:function(a){for(n=!0;t.length;){var c=t;t=[],c.forEach(a)}t={push:function(i){return a(i)},filter:function(){return t}}},assignMedium:function(a){n=!0;var c=[];if(t.length){var i=t;t=[],i.forEach(a),c=t}var O=function(){var s=c;c=[],s.forEach(a)},h=function(){return Promise.resolve().then(O)};h(),t={push:function(s){c.push(s),h()},filter:function(s){return c=c.filter(s),t}}}};return o}function ne(e){e===void 0&&(e={});var r=re(null);return r.options=p({async:!0,ssr:!1},e),r}var K=m(b());var H;var q=function(){if(H)return H;if(typeof __webpack_nonce__<"u")return __webpack_nonce__};function oe(){if(!document)return null;var e=document.createElement("style");e.type="text/css";var r=q();return r&&e.setAttribute("nonce",r),e}function ae(e,r){e.styleSheet?e.styleSheet.cssText=r:e.appendChild(document.createTextNode(r))}function ie(e){var r=document.head||document.getElementsByTagName("head")[0];r.appendChild(e)}var P=function(){var e=0,r=null;return{add:function(t){e==0&&(r=oe())&&(ae(r,t),ie(r)),e++},remove:function(){e--,!e&&r&&(r.parentNode&&r.parentNode.removeChild(r),r=null)}}};var T=function(){var e=P();return function(r,t){K.useEffect(function(){return e.add(r),function(){e.remove()}},[r&&t])}};var A=function(){var e=T(),r=function(t){var n=t.styles,o=t.dynamic;return e(n,o),null};return r};var y=m(b());var ce={left:0,top:0,right:0,gap:0},M=function(e){return parseInt(e||"",10)||0},ue=function(e){var r=window.getComputedStyle(document.body),t=r[e==="padding"?"paddingLeft":"marginLeft"],n=r[e==="padding"?"paddingTop":"marginTop"],o=r[e==="padding"?"paddingRight":"marginRight"];return[M(t),M(n),M(o)]},W=function(e){if(e===void 0&&(e="margin"),typeof window>"u")return ce;var r=ue(e),t=document.documentElement.clientWidth,n=window.innerWidth;return{left:r[0],top:r[1],right:r[2],gap:Math.max(0,n-t+r[2]-r[0])}};var fe=A(),d="data-scroll-locked",se=function(e,r,t,n){var o=e.left,a=e.top,c=e.right,i=e.gap;return t===void 0&&(t="margin"),`
  .`.concat(R,` {
   overflow: hidden `).concat(n,`;
   padding-right: `).concat(i,"px ").concat(n,`;
  }
  body[`).concat(d,`] {
    overflow: hidden `).concat(n,`;
    overscroll-behavior: contain;
    `).concat([r&&"position: relative ".concat(n,";"),t==="margin"&&`
    padding-left: `.concat(o,`px;
    padding-top: `).concat(a,`px;
    padding-right: `).concat(c,`px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(i,"px ").concat(n,`;
    `),t==="padding"&&"padding-right: ".concat(i,"px ").concat(n,";")].filter(Boolean).join(""),`
  }
  
  .`).concat(g,` {
    right: `).concat(i,"px ").concat(n,`;
  }
  
  .`).concat(w,` {
    margin-right: `).concat(i,"px ").concat(n,`;
  }
  
  .`).concat(g," .").concat(g,` {
    right: 0 `).concat(n,`;
  }
  
  .`).concat(w," .").concat(w,` {
    margin-right: 0 `).concat(n,`;
  }
  
  body[`).concat(d,`] {
    `).concat(C,": ").concat(i,`px;
  }
`)},Q=function(){var e=parseInt(document.body.getAttribute(d)||"0",10);return isFinite(e)?e:0},le=function(){y.useEffect(function(){return document.body.setAttribute(d,(Q()+1).toString()),function(){var e=Q()-1;e<=0?document.body.removeAttribute(d):document.body.setAttribute(d,e.toString())}},[])},pe=function(e){var r=e.noRelative,t=e.noImportant,n=e.gapMode,o=n===void 0?"margin":n;le();var a=y.useMemo(function(){return W(o)},[o]);return y.createElement(fe,{styles:se(a,!r,o,t?"":"!important")})};export{p as a,B as b,he as c,g as d,w as e,$ as f,ne as g,ee as h,A as i,pe as j,de as k};
