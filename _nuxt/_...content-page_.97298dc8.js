import c from"./ContentDoc.66c961ce.js";import{E as s,X as m,o as _,a as g,C as d}from"./entry.d29ecb3e.js";import{u as l}from"./composables.3f29dedf.js";import{q as u}from"./query.967675e2.js";import"./ContentRenderer.b22bbbcc.js";import"./ContentRendererMarkdown.f0cfaef2.js";import"./index.a6ef77ff.js";import"./ContentQuery.8acf114f.js";import"./utils.50bf324d.js";const A={__name:"[...content-page]",async setup(f){var n,r,i;let t,e;const p=s().params.contentpage[0],[o]=([t,e]=m(()=>u("/").where({_path:{$eq:`/${p}`}}).only(["og","description"]).find()),t=await t,e(),t);return l({meta:[{hid:"og:title",property:"og:title",content:(n=o.og)==null?void 0:n.title},{hid:"og:image",property:"og:image",content:(r=o.og)==null?void 0:r.image},{hid:"og:description",property:"og:description",content:(i=o.og)==null?void 0:i.description}]}),(h,y)=>{const a=c;return _(),g("div",null,[d(a)])}}};export{A as default};
