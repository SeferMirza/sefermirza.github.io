function f(t,c,o){t.body.children.filter(r=>r.tag=="h1"||r.tag=="h2").forEach(r=>r.children.filter(i=>i.type=="text"&&i.value.includes("{#")).forEach(i=>s(r,i))),t.body.toc.links.filter(r=>{var i;return(i=r.text)==null?void 0:i.includes("{#")}).forEach(p),t.body.children.filter(r=>r.tag=="table").forEach(h),t.body.children.filter(r=>r.tag=="blockquote").forEach(r=>r.children.filter(i=>i.tag=="p").forEach(i=>i.children.filter(l=>l.type=="text"&&l.value.startsWith(":")).forEach((l,a)=>n(r,i,l,a)))),t.body.children.filter(r=>r.tag=="p").forEach(r=>r.children.filter(i=>i.tag=="img").forEach(i=>{d(i,c,o)}));var e=t._path.split("/");t.slug=e[e.length-1].replace(".md","")}function n(...t){const c={":info:":{type:"info"},":information_source:":{type:"info"},":bulb:":{type:"tip"},":tip:":{type:"tip"},":x:":{type:"danger"},":danger:":{type:"danger"},":white_check_mark:":{type:"success"},":success:":{type:"success"},":warning:":{type:"warning"}};t[0].tag="Alert",t[0].props=c[t[2].value],t[1].children.splice(t[3],1),t[0].children[1].tag=="p"&&t[0].children[1].children.length==0&&t[0].children.splice(1,1)}function s(...t){var c=t[1].value.split("{#"),o=c[1].replace("}","");t[0].props.id=o,t[0].children[0].value=c[0]}function p(t){var c=t.text.split("{#");t.text=c[0],t.id=c[1].replace("}","")}function h(t){var c={class:"table"};t.props=c}function d(t,c,o){t.props.alt=="diagram"?(console.log(t),t.props.src=`${c.public.baseUrl}documentation/${o}${t.props.src.slice(1)}`):t.props.src=`${c.public.baseUrl}documentation${t.props.src}`}export{f as t};
