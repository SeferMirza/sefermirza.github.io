import{j as s,k as y,A as g,q as v,l as o}from"./entry.cf4d1b82.js";import{u as p}from"./head.bc188d5b.js";import w from"./ContentRenderer.4b4f55f1.js";import C from"./ContentQuery.26c37ede.js";import"./composables.5d3b4f3c.js";import"./ContentRendererMarkdown.158d94db.js";import"./_commonjsHelpers.fed2a411.js";import"./asyncData.65052115.js";const N=s({name:"ContentDoc",props:{tag:{type:String,required:!1,default:"div"},excerpt:{type:Boolean,default:!1},path:{type:String,required:!1,default:void 0},query:{type:Object,required:!1,default:void 0},head:{type:Boolean,required:!1,default:!0}},render(f){const e=y(),{tag:m,excerpt:i,path:d,query:r,head:a}=f,c={...r||{},path:d||(r==null?void 0:r.path)||g(v().path),find:"one"},l=(t,n)=>o("pre",null,JSON.stringify({message:"You should use slots with <ContentDoc>",slot:t,data:n},null,2));return o(C,c,{default:e!=null&&e.default?({data:t,refresh:n,isPartial:h})=>{var u;return a&&p(t),(u=e.default)==null?void 0:u.call(e,{doc:t,refresh:n,isPartial:h,excerpt:i,...this.$attrs})}:({data:t})=>(a&&p(t),o(w,{value:t,excerpt:i,tag:m,...this.$attrs},{empty:n=>e!=null&&e.empty?e.empty(n):l("default",t)})),empty:t=>{var n;return((n=e==null?void 0:e.empty)==null?void 0:n.call(e,t))||o("p",null,"Document is empty, overwrite this content with #empty slot in <ContentDoc>.")},"not-found":t=>{var n;return((n=e==null?void 0:e["not-found"])==null?void 0:n.call(e,t))||o("p",null,"Document not found, overwrite this content with #not-found slot in <ContentDoc>.")}})}});export{N as default};
