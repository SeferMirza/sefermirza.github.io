import{m as f,Y as v,f as g,E as d,g as l,n as h,D as r}from"./entry.8b3510c1.js";import{u as _}from"./asyncData.c852d71e.js";import{u as y}from"./state.294ebcf9.js";import{q as C,w as c,h as m,e as w,s as P,j as $,u as N}from"./query.8664a82e.js";import{_ as j}from"./nuxt-link.0af17729.js";import{u as D}from"./preview.846a8cee.js";const E=async e=>{const{content:t}=f().public;typeof(e==null?void 0:e.params)!="function"&&(e=C(e));const a=e.params(),s=t.experimental.stripQueryParameters?c(`/navigation/${`${m(a)}.${t.integrity}`}/${w(a)}.json`):c(`/navigation/${m(a)}.${t.integrity}.json`);if(P())return(await v(()=>import("./client-db.2c83ea09.js"),["./client-db.2c83ea09.js","./entry.8b3510c1.js","./query.8664a82e.js","./preview.846a8cee.js","./index.288f722b.js"],import.meta.url).then(o=>o.generateNavigation))(a);const n=await $fetch(s,{method:"GET",responseType:"json",params:t.experimental.stripQueryParameters?void 0:{_params:$(a),previewToken:D().getPreviewToken()}});if(typeof n=="string"&&n.startsWith("<!DOCTYPE html>"))throw new Error("Not found");return n},T=g({name:"ContentNavigation",props:{query:{type:Object,required:!1,default:void 0}},async setup(e){const{query:t}=d(e),a=l(()=>{var n;return typeof((n=t.value)==null?void 0:n.params)=="function"?t.value.params():t.value});if(!a.value&&y("dd-navigation").value){const{navigation:n}=N();return{navigation:n}}const{data:s}=await _(`content-navigation-${m(a.value)}`,()=>E(a.value));return{navigation:s}},render(e){const t=h(),{navigation:a}=e,s=o=>r(j,{to:o._path},()=>o.title),n=(o,u)=>r("ul",u?{"data-level":u}:null,o.map(i=>i.children?r("li",null,[s(i),n(i.children,u+1)]):r("li",null,s(i)))),p=o=>n(o,0);return t!=null&&t.default?t.default({navigation:a,...this.$attrs}):p(a)}}),S=T;export{S as default};
