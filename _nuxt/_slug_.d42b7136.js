import C from"./Header.7b0824c3.js";import k from"./Sidebar.88ab62fa.js";import w from"./Content.4aaf49b0.js";import{m as B,q as b,a0 as $,I,o as S,b as q,i as p,u as l,e as d,G as D}from"./entry.57f3ab7b.js";import{u as E}from"./asyncData.6dd1e4a6.js";import{u as H}from"./composables.cc7c9c3b.js";import{t as N}from"./transformContent.bc302677.js";/* empty css                   */import"./ContentRenderer.0c84cf15.js";import"./ContentRendererMarkdown.461467dd.js";import"./_commonjsHelpers.fed2a411.js";function R(e){return(n,i)=>{const a=(e==null?void 0:e.sectionOrder)==="desc"?-1:1,o=(e==null?void 0:e.sectionSortBy)||"position";return n[o]>i[o]?a:n[o]<i[o]?-a:0}}const V={id:"content",role:"main"},z={class:"idocs-content"},G={class:"container"},X={__name:"[slug]",async setup(e){let n,i;const a=B(),o=b(),f=o.path.replaceAll("/","");H({meta:[{hid:"og:url",property:"og:url",content:`http://gazel.io${a.public.baseUrl}${o.params.slug}`}]});const u=([n,i]=$(()=>E(`content-${o.params.slug}`,()=>D().find())),n=await n,i(),n).data.value,h=u.filter(t=>t._dir==o.params.slug),y=u.filter(t=>t._path!="/"&&t._dir=="").sort((t,_)=>{var s,r;return((s=t.article)==null?void 0:s.position)-((r=_.article)==null?void 0:r.position)}),g=h.filter(t=>t._dir==f).sort((t,_)=>{var s,r;return((s=t.article)==null?void 0:s.position)-((r=_.article)==null?void 0:r.position)}),[v]=u.filter(t=>t._dir==""&&t._path.replace("/","")==f);g.sort(R(v.article));const m=[v,...g];m.forEach(t=>N(t,a,o.params.slug));let c=I(!1);const A=()=>c.value=!c.value;return(t,_)=>{const s=C,r=k,x=w;return S(),q("div",null,[p(s,{menus:l(y),onToggle:A,isActive:l(c)},null,8,["menus","isActive"]),d("div",V,[p(r,{articles:m,isActive:l(c)},null,8,["isActive"]),d("div",z,[d("div",G,[p(x,{articles:m})])])])])}}};export{X as default};
