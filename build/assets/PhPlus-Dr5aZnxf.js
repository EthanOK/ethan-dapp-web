import{n as e}from"./rolldown-runtime-BG2f4sTM.js";import{a as t,c as n,d as r,f as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d,u as f}from"./property-CfAT6h9r.js";var p,m,h,g;e((()=>{f(),n(),t(),l(),s(),r(),p=Object.defineProperty,m=Object.getOwnPropertyDescriptor,h=(e,t,n,r)=>{for(var i=r>1?void 0:r?m(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,n,i):o(i))||i);return r&&i&&p(t,n,i),i},g=class extends c{constructor(){super(...arguments),this.size=`1em`,this.weight=`regular`,this.color=`currentColor`,this.mirrored=!1}render(){return u`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?`scale(-1, 1)`:null}
    >
      ${g.weightsMap.get(this.weight??`regular`)}
    </svg>`}},g.weightsMap=new Map([[`thin`,o`<path d="M220,128a4,4,0,0,1-4,4H132v84a4,4,0,0,1-8,0V132H40a4,4,0,0,1,0-8h84V40a4,4,0,0,1,8,0v84h84A4,4,0,0,1,220,128Z"/>`],[`light`,o`<path d="M222,128a6,6,0,0,1-6,6H134v82a6,6,0,0,1-12,0V134H40a6,6,0,0,1,0-12h82V40a6,6,0,0,1,12,0v82h82A6,6,0,0,1,222,128Z"/>`],[`regular`,o`<path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>`],[`bold`,o`<path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z"/>`],[`fill`,o`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM184,136H136v48a8,8,0,0,1-16,0V136H72a8,8,0,0,1,0-16h48V72a8,8,0,0,1,16,0v48h48a8,8,0,0,1,0,16Z"/>`],[`duotone`,o`<path d="M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z" opacity="0.2"/><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>`]]),g.styles=i`
    :host {
      display: contents;
    }
  `,h([d({type:String,reflect:!0})],g.prototype,`size`,2),h([d({type:String,reflect:!0})],g.prototype,`weight`,2),h([d({type:String,reflect:!0})],g.prototype,`color`,2),h([d({type:Boolean,reflect:!0})],g.prototype,`mirrored`,2),g=h([a(`ph-plus`)],g)}))();export{g as PhPlus};