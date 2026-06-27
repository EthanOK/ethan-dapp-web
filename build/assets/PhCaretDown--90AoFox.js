import{n as e}from"./rolldown-runtime-BG2f4sTM.js";import{a as t,c as n,d as r,f as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d,u as f}from"./property-CfAT6h9r.js";var p,m,h,g;e((()=>{f(),n(),t(),l(),s(),r(),p=Object.defineProperty,m=Object.getOwnPropertyDescriptor,h=(e,t,n,r)=>{for(var i=r>1?void 0:r?m(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,n,i):o(i))||i);return r&&i&&p(t,n,i),i},g=class extends c{constructor(){super(...arguments),this.size=`1em`,this.weight=`regular`,this.color=`currentColor`,this.mirrored=!1}render(){return u`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?`scale(-1, 1)`:null}
    >
      ${g.weightsMap.get(this.weight??`regular`)}
    </svg>`}},g.weightsMap=new Map([[`thin`,o`<path d="M210.83,98.83l-80,80a4,4,0,0,1-5.66,0l-80-80a4,4,0,0,1,5.66-5.66L128,170.34l77.17-77.17a4,4,0,1,1,5.66,5.66Z"/>`],[`light`,o`<path d="M212.24,100.24l-80,80a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,8.48-8.48L128,167.51l75.76-75.75a6,6,0,0,1,8.48,8.48Z"/>`],[`regular`,o`<path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>`],[`bold`,o`<path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/>`],[`fill`,o`<path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z"/>`],[`duotone`,o`<path d="M208,96l-80,80L48,96Z" opacity="0.2"/><path d="M215.39,92.94A8,8,0,0,0,208,88H48a8,8,0,0,0-5.66,13.66l80,80a8,8,0,0,0,11.32,0l80-80A8,8,0,0,0,215.39,92.94ZM128,164.69,67.31,104H188.69Z"/>`]]),g.styles=i`
    :host {
      display: contents;
    }
  `,h([d({type:String,reflect:!0})],g.prototype,`size`,2),h([d({type:String,reflect:!0})],g.prototype,`weight`,2),h([d({type:String,reflect:!0})],g.prototype,`color`,2),h([d({type:Boolean,reflect:!0})],g.prototype,`mirrored`,2),g=h([a(`ph-caret-down`)],g)}))();export{g as PhCaretDown};