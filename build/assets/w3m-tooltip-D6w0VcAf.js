import{L as e,S as t,v as n}from"./ApiController-DgaRH35e.js";import{n as r,u as i}from"./wui-text-DisgIUi0.js";import{n as a,o,r as s}from"./utils-DNdqbV_P.js";import{a as c,t as l,u}from"./lit-DYLA5iLF.js";import{c as d,l as f}from"./class-map-B3oaB8hb.js";import"./wui-icon-Cl7Enjp7.js";var p=s({message:``,open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:`shade`}),m=e({state:p,subscribe(e){return o(p,()=>e(p))},subscribeKey(e,t){return a(p,e,t)},showTooltip({message:e,triggerRect:t,variant:n}){p.open=!0,p.message=e,p.triggerRect=t,p.variant=n},hide(){p.open=!1,p.message=``,p.triggerRect={width:0,height:0,top:0,left:0}}}),h=u`
  :host {
    width: 100%;
    display: block;
  }
`,g=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},_=class extends l{constructor(){super(),this.unsubscribe=[],this.text=``,this.open=m.state.open,this.unsubscribe.push(t.subscribeKey(`view`,()=>{m.hide()}),n.subscribeKey(`open`,e=>{e||m.hide()}),m.subscribeKey(`open`,e=>{this.open=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),m.hide()}render(){return c`
      <div
        @pointermove=${this.onMouseEnter.bind(this)}
        @pointerleave=${this.onMouseLeave.bind(this)}
      >
        ${this.renderChildren()}
      </div>
    `}renderChildren(){return c`<slot></slot> `}onMouseEnter(){let e=this.getBoundingClientRect();if(!this.open){let t=document.querySelector(`w3m-modal`),n={width:e.width,height:e.height,left:e.left,top:e.top};if(t){let r=t.getBoundingClientRect();n.left=e.left-(window.innerWidth-r.width)/2,n.top=e.top-(window.innerHeight-r.height)/2}m.showTooltip({message:this.text,triggerRect:n,variant:`shade`})}}onMouseLeave(e){this.contains(e.relatedTarget)||m.hide()}};_.styles=[h],g([f()],_.prototype,`text`,void 0),g([d()],_.prototype,`open`,void 0),_=g([r(`w3m-tooltip-trigger`)],_);var v=i`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing:e})=>e[3]} 10px ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing:e})=>e[5]});
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`,y=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},b=class extends l{constructor(){super(),this.unsubscribe=[],this.open=m.state.open,this.message=m.state.message,this.triggerRect=m.state.triggerRect,this.variant=m.state.variant,this.unsubscribe.push(m.subscribe(e=>{this.open=e.open,this.message=e.message,this.triggerRect=e.triggerRect,this.variant=e.variant}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){this.dataset.variant=this.variant;let e=this.triggerRect.top,t=this.triggerRect.left;return this.style.cssText=`
    --w3m-tooltip-top: ${e}px;
    --w3m-tooltip-left: ${t}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;
    --w3m-tooltip-display: ${this.open?`flex`:`none`};
    --w3m-tooltip-opacity: ${+!!this.open};
    `,c`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};b.styles=[v],y([d()],b.prototype,`open`,void 0),y([d()],b.prototype,`message`,void 0),y([d()],b.prototype,`triggerRect`,void 0),y([d()],b.prototype,`variant`,void 0),b=y([r(`w3m-tooltip`)],b);