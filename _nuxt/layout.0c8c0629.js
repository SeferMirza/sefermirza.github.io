import{j as i,V as p,l as c,q as m,W as d,D as f,X as y,Y as l,Z as _,$ as v,u as L}from"./entry.513ec8b2.js";const h=i({props:{name:String},async setup(s,u){const e=await p[s.name]().then(t=>t.default||t);return()=>c(e,{},u.slots)}}),T=i({props:{name:{type:[String,Boolean,Object],default:null}},setup(s,u){const e=v("_route"),t=e===m()?d():e,n=f(()=>{var a,o;return(o=(a=L(s.name))!=null?a:t.meta.layout)!=null?o:"default"});return()=>{var r;const a=n.value&&n.value in p,o=(r=t.meta.layoutTransition)!=null?r:y;return l(_,a&&o,{default:()=>l(h,a&&{key:n.value,name:n.value,hasTransition:void 0},u.slots).default()}).default()}}});export{T as default};
