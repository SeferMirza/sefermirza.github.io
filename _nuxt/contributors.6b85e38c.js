import{u as l}from"./asyncData.718f2b36.js";import{j as u,i as _,b as o,F as h,h as p,u as d,o as r,e as t,t as n,d as m}from"./entry.a572b7fa.js";const f="https://api.github.com/repos/mouseless/learn-nuxt",y=async()=>await $fetch(u(f,"/stats/contributors"),{method:"GET",lazy:!1,server:!1,headers:{"X-GitHub-Api-Version":"2022-11-28"}});const b={class:"contributor-container"},g={class:"contributor"},v=["src"],x=t("strong",null,"Total commits:",-1),B={__name:"contributors",async setup(c){let s,a;const{data:i}=([s,a]=_(()=>l(()=>y(),"$0174vVeWLO")),s=await s,a(),s);return(V,k)=>(r(),o("div",b,[(r(!0),o(h,null,p(d(i),e=>(r(),o("div",{key:e.author.login},[t("div",g,[t("img",{class:"profile-image",src:e.author.avatar_url},null,8,v),t("h3",null,n(e.author.login),1),t("p",null,[x,m(" "+n(e.total),1)])])]))),128))]))}};export{B as default};
