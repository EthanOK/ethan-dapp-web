import{B as e,E as t,S as n,V as r,b as i,g as a,q as o,r as s,ut as c}from"./ApiController-BspwwenT.js";import{A as l,P as u,f as d,h as f,l as p,m}from"./SolanaStoreUtil-BfqeOKJ6.js";import{c as h,o as g}from"./wui-text-BBxkFcIb.js";function _(){try{return e.returnOpenHref(`${c.SECURE_SITE_SDK_ORIGIN}/loading`,`popupWindow`,`width=600,height=800,scrollbars=yes`)}catch{throw Error(`Could not open social popup`)}}async function v(){n.push(`ConnectingFarcaster`);let e=a.getAuthConnector();if(e&&!s.getAccountData()?.farcasterUrl)try{let{url:t}=await e.provider.getFarcasterUri();s.setAccountProp(`farcasterUrl`,t,s.state.activeChain)}catch(e){n.goBack(),t.showError(e)}}async function y(c){n.push(`ConnectingSocial`);let l=a.getAuthConnector(),u=null;try{let t=setTimeout(()=>{throw Error(`Social login timed out. Please try again.`)},45e3);if(l&&c){if(e.isTelegram()||(u=_()),u)s.setAccountProp(`socialWindow`,o(u),s.state.activeChain);else if(!e.isTelegram())throw Error(`Could not create social popup`);let{uri:n}=await l.provider.getSocialRedirectUri({provider:c});if(!n)throw u?.close(),Error(`Could not fetch the social redirect uri`);if(u&&(u.location.href=n),e.isTelegram()){r.setTelegramSocialProvider(c);let t=e.formatTelegramSocialLoginUrl(n);e.openHref(t,`_top`)}clearTimeout(t)}}catch(n){u?.close();let r=e.parseError(n);t.showError(r),i.sendEvent({type:`track`,event:`SOCIAL_LOGIN_ERROR`,properties:{provider:c,message:r}})}}async function b(e){s.setAccountProp(`socialProvider`,e,s.state.activeChain),i.sendEvent({type:`track`,event:`SOCIAL_LOGIN_STARTED`,properties:{provider:e}}),e===`farcaster`?await v():await y(e)}var x=f`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e[20]};
    overflow: hidden;
  }

  wui-icon {
    width: 100%;
    height: 100%;
  }
`,S=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},C=class extends l{constructor(){super(...arguments),this.logo=`google`}render(){return u`<wui-icon color="inherit" size="inherit" name=${this.logo}></wui-icon> `}};C.styles=[m,x],S([h()],C.prototype,`logo`,void 0),C=S([p(`wui-logo`)],C);var w=f`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    text-transform: capitalize;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,T=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},E=class extends l{constructor(){super(...arguments),this.logo=`google`,this.name=`Continue with google`,this.disabled=!1}render(){return u`
      <button ?disabled=${this.disabled} tabindex=${g(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          <wui-image ?boxed=${!0} logo=${this.logo}></wui-image>
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `}};E.styles=[m,d,w],T([h()],E.prototype,`logo`,void 0),T([h()],E.prototype,`name`,void 0),T([h()],E.prototype,`tabIdx`,void 0),T([h({type:Boolean})],E.prototype,`disabled`,void 0),E=T([p(`wui-list-social`)],E);export{b as t};