import{n as e}from"./rolldown-runtime-BG2f4sTM.js";import{a as t,c as n,d as r,f as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d,u as f}from"./property-CfAT6h9r.js";var p,m,h,g;e((()=>{f(),n(),t(),l(),s(),r(),p=Object.defineProperty,m=Object.getOwnPropertyDescriptor,h=(e,t,n,r)=>{for(var i=r>1?void 0:r?m(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,n,i):o(i))||i);return r&&i&&p(t,n,i),i},g=class extends c{constructor(){super(...arguments),this.size=`1em`,this.weight=`regular`,this.color=`currentColor`,this.mirrored=!1}render(){return u`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?`scale(-1, 1)`:null}
    >
      ${g.weightsMap.get(this.weight??`regular`)}
    </svg>`}},g.weightsMap=new Map([[`thin`,o`<path d="M226.83,74.83l-128,128a4,4,0,0,1-5.66,0l-56-56a4,4,0,0,1,5.66-5.66L96,194.34,221.17,69.17a4,4,0,1,1,5.66,5.66Z"/>`],[`light`,o`<path d="M228.24,76.24l-128,128a6,6,0,0,1-8.48,0l-56-56a6,6,0,0,1,8.48-8.48L96,191.51,219.76,67.76a6,6,0,0,1,8.48,8.48Z"/>`],[`regular`,o`<path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>`],[`bold`,o`<path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"/>`],[`fill`,o`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM205.66,85.66l-96,96a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L104,164.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z"/>`],[`duotone`,o`<path d="M232,56V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Z" opacity="0.2"/><path d="M205.66,85.66l-96,96a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L104,164.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z"/>`]]),g.styles=i`
    :host {
      display: contents;
    }
  `,h([d({type:String,reflect:!0})],g.prototype,`size`,2),h([d({type:String,reflect:!0})],g.prototype,`weight`,2),h([d({type:String,reflect:!0})],g.prototype,`color`,2),h([d({type:Boolean,reflect:!0})],g.prototype,`mirrored`,2),g=h([a(`ph-check`)],g)}))();export{g as PhCheck};