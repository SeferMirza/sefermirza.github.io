import{a as r,o as e,b as s,e as o,F as c,h as i,v as _,t as l,f as d}from"./entry.7df28c26.js";const u={props:["articles","isActive"]},f={class:"nav flex-column"},h=["href"],m={key:1,class:"nav-link",href:"#"},v={class:"nav flex-column"},k=["href"];function g(p,x,n,y,B,b){return e(),s("div",{class:_(["idocs-navigation bg-light",{active:n.isActive}])},[o("ul",f,[(e(!0),s(c,null,i(n.articles,t=>(e(),s("li",{class:"nav-item",key:t.slug},[n.articles[0]!==void 0?(e(),s("a",{key:0,class:"nav-link",href:"#"+t.slug},l(t.title),9,h)):(e(),s("a",m,l(t.title),1)),o("ul",v,[(e(!0),s(c,null,i(t.body.toc.links,a=>(e(),s(c,null,[t.body.toc.depth<3?(e(),s("li",{class:"nav-item",key:a.id},[o("a",{class:"nav-link",href:"#"+a.id},l(a.text),9,k)])):d("",!0)],64))),256))])]))),128))])],2)}const C=r(u,[["render",g]]);export{C as default};
