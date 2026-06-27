import{n as e}from"./rolldown-runtime-BG2f4sTM.js";import{a as t,c as n,d as r,f as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d,u as f}from"./property-CfAT6h9r.js";var p,m,h,g;e((()=>{f(),n(),t(),l(),s(),r(),p=Object.defineProperty,m=Object.getOwnPropertyDescriptor,h=(e,t,n,r)=>{for(var i=r>1?void 0:r?m(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,n,i):o(i))||i);return r&&i&&p(t,n,i),i},g=class extends c{constructor(){super(...arguments),this.size=`1em`,this.weight=`regular`,this.color=`currentColor`,this.mirrored=!1}render(){return u`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?`scale(-1, 1)`:null}
    >
      ${g.weightsMap.get(this.weight??`regular`)}
    </svg>`}},g.weightsMap=new Map([[`thin`,o`<path d="M226.83,221.17l-52.7-52.7a84.1,84.1,0,1,0-5.66,5.66l52.7,52.7a4,4,0,0,0,5.66-5.66ZM36,112a76,76,0,1,1,76,76A76.08,76.08,0,0,1,36,112Z"/>`],[`light`,o`<path d="M228.24,219.76l-51.38-51.38a86.15,86.15,0,1,0-8.48,8.48l51.38,51.38a6,6,0,0,0,8.48-8.48ZM38,112a74,74,0,1,1,74,74A74.09,74.09,0,0,1,38,112Z"/>`],[`regular`,o`<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>`],[`bold`,o`<path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"/>`],[`fill`,o`<path d="M168,112a56,56,0,1,1-56-56A56,56,0,0,1,168,112Zm61.66,117.66a8,8,0,0,1-11.32,0l-50.06-50.07a88,88,0,1,1,11.32-11.31l50.06,50.06A8,8,0,0,1,229.66,229.66ZM112,184a72,72,0,1,0-72-72A72.08,72.08,0,0,0,112,184Z"/>`],[`duotone`,o`<path d="M192,112a80,80,0,1,1-80-80A80,80,0,0,1,192,112Z" opacity="0.2"/><path d="M229.66,218.34,179.6,168.28a88.21,88.21,0,1,0-11.32,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>`]]),g.styles=i`
    :host {
      display: contents;
    }
  `,h([d({type:String,reflect:!0})],g.prototype,`size`,2),h([d({type:String,reflect:!0})],g.prototype,`weight`,2),h([d({type:String,reflect:!0})],g.prototype,`color`,2),h([d({type:Boolean,reflect:!0})],g.prototype,`mirrored`,2),g=h([a(`ph-magnifying-glass`)],g)}))();export{g as PhMagnifyingGlass};