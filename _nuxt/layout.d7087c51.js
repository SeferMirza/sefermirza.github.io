import{t as i,V as p,v as c,y as m,W as d,l as y,X as f,Y as l,Z as v,p as _,u as L}from"./entry.e0778ab7.js";const h=i({props:{name:String},async setup(s,u){const e=await p[s.name]().then(t=>t.default||t);return()=>c(e,{},u.slots)}}),j=i({props:{name:{type:[String,Boolean,Object],default:null}},setup(s,u){const e=_("_route"),t=e===m()?d():e,n=y(()=>{var a,o;return(o=(a=L(s.name))!=null?a:t.meta.layout)!=null?o:"default"});return()=>{var r;const a=n.value&&n.value in p,o=(r=t.meta.layoutTransition)!=null?r:f;return l(v,a&&o,{default:()=>l(h,a&&{key:n.value,name:n.value,hasTransition:void 0},u.slots).default()}).default()}}});export{j as default};
