import c from"./ContentRendererMarkdown.2b14d12d.js";import{j as l,w as s,k as m,l as d}from"./entry.7df28c26.js";import"./_commonjsHelpers.fed2a411.js";const g=l({name:"ContentRenderer",props:{value:{type:Object,required:!1,default:()=>({})},excerpt:{type:Boolean,default:!1},tag:{type:String,default:"div"}},setup(t){s(()=>t.excerpt,n=>{var e,r,a;n&&!((e=t.value)!=null&&e.excerpt)&&(console.warn(`No excerpt found for document content/${(r=t==null?void 0:t.value)==null?void 0:r._path}.${(a=t==null?void 0:t.value)==null?void 0:a._extension}!`),console.warn("Make sure to use <!--more--> in your content if you want to use excerpt feature."))},{immediate:!0})},render(t){var i,u,o,f;const n=m(),{value:e,excerpt:r,tag:a}=t;return!((u=(i=e==null?void 0:e.body)==null?void 0:i.children)!=null&&u.length)&&(n==null?void 0:n.empty)?n.empty({value:e,excerpt:r,tag:a,...this.$attrs}):n!=null&&n.default?n.default({value:e,excerpt:r,tag:a,...this.$attrs}):(e==null?void 0:e._type)==="markdown"&&((f=(o=e==null?void 0:e.body)==null?void 0:o.children)==null?void 0:f.length)?d(c,{value:e,excerpt:r,tag:a,...this.$attrs}):d("pre",null,JSON.stringify({message:"You should use slots with <ContentRenderer>",value:e,excerpt:r,tag:a},null,2))}});export{g as default};
