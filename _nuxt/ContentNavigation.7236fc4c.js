import{D as f,_ as v,i as d,I as l,p as _,W as g,j as h,k as s}from"./entry.d29ecb3e.js";import{q as y,h as m,e as w,j as C,u as $}from"./query.967675e2.js";import{_ as j}from"./nuxt-link.d4fec397.js";import{w as c,s as N,u as P,a as D}from"./utils.50bf324d.js";/* empty css                   *//* empty css                   *//* empty css                         *//* empty css                   *//* empty css                   *//* empty css                            *//* empty css                      *//* empty css                            *//* empty css                    *//* empty css                    *//* empty css                    *//* empty css                    *//* empty css                    *//* empty css                    *//* empty css                    *//* empty css                       *//* empty css                       *//* empty css                    *//* empty css                    *//* empty css                    */const T=async n=>{const{content:t}=f().public;typeof(n==null?void 0:n.params)!="function"&&(n=y(n));const a=n.params(),i=t.experimental.stripQueryParameters?c(`/navigation/${`${m(a)}.${t.integrity}`}/${w(a)}.json`):c(`/navigation/${m(a)}.${t.integrity}.json`);if(N())return(await v(()=>import("./client-db.64ca6a49.js"),["./client-db.64ca6a49.js","./entry.d29ecb3e.js","./entry.b0f844a3.css","./utils.50bf324d.js","./query.967675e2.js","./index.a6ef77ff.js"],import.meta.url).then(o=>o.generateNavigation))(a);const e=await $fetch(i,{method:"GET",responseType:"json",params:t.experimental.stripQueryParameters?void 0:{_params:C(a),previewToken:P("previewToken").value}});if(typeof e=="string"&&e.startsWith("<!DOCTYPE html>"))throw new Error("Not found");return e};const q=d({name:"ContentNavigation",props:{query:{type:Object,required:!1,default:void 0}},async setup(n){const{query:t}=l(n),a=_(()=>{var e;return typeof((e=t.value)==null?void 0:e.params)=="function"?t.value.params():t.value});if(!a.value&&g("dd-navigation").value){const{navigation:e}=D();return{navigation:e}}const{data:i}=await $(`content-navigation-${m(a.value)}`,()=>T(a.value));return{navigation:i}},render(n){const t=h(),{navigation:a}=n,i=o=>s(j,{to:o._path},()=>o.title),e=(o,p)=>s("ul",p?{"data-level":p}:null,o.map(r=>r.children?s("li",null,[i(r),e(r.children,p+1)]):s("li",null,i(r)))),u=o=>e(o,0);return t!=null&&t.default?t.default({navigation:a,...this.$attrs}):u(a)}});export{q as default};
