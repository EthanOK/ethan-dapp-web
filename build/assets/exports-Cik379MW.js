import{r as e}from"./rolldown-runtime-BG2f4sTM.js";import{B as t,C as n,E as r,F as i,H as a,I as o,N as s,P as c,R as l,S as u,V as d,_ as ee,at as te,b as f,d as ne,g as p,h as re,l as m,n as ie,nt as ae,r as h,t as g,ut as _,v,w as oe,x as se}from"./ApiController-BspwwenT.js";import{A as y,B as ce,C as le,P as b,T as ue,_ as de,a as fe,c as x,d as S,f as C,h as w,l as T,m as E,s as pe,z as D}from"./SolanaStoreUtil-BfqeOKJ6.js";import{t as me}from"./NavigationUtil-CLCRNDHF.js";import{c as O,o as k,s as A,t as he}from"./wui-text-BBxkFcIb.js";import"./w3m-tooltip-w3Tl2L_Z.js";import{t as ge}from"./wui-loading-thumbnail-D38wYzhQ.js";import{t as j}from"./ExchangeController-NbMolpZt.js";import"./wui-loading-spinner-gACs-jB2.js";import"./wui-button-Dtm3kduT.js";import"./wui-icon-cVJ2ySbU.js";import"./wui-icon-link-PzJ-XYIW.js";import"./wui-image-DTFkqfdE.js";import"./wui-list-item-C65A_jW9.js";import"./wui-loading-spinner-UOt_IWPa.js";import{t as _e}from"./wui-wallet-switch-Ca49y-tn.js";import"./wui-separator-SNYU5OYp.js";import"./wui-icon-box-BHp4Aw-V.js";import{t as ve}from"./wui-list-social-B4sHP4X5.js";import{t as ye}from"./ConstantsUtil-BzVOL_Q_.js";import"./wui-shimmer-4p7pwMCx.js";import"./wui-shimmer-CyXy13ii.js";import"./wui-link-Y7lQpR9d.js";import"./wui-icon-box-BJ4i1INt.js";import{n as be,t as xe}from"./ref-CSmfitxF.js";import"./wui-input-text-8j6QIeg8.js";import"./wui-email-input-FvWJl25Z.js";import{t as Se}from"./HelpersUtil-D79F0d_O.js";import"./wui-avatar-BjJplgLK.js";import"./w3m-onramp-providers-footer-Ckq__6Qe.js";import{n as Ce,t as we}from"./wui-list-wallet-DV5C8PPU.js";import"./w3m-activity-list-C62W6gDD.js";import"./wui-list-token-BuNeCFNl.js";import"./wui-qr-code-D72jU0Nv.js";import"./wui-visual-Gy8rMQUE.js";import"./wui-input-text-nJaQqUaD.js";var Te=w`
  :host {
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[20]};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[16]};
    height: 32px;
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: box-shadow;
  }

  button wui-flex.avatar-container {
    width: 28px;
    height: 24px;
    position: relative;

    wui-flex.network-image-container {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: 12px;
      height: 12px;
    }

    wui-flex.network-image-container wui-icon {
      background: ${({tokens:e})=>e.theme.foregroundPrimary};
    }

    wui-avatar {
      width: 24px;
      min-width: 24px;
      height: 24px;
    }

    wui-icon {
      width: 12px;
      height: 12px;
    }
  }

  wui-image,
  wui-icon {
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  wui-text {
    white-space: nowrap;
  }

  button wui-flex.balance-container {
    height: 100%;
    border-radius: ${({borderRadius:e})=>e[16]};
    padding-left: ${({spacing:e})=>e[1]};
    padding-right: ${({spacing:e})=>e[1]};
    background: ${({tokens:e})=>e.theme.foregroundSecondary};
    color: ${({tokens:e})=>e.theme.textPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:focus-visible:enabled,
  button:active:enabled {
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.2);

    wui-flex.balance-container {
      background: ${({tokens:e})=>e.theme.foregroundTertiary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled wui-text,
  button:disabled wui-flex.avatar-container {
    opacity: 0.3;
  }
`,M=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},N=class extends y{constructor(){super(...arguments),this.networkSrc=void 0,this.avatarSrc=void 0,this.balance=void 0,this.isUnsupportedChain=void 0,this.disabled=!1,this.loading=!1,this.address=``,this.profileName=``,this.charsStart=4,this.charsEnd=6}render(){return b`
      <button
        ?disabled=${this.disabled}
        class=${k(this.balance?void 0:`local-no-balance`)}
        data-error=${k(this.isUnsupportedChain)}
      >
        ${this.imageTemplate()} ${this.addressTemplate()} ${this.balanceTemplate()}
      </button>
    `}imageTemplate(){let e=this.networkSrc?b`<wui-image src=${this.networkSrc}></wui-image>`:b` <wui-icon size="inherit" color="inherit" name="networkPlaceholder"></wui-icon> `;return b`<wui-flex class="avatar-container">
      <wui-avatar
        .imageSrc=${this.avatarSrc}
        alt=${this.address}
        address=${this.address}
      ></wui-avatar>

      <wui-flex class="network-image-container">${e}</wui-flex>
    </wui-flex>`}addressTemplate(){return b`<wui-text variant="md-regular" color="inherit">
      ${this.address?S.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?18:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?`end`:`middle`}):null}
    </wui-text>`}balanceTemplate(){return this.balance?b`<wui-flex alignItems="center" justifyContent="center" class="balance-container"
        >${this.loading?b`<wui-loading-spinner size="md" color="inherit"></wui-loading-spinner>`:b`<wui-text variant="md-regular" color="inherit"> ${this.balance}</wui-text>`}</wui-flex
      >`:null}};N.styles=[E,C,Te],M([O()],N.prototype,`networkSrc`,void 0),M([O()],N.prototype,`avatarSrc`,void 0),M([O()],N.prototype,`balance`,void 0),M([O({type:Boolean})],N.prototype,`isUnsupportedChain`,void 0),M([O({type:Boolean})],N.prototype,`disabled`,void 0),M([O({type:Boolean})],N.prototype,`loading`,void 0),M([O()],N.prototype,`address`,void 0),M([O()],N.prototype,`profileName`,void 0),M([O()],N.prototype,`charsStart`,void 0),M([O()],N.prototype,`charsEnd`,void 0),N=M([T(`wui-account-button`)],N);var P=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},F=class extends y{constructor(){super(...arguments),this.unsubscribe=[],this.disabled=!1,this.balance=`show`,this.charsStart=4,this.charsEnd=6,this.namespace=void 0,this.isSupported=l.state.allowUnsupportedChain?!0:h.state.activeChain?h.checkIfSupportedNetwork(h.state.activeChain):!0}connectedCallback(){super.connectedCallback(),this.setAccountData(h.getAccountData(this.namespace)),this.setNetworkData(h.getNetworkData(this.namespace))}firstUpdated(){let e=this.namespace;e?this.unsubscribe.push(h.subscribeChainProp(`accountState`,e=>{this.setAccountData(e)},e),h.subscribeChainProp(`networkState`,t=>{this.setNetworkData(t),this.isSupported=h.checkIfSupportedNetwork(e,t?.caipNetwork?.caipNetworkId)},e)):this.unsubscribe.push(i.subscribeNetworkImages(()=>{this.networkImage=c.getNetworkImage(this.network)}),h.subscribeKey(`activeCaipAddress`,e=>{this.caipAddress=e}),h.subscribeChainProp(`accountState`,e=>{this.setAccountData(e)}),h.subscribeKey(`activeCaipNetwork`,e=>{this.network=e,this.networkImage=c.getNetworkImage(e),this.isSupported=e?.chainNamespace?h.checkIfSupportedNetwork(e?.chainNamespace):!0,this.fetchNetworkImage(e)}))}updated(){this.fetchNetworkImage(this.network)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!h.state.activeChain)return null;let e=this.balance===`show`,n=typeof this.balanceVal!=`string`,{formattedText:r}=t.parseBalance(this.balanceVal,this.balanceSymbol);return b`
      <wui-account-button
        .disabled=${!!this.disabled}
        .isUnsupportedChain=${l.state.allowUnsupportedChain?!1:!this.isSupported}
        address=${k(t.getPlainAddress(this.caipAddress))}
        profileName=${k(this.profileName)}
        networkSrc=${k(this.networkImage)}
        avatarSrc=${k(this.profileImage)}
        balance=${e?r:``}
        @click=${this.onClick.bind(this)}
        data-testid=${`account-button${this.namespace?`-${this.namespace}`:``}`}
        .charsStart=${this.charsStart}
        .charsEnd=${this.charsEnd}
        ?loading=${n}
      >
      </wui-account-button>
    `}onClick(){this.isSupported||l.state.allowUnsupportedChain?v.open({namespace:this.namespace}):v.open({view:`UnsupportedChain`})}async fetchNetworkImage(e){e?.assets?.imageId&&(this.networkImage=await c.fetchNetworkImage(e?.assets?.imageId))}setAccountData(e){e&&(this.caipAddress=e.caipAddress,this.balanceVal=e.balance,this.balanceSymbol=e.balanceSymbol,this.profileName=e.profileName,this.profileImage=e.profileImage)}setNetworkData(e){e&&(this.network=e.caipNetwork,this.networkImage=c.getNetworkImage(e.caipNetwork))}};P([O({type:Boolean})],F.prototype,`disabled`,void 0),P([O()],F.prototype,`balance`,void 0),P([O()],F.prototype,`charsStart`,void 0),P([O()],F.prototype,`charsEnd`,void 0),P([O()],F.prototype,`namespace`,void 0),P([A()],F.prototype,`caipAddress`,void 0),P([A()],F.prototype,`balanceVal`,void 0),P([A()],F.prototype,`balanceSymbol`,void 0),P([A()],F.prototype,`profileName`,void 0),P([A()],F.prototype,`profileImage`,void 0),P([A()],F.prototype,`network`,void 0),P([A()],F.prototype,`networkImage`,void 0),P([A()],F.prototype,`isSupported`,void 0);var Ee=class extends F{};Ee=P([T(`w3m-account-button`)],Ee);var De=class extends F{};De=P([T(`appkit-account-button`)],De);var Oe=D`
  :host {
    display: block;
    width: max-content;
  }
`,I=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},L=class extends y{constructor(){super(...arguments),this.unsubscribe=[],this.disabled=!1,this.balance=void 0,this.size=void 0,this.label=void 0,this.loadingLabel=void 0,this.charsStart=4,this.charsEnd=6,this.namespace=void 0}firstUpdated(){this.caipAddress=this.namespace?h.getAccountData(this.namespace)?.caipAddress:h.state.activeCaipAddress,this.namespace?this.unsubscribe.push(h.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress},this.namespace)):this.unsubscribe.push(h.subscribeKey(`activeCaipAddress`,e=>this.caipAddress=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return this.caipAddress?b`
          <appkit-account-button
            .disabled=${!!this.disabled}
            balance=${k(this.balance)}
            .charsStart=${k(this.charsStart)}
            .charsEnd=${k(this.charsEnd)}
            namespace=${k(this.namespace)}
          >
          </appkit-account-button>
        `:b`
          <appkit-connect-button
            size=${k(this.size)}
            label=${k(this.label)}
            loadingLabel=${k(this.loadingLabel)}
            namespace=${k(this.namespace)}
          ></appkit-connect-button>
        `}};L.styles=Oe,I([O({type:Boolean})],L.prototype,`disabled`,void 0),I([O()],L.prototype,`balance`,void 0),I([O()],L.prototype,`size`,void 0),I([O()],L.prototype,`label`,void 0),I([O()],L.prototype,`loadingLabel`,void 0),I([O()],L.prototype,`charsStart`,void 0),I([O()],L.prototype,`charsEnd`,void 0),I([O()],L.prototype,`namespace`,void 0),I([A()],L.prototype,`caipAddress`,void 0);var ke=class extends L{};ke=I([T(`w3m-button`)],ke);var Ae=class extends L{};Ae=I([T(`appkit-button`)],Ae);var je=w`
  :host {
    position: relative;
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='sm'] {
    padding: ${({spacing:e})=>e[2]};
  }

  button[data-size='md'] {
    padding: ${({spacing:e})=>e[3]};
  }

  button[data-size='lg'] {
    padding: ${({spacing:e})=>e[4]};
  }

  button[data-variant='primary'] {
    background: ${({tokens:e})=>e.core.backgroundAccentPrimary};
  }

  button[data-variant='secondary'] {
    background: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button:hover:enabled {
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  button:disabled {
    cursor: not-allowed;
  }

  button[data-loading='true'] {
    cursor: not-allowed;
  }

  button[data-loading='true'][data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
  }

  button[data-loading='true'][data-size='md'] {
    border-radius: ${({borderRadius:e})=>e[20]};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[4]};
  }

  button[data-loading='true'][data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[16]};
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[5]};
  }
`,Me=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ne=class extends y{constructor(){super(...arguments),this.size=`md`,this.variant=`primary`,this.loading=!1,this.text=`Connect Wallet`}render(){return b`
      <button
        data-loading=${this.loading}
        data-variant=${this.variant}
        data-size=${this.size}
        ?disabled=${this.loading}
      >
        ${this.contentTemplate()}
      </button>
    `}contentTemplate(){let e={lg:`lg-regular`,md:`md-regular`,sm:`sm-regular`},t={primary:`invert`,secondary:`accent-primary`};return this.loading?b`<wui-loading-spinner
      color=${t[this.variant]}
      size=${this.size}
    ></wui-loading-spinner>`:b` <wui-text variant=${e[this.size]} color=${t[this.variant]}>
        ${this.text}
      </wui-text>`}};Ne.styles=[E,C,je],Me([O()],Ne.prototype,`size`,void 0),Me([O()],Ne.prototype,`variant`,void 0),Me([O({type:Boolean})],Ne.prototype,`loading`,void 0),Me([O()],Ne.prototype,`text`,void 0),Ne=Me([T(`wui-connect-button`)],Ne);var Pe=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Fe=class extends y{constructor(){super(),this.unsubscribe=[],this.size=`md`,this.label=`Connect Wallet`,this.loadingLabel=`Connecting...`,this.open=v.state.open,this.loading=this.namespace?v.state.loadingNamespaceMap.get(this.namespace):v.state.loading,this.unsubscribe.push(v.subscribe(e=>{this.open=e.open,this.loading=this.namespace?e.loadingNamespaceMap.get(this.namespace):e.loading}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return b`
      <wui-connect-button
        size=${k(this.size)}
        .loading=${this.loading}
        @click=${this.onClick.bind(this)}
        data-testid=${`connect-button${this.namespace?`-${this.namespace}`:``}`}
      >
        ${this.loading?this.loadingLabel:this.label}
      </wui-connect-button>
    `}onClick(){this.open?v.close():this.loading||v.open({view:`Connect`,namespace:this.namespace})}};Pe([O()],Fe.prototype,`size`,void 0),Pe([O()],Fe.prototype,`label`,void 0),Pe([O()],Fe.prototype,`loadingLabel`,void 0),Pe([O()],Fe.prototype,`namespace`,void 0),Pe([A()],Fe.prototype,`open`,void 0),Pe([A()],Fe.prototype,`loading`,void 0);var Ie=class extends Fe{};Ie=Pe([T(`w3m-connect-button`)],Ie);var Le=class extends Fe{};Le=Pe([T(`appkit-connect-button`)],Le);var Re=w`
  :host {
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[32]};
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]}
      ${({spacing:e})=>e[1]} ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button[data-size='sm'] > wui-icon-box,
  button[data-size='sm'] > wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-icon-box,
  button[data-size='md'] > wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='lg'] > wui-icon-box,
  button[data-size='lg'] > wui-image {
    width: 24px;
    height: 24px;
  }

  wui-image,
  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e[32]};
  }
`,ze=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Be=class extends y{constructor(){super(...arguments),this.imageSrc=void 0,this.isUnsupportedChain=void 0,this.disabled=!1,this.size=`lg`}render(){return b`
      <button data-size=${this.size} data-testid="wui-network-button" ?disabled=${this.disabled}>
        ${this.visualTemplate()}
        <wui-text variant=${{sm:`sm-regular`,md:`md-regular`,lg:`lg-regular`}[this.size]} color="primary">
          <slot></slot>
        </wui-text>
      </button>
    `}visualTemplate(){return this.isUnsupportedChain?b` <wui-icon-box color="error" icon="warningCircle"></wui-icon-box> `:this.imageSrc?b`<wui-image src=${this.imageSrc}></wui-image>`:b` <wui-icon size="xl" color="default" name="networkPlaceholder"></wui-icon> `}};Be.styles=[E,C,Re],ze([O()],Be.prototype,`imageSrc`,void 0),ze([O({type:Boolean})],Be.prototype,`isUnsupportedChain`,void 0),ze([O({type:Boolean})],Be.prototype,`disabled`,void 0),ze([O()],Be.prototype,`size`,void 0),Be=ze([T(`wui-network-button`)],Be);var Ve=D`
  :host {
    display: block;
    width: max-content;
  }
`,He=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ue=class extends y{constructor(){super(),this.unsubscribe=[],this.disabled=!1,this.network=h.state.activeCaipNetwork,this.networkImage=c.getNetworkImage(this.network),this.caipAddress=h.state.activeCaipAddress,this.loading=v.state.loading,this.isSupported=l.state.allowUnsupportedChain?!0:h.state.activeChain?h.checkIfSupportedNetwork(h.state.activeChain):!0,this.unsubscribe.push(i.subscribeNetworkImages(()=>{this.networkImage=c.getNetworkImage(this.network)}),h.subscribeKey(`activeCaipAddress`,e=>{this.caipAddress=e}),h.subscribeKey(`activeCaipNetwork`,e=>{this.network=e,this.networkImage=c.getNetworkImage(e),this.isSupported=e?.chainNamespace?h.checkIfSupportedNetwork(e.chainNamespace):!0,c.fetchNetworkImage(e?.assets?.imageId)}),v.subscribeKey(`loading`,e=>this.loading=e))}firstUpdated(){c.fetchNetworkImage(this.network?.assets?.imageId)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.network?h.checkIfSupportedNetwork(this.network.chainNamespace):!0;return b`
      <wui-network-button
        .disabled=${!!(this.disabled||this.loading)}
        .isUnsupportedChain=${l.state.allowUnsupportedChain?!1:!e}
        imageSrc=${k(this.networkImage)}
        @click=${this.onClick.bind(this)}
        data-testid="w3m-network-button"
      >
        ${this.getLabel()}
        <slot></slot>
      </wui-network-button>
    `}getLabel(){return this.network?!this.isSupported&&!l.state.allowUnsupportedChain?`Switch Network`:this.network.name:this.label?this.label:this.caipAddress?`Unknown Network`:`Select Network`}onClick(){this.loading||(f.sendEvent({type:`track`,event:`CLICK_NETWORKS`}),v.open({view:`Networks`}))}};Ue.styles=Ve,He([O({type:Boolean})],Ue.prototype,`disabled`,void 0),He([O({type:String})],Ue.prototype,`label`,void 0),He([A()],Ue.prototype,`network`,void 0),He([A()],Ue.prototype,`networkImage`,void 0),He([A()],Ue.prototype,`caipAddress`,void 0),He([A()],Ue.prototype,`loading`,void 0),He([A()],Ue.prototype,`isSupported`,void 0);var We=class extends Ue{};We=He([T(`w3m-network-button`)],We);var Ge=class extends Ue{};Ge=He([T(`appkit-network-button`)],Ge);var Ke=w`
  :host {
    display: block;
  }

  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[4]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  wui-flex > wui-icon {
    padding: ${({spacing:e})=>e[2]};
    color: ${({tokens:e})=>e.theme.textInvert};
    background-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    border-radius: ${({borderRadius:e})=>e[2]};
    align-items: center;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent020};
    }
  }
`,qe=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Je=class extends y{constructor(){super(...arguments),this.label=``,this.description=``,this.icon=`wallet`}render(){return b`
      <button>
        <wui-flex gap="2" alignItems="center">
          <wui-icon weight="fill" size="lg" name=${this.icon} color="inherit"></wui-icon>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.label}</wui-text>
            <wui-text variant="md-regular" color="tertiary">${this.description}</wui-text>
          </wui-flex>
        </wui-flex>
        <wui-icon size="lg" color="accent-primary" name="chevronRight"></wui-icon>
      </button>
    `}};Je.styles=[E,C,Ke],qe([O()],Je.prototype,`label`,void 0),qe([O()],Je.prototype,`description`,void 0),qe([O()],Je.prototype,`icon`,void 0),Je=qe([T(`wui-notice-card`)],Je);var Ye=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Xe=class extends y{constructor(){super(),this.unsubscribe=[],this.socialProvider=d.getConnectedSocialProvider(),this.socialUsername=d.getConnectedSocialUsername(),this.namespace=h.state.activeChain,this.unsubscribe.push(h.subscribeKey(`activeChain`,e=>{this.namespace=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=p.getConnectorId(this.namespace),t=p.getAuthConnector();if(!t||e!==_.CONNECTOR_ID.AUTH)return this.style.cssText=`display: none`,null;let n=t.provider.getEmail()??``;return!n&&!this.socialUsername?(this.style.cssText=`display: none`,null):b`
      <wui-list-item
        ?rounded=${!0}
        icon=${this.socialProvider??`mail`}
        data-testid="w3m-account-email-update"
        ?chevron=${!this.socialProvider}
        @click=${()=>{this.onGoToUpdateEmail(n,this.socialProvider)}}
      >
        <wui-text variant="lg-regular" color="primary">${this.getAuthName(n)}</wui-text>
      </wui-list-item>
    `}onGoToUpdateEmail(e,t){t||u.push(`UpdateEmailWallet`,{email:e,redirectView:`Account`})}getAuthName(e){return this.socialUsername?this.socialProvider===`discord`&&this.socialUsername.endsWith(`0`)?this.socialUsername.slice(0,-1):this.socialUsername:e.length>30?`${e.slice(0,-3)}...`:e}};Ye([A()],Xe.prototype,`namespace`,void 0),Xe=Ye([T(`w3m-account-auth-button`)],Xe);var Ze=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Qe=class extends y{constructor(){super(),this.usubscribe=[],this.networkImages=i.state.networkImages,this.address=h.getAccountData()?.address,this.profileImage=h.getAccountData()?.profileImage,this.profileName=h.getAccountData()?.profileName,this.network=h.state.activeCaipNetwork,this.disconnecting=!1,this.remoteFeatures=l.state.remoteFeatures,this.usubscribe.push(h.subscribeChainProp(`accountState`,e=>{e&&(this.address=e.address,this.profileImage=e.profileImage,this.profileName=e.profileName)}),h.subscribeKey(`activeCaipNetwork`,e=>{e?.id&&(this.network=e)}),l.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.usubscribe.forEach(e=>e())}render(){if(!this.address)throw Error(`w3m-account-settings-view: No account provided`);let e=this.networkImages[this.network?.assets?.imageId??``];return b`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding=${[`0`,`5`,`3`,`5`]}
      >
        <wui-avatar
          alt=${this.address}
          address=${this.address}
          imageSrc=${k(this.profileImage)}
          size="lg"
        ></wui-avatar>
        <wui-flex flexDirection="column" alignItems="center">
          <wui-flex gap="1" alignItems="center" justifyContent="center">
            <wui-text variant="h5-medium" color="primary" data-testid="account-settings-address">
              ${S.getTruncateString({string:this.address,charsStart:4,charsEnd:6,truncate:`middle`})}
            </wui-text>
            <wui-icon-link
              size="md"
              icon="copy"
              iconColor="default"
              @click=${this.onCopyAddress}
            ></wui-icon-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" gap="4">
        <wui-flex flexDirection="column" gap="2" .padding=${[`6`,`4`,`3`,`4`]}>
          ${this.authCardTemplate()}
          <w3m-account-auth-button></w3m-account-auth-button>
          <wui-list-item
            imageSrc=${k(e)}
            ?chevron=${this.isAllowedNetworkSwitch()}
            ?fullSize=${!0}
            ?rounded=${!0}
            @click=${this.onNetworks.bind(this)}
            data-testid="account-switch-network-button"
          >
            <wui-text variant="lg-regular" color="primary">
              ${this.network?.name??`Unknown`}
            </wui-text>
          </wui-list-item>
          ${this.smartAccountSettingsTemplate()} ${this.chooseNameButtonTemplate()}
          <wui-list-item
            ?rounded=${!0}
            icon="power"
            iconColor="error"
            ?chevron=${!1}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `}chooseNameButtonTemplate(){let e=this.network?.chainNamespace,t=p.getConnectorId(e),n=p.getAuthConnector();return!h.checkIfNamesSupported()||!n||t!==_.CONNECTOR_ID.AUTH||this.profileName?null:b`
      <wui-list-item
        icon="id"
        ?rounded=${!0}
        ?chevron=${!0}
        @click=${this.onChooseName.bind(this)}
        data-testid="account-choose-name-button"
      >
        <wui-text variant="lg-regular" color="primary">Choose account name </wui-text>
      </wui-list-item>
    `}authCardTemplate(){let e=p.getConnectorId(this.network?.chainNamespace),t=p.getAuthConnector(),{origin:n}=location;return!t||e!==_.CONNECTOR_ID.AUTH||n.includes(a.SECURE_SITE)?null:b`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `}isAllowedNetworkSwitch(){let e=h.getAllRequestedCaipNetworks(),t=e?e.length>1:!1,n=e?.find(({id:e})=>e===this.network?.id);return t||!n}onCopyAddress(){try{this.address&&(t.copyToClopboard(this.address),r.showSuccess(`Address copied`))}catch{r.showError(`Failed to copy`)}}smartAccountSettingsTemplate(){let e=this.network?.chainNamespace,t=h.checkIfSmartAccountEnabled(),n=p.getConnectorId(e);return!p.getAuthConnector()||n!==_.CONNECTOR_ID.AUTH||!t?null:b`
      <wui-list-item
        icon="user"
        ?rounded=${!0}
        ?chevron=${!0}
        @click=${this.onSmartAccountSettings.bind(this)}
        data-testid="account-smart-account-settings-button"
      >
        <wui-text variant="lg-regular" color="primary">Smart Account Settings</wui-text>
      </wui-list-item>
    `}onChooseName(){u.push(`ChooseAccountName`)}onNetworks(){this.isAllowedNetworkSwitch()&&u.push(`Networks`)}async onDisconnect(){try{this.disconnecting=!0;let e=this.network?.chainNamespace,t=m.getConnections(e).length>0,n=e&&p.state.activeConnectorIds[e],i=this.remoteFeatures?.multiWallet;await m.disconnect(i?{id:n,namespace:e}:{}),t&&i&&(u.push(`ProfileWallets`),r.showSuccess(`Wallet deleted`))}catch{f.sendEvent({type:`track`,event:`DISCONNECT_ERROR`,properties:{message:`Failed to disconnect`}}),r.showError(`Failed to disconnect`)}finally{this.disconnecting=!1}}onGoToUpgradeView(){f.sendEvent({type:`track`,event:`EMAIL_UPGRADE_FROM_MODAL`}),u.push(`UpgradeEmailWallet`)}onSmartAccountSettings(){u.push(`SmartAccountSettings`)}};Ze([A()],Qe.prototype,`address`,void 0),Ze([A()],Qe.prototype,`profileImage`,void 0),Ze([A()],Qe.prototype,`profileName`,void 0),Ze([A()],Qe.prototype,`network`,void 0),Ze([A()],Qe.prototype,`disconnecting`,void 0),Ze([A()],Qe.prototype,`remoteFeatures`,void 0),Qe=Ze([T(`w3m-account-settings-view`)],Qe);var $e=w`
  :host {
    flex: 1;
    height: 100%;
  }

  button {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    column-gap: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-active='true'] {
    color: ${({tokens:e})=>e.theme.textPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundTertiary};
  }

  button:hover:enabled:not([data-active='true']),
  button:active:enabled:not([data-active='true']) {
    wui-text,
    wui-icon {
      color: ${({tokens:e})=>e.theme.textPrimary};
    }
  }
`,et=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},tt={lg:`lg-regular`,md:`md-regular`,sm:`sm-regular`},nt={lg:`md`,md:`sm`,sm:`sm`},rt=class extends y{constructor(){super(...arguments),this.icon=`mobile`,this.size=`md`,this.label=``,this.active=!1}render(){return b`
      <button data-active=${this.active}>
        ${this.icon?b`<wui-icon size=${nt[this.size]} name=${this.icon}></wui-icon>`:``}
        <wui-text variant=${tt[this.size]}> ${this.label} </wui-text>
      </button>
    `}};rt.styles=[E,C,$e],et([O()],rt.prototype,`icon`,void 0),et([O()],rt.prototype,`size`,void 0),et([O()],rt.prototype,`label`,void 0),et([O({type:Boolean})],rt.prototype,`active`,void 0),rt=et([T(`wui-tab-item`)],rt);var it=w`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e[`01`]};
    box-sizing: border-box;
  }

  :host([data-size='sm']) {
    height: 26px;
  }

  :host([data-size='md']) {
    height: 36px;
  }
`,at=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ot=class extends y{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.size=`md`,this.activeTab=0}render(){return this.dataset.size=this.size,this.tabs.map((e,t)=>{let n=t===this.activeTab;return b`
        <wui-tab-item
          @click=${()=>this.onTabClick(t)}
          icon=${e.icon}
          size=${this.size}
          label=${e.label}
          ?active=${n}
          data-active=${n}
          data-testid="tab-${e.label?.toLowerCase()}"
        ></wui-tab-item>
      `})}onTabClick(e){this.activeTab=e,this.onTabChange(e)}};ot.styles=[E,C,it],at([O({type:Array})],ot.prototype,`tabs`,void 0),at([O()],ot.prototype,`onTabChange`,void 0),at([O()],ot.prototype,`size`,void 0),at([A()],ot.prototype,`activeTab`,void 0),ot=at([T(`wui-tabs`)],ot);var st=w`
  wui-icon-link {
    margin-right: calc(${({spacing:e})=>e[8]} * -1);
  }

  wui-notice-card {
    margin-bottom: ${({spacing:e})=>e[1]};
  }

  wui-list-item > wui-text {
    flex: 1;
  }

  w3m-transactions-view {
    max-height: 200px;
  }

  .balance-container {
    display: inline;
  }

  .tab-content-container {
    height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .symbol {
    transform: translateY(-2px);
  }

  .tab-content-container::-webkit-scrollbar {
    display: none;
  }

  .account-button {
    width: auto;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[3]};
    height: 48px;
    padding: ${({spacing:e})=>e[2]};
    padding-right: ${({spacing:e})=>e[3]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[6]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
  }

  .account-button:hover {
    background-color: ${({tokens:e})=>e.core.glass010};
  }

  .avatar-container {
    position: relative;
  }

  wui-avatar.avatar {
    width: 32px;
    height: 32px;
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.core.glass010};
  }

  wui-wallet-switch {
    margin-top: ${({spacing:e})=>e[2]};
  }

  wui-avatar.network-avatar {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 100%;
    top: 100%;
    transform: translate(-75%, -75%);
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.core.glass010};
  }

  .account-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .account-links wui-flex {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background: red;
    align-items: center;
    justify-content: center;
    height: 48px;
    padding: 10px;
    flex: 1 0 0;
    border-radius: var(--XS, 16px);
    border: 1px solid var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    background: var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    transition:
      background-color ${({durations:e})=>e.md}
        ${({easings:e})=>e[`ease-out-power-1`]},
      opacity ${({durations:e})=>e.md} ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color, opacity;
  }

  .account-links wui-flex:hover {
    background: var(--dark-accent-glass-015, rgba(71, 161, 255, 0.15));
  }

  .account-links wui-flex wui-icon {
    width: var(--S, 20px);
    height: var(--S, 20px);
  }

  .account-links wui-flex wui-icon svg path {
    stroke: #667dff;
  }
`,R=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},z=class extends y{constructor(){super(),this.unsubscribe=[],this.caipAddress=h.getAccountData()?.caipAddress,this.address=t.getPlainAddress(h.getAccountData()?.caipAddress),this.profileImage=h.getAccountData()?.profileImage,this.profileName=h.getAccountData()?.profileName,this.disconnecting=!1,this.balance=h.getAccountData()?.balance,this.balanceSymbol=h.getAccountData()?.balanceSymbol,this.features=l.state.features,this.remoteFeatures=l.state.remoteFeatures,this.namespace=h.state.activeChain,this.activeConnectorIds=p.state.activeConnectorIds,this.unsubscribe.push(h.subscribeChainProp(`accountState`,e=>{this.address=t.getPlainAddress(e?.caipAddress),this.caipAddress=e?.caipAddress,this.balance=e?.balance,this.balanceSymbol=e?.balanceSymbol,this.profileName=e?.profileName,this.profileImage=e?.profileImage}),l.subscribeKey(`features`,e=>this.features=e),l.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e),p.subscribeKey(`activeConnectorIds`,e=>{this.activeConnectorIds=e}),h.subscribeKey(`activeChain`,e=>this.namespace=e),h.subscribeKey(`activeCaipNetwork`,e=>{e?.chainNamespace&&(this.namespace=e?.chainNamespace)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!this.caipAddress||!this.namespace)return null;let e=this.activeConnectorIds[this.namespace],n=e?p.getConnectorById(e):void 0,r=c.getConnectorImage(n),{value:i,decimals:a,symbol:o}=t.parseBalance(this.balance,this.balanceSymbol);return b`<wui-flex
        flexDirection="column"
        .padding=${[`0`,`5`,`4`,`5`]}
        alignItems="center"
        gap="3"
      >
        <wui-avatar
          alt=${k(this.caipAddress)}
          address=${k(t.getPlainAddress(this.caipAddress))}
          imageSrc=${k(this.profileImage===null?void 0:this.profileImage)}
          data-testid="single-account-avatar"
        ></wui-avatar>
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          imageSrc=${r}
          alt=${n?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
        <div class="balance-container">
          <wui-text variant="h3-regular" color="primary">${i}</wui-text>
          <wui-text variant="h3-regular" color="secondary">.${a}</wui-text>
          <wui-text variant="h6-medium" color="primary" class="symbol">${o}</wui-text>
        </div>
        ${this.explorerBtnTemplate()}
      </wui-flex>

      <wui-flex flexDirection="column" gap="2" .padding=${[`0`,`3`,`3`,`3`]}>
        ${this.authCardTemplate()} <w3m-account-auth-button></w3m-account-auth-button>
        ${this.orderedFeaturesTemplate()} ${this.activityTemplate()}
        <wui-list-item
          .rounded=${!0}
          icon="power"
          iconColor="error"
          ?chevron=${!1}
          .loading=${this.disconnecting}
          .rightIcon=${!1}
          @click=${this.onDisconnect.bind(this)}
          data-testid="disconnect-button"
        >
          <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>`}fundWalletTemplate(){if(!this.namespace)return null;let e=a.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),t=!!this.features?.receive,n=this.remoteFeatures?.onramp&&e,r=j.isPayWithExchangeEnabled();return!n&&!t&&!r?null:b`
      <wui-list-item
        .rounded=${!0}
        data-testid="w3m-account-default-fund-wallet-button"
        iconVariant="blue"
        icon="dollar"
        ?chevron=${!0}
        @click=${this.handleClickFundWallet.bind(this)}
      >
        <wui-text variant="lg-regular" color="primary">Fund wallet</wui-text>
      </wui-list-item>
    `}orderedFeaturesTemplate(){return(this.features?.walletFeaturesOrder||a.DEFAULT_FEATURES.walletFeaturesOrder).map(e=>{switch(e){case`onramp`:return this.fundWalletTemplate();case`swaps`:return this.swapsTemplate();case`send`:return this.sendTemplate();default:return null}})}activityTemplate(){return this.namespace&&this.remoteFeatures?.activity&&a.ACTIVITY_ENABLED_CHAIN_NAMESPACES.includes(this.namespace)?b` <wui-list-item
          .rounded=${!0}
          icon="clock"
          ?chevron=${!0}
          @click=${this.onTransactions.bind(this)}
          data-testid="w3m-account-default-activity-button"
        >
          <wui-text variant="lg-regular" color="primary">Activity</wui-text>
        </wui-list-item>`:null}swapsTemplate(){let e=this.remoteFeatures?.swaps,t=h.state.activeChain===_.CHAIN.EVM;return!e||!t?null:b`
      <wui-list-item
        .rounded=${!0}
        icon="recycleHorizontal"
        ?chevron=${!0}
        @click=${this.handleClickSwap.bind(this)}
        data-testid="w3m-account-default-swaps-button"
      >
        <wui-text variant="lg-regular" color="primary">Swap</wui-text>
      </wui-list-item>
    `}sendTemplate(){let e=this.features?.send,t=h.state.activeChain;if(!t)throw Error(`SendController:sendTemplate - namespace is required`);let n=a.SEND_SUPPORTED_NAMESPACES.includes(t);return!e||!n?null:b`
      <wui-list-item
        .rounded=${!0}
        icon="send"
        ?chevron=${!0}
        @click=${this.handleClickSend.bind(this)}
        data-testid="w3m-account-default-send-button"
      >
        <wui-text variant="lg-regular" color="primary">Send</wui-text>
      </wui-list-item>
    `}authCardTemplate(){let e=h.state.activeChain;if(!e)throw Error(`AuthCardTemplate:authCardTemplate - namespace is required`);let t=p.getConnectorId(e),n=p.getAuthConnector(),{origin:r}=location;return!n||t!==_.CONNECTOR_ID.AUTH||r.includes(a.SECURE_SITE)?null:b`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `}handleClickFundWallet(){u.push(`FundWallet`)}handleClickSwap(){u.push(`Swap`)}handleClickSend(){u.push(`WalletSend`)}explorerBtnTemplate(){return h.getAccountData()?.addressExplorerUrl?b`
      <wui-button size="md" variant="accent-primary" @click=${this.onExplorer.bind(this)}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="compass"></wui-icon>
        Block Explorer
        <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
      </wui-button>
    `:null}onTransactions(){f.sendEvent({type:`track`,event:`CLICK_TRANSACTIONS`,properties:{isSmartAccount:re(h.state.activeChain)===s.ACCOUNT_TYPES.SMART_ACCOUNT}}),u.push(`Transactions`)}async onDisconnect(){try{this.disconnecting=!0;let e=m.getConnections(this.namespace).length>0,t=this.namespace&&p.state.activeConnectorIds[this.namespace],n=this.remoteFeatures?.multiWallet;await m.disconnect(n?{id:t,namespace:this.namespace}:{}),e&&n&&(u.push(`ProfileWallets`),r.showSuccess(`Wallet deleted`))}catch{f.sendEvent({type:`track`,event:`DISCONNECT_ERROR`,properties:{message:`Failed to disconnect`}}),r.showError(`Failed to disconnect`)}finally{this.disconnecting=!1}}onExplorer(){let e=h.getAccountData()?.addressExplorerUrl;e&&t.openHref(e,`_blank`)}onGoToUpgradeView(){f.sendEvent({type:`track`,event:`EMAIL_UPGRADE_FROM_MODAL`}),u.push(`UpgradeEmailWallet`)}onGoToProfileWalletsView(){u.push(`ProfileWallets`)}};z.styles=st,R([A()],z.prototype,`caipAddress`,void 0),R([A()],z.prototype,`address`,void 0),R([A()],z.prototype,`profileImage`,void 0),R([A()],z.prototype,`profileName`,void 0),R([A()],z.prototype,`disconnecting`,void 0),R([A()],z.prototype,`balance`,void 0),R([A()],z.prototype,`balanceSymbol`,void 0),R([A()],z.prototype,`features`,void 0),R([A()],z.prototype,`remoteFeatures`,void 0),R([A()],z.prototype,`namespace`,void 0),R([A()],z.prototype,`activeConnectorIds`,void 0),z=R([T(`w3m-account-default-widget`)],z);var ct=w`
  span {
    font-weight: 500;
    font-size: 38px;
    color: ${({tokens:e})=>e.theme.textPrimary};
    line-height: 38px;
    letter-spacing: -2%;
    text-align: center;
    font-family: var(--apkt-fontFamily-regular);
  }

  .pennies {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }
`,lt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ut=class extends y{constructor(){super(...arguments),this.dollars=`0`,this.pennies=`00`}render(){return b`<span>$${this.dollars}<span class="pennies">.${this.pennies}</span></span>`}};ut.styles=[E,ct],lt([O()],ut.prototype,`dollars`,void 0),lt([O()],ut.prototype,`pennies`,void 0),ut=lt([T(`wui-balance`)],ut);var dt=w`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
  }

  /* -- Variants --------------------------------------------------------- */
  :host([data-variant='fill']) {
    background-color: ${({colors:e})=>e.neutrals100};
  }

  :host([data-variant='shade']) {
    background-color: ${({colors:e})=>e.neutrals900};
  }

  :host([data-variant='fill']) > wui-text {
    color: ${({colors:e})=>e.black};
  }

  :host([data-variant='shade']) > wui-text {
    color: ${({colors:e})=>e.white};
  }

  :host([data-variant='fill']) > wui-icon {
    color: ${({colors:e})=>e.neutrals100};
  }

  :host([data-variant='shade']) > wui-icon {
    color: ${({colors:e})=>e.neutrals900};
  }

  /* -- Sizes --------------------------------------------------------- */
  :host([data-size='sm']) {
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-size='md']) {
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  /* -- Placements --------------------------------------------------------- */
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
`,ft=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},pt={sm:`sm-regular`,md:`md-regular`},mt=class extends y{constructor(){super(...arguments),this.placement=`top`,this.variant=`fill`,this.size=`md`,this.message=``}render(){return this.dataset.variant=this.variant,this.dataset.size=this.size,b`<wui-icon data-placement=${this.placement} size="inherit" name="cursor"></wui-icon>
      <wui-text variant=${pt[this.size]}>${this.message}</wui-text>`}};mt.styles=[E,C,dt],ft([O()],mt.prototype,`placement`,void 0),ft([O()],mt.prototype,`variant`,void 0),ft([O()],mt.prototype,`size`,void 0),ft([O()],mt.prototype,`message`,void 0),mt=ft([T(`wui-tooltip`)],mt);var ht=D`
  :host {
    width: 100%;
    max-height: 280px;
    overflow: scroll;
    scrollbar-width: none;
  }

  :host::-webkit-scrollbar {
    display: none;
  }
`,gt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},_t=class extends y{render(){return b`<w3m-activity-list page="account"></w3m-activity-list>`}};_t.styles=ht,_t=gt([T(`w3m-account-activity-widget`)],_t);var vt=w`
  :host {
    width: 100%;
  }

  button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({spacing:e})=>e[4]};
    padding: ${({spacing:e})=>e[4]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    max-width: 174px;
  }

  .tag-container {
    width: fit-content;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`,yt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},bt=class extends y{constructor(){super(...arguments),this.icon=`card`,this.text=``,this.description=``,this.tag=void 0,this.disabled=!1}render(){return b`
      <button ?disabled=${this.disabled}>
        <wui-flex alignItems="center" gap="3">
          <wui-icon-box padding="2" color="secondary" icon=${this.icon} size="lg"></wui-icon-box>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.text}</wui-text>
            ${this.description?b`<wui-text variant="md-regular" color="secondary">
                  ${this.description}</wui-text
                >`:null}
          </wui-flex>
        </wui-flex>

        <wui-flex class="tag-container" alignItems="center" gap="1" justifyContent="flex-end">
          ${this.tag?b`<wui-tag tagType="main" size="sm">${this.tag}</wui-tag>`:null}
          <wui-icon size="md" name="chevronRight" color="default"></wui-icon>
        </wui-flex>
      </button>
    `}};bt.styles=[E,C,vt],yt([O()],bt.prototype,`icon`,void 0),yt([O()],bt.prototype,`text`,void 0),yt([O()],bt.prototype,`description`,void 0),yt([O()],bt.prototype,`tag`,void 0),yt([O({type:Boolean})],bt.prototype,`disabled`,void 0),bt=yt([T(`wui-list-description`)],bt);var xt=D`
  :host {
    width: 100%;
  }

  wui-flex {
    width: 100%;
  }

  .contentContainer {
    max-height: 280px;
    overflow: scroll;
    scrollbar-width: none;
  }

  .contentContainer::-webkit-scrollbar {
    display: none;
  }
`,St=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ct=class extends y{constructor(){super(),this.unsubscribe=[],this.tokenBalance=h.getAccountData()?.tokenBalance,this.remoteFeatures=l.state.remoteFeatures,this.unsubscribe.push(h.subscribeChainProp(`accountState`,e=>{this.tokenBalance=e?.tokenBalance}),l.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return b`${this.tokenTemplate()}`}tokenTemplate(){return this.tokenBalance&&this.tokenBalance?.length>0?b`<wui-flex class="contentContainer" flexDirection="column" gap="2">
        ${this.tokenItemTemplate()}
      </wui-flex>`:b` <wui-flex flexDirection="column">
      ${this.onRampTemplate()}
      <wui-list-description
        @click=${this.onReceiveClick.bind(this)}
        text="Receive funds"
        description="Scan the QR code and receive funds"
        icon="qrCode"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
        data-testid="w3m-account-receive-button"
      ></wui-list-description
    ></wui-flex>`}onRampTemplate(){return this.remoteFeatures?.onramp?b`<wui-list-description
        @click=${this.onBuyClick.bind(this)}
        text="Buy Crypto"
        description="Easy with card or bank account"
        icon="card"
        iconColor="success-100"
        iconBackgroundColor="success-100"
        tag="popular"
        data-testid="w3m-account-onramp-button"
      ></wui-list-description>`:b``}tokenItemTemplate(){return this.tokenBalance?.map(e=>b`<wui-list-token
          tokenName=${e.name}
          tokenImageUrl=${e.iconUrl}
          tokenAmount=${e.quantity.numeric}
          tokenValue=${e.value}
          tokenCurrency=${e.symbol}
        ></wui-list-token>`)}onReceiveClick(){u.push(`WalletReceive`)}onBuyClick(){f.sendEvent({type:`track`,event:`SELECT_BUY_CRYPTO`,properties:{isSmartAccount:re(h.state.activeChain)===s.ACCOUNT_TYPES.SMART_ACCOUNT}}),u.push(`OnRampProviders`)}};Ct.styles=xt,St([A()],Ct.prototype,`tokenBalance`,void 0),St([A()],Ct.prototype,`remoteFeatures`,void 0),Ct=St([T(`w3m-account-tokens-widget`)],Ct);var wt=w`
  wui-flex {
    width: 100%;
  }

  wui-promo {
    position: absolute;
    top: -32px;
  }

  wui-profile-button {
    margin-top: calc(-1 * ${({spacing:e})=>e[4]});
  }

  wui-promo + wui-profile-button {
    margin-top: ${({spacing:e})=>e[4]};
  }

  wui-tabs {
    width: 100%;
  }

  .contentContainer {
    height: 280px;
  }

  .contentContainer > wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  .contentContainer > .textContent {
    width: 65%;
  }
`,Tt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},B=class extends y{constructor(){super(...arguments),this.unsubscribe=[],this.network=h.state.activeCaipNetwork,this.profileName=h.getAccountData()?.profileName,this.address=h.getAccountData()?.address,this.currentTab=h.getAccountData()?.currentTab,this.tokenBalance=h.getAccountData()?.tokenBalance,this.features=l.state.features,this.namespace=h.state.activeChain,this.activeConnectorIds=p.state.activeConnectorIds,this.remoteFeatures=l.state.remoteFeatures}firstUpdated(){h.fetchTokenBalance(),this.unsubscribe.push(h.subscribeChainProp(`accountState`,e=>{e?.address?(this.address=e.address,this.profileName=e.profileName,this.currentTab=e.currentTab,this.tokenBalance=e.tokenBalance):v.close()}),p.subscribeKey(`activeConnectorIds`,e=>{this.activeConnectorIds=e}),h.subscribeKey(`activeChain`,e=>this.namespace=e),h.subscribeKey(`activeCaipNetwork`,e=>this.network=e),l.subscribeKey(`features`,e=>this.features=e),l.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e)),this.watchSwapValues()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),clearInterval(this.watchTokenBalance)}render(){if(!this.address)throw Error(`w3m-account-features-widget: No account provided`);if(!this.namespace)return null;let e=this.activeConnectorIds[this.namespace],t=e?p.getConnectorById(e):void 0,{icon:n,iconSize:r}=this.getAuthData();return b`<wui-flex
      flexDirection="column"
      .padding=${[`0`,`3`,`4`,`3`]}
      alignItems="center"
      gap="4"
      data-testid="w3m-account-wallet-features-widget"
    >
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center" gap="2">
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          icon=${n}
          iconSize=${r}
          alt=${t?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        ${this.tokenBalanceTemplate()}
      </wui-flex>
      ${this.orderedWalletFeatures()} ${this.tabsTemplate()} ${this.listContentTemplate()}
    </wui-flex>`}orderedWalletFeatures(){let e=this.features?.walletFeaturesOrder||a.DEFAULT_FEATURES.walletFeaturesOrder;if(e.every(e=>e===`send`||e===`receive`?!this.features?.[e]:e===`swaps`||e===`onramp`?!this.remoteFeatures?.[e]:!0))return null;let t=e.map(e=>e===`receive`||e===`onramp`?`fund`:e);return b`<wui-flex gap="2">
      ${[...new Set(t)].map(e=>{switch(e){case`fund`:return this.fundWalletTemplate();case`swaps`:return this.swapsTemplate();case`send`:return this.sendTemplate();default:return null}})}
    </wui-flex>`}fundWalletTemplate(){if(!this.namespace)return null;let e=a.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),t=this.features?.receive,n=this.remoteFeatures?.onramp&&e,r=j.isPayWithExchangeEnabled();return!n&&!t&&!r?null:b`
      <w3m-tooltip-trigger text="Fund wallet">
        <wui-button
          data-testid="wallet-features-fund-wallet-button"
          @click=${this.onFundWalletClick.bind(this)}
          variant="accent-secondary"
          size="lg"
          fullWidth
        >
          <wui-icon name="dollar"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `}swapsTemplate(){let e=this.remoteFeatures?.swaps,t=h.state.activeChain===_.CHAIN.EVM;return!e||!t?null:b`
      <w3m-tooltip-trigger text="Swap">
        <wui-button
          fullWidth
          data-testid="wallet-features-swaps-button"
          @click=${this.onSwapClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="recycleHorizontal"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `}sendTemplate(){let e=this.features?.send,t=h.state.activeChain,n=a.SEND_SUPPORTED_NAMESPACES.includes(t);return!e||!n?null:b`
      <w3m-tooltip-trigger text="Send">
        <wui-button
          fullWidth
          data-testid="wallet-features-send-button"
          @click=${this.onSendClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="send"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `}watchSwapValues(){this.watchTokenBalance=setInterval(()=>h.fetchTokenBalance(e=>this.onTokenBalanceError(e)),1e4)}onTokenBalanceError(e){e instanceof Error&&e.cause instanceof Response&&e.cause.status===_.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE&&clearInterval(this.watchTokenBalance)}listContentTemplate(){return this.currentTab===0?b`<w3m-account-tokens-widget></w3m-account-tokens-widget>`:this.currentTab===1?b`<w3m-account-activity-widget></w3m-account-activity-widget>`:b`<w3m-account-tokens-widget></w3m-account-tokens-widget>`}tokenBalanceTemplate(){if(this.tokenBalance&&this.tokenBalance?.length>=0){let e=t.calculateBalance(this.tokenBalance),{dollars:n=`0`,pennies:r=`00`}=t.formatTokenBalance(e);return b`<wui-balance dollars=${n} pennies=${r}></wui-balance>`}return b`<wui-balance dollars="0" pennies="00"></wui-balance>`}tabsTemplate(){let e=Se.getTabsByNamespace(h.state.activeChain);return e.length===0?null:b`<wui-tabs
      .onTabChange=${this.onTabChange.bind(this)}
      .activeTab=${this.currentTab}
      .tabs=${e}
    ></wui-tabs>`}onTabChange(e){h.setAccountProp(`currentTab`,e,this.namespace)}onFundWalletClick(){u.push(`FundWallet`)}onSwapClick(){this.network?.caipNetworkId&&!a.SWAP_SUPPORTED_NETWORKS.includes(this.network?.caipNetworkId)?u.push(`UnsupportedChain`,{swapUnsupportedChain:!0}):(f.sendEvent({type:`track`,event:`OPEN_SWAP`,properties:{network:this.network?.caipNetworkId||``,isSmartAccount:re(h.state.activeChain)===s.ACCOUNT_TYPES.SMART_ACCOUNT}}),u.push(`Swap`))}getAuthData(){let e=d.getConnectedSocialProvider(),t=d.getConnectedSocialUsername(),r=p.getAuthConnector()?.provider.getEmail()??``;return{name:n.getAuthName({email:r,socialUsername:t,socialProvider:e}),icon:e??`mail`,iconSize:e?`xl`:`md`}}onGoToProfileWalletsView(){u.push(`ProfileWallets`)}onSendClick(){f.sendEvent({type:`track`,event:`OPEN_SEND`,properties:{network:this.network?.caipNetworkId||``,isSmartAccount:re(h.state.activeChain)===s.ACCOUNT_TYPES.SMART_ACCOUNT}}),u.push(`WalletSend`)}};B.styles=wt,Tt([A()],B.prototype,`watchTokenBalance`,void 0),Tt([A()],B.prototype,`network`,void 0),Tt([A()],B.prototype,`profileName`,void 0),Tt([A()],B.prototype,`address`,void 0),Tt([A()],B.prototype,`currentTab`,void 0),Tt([A()],B.prototype,`tokenBalance`,void 0),Tt([A()],B.prototype,`features`,void 0),Tt([A()],B.prototype,`namespace`,void 0),Tt([A()],B.prototype,`activeConnectorIds`,void 0),Tt([A()],B.prototype,`remoteFeatures`,void 0),B=Tt([T(`w3m-account-wallet-features-widget`)],B);var Et=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Dt=class extends y{constructor(){super(),this.unsubscribe=[],this.namespace=h.state.activeChain,this.unsubscribe.push(h.subscribeKey(`activeChain`,e=>{this.namespace=e}))}render(){if(!this.namespace)return null;let e=p.getConnectorId(this.namespace);return b`
      ${p.getAuthConnector()&&e===_.CONNECTOR_ID.AUTH?this.walletFeaturesTemplate():this.defaultTemplate()}
    `}walletFeaturesTemplate(){return b`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`}defaultTemplate(){return b`<w3m-account-default-widget></w3m-account-default-widget>`}};Et([A()],Dt.prototype,`namespace`,void 0),Dt=Et([T(`w3m-account-view`)],Dt);var Ot=w`
  wui-image {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-image,
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-icon:not(.custom-icon, .icon-badge) {
    cursor: pointer;
  }

  .icon-box {
    position: relative;
    border-radius: ${({borderRadius:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .icon-badge {
    position: absolute;
    top: 18px;
    left: 23px;
    z-index: 3;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: 50%;
    padding: ${({spacing:e})=>e[`01`]};
  }

  .icon-badge {
    width: 8px;
    height: 8px;
  }
`,V=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},H=class extends y{constructor(){super(...arguments),this.address=``,this.profileName=``,this.content=[],this.alt=``,this.imageSrc=``,this.icon=void 0,this.iconSize=`md`,this.iconBadge=void 0,this.iconBadgeSize=`md`,this.buttonVariant=`neutral-primary`,this.enableMoreButton=!1,this.charsStart=4,this.charsEnd=6}render(){return b`
      <wui-flex flexDirection="column" rowgap="2">
        ${this.topTemplate()} ${this.bottomTemplate()}
      </wui-flex>
    `}topTemplate(){return b`
      <wui-flex alignItems="flex-start" justifyContent="space-between">
        ${this.imageOrIconTemplate()}
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="copy"
          @click=${this.dispatchCopyEvent}
        ></wui-icon-link>
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="externalLink"
          @click=${this.dispatchExternalLinkEvent}
        ></wui-icon-link>
        ${this.enableMoreButton?b`<wui-icon-link
              variant="secondary"
              size="md"
              icon="threeDots"
              @click=${this.dispatchMoreButtonEvent}
              data-testid="wui-active-profile-wallet-item-more-button"
            ></wui-icon-link>`:null}
      </wui-flex>
    `}bottomTemplate(){return b` <wui-flex flexDirection="column">${this.contentTemplate()}</wui-flex> `}imageOrIconTemplate(){return this.icon?b`
        <wui-flex flexGrow="1" alignItems="center">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge?b`<wui-icon
                  color="accent-primary"
                  size="inherit"
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`:null}
          </wui-flex>
        </wui-flex>
      `:b`
      <wui-flex flexGrow="1" alignItems="center">
        <wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>
      </wui-flex>
    `}contentTemplate(){return this.content.length===0?null:b`
      <wui-flex flexDirection="column" rowgap="3">
        ${this.content.map(e=>this.labelAndTagTemplate(e))}
      </wui-flex>
    `}labelAndTagTemplate({address:e,profileName:t,label:n,description:r,enableButton:i,buttonType:a,buttonLabel:o,buttonVariant:s,tagVariant:c,tagLabel:l,alignItems:u=`flex-end`}){return b`
      <wui-flex justifyContent="space-between" alignItems=${u} columngap="1">
        <wui-flex flexDirection="column" rowgap="01">
          ${n?b`<wui-text variant="sm-medium" color="secondary">${n}</wui-text>`:null}

          <wui-flex alignItems="center" columngap="1">
            <wui-text variant="md-regular" color="primary">
              ${S.getTruncateString({string:t||e,charsStart:t?16:this.charsStart,charsEnd:t?0:this.charsEnd,truncate:t?`end`:`middle`})}
            </wui-text>

            ${c&&l?b`<wui-tag variant=${c} size="sm">${l}</wui-tag>`:null}
          </wui-flex>

          ${r?b`<wui-text variant="sm-regular" color="secondary">${r}</wui-text>`:null}
        </wui-flex>

        ${i?this.buttonTemplate({buttonType:a,buttonLabel:o,buttonVariant:s}):null}
      </wui-flex>
    `}buttonTemplate({buttonType:e,buttonLabel:t,buttonVariant:n}){return b`
      <wui-button
        size="sm"
        variant=${n}
        @click=${e===`disconnect`?this.dispatchDisconnectEvent.bind(this):this.dispatchSwitchEvent.bind(this)}
        data-testid=${e===`disconnect`?`wui-active-profile-wallet-item-disconnect-button`:`wui-active-profile-wallet-item-switch-button`}
      >
        ${t}
      </wui-button>
    `}dispatchDisconnectEvent(){this.dispatchEvent(new CustomEvent(`disconnect`,{bubbles:!0,composed:!0}))}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent(`switch`,{bubbles:!0,composed:!0}))}dispatchExternalLinkEvent(){this.dispatchEvent(new CustomEvent(`externalLink`,{bubbles:!0,composed:!0}))}dispatchMoreButtonEvent(){this.dispatchEvent(new CustomEvent(`more`,{bubbles:!0,composed:!0}))}dispatchCopyEvent(){this.dispatchEvent(new CustomEvent(`copy`,{bubbles:!0,composed:!0}))}};H.styles=[E,C,Ot],V([O()],H.prototype,`address`,void 0),V([O()],H.prototype,`profileName`,void 0),V([O({type:Array})],H.prototype,`content`,void 0),V([O()],H.prototype,`alt`,void 0),V([O()],H.prototype,`imageSrc`,void 0),V([O()],H.prototype,`icon`,void 0),V([O()],H.prototype,`iconSize`,void 0),V([O()],H.prototype,`iconBadge`,void 0),V([O()],H.prototype,`iconBadgeSize`,void 0),V([O()],H.prototype,`buttonVariant`,void 0),V([O({type:Boolean})],H.prototype,`enableMoreButton`,void 0),V([O({type:Number})],H.prototype,`charsStart`,void 0),V([O({type:Number})],H.prototype,`charsEnd`,void 0),H=V([T(`wui-active-profile-wallet-item`)],H);var kt=w`
  wui-image,
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  .right-icon {
    cursor: pointer;
  }

  .icon-box {
    position: relative;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .icon-badge {
    position: absolute;
    top: 18px;
    left: 23px;
    z-index: 3;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: 50%;
    padding: ${({spacing:e})=>e[`01`]};
  }

  .icon-badge {
    width: 8px;
    height: 8px;
  }
`,U=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},W=class extends y{constructor(){super(...arguments),this.address=``,this.profileName=``,this.alt=``,this.buttonLabel=``,this.buttonVariant=`accent-primary`,this.imageSrc=``,this.icon=void 0,this.iconSize=`md`,this.iconBadgeSize=`md`,this.rightIcon=`signOut`,this.rightIconSize=`md`,this.loading=!1,this.charsStart=4,this.charsEnd=6}render(){return b`
      <wui-flex alignItems="center" columngap="2">
        ${this.imageOrIconTemplate()} ${this.labelAndDescriptionTemplate()}
        ${this.buttonActionTemplate()}
      </wui-flex>
    `}imageOrIconTemplate(){return this.icon?b`
        <wui-flex alignItems="center" justifyContent="center" class="icon-box">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge?b`<wui-icon
                  color="default"
                  size="inherit"
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`:null}
          </wui-flex>
        </wui-flex>
      `:b`<wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>`}labelAndDescriptionTemplate(){return b`
      <wui-flex
        flexDirection="column"
        flexGrow="1"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <wui-text variant="lg-regular" color="primary">
          ${S.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?16:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?`end`:`middle`})}
        </wui-text>
      </wui-flex>
    `}buttonActionTemplate(){return b`
      <wui-flex columngap="1" alignItems="center" justifyContent="center">
        <wui-button
          size="sm"
          variant=${this.buttonVariant}
          .loading=${this.loading}
          @click=${this.handleButtonClick}
          data-testid="wui-inactive-profile-wallet-item-button"
        >
          ${this.buttonLabel}
        </wui-button>

        <wui-icon-link
          variant="secondary"
          size="md"
          icon=${k(this.rightIcon)}
          class="right-icon"
          @click=${this.handleIconClick}
        ></wui-icon-link>
      </wui-flex>
    `}handleButtonClick(){this.dispatchEvent(new CustomEvent(`buttonClick`,{bubbles:!0,composed:!0}))}handleIconClick(){this.dispatchEvent(new CustomEvent(`iconClick`,{bubbles:!0,composed:!0}))}};W.styles=[E,C,kt],U([O()],W.prototype,`address`,void 0),U([O()],W.prototype,`profileName`,void 0),U([O()],W.prototype,`alt`,void 0),U([O()],W.prototype,`buttonLabel`,void 0),U([O()],W.prototype,`buttonVariant`,void 0),U([O()],W.prototype,`imageSrc`,void 0),U([O()],W.prototype,`icon`,void 0),U([O()],W.prototype,`iconSize`,void 0),U([O()],W.prototype,`iconBadge`,void 0),U([O()],W.prototype,`iconBadgeSize`,void 0),U([O()],W.prototype,`rightIcon`,void 0),U([O()],W.prototype,`rightIconSize`,void 0),U([O({type:Boolean})],W.prototype,`loading`,void 0),U([O({type:Number})],W.prototype,`charsStart`,void 0),U([O({type:Number})],W.prototype,`charsEnd`,void 0),W=U([T(`wui-inactive-profile-wallet-item`)],W);var At={getAuthData(e){let t=e.connectorId===_.CONNECTOR_ID.AUTH;if(!t)return{isAuth:!1,icon:void 0,iconSize:void 0,name:void 0};let r=e?.auth?.name??d.getConnectedSocialProvider(),i=e?.auth?.username??d.getConnectedSocialUsername(),a=p.getAuthConnector()?.provider.getEmail()??``;return{isAuth:!0,icon:r??`mail`,iconSize:r?`xl`:`md`,name:t?n.getAuthName({email:a,socialUsername:i,socialProvider:r}):void 0}}},jt=w`
  :host {
    --connect-scroll--top-opacity: 0;
    --connect-scroll--bottom-opacity: 0;
  }

  .balance-amount {
    flex: 1;
  }

  .wallet-list {
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity ${({easings:e})=>e[`ease-out-power-1`]}
      ${({durations:e})=>e.md};
    will-change: opacity;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
      rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
      black 40px,
      black calc(100% - 40px),
      rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
    );
  }

  .active-wallets {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  .active-wallets-box {
    height: 330px;
  }

  .empty-wallet-list-box {
    height: 400px;
  }

  .empty-box {
    width: 100%;
    padding: ${({spacing:e})=>e[4]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-separator {
    margin: ${({spacing:e})=>e[2]} 0 ${({spacing:e})=>e[2]} 0;
  }

  .active-connection {
    padding: ${({spacing:e})=>e[2]};
  }

  .recent-connection {
    padding: ${({spacing:e})=>e[2]} 0 ${({spacing:e})=>e[2]} 0;
  }

  @media (max-width: 430px) {
    .active-wallets-box,
    .empty-wallet-list-box {
      height: auto;
      max-height: clamp(360px, 470px, 80vh);
    }
  }
`,G=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},K={ADDRESS_DISPLAY:{START:4,END:6},BADGE:{SIZE:`md`,ICON:`lightbulb`},SCROLL_THRESHOLD:50,OPACITY_RANGE:[0,1]},Mt={eip155:`ethereum`,solana:`solana`,bip122:`bitcoin`,ton:`ton`,tron:`tron`},Nt=[{namespace:`eip155`,icon:Mt.eip155,label:`EVM`},{namespace:`solana`,icon:Mt.solana,label:`Solana`},{namespace:`bip122`,icon:Mt.bip122,label:`Bitcoin`},{namespace:`ton`,icon:Mt.ton,label:`Ton`},{namespace:`tron`,icon:Mt.tron,label:`Tron`}],Pt={eip155:{title:`Add EVM Wallet`,description:`Add your first EVM wallet`},solana:{title:`Add Solana Wallet`,description:`Add your first Solana wallet`},bip122:{title:`Add Bitcoin Wallet`,description:`Add your first Bitcoin wallet`},ton:{title:`Add TON Wallet`,description:`Add your first TON wallet`},tron:{title:`Add TRON Wallet`,description:`Add your first TRON wallet`}},q=class extends y{constructor(){super(),this.unsubscribers=[],this.currentTab=0,this.namespace=h.state.activeChain,this.namespaces=Array.from(h.state.chains.keys()),this.caipAddress=void 0,this.profileName=void 0,this.activeConnectorIds=p.state.activeConnectorIds,this.lastSelectedAddress=``,this.lastSelectedConnectorId=``,this.isSwitching=!1,this.caipNetwork=h.state.activeCaipNetwork,this.user=h.getAccountData()?.user,this.remoteFeatures=l.state.remoteFeatures,this.currentTab=this.namespace?this.namespaces.indexOf(this.namespace):0,this.caipAddress=h.getAccountData(this.namespace)?.caipAddress,this.profileName=h.getAccountData(this.namespace)?.profileName,this.unsubscribers.push(m.subscribeKey(`connections`,()=>this.onConnectionsChange()),m.subscribeKey(`recentConnections`,()=>this.requestUpdate()),p.subscribeKey(`activeConnectorIds`,e=>{this.activeConnectorIds=e}),h.subscribeKey(`activeCaipNetwork`,e=>this.caipNetwork=e),h.subscribeChainProp(`accountState`,e=>{this.user=e?.user}),l.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e)),this.chainListener=h.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress,this.profileName=e?.profileName},this.namespace)}disconnectedCallback(){this.unsubscribers.forEach(e=>e()),this.resizeObserver?.disconnect(),this.removeScrollListener(),this.chainListener?.()}firstUpdated(){let e=this.shadowRoot?.querySelector(`.wallet-list`);if(!e)return;let t=()=>this.updateScrollOpacity(e);requestAnimationFrame(t),e.addEventListener(`scroll`,t),this.resizeObserver=new ResizeObserver(t),this.resizeObserver.observe(e),t()}render(){let e=this.namespace;if(!e)throw Error(`Namespace is not set`);return b`
      <wui-flex flexDirection="column" .padding=${[`0`,`4`,`4`,`4`]} gap="4">
        ${this.renderTabs()} ${this.renderHeader(e)} ${this.renderConnections(e)}
        ${this.renderAddConnectionButton(e)}
      </wui-flex>
    `}renderTabs(){let e=this.namespaces.map(e=>Nt.find(t=>t.namespace===e)).filter(Boolean);return e.length>1?b`
        <wui-tabs
          .onTabChange=${e=>this.handleTabChange(e)}
          .activeTab=${this.currentTab}
          .tabs=${e}
        ></wui-tabs>
      `:null}renderHeader(e){let t=this.getActiveConnections(e).flatMap(({accounts:e})=>e).length+ +!!this.caipAddress;return b`
      <wui-flex alignItems="center" columngap="1">
        <wui-icon
          size="sm"
          name=${Mt[e]??Mt.eip155}
        ></wui-icon>
        <wui-text color="secondary" variant="lg-regular"
          >${t>1?`Wallets`:`Wallet`}</wui-text
        >
        <wui-text
          color="primary"
          variant="lg-regular"
          class="balance-amount"
          data-testid="balance-amount"
        >
          ${t}
        </wui-text>
        <wui-link
          color="secondary"
          variant="secondary"
          @click=${()=>m.disconnect({namespace:e})}
          ?disabled=${!this.hasAnyConnections(e)}
          data-testid="disconnect-all-button"
        >
          Disconnect All
        </wui-link>
      </wui-flex>
    `}renderConnections(e){let t=this.hasAnyConnections(e);return b`
      <wui-flex flexDirection="column" class=${he({"wallet-list":!0,"active-wallets-box":t,"empty-wallet-list-box":!t})} rowgap="3">
        ${t?this.renderActiveConnections(e):this.renderEmptyState(e)}
      </wui-flex>
    `}renderActiveConnections(e){let t=this.getActiveConnections(e),n=this.activeConnectorIds[e];return b`
      ${this.getPlainAddress()||n||t.length>0?b`<wui-flex
            flexDirection="column"
            .padding=${[`4`,`0`,`4`,`0`]}
            class="active-wallets"
          >
            ${this.renderActiveProfile(e)} ${this.renderActiveConnectionsList(e)}
          </wui-flex>`:null}
      ${this.renderRecentConnections(e)}
    `}renderActiveProfile(e){let t=this.activeConnectorIds[e];if(!t)return null;let{connections:n}=ne.getConnectionsData(e),r=p.getConnectorById(t),i=c.getConnectorImage(r),a=this.getPlainAddress();if(!a)return null;let o=e===_.CHAIN.BITCOIN,s=At.getAuthData({connectorId:t,accounts:[]}),l=this.getActiveConnections(e).flatMap(e=>e.accounts).length>0,u=n.find(e=>e.connectorId===t),d=u?.accounts.filter(e=>!x.isLowerCaseMatch(e.address,a));return b`
      <wui-flex flexDirection="column" .padding=${[`0`,`4`,`0`,`4`]}>
        <wui-active-profile-wallet-item
          address=${a}
          alt=${r?.name}
          .content=${this.getProfileContent({address:a,connections:n,connectorId:t,namespace:e})}
          .charsStart=${K.ADDRESS_DISPLAY.START}
          .charsEnd=${K.ADDRESS_DISPLAY.END}
          .icon=${s.icon}
          .iconSize=${s.iconSize}
          .iconBadge=${this.isSmartAccount(a)?K.BADGE.ICON:void 0}
          .iconBadgeSize=${this.isSmartAccount(a)?K.BADGE.SIZE:void 0}
          imageSrc=${i}
          ?enableMoreButton=${s.isAuth}
          @copy=${()=>this.handleCopyAddress(a)}
          @disconnect=${()=>this.handleDisconnect(e,t)}
          @switch=${()=>{o&&u&&d?.[0]&&this.handleSwitchWallet(u,d[0].address,e)}}
          @externalLink=${()=>this.handleExternalLink(a)}
          @more=${()=>this.handleMore()}
          data-testid="wui-active-profile-wallet-item"
        ></wui-active-profile-wallet-item>
        ${l?b`<wui-separator></wui-separator>`:null}
      </wui-flex>
    `}renderActiveConnectionsList(e){let t=this.getActiveConnections(e);return t.length===0?null:b`
      <wui-flex flexDirection="column" .padding=${[`0`,`2`,`0`,`2`]}>
        ${this.renderConnectionList(t,!1,e)}
      </wui-flex>
    `}renderRecentConnections(e){let{recentConnections:t}=ne.getConnectionsData(e);return t.flatMap(e=>e.accounts).length===0?null:b`
      <wui-flex flexDirection="column" .padding=${[`0`,`2`,`0`,`2`]} rowGap="2">
        <wui-text color="secondary" variant="sm-medium" data-testid="recently-connected-text"
          >RECENTLY CONNECTED</wui-text
        >
        <wui-flex flexDirection="column" .padding=${[`0`,`2`,`0`,`2`]}>
          ${this.renderConnectionList(t,!0,e)}
        </wui-flex>
      </wui-flex>
    `}renderConnectionList(e,t,n){return e.filter(e=>e.accounts.length>0).map((e,r)=>{let i=p.getConnectorById(e.connectorId),a=c.getConnectorImage(i)??``,o=At.getAuthData(e);return e.accounts.map((i,s)=>{let c=r!==0||s!==0,l=this.isAccountLoading(e.connectorId,i.address);return b`
            <wui-flex flexDirection="column">
              ${c?b`<wui-separator></wui-separator>`:null}
              <wui-inactive-profile-wallet-item
                address=${i.address}
                alt=${e.connectorId}
                buttonLabel=${t?`Connect`:`Switch`}
                buttonVariant=${t?`neutral-secondary`:`accent-secondary`}
                rightIcon=${t?`bin`:`power`}
                rightIconSize="sm"
                class=${t?`recent-connection`:`active-connection`}
                data-testid=${t?`recent-connection`:`active-connection`}
                imageSrc=${a}
                .iconBadge=${this.isSmartAccount(i.address)?K.BADGE.ICON:void 0}
                .iconBadgeSize=${this.isSmartAccount(i.address)?K.BADGE.SIZE:void 0}
                .icon=${o.icon}
                .iconSize=${o.iconSize}
                .loading=${l}
                .showBalance=${!1}
                .charsStart=${K.ADDRESS_DISPLAY.START}
                .charsEnd=${K.ADDRESS_DISPLAY.END}
                @buttonClick=${()=>this.handleSwitchWallet(e,i.address,n)}
                @iconClick=${()=>this.handleWalletAction({connection:e,address:i.address,isRecentConnection:t,namespace:n})}
              ></wui-inactive-profile-wallet-item>
            </wui-flex>
          `})})}renderAddConnectionButton(e){if(!this.isMultiWalletEnabled()&&this.caipAddress||!this.hasAnyConnections(e))return null;let{title:t}=this.getChainLabelInfo(e);return b`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon="plus"
        iconSize="sm"
        ?chevron=${!0}
        @click=${()=>this.handleAddConnection(e)}
        data-testid="add-connection-button"
      >
        <wui-text variant="md-medium" color="secondary">${t}</wui-text>
      </wui-list-item>
    `}renderEmptyState(e){let{title:t,description:n}=this.getChainLabelInfo(e);return b`
      <wui-flex alignItems="flex-start" class="empty-template" data-testid="empty-template">
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          rowgap="3"
          class="empty-box"
        >
          <wui-icon-box size="xl" icon="wallet" color="secondary"></wui-icon-box>

          <wui-flex flexDirection="column" alignItems="center" justifyContent="center" gap="1">
            <wui-text color="primary" variant="lg-regular" data-testid="empty-state-text"
              >No wallet connected</wui-text
            >
            <wui-text color="secondary" variant="md-regular" data-testid="empty-state-description"
              >${n}</wui-text
            >
          </wui-flex>

          <wui-link
            @click=${()=>this.handleAddConnection(e)}
            data-testid="empty-state-button"
            icon="plus"
          >
            ${t}
          </wui-link>
        </wui-flex>
      </wui-flex>
    `}handleTabChange(e){let t=this.namespaces[e];t&&(this.chainListener?.(),this.currentTab=this.namespaces.indexOf(t),this.namespace=t,this.caipAddress=h.getAccountData(t)?.caipAddress,this.profileName=h.getAccountData(t)?.profileName,this.chainListener=h.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress},t))}async handleSwitchWallet(e,t,n){try{this.isSwitching=!0,this.lastSelectedConnectorId=e.connectorId,this.lastSelectedAddress=t,this.caipNetwork?.chainNamespace!==n&&e?.caipNetwork&&(p.setFilterByNamespace(n),await h.switchActiveNetwork(e?.caipNetwork)),await m.switchConnection({connection:e,address:t,namespace:n,closeModalOnConnect:!1,onChange({hasSwitchedAccount:e,hasSwitchedWallet:t}){t?r.showSuccess(`Wallet switched`):e&&r.showSuccess(`Account switched`)}})}catch{r.showError(`Failed to switch wallet`)}finally{this.isSwitching=!1}}handleWalletAction(e){let{connection:t,address:n,isRecentConnection:i,namespace:a}=e;i?(d.deleteAddressFromConnection({connectorId:t.connectorId,address:n,namespace:a}),m.syncStorageConnections(),r.showSuccess(`Wallet deleted`)):this.handleDisconnect(a,t.connectorId)}async handleDisconnect(e,t){try{await m.disconnect({id:t,namespace:e}),r.showSuccess(`Wallet disconnected`)}catch{r.showError(`Failed to disconnect wallet`)}}handleCopyAddress(e){t.copyToClopboard(e),r.showSuccess(`Address copied`)}handleMore(){u.push(`AccountSettings`)}handleExternalLink(e){let n=this.caipNetwork?.blockExplorers?.default.url;n&&t.openHref(`${n}/address/${e}`,`_blank`)}handleAddConnection(e){p.setFilterByNamespace(e),u.push(`Connect`,{addWalletForNamespace:e})}getChainLabelInfo(e){return Pt[e]??{title:`Add Wallet`,description:`Add your first wallet`}}isSmartAccount(e){if(!this.namespace)return!1;let t=this.user?.accounts?.find(e=>e.type===`smartAccount`);return t&&e?x.isLowerCaseMatch(t.address,e):!1}getPlainAddress(){return this.caipAddress?t.getPlainAddress(this.caipAddress):void 0}getActiveConnections(e){let t=this.activeConnectorIds[e],{connections:n}=ne.getConnectionsData(e),[r]=n.filter(e=>x.isLowerCaseMatch(e.connectorId,t));if(!t)return n;let i=e===_.CHAIN.BITCOIN,{address:a}=this.caipAddress?te.parseCaipAddress(this.caipAddress):{},o=[...a?[a]:[]];return i&&r&&(o=r.accounts.map(e=>e.address)||[]),ne.excludeConnectorAddressFromConnections({connectorId:t,addresses:o,connections:n})}hasAnyConnections(e){let t=this.getActiveConnections(e),{recentConnections:n}=ne.getConnectionsData(e);return!!this.caipAddress||t.length>0||n.length>0}isAccountLoading(e,t){return x.isLowerCaseMatch(this.lastSelectedConnectorId,e)&&x.isLowerCaseMatch(this.lastSelectedAddress,t)&&this.isSwitching}getProfileContent(e){let{address:t,connections:n,connectorId:r,namespace:i}=e,[a]=n.filter(e=>x.isLowerCaseMatch(e.connectorId,r));if(i===_.CHAIN.BITCOIN&&a?.accounts.every(e=>typeof e.type==`string`))return this.getBitcoinProfileContent(a.accounts,t);let o=At.getAuthData({connectorId:r,accounts:[]});return[{address:t,tagLabel:`Active`,tagVariant:`success`,enableButton:!0,profileName:this.profileName,buttonType:`disconnect`,buttonLabel:`Disconnect`,buttonVariant:`neutral-secondary`,...o.isAuth?{description:this.isSmartAccount(t)?`Smart Account`:`EOA Account`}:{}}]}getBitcoinProfileContent(e,t){let n=e.length>1,r=this.getPlainAddress();return e.map(e=>{let i=x.isLowerCaseMatch(e.address,r),a=`PAYMENT`;return e.type===`ordinal`&&(a=`ORDINALS`),{address:e.address,tagLabel:x.isLowerCaseMatch(e.address,t)?`Active`:void 0,tagVariant:x.isLowerCaseMatch(e.address,t)?`success`:void 0,enableButton:!0,...n?{label:a,alignItems:`flex-end`,buttonType:i?`disconnect`:`switch`,buttonLabel:i?`Disconnect`:`Switch`,buttonVariant:i?`neutral-secondary`:`accent-secondary`}:{alignItems:`center`,buttonType:`disconnect`,buttonLabel:`Disconnect`,buttonVariant:`neutral-secondary`}}})}removeScrollListener(){let e=this.shadowRoot?.querySelector(`.wallet-list`);e&&e.removeEventListener(`scroll`,()=>this.handleConnectListScroll())}handleConnectListScroll(){let e=this.shadowRoot?.querySelector(`.wallet-list`);e&&this.updateScrollOpacity(e)}isMultiWalletEnabled(){return!!this.remoteFeatures?.multiWallet}updateScrollOpacity(e){e.style.setProperty(`--connect-scroll--top-opacity`,de.interpolate([0,K.SCROLL_THRESHOLD],K.OPACITY_RANGE,e.scrollTop).toString()),e.style.setProperty(`--connect-scroll--bottom-opacity`,de.interpolate([0,K.SCROLL_THRESHOLD],K.OPACITY_RANGE,e.scrollHeight-e.scrollTop-e.offsetHeight).toString())}onConnectionsChange(){if(this.isMultiWalletEnabled()&&this.namespace){let{connections:e}=ne.getConnectionsData(this.namespace);e.length===0&&u.reset(`ProfileWallets`)}this.requestUpdate()}};q.styles=jt,G([A()],q.prototype,`currentTab`,void 0),G([A()],q.prototype,`namespace`,void 0),G([A()],q.prototype,`namespaces`,void 0),G([A()],q.prototype,`caipAddress`,void 0),G([A()],q.prototype,`profileName`,void 0),G([A()],q.prototype,`activeConnectorIds`,void 0),G([A()],q.prototype,`lastSelectedAddress`,void 0),G([A()],q.prototype,`lastSelectedConnectorId`,void 0),G([A()],q.prototype,`isSwitching`,void 0),G([A()],q.prototype,`caipNetwork`,void 0),G([A()],q.prototype,`user`,void 0),G([A()],q.prototype,`remoteFeatures`,void 0),q=G([T(`w3m-profile-wallets-view`)],q);var Ft=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},It=class extends y{constructor(){super(),this.unsubscribe=[],this.activeCaipNetwork=h.state.activeCaipNetwork,this.features=l.state.features,this.remoteFeatures=l.state.remoteFeatures,this.exchangesLoading=j.state.isLoading,this.exchanges=j.state.exchanges,this.unsubscribe.push(l.subscribeKey(`features`,e=>this.features=e),l.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e),h.subscribeKey(`activeCaipNetwork`,e=>{this.activeCaipNetwork=e,this.setDefaultPaymentAsset()}),j.subscribeKey(`isLoading`,e=>this.exchangesLoading=e),j.subscribeKey(`exchanges`,e=>this.exchanges=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}async firstUpdated(){j.isPayWithExchangeSupported()&&(await this.setDefaultPaymentAsset(),await j.fetchExchanges())}render(){return b`
      <wui-flex flexDirection="column" .padding=${[`1`,`3`,`3`,`3`]} gap="2">
        ${this.onrampTemplate()} ${this.receiveTemplate()} ${this.depositFromExchangeTemplate()}
      </wui-flex>
    `}async setDefaultPaymentAsset(){if(!this.activeCaipNetwork)return;let e=await j.getAssetsForNetwork(this.activeCaipNetwork.caipNetworkId),t=e.find(e=>e.metadata.symbol===`USDC`)||e[0];t&&j.setPaymentAsset(t)}onrampTemplate(){if(!this.activeCaipNetwork)return null;let e=this.remoteFeatures?.onramp,t=a.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.activeCaipNetwork.chainNamespace);return!e||!t?null:b`
      <wui-list-item
        @click=${this.onBuyCrypto.bind(this)}
        icon="card"
        data-testid="wallet-features-onramp-button"
      >
        <wui-text variant="lg-regular" color="primary">Buy crypto</wui-text>
      </wui-list-item>
    `}depositFromExchangeTemplate(){return!this.activeCaipNetwork||!j.isPayWithExchangeSupported()?null:b`
      <wui-list-item
        @click=${this.onDepositFromExchange.bind(this)}
        icon="arrowBottomCircle"
        data-testid="wallet-features-deposit-from-exchange-button"
        ?loading=${this.exchangesLoading}
        ?disabled=${this.exchangesLoading||!this.exchanges.length}
      >
        <wui-text variant="lg-regular" color="primary">Deposit from exchange</wui-text>
      </wui-list-item>
    `}receiveTemplate(){return this.features?.receive?b`
      <wui-list-item
        @click=${this.onReceive.bind(this)}
        icon="qrCode"
        data-testid="wallet-features-receive-button"
      >
        <wui-text variant="lg-regular" color="primary">Receive funds</wui-text>
      </wui-list-item>
    `:null}onBuyCrypto(){u.push(`OnRampProviders`)}onReceive(){u.push(`WalletReceive`)}onDepositFromExchange(){j.reset(),u.push(`PayWithExchange`,{redirectView:u.state.data?.redirectView})}};Ft([A()],It.prototype,`activeCaipNetwork`,void 0),Ft([A()],It.prototype,`features`,void 0),Ft([A()],It.prototype,`remoteFeatures`,void 0),Ft([A()],It.prototype,`exchangesLoading`,void 0),Ft([A()],It.prototype,`exchanges`,void 0),It=Ft([T(`w3m-fund-wallet-view`)],It);var Lt=w`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    user-select: none;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({colors:e})=>e.neutrals300};
    border-radius: ${({borderRadius:e})=>e.round};
    border: 1px solid transparent;
    will-change: border;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  span:before {
    content: '';
    position: absolute;
    background-color: ${({colors:e})=>e.white};
    border-radius: 50%;
  }

  /* -- Sizes --------------------------------------------------------- */
  label[data-size='lg'] {
    width: 48px;
    height: 32px;
  }

  label[data-size='md'] {
    width: 40px;
    height: 28px;
  }

  label[data-size='sm'] {
    width: 32px;
    height: 22px;
  }

  label[data-size='lg'] > span:before {
    height: 24px;
    width: 24px;
    left: 4px;
    top: 3px;
  }

  label[data-size='md'] > span:before {
    height: 20px;
    width: 20px;
    left: 4px;
    top: 3px;
  }

  label[data-size='sm'] > span:before {
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
  }

  /* -- Focus states --------------------------------------------------- */
  input:focus-visible:not(:checked) + span,
  input:focus:not(:checked) + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    background-color: ${({tokens:e})=>e.theme.textTertiary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  input:focus-visible:checked + span,
  input:focus:checked + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  input:checked + span {
    background-color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  label[data-size='lg'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='md'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='sm'] > input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }

  /* -- Hover states ------------------------------------------------------- */
  label:hover > input:not(:checked):not(:disabled) + span {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  label:hover > input:checked:not(:disabled) + span {
    background-color: ${({colors:e})=>e.accent080};
  }

  /* -- Disabled state --------------------------------------------------- */
  label:has(input:disabled) {
    pointer-events: none;
    user-select: none;
  }

  input:not(:checked):disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:checked:disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:not(:checked):disabled + span::before {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  input:checked:disabled + span::before {
    background-color: ${({tokens:e})=>e.theme.textTertiary};
  }
`,Rt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},zt=class extends y{constructor(){super(...arguments),this.inputElementRef=xe(),this.checked=!1,this.disabled=!1,this.size=`md`}render(){return b`
      <label data-size=${this.size}>
        <input
          ${be(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent(`switchChange`,{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};zt.styles=[E,C,Lt],Rt([O({type:Boolean})],zt.prototype,`checked`,void 0),Rt([O({type:Boolean})],zt.prototype,`disabled`,void 0),Rt([O()],zt.prototype,`size`,void 0),zt=Rt([T(`wui-toggle`)],zt);var Bt=w`
  :host {
    height: auto;
  }

  :host > wui-flex {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`,Vt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ht=class extends y{constructor(){super(...arguments),this.checked=!1}render(){return b`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `}handleToggleChange(e){e.stopPropagation(),this.checked=e.detail,this.dispatchSwitchEvent()}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent(`certifiedSwitchChange`,{detail:this.checked,bubbles:!0,composed:!0}))}};Ht.styles=[E,C,Bt],Vt([O({type:Boolean})],Ht.prototype,`checked`,void 0),Ht=Vt([T(`wui-certified-switch`)],Ht);var Ut=w`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.iconDefault};
    cursor: pointer;
    padding: ${({spacing:e})=>e[2]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
  }

  @media (hover: hover) {
    wui-icon:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }
`,Wt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Gt=class extends y{constructor(){super(...arguments),this.inputComponentRef=xe(),this.inputValue=``}render(){return b`
      <wui-input-text
        ${be(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue?b`<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`:null}
      </wui-input-text>
    `}onInputChange(e){this.inputValue=e.detail||``}clearValue(){let e=this.inputComponentRef.value?.inputElementRef.value;e&&(e.value=``,this.inputValue=``,e.focus(),e.dispatchEvent(new Event(`input`)))}};Gt.styles=[E,Ut],Wt([O()],Gt.prototype,`inputValue`,void 0),Gt=Wt([T(`wui-search-bar`)],Gt);var Kt=w`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 104px;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--apkt-path-network);
    clip-path: var(--apkt-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: ${({tokens:e})=>e.theme.foregroundSecondary};
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`,qt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Jt=class extends y{constructor(){super(...arguments),this.type=`wallet`}render(){return b`
      ${this.shimmerTemplate()}
      <wui-shimmer width="80px" height="20px"></wui-shimmer>
    `}shimmerTemplate(){return this.type===`network`?b` <wui-shimmer data-type=${this.type} width="48px" height="54px"></wui-shimmer>
        ${_e}`:b`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}};Jt.styles=[E,C,Kt],qt([O()],Jt.prototype,`type`,void 0),Jt=qt([T(`wui-card-select-loader`)],Jt);var Yt=D`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`,J=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Y=class extends y{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--apkt-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--apkt-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--apkt-spacing-${this.gap})`};
      padding-top: ${this.padding&&S.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&S.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&S.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&S.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&S.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&S.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&S.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&S.getSpacingStyles(this.margin,3)};
    `,b`<slot></slot>`}};Y.styles=[E,Yt],J([O()],Y.prototype,`gridTemplateRows`,void 0),J([O()],Y.prototype,`gridTemplateColumns`,void 0),J([O()],Y.prototype,`justifyItems`,void 0),J([O()],Y.prototype,`alignItems`,void 0),J([O()],Y.prototype,`justifyContent`,void 0),J([O()],Y.prototype,`alignContent`,void 0),J([O()],Y.prototype,`columnGap`,void 0),J([O()],Y.prototype,`rowGap`,void 0),J([O()],Y.prototype,`gap`,void 0),J([O()],Y.prototype,`padding`,void 0),J([O()],Y.prototype,`margin`,void 0),Y=J([T(`wui-grid`)],Y);var Xt=w`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[0]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: clamp(0px, ${({borderRadius:e})=>e[4]}, 20px);
    transition:
      color ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-1`]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textPrimary};
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled > wui-flex > wui-text {
    color: ${({tokens:e})=>e.core.glass010};
  }

  [data-selected='true'] {
    background-color: ${({colors:e})=>e.accent020};
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: ${({colors:e})=>e.accent010};
    }
  }

  [data-selected='true']:active:enabled {
    background-color: ${({colors:e})=>e.accent010};
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`,Zt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},X=class extends y{constructor(){super(),this.observer=new IntersectionObserver(()=>void 0),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.isImpressed=!1,this.explorerId=``,this.walletQuery=``,this.certified=!1,this.displayIndex=0,this.wallet=void 0,this.observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting?(this.visible=!0,this.fetchImageSrc(),this.sendImpressionEvent()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){let e=this.wallet?.badge_type===`certified`;return b`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
            color="inherit"
            class=${k(e?`certified`:void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${e?b`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return!this.visible&&!this.imageSrc||this.imageLoading?this.shimmerTemplate():b`
      <wui-wallet-image
        size="lg"
        imageSrc=${k(this.imageSrc)}
        name=${k(this.wallet?.name)}
        .installed=${this.wallet?.installed??!1}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `}shimmerTemplate(){return b`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=c.getWalletImage(this.wallet),!this.imageSrc&&(this.imageLoading=!0,this.imageSrc=await c.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}sendImpressionEvent(){!this.wallet||this.isImpressed||(this.isImpressed=!0,f.sendWalletImpressionEvent({name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.explorerId,view:u.state.view,query:this.walletQuery,certified:this.certified,displayIndex:this.displayIndex}))}};X.styles=Xt,Zt([A()],X.prototype,`visible`,void 0),Zt([A()],X.prototype,`imageSrc`,void 0),Zt([A()],X.prototype,`imageLoading`,void 0),Zt([A()],X.prototype,`isImpressed`,void 0),Zt([O()],X.prototype,`explorerId`,void 0),Zt([O()],X.prototype,`walletQuery`,void 0),Zt([O()],X.prototype,`certified`,void 0),Zt([O()],X.prototype,`displayIndex`,void 0),Zt([O({type:Object})],X.prototype,`wallet`,void 0),X=Zt([T(`w3m-all-wallets-list-item`)],X);var Qt=w`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  w3m-all-wallets-list-item {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e[`ease-inout-power-2`]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-loading-spinner {
    padding-top: ${({spacing:e})=>e[4]};
    padding-bottom: ${({spacing:e})=>e[4]};
    justify-content: center;
    grid-column: 1 / span 4;
  }
`,$t=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},en=`local-paginator`,tn=class extends y{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!g.state.wallets.length,this.wallets=g.state.wallets,this.mobileFullScreen=l.state.enableMobileFullScreen,this.unsubscribe.push(g.subscribeKey(`wallets`,e=>this.wallets=e))}firstUpdated(){this.mobileFullScreen&&this.setAttribute(`data-mobile-fullscreen`,`true`),this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.paginationObserver?.disconnect()}render(){return b`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${[`0`,`3`,`3`,`3`]}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;let e=this.shadowRoot?.querySelector(`wui-grid`);e&&(await g.fetchWalletsByPage({page:1}),await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:`forwards`,easing:`ease`}).finished,this.loading=!1,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:`forwards`,easing:`ease`}))}shimmerTemplate(e,t){return[...Array(e)].map(()=>b`
        <wui-card-select-loader type="wallet" id=${k(t)}></wui-card-select-loader>
      `)}walletsTemplate(){return oe.getWalletConnectWallets(this.wallets).map((e,t)=>b`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${e.id}"
          @click=${()=>this.onConnectWallet(e)}
          .wallet=${e}
          explorerId=${e.id}
          certified=${this.badge===`certified`}
          displayIndex=${t}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){let{wallets:e,recommended:t,featured:n,count:r,mobileFilteredOutWalletsLength:i}=g.state,a=window.innerWidth<352?3:4,o=e.length+t.length,s=Math.ceil(o/a)*a-o+a;return s-=e.length?n.length%a:0,r===0&&n.length>0?null:r===0||[...n,...e,...t].length<r-(i??0)?this.shimmerTemplate(s,en):null}createPaginationObserver(){let e=this.shadowRoot?.querySelector(`#${en}`);e&&(this.paginationObserver=new IntersectionObserver(([e])=>{if(e?.isIntersecting&&!this.loading){let{page:e,count:t,wallets:n}=g.state;n.length<t&&g.fetchWalletsByPage({page:e+1})}}),this.paginationObserver.observe(e))}onConnectWallet(e){p.selectWalletConnector(e)}};tn.styles=Qt,$t([A()],tn.prototype,`loading`,void 0),$t([A()],tn.prototype,`wallets`,void 0),$t([A()],tn.prototype,`badge`,void 0),$t([A()],tn.prototype,`mobileFullScreen`,void 0),tn=$t([T(`w3m-all-wallets-list`)],tn);var nn=D`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
    height: auto;
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`,rn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},an=class extends y{constructor(){super(...arguments),this.prevQuery=``,this.prevBadge=void 0,this.loading=!0,this.mobileFullScreen=l.state.enableMobileFullScreen,this.query=``}render(){return this.mobileFullScreen&&this.setAttribute(`data-mobile-fullscreen`,`true`),this.onSearch(),this.loading?b`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await g.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){let{search:e}=g.state,t=oe.markWalletsAsInstalled(e),n=oe.filterWalletsByWcSupport(t);return n.length?b`
      <wui-grid
        data-testid="wallet-list"
        .padding=${[`0`,`3`,`3`,`3`]}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${n.map((e,t)=>b`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(e)}
              .wallet=${e}
              data-testid="wallet-search-item-${e.id}"
              explorerId=${e.id}
              certified=${this.badge===`certified`}
              walletQuery=${this.query}
              displayIndex=${t}
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:b`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(e){p.selectWalletConnector(e)}};an.styles=nn,rn([A()],an.prototype,`loading`,void 0),rn([A()],an.prototype,`mobileFullScreen`,void 0),rn([O()],an.prototype,`query`,void 0),rn([O()],an.prototype,`badge`,void 0),an=rn([T(`w3m-all-wallets-search`)],an);var on=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},sn=class extends y{constructor(){super(...arguments),this.search=``,this.badge=void 0,this.onDebouncedSearch=t.debounce(e=>{this.search=e})}render(){let e=this.search.length>=2;return b`
      <wui-flex .padding=${[`1`,`3`,`3`,`3`]} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge===`certified`}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${e||this.badge?b`<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`:b`<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}onCertifiedSwitchChange(e){e.detail?(this.badge=`certified`,r.showSvg(`Only WalletConnect certified`,{icon:`walletConnectBrown`,iconColor:`accent-100`})):this.badge=void 0}qrButtonTemplate(){return t.isMobile()?b`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){u.push(`ConnectingWalletConnect`)}};on([A()],sn.prototype,`search`,void 0),on([A()],sn.prototype,`badge`,void 0),sn=on([T(`w3m-all-wallets-view`)],sn);var cn=w`
  button {
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[4]};
    width: 100%;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    justify-content: center;
    align-items: center;
  }

  :host([data-size='sm']) button {
    padding: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-size='md']) button {
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  button:hover {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  button:disabled {
    opacity: 0.5;
  }
`,ln=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},un=class extends y{constructor(){super(...arguments),this.text=``,this.disabled=!1,this.size=`lg`,this.icon=`copy`,this.tabIdx=void 0}render(){this.dataset.size=this.size;let e=`${this.size}-regular`;return b`
      <button ?disabled=${this.disabled} tabindex=${k(this.tabIdx)}>
        <wui-icon name=${this.icon} size=${this.size} color="default"></wui-icon>
        <wui-text align="center" variant=${e} color="primary">${this.text}</wui-text>
      </button>
    `}};un.styles=[E,C,cn],ln([O()],un.prototype,`text`,void 0),ln([O({type:Boolean})],un.prototype,`disabled`,void 0),ln([O()],un.prototype,`size`,void 0),ln([O()],un.prototype,`icon`,void 0),ln([O()],un.prototype,`tabIdx`,void 0),un=ln([T(`wui-list-button`)],un);var dn=w`
  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }

  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }

  wui-icon-link,
  wui-loading-spinner {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  wui-icon-link {
    right: ${({spacing:e})=>e[2]};
  }

  wui-loading-spinner {
    right: ${({spacing:e})=>e[3]};
  }

  wui-text {
    margin: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[0]} ${({spacing:e})=>e[3]};
  }
`,fn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},pn=class extends y{constructor(){super(),this.unsubscribe=[],this.formRef=xe(),this.email=``,this.loading=!1,this.error=``,this.remoteFeatures=l.state.remoteFeatures,this.hasExceededUsageLimit=g.state.plan.hasExceededUsageLimit,this.unsubscribe.push(l.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e}),g.subscribeKey(`plan`,e=>this.hasExceededUsageLimit=e.hasExceededUsageLimit))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}firstUpdated(){this.formRef.value?.addEventListener(`keydown`,e=>{e.key===`Enter`&&this.onSubmitEmail(e)})}render(){let e=m.hasAnyConnection(_.CONNECTOR_ID.AUTH);return b`
      <form ${be(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
        <wui-email-input
          @focus=${this.onFocusEvent.bind(this)}
          .disabled=${this.loading}
          @inputChange=${this.onEmailInputChange.bind(this)}
          tabIdx=${k(this.tabIdx)}
          ?disabled=${e||this.hasExceededUsageLimit}
        >
        </wui-email-input>

        ${this.submitButtonTemplate()}${this.loadingTemplate()}
        <input type="submit" hidden />
      </form>
      ${this.templateError()}
    `}submitButtonTemplate(){return!this.loading&&this.email.length>3?b`
          <wui-icon-link
            size="lg"
            icon="chevronRight"
            iconcolor="accent-100"
            @click=${this.onSubmitEmail.bind(this)}
          >
          </wui-icon-link>
        `:null}loadingTemplate(){return this.loading?b`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:null}templateError(){return this.error?b`<wui-text variant="sm-medium" color="error">${this.error}</wui-text>`:null}onEmailInputChange(e){this.email=e.detail.trim(),this.error=``}async onSubmitEmail(e){if(!Se.isValidEmail(this.email)){le.open({displayMessage:pe.ALERT_WARNINGS.INVALID_EMAIL.displayMessage},`warning`);return}if(!_.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(e=>e===h.state.activeChain)){let e=h.getFirstCaipNetworkSupportsAuthConnector();if(e){u.push(`SwitchNetwork`,{network:e});return}}try{if(this.loading)return;this.loading=!0,e.preventDefault();let t=p.getAuthConnector();if(!t)throw Error(`w3m-email-login-widget: Auth connector not found`);let{action:n}=await t.provider.connectEmail({email:this.email});if(f.sendEvent({type:`track`,event:`EMAIL_SUBMITTED`}),n===`VERIFY_OTP`)f.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_SENT`}),u.push(`EmailVerifyOtp`,{email:this.email});else if(n===`VERIFY_DEVICE`)u.push(`EmailVerifyDevice`,{email:this.email});else if(n===`CONNECT`){let e=this.remoteFeatures?.multiWallet;await m.connectExternal(t,h.state.activeChain),e?(u.replace(`ProfileWallets`),r.showSuccess(`New Wallet Added`)):u.replace(`Account`)}}catch(e){t.parseError(e)?.includes(`Invalid email`)?this.error=`Invalid email. Try again.`:r.showError(e)}finally{this.loading=!1}}onFocusEvent(){f.sendEvent({type:`track`,event:`EMAIL_LOGIN_SELECTED`})}};pn.styles=dn,fn([O()],pn.prototype,`tabIdx`,void 0),fn([A()],pn.prototype,`email`,void 0),fn([A()],pn.prototype,`loading`,void 0),fn([A()],pn.prototype,`error`,void 0),fn([A()],pn.prototype,`remoteFeatures`,void 0),fn([A()],pn.prototype,`hasExceededUsageLimit`,void 0),pn=fn([T(`w3m-email-login-widget`)],pn);var mn=w`
  :host {
    display: block;
    width: 100%;
  }

  button {
    width: 100%;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  @media (hover: hover) {
    button:hover:enabled {
      background: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`,hn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},gn=class extends y{constructor(){super(...arguments),this.logo=`google`,this.disabled=!1,this.tabIdx=void 0}render(){return b`
      <button ?disabled=${this.disabled} tabindex=${k(this.tabIdx)}>
        <wui-icon size="xxl" name=${this.logo}></wui-icon>
      </button>
    `}};gn.styles=[E,C,mn],hn([O()],gn.prototype,`logo`,void 0),hn([O({type:Boolean})],gn.prototype,`disabled`,void 0),hn([O()],gn.prototype,`tabIdx`,void 0),gn=hn([T(`wui-logo-select`)],gn);var _n=w`
  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1)
      ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }
`,vn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},yn=2,bn=6,xn=class extends y{constructor(){super(),this.unsubscribe=[],this.walletGuide=`get-started`,this.tabIdx=void 0,this.connectors=p.state.connectors,this.remoteFeatures=l.state.remoteFeatures,this.authConnector=this.connectors.find(e=>e.type===`AUTH`),this.isPwaLoading=!1,this.hasExceededUsageLimit=g.state.plan.hasExceededUsageLimit,this.unsubscribe.push(p.subscribeKey(`connectors`,e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>e.type===`AUTH`)}),l.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e),g.subscribeKey(`plan`,e=>this.hasExceededUsageLimit=e.hasExceededUsageLimit))}connectedCallback(){super.connectedCallback(),this.handlePwaFrameLoad()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return b`
      <wui-flex
        class="container"
        flexDirection="column"
        gap="2"
        data-testid="w3m-social-login-widget"
      >
        ${this.topViewTemplate()}${this.bottomViewTemplate()}
      </wui-flex>
    `}topViewTemplate(){let e=this.walletGuide===`explore`,t=this.remoteFeatures?.socials;return!t&&e?(t=a.DEFAULT_SOCIALS,this.renderTopViewContent(t)):t?this.renderTopViewContent(t):null}renderTopViewContent(e){return e.length===2?b` <wui-flex gap="2">
        ${e.slice(0,yn).map(e=>b`<wui-logo-select
              data-testid=${`social-selector-${e}`}
              @click=${()=>{this.onSocialClick(e)}}
              logo=${e}
              tabIdx=${k(this.tabIdx)}
              ?disabled=${this.isPwaLoading||this.hasConnection()}
            ></wui-logo-select>`)}
      </wui-flex>`:b` <wui-list-button
      data-testid=${`social-selector-${e[0]}`}
      @click=${()=>{this.onSocialClick(e[0])}}
      size="lg"
      icon=${k(e[0])}
      text=${`Continue with ${S.capitalize(e[0])}`}
      tabIdx=${k(this.tabIdx)}
      ?disabled=${this.isPwaLoading||this.hasConnection()}
    ></wui-list-button>`}bottomViewTemplate(){let e=this.remoteFeatures?.socials,t=this.walletGuide===`explore`;return(!this.authConnector||!e||e.length===0)&&t&&(e=a.DEFAULT_SOCIALS),!e||e.length<=yn?null:e&&e.length>bn?b`<wui-flex gap="2">
        ${e.slice(1,bn-1).map(e=>b`<wui-logo-select
              data-testid=${`social-selector-${e}`}
              @click=${()=>{this.onSocialClick(e)}}
              logo=${e}
              tabIdx=${k(this.tabIdx)}
              ?focusable=${this.tabIdx!==void 0&&this.tabIdx>=0}
              ?disabled=${this.isPwaLoading||this.hasConnection()}
            ></wui-logo-select>`)}
        <wui-logo-select
          logo="more"
          tabIdx=${k(this.tabIdx)}
          @click=${this.onMoreSocialsClick.bind(this)}
          ?disabled=${this.isPwaLoading||this.hasConnection()}
          data-testid="social-selector-more"
        ></wui-logo-select>
      </wui-flex>`:e?b`<wui-flex gap="2">
      ${e.slice(1,e.length).map(e=>b`<wui-logo-select
            data-testid=${`social-selector-${e}`}
            @click=${()=>{this.onSocialClick(e)}}
            logo=${e}
            tabIdx=${k(this.tabIdx)}
            ?focusable=${this.tabIdx!==void 0&&this.tabIdx>=0}
            ?disabled=${this.isPwaLoading||this.hasConnection()}
          ></wui-logo-select>`)}
    </wui-flex>`:null}onMoreSocialsClick(){u.push(`ConnectSocials`)}async onSocialClick(e){if(this.hasExceededUsageLimit){u.push(`UsageExceeded`);return}if(!_.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(e=>e===h.state.activeChain)){let e=h.getFirstCaipNetworkSupportsAuthConnector();if(e){u.push(`SwitchNetwork`,{network:e});return}}e&&await ve(e)}async handlePwaFrameLoad(){if(t.isPWA()){this.isPwaLoading=!0;try{this.authConnector?.provider instanceof ce&&await this.authConnector.provider.init()}catch(e){le.open({displayMessage:`Error loading embedded wallet in PWA`,debugMessage:e.message},`error`)}finally{this.isPwaLoading=!1}}}hasConnection(){return m.hasAnyConnection(_.CONNECTOR_ID.AUTH)}};xn.styles=_n,vn([O()],xn.prototype,`walletGuide`,void 0),vn([O()],xn.prototype,`tabIdx`,void 0),vn([A()],xn.prototype,`connectors`,void 0),vn([A()],xn.prototype,`remoteFeatures`,void 0),vn([A()],xn.prototype,`authConnector`,void 0),vn([A()],xn.prototype,`isPwaLoading`,void 0),vn([A()],xn.prototype,`hasExceededUsageLimit`,void 0),xn=vn([T(`w3m-social-login-widget`)],xn);var Sn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Cn=class extends y{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=p.state.connectors,this.count=g.state.count,this.filteredCount=g.state.filteredWallets.length,this.isFetchingRecommendedWallets=g.state.isFetchingRecommendedWallets,this.unsubscribe.push(p.subscribeKey(`connectors`,e=>this.connectors=e),g.subscribeKey(`count`,e=>this.count=e),g.subscribeKey(`filteredWallets`,e=>this.filteredCount=e.length),g.subscribeKey(`isFetchingRecommendedWallets`,e=>this.isFetchingRecommendedWallets=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.connectors.find(e=>e.id===`walletConnect`),{allWallets:n}=l.state;if(!e||n===`HIDE`||n===`ONLY_MOBILE`&&!t.isMobile())return null;let r=g.state.featured.length,i=this.count+r,a=i<10?i:Math.floor(i/10)*10,o=this.filteredCount>0?this.filteredCount:a,s=`${o}`;this.filteredCount>0?s=`${this.filteredCount}`:o<i&&(s=`${o}+`);let c=m.hasAnyConnection(_.CONNECTOR_ID.WALLET_CONNECT);return b`
      <wui-list-wallet
        name="Search Wallet"
        walletIcon="search"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${s}
        tagVariant="info"
        data-testid="all-wallets"
        tabIdx=${k(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        ?disabled=${c}
        size="sm"
      ></wui-list-wallet>
    `}onAllWallets(){f.sendEvent({type:`track`,event:`CLICK_ALL_WALLETS`}),u.push(`AllWallets`,{redirectView:u.state.data?.redirectView})}};Sn([O()],Cn.prototype,`tabIdx`,void 0),Sn([A()],Cn.prototype,`connectors`,void 0),Sn([A()],Cn.prototype,`count`,void 0),Sn([A()],Cn.prototype,`filteredCount`,void 0),Sn([A()],Cn.prototype,`isFetchingRecommendedWallets`,void 0),Cn=Sn([T(`w3m-all-wallets-widget`)],Cn);var wn=w`
  :host {
    margin-top: ${({spacing:e})=>e[1]};
  }
  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1)
      ${({spacing:e})=>e[2]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }
`,Tn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},En=class extends y{constructor(){super(),this.unsubscribe=[],this.explorerWallets=g.state.explorerWallets,this.connections=m.state.connections,this.connectorImages=i.state.connectorImages,this.loadingTelegram=!1,this.unsubscribe.push(m.subscribeKey(`connections`,e=>this.connections=e),i.subscribeKey(`connectorImages`,e=>this.connectorImages=e),g.subscribeKey(`explorerFilteredWallets`,e=>{this.explorerWallets=e?.length?e:g.state.explorerWallets}),g.subscribeKey(`explorerWallets`,e=>{this.explorerWallets?.length||(this.explorerWallets=e)})),t.isTelegram()&&t.isIos()&&(this.loadingTelegram=!m.state.wcUri,this.unsubscribe.push(m.subscribeKey(`wcUri`,e=>this.loadingTelegram=!e)))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return b`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `}connectorListTemplate(){return n.connectorList().map((e,t)=>e.kind===`connector`?this.renderConnector(e,t):this.renderWallet(e,t))}getConnectorNamespaces(e){return e.subtype===`walletConnect`?[]:e.subtype===`multiChain`?e.connector.connectors?.map(e=>e.chain)||[]:[e.connector.chain]}renderConnector(e,t){let n=e.connector,r=c.getConnectorImage(n)||this.connectorImages[n?.imageId??``],i=(this.connections.get(n.chain)??[]).some(e=>x.isLowerCaseMatch(e.connectorId,n.id)),a,o;e.subtype===`walletConnect`?(a=`qr code`,o=`accent`):e.subtype===`injected`||e.subtype===`announced`?(a=i?`connected`:`installed`,o=i?`info`:`success`):(a=void 0,o=void 0);let s=m.hasAnyConnection(_.CONNECTOR_ID.WALLET_CONNECT),l=e.subtype===`walletConnect`||e.subtype===`external`?s:!1;return b`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${k(r)}
        .installed=${!0}
        name=${n.name??`Unknown`}
        .tagVariant=${o}
        tagLabel=${k(a)}
        data-testid=${`wallet-selector-${n.id.toLowerCase()}`}
        size="sm"
        @click=${()=>this.onClickConnector(e)}
        tabIdx=${k(this.tabIdx)}
        ?disabled=${l}
        rdnsId=${k(n.explorerWallet?.rdns||void 0)}
        walletRank=${k(n.explorerWallet?.order)}
        .namespaces=${this.getConnectorNamespaces(e)}
      >
      </w3m-list-wallet>
    `}onClickConnector(e){let n=u.state.data?.redirectView;if(e.subtype===`walletConnect`){p.setActiveConnector(e.connector),t.isMobile()?u.push(`AllWallets`):u.push(`ConnectingWalletConnect`,{redirectView:n});return}if(e.subtype===`multiChain`){p.setActiveConnector(e.connector),u.push(`ConnectingMultiChain`,{redirectView:n});return}if(e.subtype===`injected`){p.setActiveConnector(e.connector),u.push(`ConnectingExternal`,{connector:e.connector,redirectView:n,wallet:e.connector.explorerWallet});return}if(e.subtype===`announced`){if(e.connector.id===`walletConnect`){t.isMobile()?u.push(`AllWallets`):u.push(`ConnectingWalletConnect`,{redirectView:n});return}u.push(`ConnectingExternal`,{connector:e.connector,redirectView:n,wallet:e.connector.explorerWallet});return}u.push(`ConnectingExternal`,{connector:e.connector,redirectView:n})}renderWallet(e,t){let n=e.wallet,r=c.getWalletImage(n),i=m.hasAnyConnection(_.CONNECTOR_ID.WALLET_CONNECT),a=this.loadingTelegram,o=e.subtype===`recent`?`recent`:void 0,s=e.subtype===`recent`?`info`:void 0;return b`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${k(r)}
        name=${n.name??`Unknown`}
        @click=${()=>this.onClickWallet(e)}
        size="sm"
        data-testid=${`wallet-selector-${n.id}`}
        tabIdx=${k(this.tabIdx)}
        ?loading=${a}
        ?disabled=${i}
        rdnsId=${k(n.rdns||void 0)}
        walletRank=${k(n.order)}
        tagLabel=${k(o)}
        .tagVariant=${s}
      >
      </w3m-list-wallet>
    `}onClickWallet(e){let t=u.state.data?.redirectView,n=h.state.activeChain;if(e.subtype===`featured`){p.selectWalletConnector(e.wallet);return}if(e.subtype===`recent`){if(this.loadingTelegram)return;p.selectWalletConnector(e.wallet);return}if(e.subtype===`custom`){if(this.loadingTelegram)return;u.push(`ConnectingWalletConnect`,{wallet:e.wallet,redirectView:t});return}if(this.loadingTelegram)return;let r=n?p.getConnector({id:e.wallet.id,namespace:n}):void 0;r?u.push(`ConnectingExternal`,{connector:r,redirectView:t}):u.push(`ConnectingWalletConnect`,{wallet:e.wallet,redirectView:t})}};En.styles=wn,Tn([O({type:Number})],En.prototype,`tabIdx`,void 0),Tn([A()],En.prototype,`explorerWallets`,void 0),Tn([A()],En.prototype,`connections`,void 0),Tn([A()],En.prototype,`connectorImages`,void 0),Tn([A()],En.prototype,`loadingTelegram`,void 0),En=Tn([T(`w3m-connector-list`)],En);var Dn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},On=class extends y{constructor(){super(...arguments),this.tabIdx=void 0}render(){return b`
      <wui-flex flexDirection="column" gap="2">
        <w3m-connector-list tabIdx=${k(this.tabIdx)}></w3m-connector-list>
        <w3m-all-wallets-widget tabIdx=${k(this.tabIdx)}></w3m-all-wallets-widget>
      </wui-flex>
    `}};Dn([O()],On.prototype,`tabIdx`,void 0),On=Dn([T(`w3m-wallet-login-list`)],On);var kn=w`
  :host {
    --connect-scroll--top-opacity: 0;
    --connect-scroll--bottom-opacity: 0;
    --connect-mask-image: none;
  }

  .connect {
    max-height: clamp(360px, 470px, 80vh);
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
    mask-image: var(--connect-mask-image);
  }

  .guide {
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
  }

  .connect::-webkit-scrollbar {
    display: none;
  }

  .all-wallets {
    flex-flow: column;
  }

  .connect.disabled,
  .guide.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }

  wui-separator {
    margin: ${({spacing:e})=>e[3]} calc(${({spacing:e})=>e[3]} * -1);
    width: calc(100% + ${({spacing:e})=>e[3]} * 2);
  }
`,Z=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},An=470,Q=class extends y{constructor(){super(),this.unsubscribe=[],this.connectors=p.state.connectors,this.authConnector=this.connectors.find(e=>e.type===`AUTH`),this.features=l.state.features,this.remoteFeatures=l.state.remoteFeatures,this.enableWallets=l.state.enableWallets,this.noAdapters=h.state.noAdapters,this.walletGuide=`get-started`,this.checked=ge.state.isLegalCheckboxChecked,this.isEmailEnabled=this.remoteFeatures?.email&&!h.state.noAdapters,this.isSocialEnabled=this.remoteFeatures?.socials&&this.remoteFeatures.socials.length>0&&!h.state.noAdapters,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors),this.unsubscribe.push(p.subscribeKey(`connectors`,e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>e.type===`AUTH`),this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)}),l.subscribeKey(`features`,e=>{this.features=e}),l.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e,this.setEmailAndSocialEnableCheck(this.noAdapters,this.remoteFeatures)}),l.subscribeKey(`enableWallets`,e=>this.enableWallets=e),h.subscribeKey(`noAdapters`,e=>this.setEmailAndSocialEnableCheck(e,this.remoteFeatures)),ge.subscribeKey(`isLegalCheckboxChecked`,e=>this.checked=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.resizeObserver?.disconnect(),(this.shadowRoot?.querySelector(`.connect`))?.removeEventListener(`scroll`,this.handleConnectListScroll.bind(this))}firstUpdated(){let e=this.shadowRoot?.querySelector(`.connect`);e&&(requestAnimationFrame(this.handleConnectListScroll.bind(this)),e?.addEventListener(`scroll`,this.handleConnectListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleConnectListScroll()}),this.resizeObserver?.observe(e),this.handleConnectListScroll())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.state,n=l.state.features?.legalCheckbox,r=!!(e||t)&&!!n&&this.walletGuide===`get-started`&&!this.checked,i={connect:!0,disabled:r},a=l.state.enableWalletGuide,o=this.enableWallets,s=this.isSocialEnabled||this.authConnector,c=r?-1:void 0;return b`
      <wui-flex flexDirection="column">
        ${this.legalCheckboxTemplate()}
        <wui-flex
          data-testid="w3m-connect-scroll-view"
          flexDirection="column"
          .padding=${[`0`,`0`,`4`,`0`]}
          class=${he(i)}
        >
          <wui-flex
            class="connect-methods"
            flexDirection="column"
            gap="2"
            .padding=${s&&o&&a&&this.walletGuide===`get-started`?[`0`,`3`,`0`,`3`]:[`0`,`3`,`3`,`3`]}
          >
            ${this.renderConnectMethod(c)}
          </wui-flex>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}reownBrandingTemplate(){return Se.hasFooter()||!this.remoteFeatures?.reownBranding?null:b`<wui-ux-by-reown></wui-ux-by-reown>`}setEmailAndSocialEnableCheck(e,t){this.isEmailEnabled=t?.email&&!e,this.isSocialEnabled=t?.socials&&t.socials.length>0&&!e,this.remoteFeatures=t,this.noAdapters=e}checkIfAuthEnabled(e){let t=e.filter(e=>e.type===ye.CONNECTOR_TYPE_AUTH).map(e=>e.chain);return _.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(e=>t.includes(e))}renderConnectMethod(e){return b`${oe.getConnectOrderMethod(this.features,this.connectors).map((t,n)=>{switch(t){case`email`:return b`${this.emailTemplate(e)} ${this.separatorTemplate(n,`email`)}`;case`social`:return b`${this.socialListTemplate(e)}
          ${this.separatorTemplate(n,`social`)}`;case`wallet`:return b`${this.walletListTemplate(e)}
          ${this.separatorTemplate(n,`wallet`)}`;default:return null}})}`}checkMethodEnabled(e){switch(e){case`wallet`:return this.enableWallets;case`social`:return this.isSocialEnabled&&this.isAuthEnabled;case`email`:return this.isEmailEnabled&&this.isAuthEnabled;default:return null}}checkIsThereNextMethod(e){let t=oe.getConnectOrderMethod(this.features,this.connectors)[e+1];if(t)return this.checkMethodEnabled(t)?t:this.checkIsThereNextMethod(e+1)}separatorTemplate(e,t){let n=this.checkIsThereNextMethod(e),r=this.walletGuide===`explore`;switch(t){case`wallet`:return this.enableWallets&&n&&!r?b`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`:null;case`email`:{let e=n===`social`;return this.isAuthEnabled&&this.isEmailEnabled&&!e&&n?b`<wui-separator
              data-testid="w3m-email-login-or-separator"
              text="or"
            ></wui-separator>`:null}case`social`:{let e=n===`email`;return this.isAuthEnabled&&this.isSocialEnabled&&!e&&n?b`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`:null}default:return null}}emailTemplate(e){return!this.isEmailEnabled||!this.isAuthEnabled?null:b`<w3m-email-login-widget tabIdx=${k(e)}></w3m-email-login-widget>`}socialListTemplate(e){return!this.isSocialEnabled||!this.isAuthEnabled?null:b`<w3m-social-login-widget
      walletGuide=${this.walletGuide}
      tabIdx=${k(e)}
    ></w3m-social-login-widget>`}walletListTemplate(e){let n=this.enableWallets,r=this.features?.emailShowWallets===!1,i=this.features?.collapseWallets,a=r||i;return!n||(t.isTelegram()&&(t.isSafari()||t.isIos())&&m.connectWalletConnect().catch(e=>({})),this.walletGuide===`explore`)?null:this.isAuthEnabled&&(this.isEmailEnabled||this.isSocialEnabled)&&a?b`<wui-list-button
        data-testid="w3m-collapse-wallets-button"
        tabIdx=${k(e)}
        @click=${this.onContinueWalletClick.bind(this)}
        text="Continue with a wallet"
        icon="wallet"
      ></wui-list-button>`:b`<w3m-wallet-login-list tabIdx=${k(e)}></w3m-wallet-login-list>`}legalCheckboxTemplate(){return this.walletGuide===`explore`?null:b`<w3m-legal-checkbox data-testid="w3m-legal-checkbox"></w3m-legal-checkbox>`}handleConnectListScroll(){let e=this.shadowRoot?.querySelector(`.connect`);e&&(e.scrollHeight>An?(e.style.setProperty(`--connect-mask-image`,`linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
          black 100px,
          black calc(100% - 100px),
          rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
        )`),e.style.setProperty(`--connect-scroll--top-opacity`,de.interpolate([0,50],[0,1],e.scrollTop).toString()),e.style.setProperty(`--connect-scroll--bottom-opacity`,de.interpolate([0,50],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString())):(e.style.setProperty(`--connect-mask-image`,`none`),e.style.setProperty(`--connect-scroll--top-opacity`,`0`),e.style.setProperty(`--connect-scroll--bottom-opacity`,`0`)))}onContinueWalletClick(){u.push(`ConnectWallets`)}};Q.styles=kn,Z([A()],Q.prototype,`connectors`,void 0),Z([A()],Q.prototype,`authConnector`,void 0),Z([A()],Q.prototype,`features`,void 0),Z([A()],Q.prototype,`remoteFeatures`,void 0),Z([A()],Q.prototype,`enableWallets`,void 0),Z([A()],Q.prototype,`noAdapters`,void 0),Z([O()],Q.prototype,`walletGuide`,void 0),Z([A()],Q.prototype,`checked`,void 0),Z([A()],Q.prototype,`isEmailEnabled`,void 0),Z([A()],Q.prototype,`isSocialEnabled`,void 0),Z([A()],Q.prototype,`isAuthEnabled`,void 0),Q=Z([T(`w3m-connect-view`)],Q);var jn=w`
  wui-flex {
    width: 100%;
    height: 52px;
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding-left: ${({spacing:e})=>e[3]};
    padding-right: ${({spacing:e})=>e[3]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[6]};
  }

  wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-icon {
    width: 12px;
    height: 12px;
  }
`,Mn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Nn=class extends y{constructor(){super(...arguments),this.disabled=!1,this.label=``,this.buttonLabel=``}render(){return b`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="inherit">${this.label}</wui-text>
        <wui-button variant="accent-secondary" size="sm">
          ${this.buttonLabel}
          <wui-icon name="chevronRight" color="inherit" size="inherit" slot="iconRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};Nn.styles=[E,C,jn],Mn([O({type:Boolean})],Nn.prototype,`disabled`,void 0),Mn([O()],Nn.prototype,`label`,void 0),Mn([O()],Nn.prototype,`buttonLabel`,void 0),Nn=Mn([T(`wui-cta-button`)],Nn);var Pn=w`
  :host {
    display: block;
    padding: 0 ${({spacing:e})=>e[5]} ${({spacing:e})=>e[5]};
  }
`,Fn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},In=class extends y{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display=`none`,null;let{name:e,app_store:n,play_store:r,chrome_store:i,homepage:a}=this.wallet,o=t.isMobile(),s=t.isIos(),c=t.isAndroid(),l=[n,r,a,i].filter(Boolean).length>1,d=S.getTruncateString({string:e,charsStart:12,charsEnd:0,truncate:`end`});return l&&!o?b`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${()=>u.push(`Downloads`,{wallet:this.wallet})}
        ></wui-cta-button>
      `:!l&&a?b`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:n&&s?b`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:r&&c?b`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display=`none`,null)}onAppStore(){this.wallet?.app_store&&t.openHref(this.wallet.app_store,`_blank`)}onPlayStore(){this.wallet?.play_store&&t.openHref(this.wallet.play_store,`_blank`)}onHomePage(){this.wallet?.homepage&&t.openHref(this.wallet.homepage,`_blank`)}};In.styles=[Pn],Fn([O({type:Object})],In.prototype,`wallet`,void 0),In=Fn([T(`w3m-mobile-download-links`)],In);var Ln=w`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-wallet-image {
    width: 56px;
    height: 56px;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e[1]} * -1);
    bottom: calc(${({spacing:e})=>e[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: ${({durations:e})=>e.lg};
    transition-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e[4]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e[`ease-out-power-2`]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  w3m-mobile-download-links {
    padding: 0px;
    width: 100%;
  }
`,Rn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$=class extends y{constructor(){super(),this.wallet=u.state.data?.wallet,this.connector=u.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon=`refresh`,this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=c.getConnectorImage(this.connector)??c.getWalletImage(this.wallet),this.name=this.wallet?.name??this.connector?.name??`Wallet`,this.isRetrying=!1,this.uri=m.state.wcUri,this.error=m.state.wcError,this.ready=!1,this.showRetry=!1,this.label=void 0,this.secondaryBtnLabel=`Try again`,this.secondaryLabel=`Accept connection request in the wallet`,this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(m.subscribeKey(`wcUri`,e=>{this.uri=e,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),m.subscribeKey(`wcError`,e=>this.error=e)),(t.isTelegram()||t.isSafari())&&t.isIos()&&m.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),m.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();let e=this.error?`Connection can be declined if a previous request is still active`:this.secondaryLabel,t=``;return this.label?t=this.label:(t=`Continue in ${this.name}`,this.error&&(t=`Connection declined`)),b`
      <wui-flex
        data-error=${k(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${[`10`,`5`,`5`,`5`]}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${k(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="6"> <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${[`2`,`0`,`0`,`0`]}
        >
          <wui-text align="center" variant="lg-medium" color=${this.error?`error`:`primary`}>
            ${t}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">${e}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?b`
                <wui-button
                  variant="neutral-secondary"
                  size="md"
                  ?disabled=${this.isRetrying||this.isLoading}
                  @click=${this.onTryAgain.bind(this)}
                  data-testid="w3m-connecting-widget-secondary-button"
                >
                  <wui-icon
                    color="inherit"
                    slot="iconLeft"
                    name=${this.secondaryBtnIcon}
                  ></wui-icon>
                  ${this.secondaryBtnLabel}
                </wui-button>
              `:null}
      </wui-flex>

      ${this.isWalletConnect?b`
              <wui-flex .padding=${[`0`,`5`,`5`,`5`]} justifyContent="center">
                <wui-link
                  @click=${this.onCopyUri}
                  variant="secondary"
                  icon="copy"
                  data-testid="wui-link-copy"
                >
                  Copy link
                </wui-link>
              </wui-flex>
            `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links></wui-flex>
      </wui-flex>
    `}onShowRetry(){this.error&&!this.showRetry&&(this.showRetry=!0,(this.shadowRoot?.querySelector(`wui-button`))?.animate([{opacity:0},{opacity:1}],{fill:`forwards`,easing:`ease`}))}onTryAgain(){m.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){let e=ee.state.themeVariables[`--w3m-border-radius-master`];return b`<wui-loading-thumbnail radius=${(e?parseInt(e.replace(`px`,``),10):4)*9}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(t.copyToClopboard(this.uri),r.showSuccess(`Link copied`))}catch{r.showError(`Failed to copy`)}}};$.styles=Ln,Rn([A()],$.prototype,`isRetrying`,void 0),Rn([A()],$.prototype,`uri`,void 0),Rn([A()],$.prototype,`error`,void 0),Rn([A()],$.prototype,`ready`,void 0),Rn([A()],$.prototype,`showRetry`,void 0),Rn([A()],$.prototype,`label`,void 0),Rn([A()],$.prototype,`secondaryBtnLabel`,void 0),Rn([A()],$.prototype,`secondaryLabel`,void 0),Rn([A()],$.prototype,`isLoading`,void 0),Rn([O({type:Boolean})],$.prototype,`isMobile`,void 0),Rn([O()],$.prototype,`onRetry`,void 0);var zn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Bn=class extends ${constructor(){if(super(),this.externalViewUnsubscribe=[],this.connectionsByNamespace=m.getConnections(this.connector?.chain),this.hasMultipleConnections=this.connectionsByNamespace.length>0,this.remoteFeatures=l.state.remoteFeatures,this.currentActiveConnectorId=p.state.activeConnectorIds[this.connector?.chain],!this.connector)throw Error(`w3m-connecting-view: No connector provided`);let e=this.connector?.chain;this.isAlreadyConnected(this.connector)&&(this.secondaryBtnLabel=void 0,this.label=`This account is already linked, change your account in ${this.connector.name}`,this.secondaryLabel=`To link a new account, open ${this.connector.name} and switch to the account you want to link`),f.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.connector.name??`Unknown`,platform:`browser`,displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:u.state.view}}),this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),this.isWalletConnect=!1,this.externalViewUnsubscribe.push(p.subscribeKey(`activeConnectorIds`,t=>{let n=t[e],i=this.remoteFeatures?.multiWallet,{redirectView:a}=u.state.data??{};n!==this.currentActiveConnectorId&&(this.hasMultipleConnections&&i?(u.replace(`ProfileWallets`),r.showSuccess(`New Wallet Added`)):a?u.replace(a):v.close())}),m.subscribeKey(`connections`,this.onConnectionsChange.bind(this)))}disconnectedCallback(){this.externalViewUnsubscribe.forEach(e=>e())}async onConnectProxy(){try{if(this.error=!1,this.connector){if(this.isAlreadyConnected(this.connector))return;(!(this.connector.id===_.CONNECTOR_ID.COINBASE_SDK||this.connector.id===_.CONNECTOR_ID.BASE_ACCOUNT)||!this.error)&&await m.connectExternal(this.connector,this.connector.chain)}}catch(e){e instanceof o&&e.originalName===ae.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?f.sendEvent({type:`track`,event:`USER_REJECTED`,properties:{message:e.message}}):f.sendEvent({type:`track`,event:`CONNECT_ERROR`,properties:{message:e?.message??`Unknown`}}),this.error=!0}}onConnectionsChange(e){if(this.connector?.chain&&e.get(this.connector.chain)&&this.isAlreadyConnected(this.connector)){let t=e.get(this.connector.chain)??[],n=this.remoteFeatures?.multiWallet;if(t.length===0)u.replace(`Connect`);else{let e=ne.getConnectionsByConnectorId(this.connectionsByNamespace,this.connector.id).flatMap(e=>e.accounts),i=ne.getConnectionsByConnectorId(t,this.connector.id).flatMap(e=>e.accounts);i.length===0?this.hasMultipleConnections&&n?(u.replace(`ProfileWallets`),r.showSuccess(`Wallet deleted`)):v.close():!e.every(e=>i.some(t=>x.isLowerCaseMatch(e.address,t.address)))&&n&&u.replace(`ProfileWallets`)}}}isAlreadyConnected(e){return!!e&&this.connectionsByNamespace.some(t=>x.isLowerCaseMatch(t.connectorId,e.id))}};Bn=zn([T(`w3m-connecting-external-view`)],Bn);var Vn=D`
  wui-flex,
  wui-list-wallet {
    width: 100%;
  }
`,Hn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Un=class extends y{constructor(){super(),this.unsubscribe=[],this.activeConnector=p.state.activeConnector,this.unsubscribe.push(p.subscribeKey(`activeConnector`,e=>this.activeConnector=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return b`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`3`,`5`,`5`,`5`]}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image
            size="lg"
            imageSrc=${k(c.getConnectorImage(this.activeConnector))}
          ></wui-wallet-image>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${[`0`,`3`,`0`,`3`]}
        >
          <wui-text variant="lg-medium" color="primary">
            Select Chain for ${this.activeConnector?.name}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary"
            >Select which chain to connect to your multi chain wallet</wui-text
          >
        </wui-flex>
        <wui-flex
          flexGrow="1"
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${[`2`,`0`,`2`,`0`]}
        >
          ${this.networksTemplate()}
        </wui-flex>
      </wui-flex>
    `}networksTemplate(){return this.activeConnector?.connectors?.map((e,t)=>e.name?b`
            <w3m-list-wallet
              displayIndex=${t}
              imageSrc=${k(c.getChainImage(e.chain))}
              name=${_.CHAIN_NAME_MAP[e.chain]}
              @click=${()=>this.onConnector(e)}
              size="sm"
              data-testid="wui-list-chain-${e.chain}"
              rdnsId=${e.explorerWallet?.rdns}
            ></w3m-list-wallet>
          `:null)}onConnector(e){let n=this.activeConnector?.connectors?.find(t=>t.chain===e.chain),i=u.state.data?.redirectView;if(!n){r.showError(`Failed to find connector`);return}n.id===`walletConnect`?t.isMobile()?u.push(`AllWallets`):u.push(`ConnectingWalletConnect`,{redirectView:i}):u.push(`ConnectingExternal`,{connector:n,redirectView:i,wallet:this.activeConnector?.explorerWallet})}};Un.styles=Vn,Hn([A()],Un.prototype,`activeConnector`,void 0),Un=Hn([T(`w3m-connecting-multi-chain-view`)],Un);var Wn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Gn=class extends y{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){return b`
      <wui-flex justifyContent="center" .padding=${[`0`,`0`,`4`,`0`]}>
        <wui-tabs .tabs=${this.generateTabs()} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){let e=this.platforms.map(e=>e===`browser`?{label:`Browser`,icon:`extension`,platform:`browser`}:e===`mobile`?{label:`Mobile`,icon:`mobile`,platform:`mobile`}:e===`qrcode`?{label:`Mobile`,icon:`mobile`,platform:`qrcode`}:e===`web`?{label:`Webapp`,icon:`browser`,platform:`web`}:e===`desktop`?{label:`Desktop`,icon:`desktop`,platform:`desktop`}:{label:`Browser`,icon:`extension`,platform:`unsupported`});return this.platformTabs=e.map(({platform:e})=>e),e}onTabChange(e){let t=this.platformTabs[e];t&&this.onSelectPlatfrom?.(t)}};Wn([O({type:Array})],Gn.prototype,`platforms`,void 0),Wn([O()],Gn.prototype,`onSelectPlatfrom`,void 0),Gn=Wn([T(`w3m-connecting-header`)],Gn);var Kn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},qn=class extends ${constructor(){if(super(),!this.wallet)throw Error(`w3m-connecting-wc-browser: No wallet provided`);this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),f.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`browser`,displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:u.state.view}})}async onConnectProxy(){try{this.error=!1;let{connectors:e}=p.state,t=e.find(e=>e.type===`ANNOUNCED`&&e.info?.rdns===this.wallet?.rdns||e.type===`INJECTED`||e.name===this.wallet?.name);if(t)await m.connectExternal(t,t.chain);else throw Error(`w3m-connecting-wc-browser: No connector found`);v.close()}catch(e){e instanceof o&&e.originalName===ae.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?f.sendEvent({type:`track`,event:`USER_REJECTED`,properties:{message:e.message}}):f.sendEvent({type:`track`,event:`CONNECT_ERROR`,properties:{message:e?.message??`Unknown`}}),this.error=!0}}};qn=Kn([T(`w3m-connecting-wc-browser`)],qn);var Jn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Yn=class extends ${constructor(){if(super(),!this.wallet)throw Error(`w3m-connecting-wc-desktop: No wallet provided`);this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),f.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`desktop`,displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:u.state.view}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;let{desktop_link:e,name:n}=this.wallet,{redirect:r,href:i}=t.formatNativeUrl(e,this.uri);m.setWcLinking({name:n,href:i}),m.setRecentWallet(this.wallet),t.openHref(r,`_blank`)}catch{this.error=!0}}};Yn=Jn([T(`w3m-connecting-wc-desktop`)],Yn);var Xn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Zn=class extends ${constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=l.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{ne.onConnectMobile(this.wallet)},!this.wallet)throw Error(`w3m-connecting-wc-mobile: No wallet provided`);this.secondaryBtnLabel=`Open`,this.secondaryLabel=a.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon=`externalLink`,this.onHandleURI(),this.unsubscribe.push(m.subscribeKey(`wcUri`,()=>{this.onHandleURI()})),f.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`mobile`,displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:u.state.view}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){m.setWcError(!1),this.onConnect?.()}};Xn([A()],Zn.prototype,`redirectDeeplink`,void 0),Xn([A()],Zn.prototype,`redirectUniversalLink`,void 0),Xn([A()],Zn.prototype,`target`,void 0),Xn([A()],Zn.prototype,`preferUniversalLinks`,void 0),Xn([A()],Zn.prototype,`isLoading`,void 0),Zn=Xn([T(`w3m-connecting-wc-mobile`)],Zn);var Qn=w`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`,$n=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},er=class extends ${constructor(){super(),this.basic=!1}firstUpdated(){this.basic||f.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet?.name??`WalletConnect`,platform:`qrcode`,displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:u.state.view}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(e=>e())}render(){return this.onRenderProxy(),b`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`0`,`5`,`5`,`5`]}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0)}qrCodeTemplate(){if(!this.uri||!this.ready)return null;let e=this.wallet?this.wallet.name:void 0;m.setWcLinking(void 0),m.setRecentWallet(this.wallet);let t=ee.state.themeVariables[`--apkt-qr-color`]??ee.state.themeVariables[`--w3m-qr-color`];return b` <wui-qr-code
      theme=${ee.state.themeMode}
      uri=${this.uri}
      imageSrc=${k(c.getWalletImage(this.wallet))}
      color=${k(t)}
      alt=${k(e)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){return b`<wui-button
      .disabled=${!this.uri||!this.ready}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`}};er.styles=Qn,$n([O({type:Boolean})],er.prototype,`basic`,void 0),er=$n([T(`w3m-connecting-wc-qrcode`)],er);var tr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},nr=class extends y{constructor(){if(super(),this.wallet=u.state.data?.wallet,!this.wallet)throw Error(`w3m-connecting-wc-unsupported: No wallet provided`);f.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`browser`,displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:u.state.view}})}render(){return b`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`10`,`5`,`5`,`5`]}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${k(c.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};nr=tr([T(`w3m-connecting-wc-unsupported`)],nr);var rr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ir=class extends ${constructor(){if(super(),this.isLoading=!0,!this.wallet)throw Error(`w3m-connecting-wc-web: No wallet provided`);this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel=`Open`,this.secondaryLabel=a.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon=`externalLink`,this.updateLoadingState(),this.unsubscribe.push(m.subscribeKey(`wcUri`,()=>{this.updateLoadingState()})),f.sendEvent({type:`track`,event:`SELECT_WALLET`,properties:{name:this.wallet.name,platform:`web`,displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:u.state.view}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;let{webapp_link:e,name:n}=this.wallet,{redirect:r,href:i}=t.formatUniversalUrl(e,this.uri);m.setWcLinking({name:n,href:i}),m.setRecentWallet(this.wallet),t.openHref(r,`_blank`)}catch{this.error=!0}}};rr([A()],ir.prototype,`isLoading`,void 0),ir=rr([T(`w3m-connecting-wc-web`)],ir);var ar=w`
  :host([data-mobile-fullscreen='true']) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :host([data-mobile-fullscreen='true']) wui-ux-by-reown {
    margin-top: auto;
  }
`,or=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},sr=class extends y{constructor(){super(),this.wallet=u.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!l.state.siwx,this.remoteFeatures=l.state.remoteFeatures,this.displayBranding=!0,this.basic=!1,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(l.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return l.state.enableMobileFullScreen&&this.setAttribute(`data-mobile-fullscreen`,`true`),b`
      ${this.headerTemplate()}
      <div class="platform-container">${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return!this.remoteFeatures?.reownBranding||!this.displayBranding?null:b`<wui-ux-by-reown></wui-ux-by-reown>`}async initializeConnection(e=!1){if(!(this.platform===`browser`||l.state.manualWCControl&&!e))try{let{wcPairingExpiry:n,status:i}=m.state,{redirectView:a}=u.state.data??{};if(e||l.state.enableEmbedded||t.isPairingExpired(n)||i===`connecting`){let e=m.getConnections(h.state.activeChain),t=this.remoteFeatures?.multiWallet,n=e.length>0;await m.connectWalletConnect({cache:`never`}),this.isSiwxEnabled||(n&&t?(u.replace(`ProfileWallets`),r.showSuccess(`New Wallet Added`)):a?u.replace(a):v.close())}}catch(e){if(e instanceof Error&&e.message.includes(`An error occurred when attempting to switch chain`)&&!l.state.enableNetworkSwitch&&h.state.activeChain){h.setActiveCaipNetwork(fe.getUnsupportedNetwork(`${h.state.activeChain}:${h.state.activeCaipNetwork?.id}`)),h.showUnsupportedChainUI();return}e instanceof o&&e.originalName===ae.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?f.sendEvent({type:`track`,event:`USER_REJECTED`,properties:{message:e.message}}):f.sendEvent({type:`track`,event:`CONNECT_ERROR`,properties:{message:e?.message??`Unknown`}}),m.setWcError(!0),r.showError(e.message??`Connection error`),m.resetWcConnection(),u.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push(`qrcode`),this.platform=`qrcode`;return}if(this.platform)return;let{mobile_link:e,desktop_link:n,webapp_link:r,injected:i,rdns:a}=this.wallet,o=i?.map(({injected_id:e})=>e).filter(Boolean),s=[...a?[a]:o??[]],c=l.state.isUniversalProvider?!1:s.length,u=e,d=r,ee=m.checkInstalled(s),te=c&&ee,f=n&&!t.isMobile();te&&!h.state.noAdapters&&this.platforms.push(`browser`),u&&this.platforms.push(t.isMobile()?`mobile`:`qrcode`),d&&this.platforms.push(`web`),f&&this.platforms.push(`desktop`);let ne=ie.isCustomDeeplinkWallet(this.wallet.id,h.state.activeChain);!te&&c&&!h.state.noAdapters&&!ne&&this.platforms.push(`unsupported`),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case`browser`:return b`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case`web`:return b`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case`desktop`:return b`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case`mobile`:return b`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case`qrcode`:return b`<w3m-connecting-wc-qrcode ?basic=${this.basic}></w3m-connecting-wc-qrcode>`;default:return b`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?b`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(e){let t=this.shadowRoot?.querySelector(`div`);t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:`forwards`,easing:`ease`}).finished,this.platform=e,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:`forwards`,easing:`ease`}))}};sr.styles=ar,or([A()],sr.prototype,`platform`,void 0),or([A()],sr.prototype,`platforms`,void 0),or([A()],sr.prototype,`isSiwxEnabled`,void 0),or([A()],sr.prototype,`remoteFeatures`,void 0),or([O({type:Boolean})],sr.prototype,`displayBranding`,void 0),or([O({type:Boolean})],sr.prototype,`basic`,void 0),sr=or([T(`w3m-connecting-wc-view`)],sr);var cr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},lr=class extends y{constructor(){super(),this.unsubscribe=[],this.isMobile=t.isMobile(),this.remoteFeatures=l.state.remoteFeatures,this.unsubscribe.push(l.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(this.isMobile){let{featured:e,recommended:t}=g.state,{customWallets:n}=l.state,r=d.getRecentWallets();return b`<wui-flex flexDirection="column" gap="2" .margin=${[`1`,`3`,`3`,`3`]}>
        ${e.length||t.length||n?.length||r.length?b`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return b`<wui-flex flexDirection="column" .padding=${[`0`,`0`,`4`,`0`]}>
        <w3m-connecting-wc-view ?basic=${!0} .displayBranding=${!1}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${[`0`,`3`,`0`,`3`]}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?b` <wui-flex flexDirection="column" .padding=${[`1`,`0`,`1`,`0`]}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`:null}};cr([A()],lr.prototype,`isMobile`,void 0),cr([A()],lr.prototype,`remoteFeatures`,void 0),lr=cr([T(`w3m-connecting-wc-basic-view`)],lr);var ur=D`
  .continue-button-container {
    width: 100%;
  }
`,dr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},fr=class extends y{constructor(){super(...arguments),this.loading=!1}render(){return b`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="6"
        .padding=${[`0`,`0`,`4`,`0`]}
      >
        ${this.onboardingTemplate()} ${this.buttonsTemplate()}
        <wui-link
          @click=${()=>{t.openHref(me.URLS.FAQ,`_blank`)}}
        >
          Learn more about names
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-link>
      </wui-flex>
    `}onboardingTemplate(){return b` <wui-flex
      flexDirection="column"
      gap="6"
      alignItems="center"
      .padding=${[`0`,`6`,`0`,`6`]}
    >
      <wui-flex gap="3" alignItems="center" justifyContent="center">
        <wui-icon-box icon="id" size="xl" iconSize="xxl" color="default"></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="3">
        <wui-text align="center" variant="lg-medium" color="primary">
          Choose your account name
        </wui-text>
        <wui-text align="center" variant="md-regular" color="primary">
          Finally say goodbye to 0x addresses, name your account to make it easier to exchange
          assets
        </wui-text>
      </wui-flex>
    </wui-flex>`}buttonsTemplate(){return b`<wui-flex
      .padding=${[`0`,`8`,`0`,`8`]}
      gap="3"
      class="continue-button-container"
    >
      <wui-button
        fullWidth
        .loading=${this.loading}
        size="lg"
        borderRadius="xs"
        @click=${this.handleContinue.bind(this)}
        >Choose name
      </wui-button>
    </wui-flex>`}handleContinue(){u.push(`RegisterAccountName`),f.sendEvent({type:`track`,event:`OPEN_ENS_FLOW`,properties:{isSmartAccount:re(h.state.activeChain)===s.ACCOUNT_TYPES.SMART_ACCOUNT}})}};fr.styles=ur,dr([A()],fr.prototype,`loading`,void 0),fr=dr([T(`w3m-choose-account-name-view`)],fr);var pr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},mr=class extends y{constructor(){super(...arguments),this.wallet=u.state.data?.wallet}render(){if(!this.wallet)throw Error(`w3m-downloads-view`);return b`
      <wui-flex gap="2" flexDirection="column" .padding=${[`3`,`3`,`4`,`3`]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?b`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?b`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?b`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?b`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `:null}openStore(e){e.href&&this.wallet&&(f.sendEvent({type:`track`,event:`GET_WALLET`,properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.wallet.id,type:e.type}}),t.openHref(e.href,`_blank`))}onChromeStore(){this.wallet?.chrome_store&&this.openStore({href:this.wallet.chrome_store,type:`chrome_store`})}onAppStore(){this.wallet?.app_store&&this.openStore({href:this.wallet.app_store,type:`app_store`})}onPlayStore(){this.wallet?.play_store&&this.openStore({href:this.wallet.play_store,type:`play_store`})}onHomePage(){this.wallet?.homepage&&this.openStore({href:this.wallet.homepage,type:`homepage`})}};mr=pr([T(`w3m-downloads-view`)],mr);var hr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},gr=`https://walletguide.walletconnect.network`,_r=class extends y{render(){return b`
      <wui-flex flexDirection="column" .padding=${[`0`,`3`,`3`,`3`]} gap="2">
        ${this.recommendedWalletsTemplate()}
        <w3m-list-wallet
          name="Explore all"
          showAllWallets
          walletIcon="allWallets"
          icon="externalLink"
          size="sm"
          @click=${()=>{t.openHref(`https://walletguide.walletconnect.network/`,`_blank`)}}
        ></w3m-list-wallet>
      </wui-flex>
    `}recommendedWalletsTemplate(){let{recommended:e,featured:t}=g.state,{customWallets:n}=l.state;return[...t,...n??[],...e].slice(0,4).map((e,t)=>b`
        <w3m-list-wallet
          displayIndex=${t}
          name=${e.name??`Unknown`}
          tagVariant="accent"
          size="sm"
          imageSrc=${k(c.getWalletImage(e))}
          @click=${()=>{this.onWalletClick(e)}}
        ></w3m-list-wallet>
      `)}onWalletClick(e){f.sendEvent({type:`track`,event:`GET_WALLET`,properties:{name:e.name,walletRank:void 0,explorerId:e.id,type:`homepage`}}),t.openHref(e.homepage??gr,`_blank`)}};_r=hr([T(`w3m-get-wallet-view`)],_r);var vr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},yr=class extends y{constructor(){super(...arguments),this.data=[]}render(){return b`
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        ${this.data.map(e=>b`
            <wui-flex flexDirection="column" alignItems="center" gap="5">
              <wui-flex flexDirection="row" justifyContent="center" gap="1">
                ${e.images.map(e=>b`<wui-visual size="sm" name=${e}></wui-visual>`)}
              </wui-flex>
            </wui-flex>
            <wui-flex flexDirection="column" alignItems="center" gap="1">
              <wui-text variant="md-regular" color="primary" align="center">${e.title}</wui-text>
              <wui-text variant="sm-regular" color="secondary" align="center"
                >${e.text}</wui-text
              >
            </wui-flex>
          `)}
      </wui-flex>
    `}};vr([O({type:Array})],yr.prototype,`data`,void 0),yr=vr([T(`w3m-help-widget`)],yr);var br=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},xr=[{images:[`login`,`profile`,`lock`],title:`One login for all of web3`,text:`Log in to any app by connecting your wallet. Say goodbye to countless passwords!`},{images:[`defi`,`nft`,`eth`],title:`A home for your digital assets`,text:`A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs.`},{images:[`browser`,`noun`,`dao`],title:`Your gateway to a new web`,text:`With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more.`}],Sr=class extends y{render(){return b`
      <wui-flex
        flexDirection="column"
        .padding=${[`6`,`5`,`5`,`5`]}
        alignItems="center"
        gap="5"
      >
        <w3m-help-widget .data=${xr}></w3m-help-widget>
        <wui-button variant="accent-primary" size="md" @click=${this.onGetWallet.bind(this)}>
          <wui-icon color="inherit" slot="iconLeft" name="wallet"></wui-icon>
          Get a wallet
        </wui-button>
      </wui-flex>
    `}onGetWallet(){f.sendEvent({type:`track`,event:`CLICK_GET_WALLET_HELP`}),u.push(`GetWallet`)}};Sr=br([T(`w3m-what-is-a-wallet-view`)],Sr);var Cr=w`
  wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
  }
  wui-flex::-webkit-scrollbar {
    display: none;
  }
  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`,wr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Tr=class extends y{constructor(){super(),this.unsubscribe=[],this.checked=ge.state.isLegalCheckboxChecked,this.unsubscribe.push(ge.subscribeKey(`isLegalCheckboxChecked`,e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.state,n=l.state.features?.legalCheckbox,r=!!(e||t)&&!!n,i=r&&!this.checked,a=i?-1:void 0;return b`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${r?[`0`,`3`,`3`,`3`]:`3`}
        gap="2"
        class=${k(i?`disabled`:void 0)}
      >
        <w3m-wallet-login-list tabIdx=${k(a)}></w3m-wallet-login-list>
      </wui-flex>
    `}};Tr.styles=Cr,wr([A()],Tr.prototype,`checked`,void 0),Tr=wr([T(`w3m-connect-wallets-view`)],Tr);var Er=w`
  :host {
    display: block;
    width: 120px;
    height: 120px;
  }

  svg {
    width: 120px;
    height: 120px;
    fill: none;
    stroke: transparent;
    stroke-linecap: round;
  }

  use {
    stroke: ${e=>e.colors.accent100};
    stroke-width: 2px;
    stroke-dasharray: 54, 118;
    stroke-dashoffset: 172;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`,Dr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Or=class extends y{render(){return b`
      <svg viewBox="0 0 54 59">
        <path
          id="wui-loader-path"
          d="M17.22 5.295c3.877-2.277 5.737-3.363 7.72-3.726a11.44 11.44 0 0 1 4.12 0c1.983.363 3.844 1.45 7.72 3.726l6.065 3.562c3.876 2.276 5.731 3.372 7.032 4.938a11.896 11.896 0 0 1 2.06 3.63c.683 1.928.688 4.11.688 8.663v7.124c0 4.553-.005 6.735-.688 8.664a11.896 11.896 0 0 1-2.06 3.63c-1.3 1.565-3.156 2.66-7.032 4.937l-6.065 3.563c-3.877 2.276-5.737 3.362-7.72 3.725a11.46 11.46 0 0 1-4.12 0c-1.983-.363-3.844-1.449-7.72-3.726l-6.065-3.562c-3.876-2.276-5.731-3.372-7.032-4.938a11.885 11.885 0 0 1-2.06-3.63c-.682-1.928-.688-4.11-.688-8.663v-7.124c0-4.553.006-6.735.688-8.664a11.885 11.885 0 0 1 2.06-3.63c1.3-1.565 3.156-2.66 7.032-4.937l6.065-3.562Z"
        />
        <use xlink:href="#wui-loader-path"></use>
      </svg>
    `}};Or.styles=[E,Er],Or=Dr([T(`wui-loading-hexagon`)],Or);var kr=D`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: 4px;
    bottom: 0;
    opacity: 0;
    transform: scale(0.5);
    z-index: 1;
  }

  wui-button {
    display: none;
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  wui-button[data-retry='true'] {
    display: block;
    opacity: 1;
  }
`,Ar=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},jr=class extends y{constructor(){super(),this.network=u.state.data?.network,this.unsubscribe=[],this.showRetry=!1,this.error=!1}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}firstUpdated(){this.onSwitchNetwork()}render(){if(!this.network)throw Error(`w3m-network-switch-view: No network provided`);this.onShowRetry();let e=this.getLabel(),t=this.getSubLabel();return b`
      <wui-flex
        data-error=${this.error}
        flexDirection="column"
        alignItems="center"
        .padding=${[`10`,`5`,`10`,`5`]}
        gap="7"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-network-image
            size="lg"
            imageSrc=${k(c.getNetworkImage(this.network))}
          ></wui-network-image>

          ${this.error?null:b`<wui-loading-hexagon></wui-loading-hexagon>`}

          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="h6-regular" color="primary">${e}</wui-text>
          <wui-text align="center" variant="md-regular" color="secondary">${t}</wui-text>
        </wui-flex>

        <wui-button
          data-retry=${this.showRetry}
          variant="accent-primary"
          size="md"
          .disabled=${!this.error}
          @click=${this.onSwitchNetwork.bind(this)}
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try again
        </wui-button>
      </wui-flex>
    `}getSubLabel(){let e=p.getConnectorId(h.state.activeChain);return p.getAuthConnector()&&e===_.CONNECTOR_ID.AUTH?``:this.error?`Switch can be declined if chain is not supported by a wallet or previous request is still active`:`Accept connection request in your wallet`}getLabel(){let e=p.getConnectorId(h.state.activeChain);return p.getAuthConnector()&&e===_.CONNECTOR_ID.AUTH?`Switching to ${this.network?.name??`Unknown`} network...`:this.error?`Switch declined`:`Approve in wallet`}onShowRetry(){this.error&&!this.showRetry&&(this.showRetry=!0,(this.shadowRoot?.querySelector(`wui-button`))?.animate([{opacity:0},{opacity:1}],{fill:`forwards`,easing:`ease`}))}async onSwitchNetwork(){try{this.error=!1,h.state.activeChain!==this.network?.chainNamespace&&h.setIsSwitchingNamespace(!0),this.network&&(await h.switchActiveNetwork(this.network),await ue.isAuthenticated()&&u.goBack())}catch{this.error=!0}}};jr.styles=kr,Ar([A()],jr.prototype,`showRetry`,void 0),Ar([A()],jr.prototype,`error`,void 0),jr=Ar([T(`w3m-network-switch-view`)],jr);var Mr=w`
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
`,Nr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Pr=class extends y{constructor(){super(...arguments),this.imageSrc=void 0,this.name=`Ethereum`,this.disabled=!1}render(){return b`
      <button ?disabled=${this.disabled} tabindex=${k(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          ${this.imageTemplate()}
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `}imageTemplate(){return this.imageSrc?b`<wui-image ?boxed=${!0} src=${this.imageSrc}></wui-image>`:b`<wui-image
      ?boxed=${!0}
      icon="networkPlaceholder"
      size="lg"
      iconColor="default"
    ></wui-image>`}};Pr.styles=[E,C,Mr],Nr([O()],Pr.prototype,`imageSrc`,void 0),Nr([O()],Pr.prototype,`name`,void 0),Nr([O()],Pr.prototype,`tabIdx`,void 0),Nr([O({type:Boolean})],Pr.prototype,`disabled`,void 0),Pr=Nr([T(`wui-list-network`)],Pr);var Fr=D`
  .container {
    max-height: 360px;
    overflow: auto;
  }

  .container::-webkit-scrollbar {
    display: none;
  }
`,Ir=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Lr=class extends y{constructor(){super(),this.unsubscribe=[],this.network=h.state.activeCaipNetwork,this.requestedCaipNetworks=h.getCaipNetworks(),this.search=``,this.onDebouncedSearch=t.debounce(e=>{this.search=e},100),this.unsubscribe.push(i.subscribeNetworkImages(()=>this.requestUpdate()),h.subscribeKey(`activeCaipNetwork`,e=>this.network=e),h.subscribe(()=>{this.requestedCaipNetworks=h.getAllRequestedCaipNetworks()}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return b`
      ${this.templateSearchInput()}
      <wui-flex
        class="container"
        .padding=${[`0`,`3`,`3`,`3`]}
        flexDirection="column"
        gap="2"
      >
        ${this.networksTemplate()}
      </wui-flex>
    `}templateSearchInput(){return b`
      <wui-flex gap="2" .padding=${[`0`,`3`,`3`,`3`]}>
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="md"
          placeholder="Search network"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}networksTemplate(){let e=h.getAllApprovedCaipNetworkIds(),n=t.sortRequestedNetworks(e,this.requestedCaipNetworks);return this.search?this.filteredNetworks=n?.filter(e=>e?.name?.toLowerCase().includes(this.search.toLowerCase())):this.filteredNetworks=n,this.filteredNetworks?.map(e=>b`
        <wui-list-network
          .selected=${this.network?.id===e.id}
          imageSrc=${k(c.getNetworkImage(e))}
          type="network"
          name=${e.name??e.id}
          @click=${()=>this.onSwitchNetwork(e)}
          .disabled=${h.isCaipNetworkDisabled(e)}
          data-testid=${`w3m-network-switch-${e.name??e.id}`}
        ></wui-list-network>
      `)}onSwitchNetwork(e){se.onSwitchNetwork({network:e})}};Lr.styles=Fr,Ir([A()],Lr.prototype,`network`,void 0),Ir([A()],Lr.prototype,`requestedCaipNetworks`,void 0),Ir([A()],Lr.prototype,`filteredNetworks`,void 0),Ir([A()],Lr.prototype,`search`,void 0),Lr=Ir([T(`w3m-networks-view`)],Lr);var Rr=w`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-visual {
    border-radius: calc(
      ${({borderRadius:e})=>e[1]} * 9 - ${({borderRadius:e})=>e[3]}
    );
    position: relative;
    overflow: hidden;
  }

  wui-visual::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(
      ${({borderRadius:e})=>e[1]} * 9 - ${({borderRadius:e})=>e[3]}
    );
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e[1]} * -1);
    bottom: calc(${({spacing:e})=>e[1]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e[4]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e[`ease-out-power-2`]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  wui-link {
    padding: ${({spacing:e})=>e[`01`]} ${({spacing:e})=>e[2]};
  }

  .capitalize {
    text-transform: capitalize;
  }
`,zr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Br={eip155:`eth`,solana:`solana`,bip122:`bitcoin`,polkadot:void 0},Vr=class extends y{constructor(){super(...arguments),this.unsubscribe=[],this.switchToChain=u.state.data?.switchToChain,this.caipNetwork=u.state.data?.network,this.activeChain=h.state.activeChain}firstUpdated(){this.unsubscribe.push(h.subscribeKey(`activeChain`,e=>this.activeChain=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.switchToChain?_.CHAIN_NAME_MAP[this.switchToChain]:`supported`;if(!this.switchToChain)return null;let t=_.CHAIN_NAME_MAP[this.switchToChain];return b`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`4`,`2`,`2`,`2`]}
        gap="4"
      >
        <wui-flex justifyContent="center" flexDirection="column" alignItems="center" gap="2">
          <wui-visual
            size="md"
            name=${k(Br[this.switchToChain])}
          ></wui-visual>
          <wui-flex gap="2" flexDirection="column" alignItems="center">
            <wui-text
              data-testid=${`w3m-switch-active-chain-to-${t}`}
              variant="lg-regular"
              color="primary"
              align="center"
              >Switch to <span class="capitalize">${t}</span></wui-text
            >
            <wui-text variant="md-regular" color="secondary" align="center">
              Connected wallet doesn't support connecting to ${e} chain. You
              need to connect with a different wallet.
            </wui-text>
          </wui-flex>
          <wui-button
            data-testid="w3m-switch-active-chain-button"
            size="md"
            @click=${this.switchActiveChain.bind(this)}
            >Switch</wui-button
          >
        </wui-flex>
      </wui-flex>
    `}async switchActiveChain(){this.switchToChain&&(h.setIsSwitchingNamespace(!0),p.setFilterByNamespace(this.switchToChain),this.caipNetwork?await h.switchActiveNetwork(this.caipNetwork):h.setActiveNamespace(this.switchToChain),u.reset(`Connect`))}};Vr.styles=Rr,zr([O()],Vr.prototype,`activeChain`,void 0),Vr=zr([T(`w3m-switch-active-chain-view`)],Vr);var Hr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ur=[{images:[`network`,`layers`,`system`],title:`The system’s nuts and bolts`,text:`A network is what brings the blockchain to life, as this technical infrastructure allows apps to access the ledger and smart contract services.`},{images:[`noun`,`defiAlt`,`dao`],title:`Designed for different uses`,text:`Each network is designed differently, and may therefore suit certain apps and experiences.`}],Wr=class extends y{render(){return b`
      <wui-flex
        flexDirection="column"
        .padding=${[`6`,`5`,`5`,`5`]}
        alignItems="center"
        gap="5"
      >
        <w3m-help-widget .data=${Ur}></w3m-help-widget>
        <wui-button
          variant="accent-primary"
          size="md"
          @click=${()=>{t.openHref(`https://ethereum.org/en/developers/docs/networks/`,`_blank`)}}
        >
          Learn more
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};Wr=Hr([T(`w3m-what-is-a-network-view`)],Wr);var Gr=D`
  :host > wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }
`,Kr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},qr=class extends y{constructor(){super(),this.swapUnsupportedChain=u.state.data?.swapUnsupportedChain,this.unsubscribe=[],this.disconnecting=!1,this.remoteFeatures=l.state.remoteFeatures,this.unsubscribe.push(i.subscribeNetworkImages(()=>this.requestUpdate()),l.subscribeKey(`remoteFeatures`,e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return b`
      <wui-flex class="container" flexDirection="column" gap="0">
        <wui-flex
          class="container"
          flexDirection="column"
          .padding=${[`3`,`5`,`2`,`5`]}
          alignItems="center"
          gap="5"
        >
          ${this.descriptionTemplate()}
        </wui-flex>

        <wui-flex flexDirection="column" padding="3" gap="2"> ${this.networksTemplate()} </wui-flex>

        <wui-separator text="or"></wui-separator>
        <wui-flex flexDirection="column" padding="3" gap="2">
          <wui-list-item
            variant="icon"
            iconVariant="overlay"
            icon="signOut"
            ?chevron=${!1}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="md-medium" color="secondary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `}descriptionTemplate(){return this.swapUnsupportedChain?b`
        <wui-text variant="sm-regular" color="secondary" align="center">
          The swap feature doesn’t support your current network. Switch to an available option to
          continue.
        </wui-text>
      `:b`
      <wui-text variant="sm-regular" color="secondary" align="center">
        This app doesn’t support your current network. Switch to an available option to continue.
      </wui-text>
    `}networksTemplate(){let e=h.getAllRequestedCaipNetworks(),n=h.getAllApprovedCaipNetworkIds(),r=t.sortRequestedNetworks(n,e);return(this.swapUnsupportedChain?r.filter(e=>a.SWAP_SUPPORTED_NETWORKS.includes(e.caipNetworkId)):r).map(e=>b`
        <wui-list-network
          imageSrc=${k(c.getNetworkImage(e))}
          name=${e.name??`Unknown`}
          @click=${()=>this.onSwitchNetwork(e)}
        >
        </wui-list-network>
      `)}async onDisconnect(){try{this.disconnecting=!0;let e=h.state.activeChain,t=m.getConnections(e).length>0,n=e&&p.state.activeConnectorIds[e],i=this.remoteFeatures?.multiWallet;await m.disconnect(i?{id:n,namespace:e}:{}),t&&i&&(u.push(`ProfileWallets`),r.showSuccess(`Wallet deleted`))}catch{f.sendEvent({type:`track`,event:`DISCONNECT_ERROR`,properties:{message:`Failed to disconnect`}}),r.showError(`Failed to disconnect`)}finally{this.disconnecting=!1}}async onSwitchNetwork(e){let t=h.getActiveCaipAddress(),n=h.getAllApprovedCaipNetworkIds();h.getNetworkProp(`supportsAllNetworks`,e.chainNamespace);let r=u.state.data;t?n?.includes(e.caipNetworkId)?await h.switchActiveNetwork(e):u.push(`SwitchNetwork`,{...r,network:e}):t||(h.setActiveCaipNetwork(e),u.push(`Connect`))}};qr.styles=Gr,Kr([A()],qr.prototype,`disconnecting`,void 0),Kr([A()],qr.prototype,`remoteFeatures`,void 0),qr=Kr([T(`w3m-unsupported-chain-view`)],qr);var Jr=w`
  wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
  }

  /* -- Types --------------------------------------------------------- */
  wui-flex[data-type='info'] {
    color: ${({tokens:e})=>e.theme.textSecondary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-flex[data-type='success'] {
    color: ${({tokens:e})=>e.core.textSuccess};
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] {
    color: ${({tokens:e})=>e.core.textError};
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  wui-flex[data-type='warning'] {
    color: ${({tokens:e})=>e.core.textWarning};
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  wui-flex[data-type='info'] wui-icon-box {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-flex[data-type='success'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  wui-flex[data-type='warning'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  wui-text {
    flex: 1;
  }
`,Yr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Xr=class extends y{constructor(){super(...arguments),this.icon=`externalLink`,this.text=``,this.type=`info`}render(){return b`
      <wui-flex alignItems="center" data-type=${this.type}>
        <wui-icon-box size="sm" color="inherit" icon=${this.icon}></wui-icon-box>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
      </wui-flex>
    `}};Xr.styles=[E,C,Jr],Yr([O()],Xr.prototype,`icon`,void 0),Yr([O()],Xr.prototype,`text`,void 0),Yr([O()],Xr.prototype,`type`,void 0),Xr=Yr([T(`wui-banner`)],Xr);var Zr=D`
  :host > wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }
`,Qr=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$r=class extends y{constructor(){super(),this.unsubscribe=[]}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return b` <wui-flex flexDirection="column" .padding=${[`2`,`3`,`3`,`3`]} gap="2">
      <wui-banner
        icon="warningCircle"
        text="You can only receive assets on these networks"
      ></wui-banner>
      ${this.networkTemplate()}
    </wui-flex>`}networkTemplate(){let e=h.getAllRequestedCaipNetworks(),n=h.getAllApprovedCaipNetworkIds(),r=h.state.activeCaipNetwork,i=h.checkIfSmartAccountEnabled(),a=t.sortRequestedNetworks(n,e);if(i&&re(r?.chainNamespace)===s.ACCOUNT_TYPES.SMART_ACCOUNT){if(!r)return null;a=[r]}return a.filter(e=>e.chainNamespace===r?.chainNamespace).map(e=>b`
        <wui-list-network
          imageSrc=${k(c.getNetworkImage(e))}
          name=${e.name??`Unknown`}
          ?transparent=${!0}
        >
        </wui-list-network>
      `)}};$r.styles=Zr,$r=Qr([T(`w3m-wallet-compatible-networks-view`)],$r);var ei=w`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 56px;
    box-shadow: 0 0 0 8px ${({tokens:e})=>e.theme.borderPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    overflow: hidden;
  }

  :host([data-border-radius-full='true']) {
    border-radius: 50px;
  }

  wui-icon {
    width: 32px;
    height: 32px;
  }
`,ti=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ni=class extends y{render(){return this.dataset.borderRadiusFull=this.borderRadiusFull?`true`:`false`,b`${this.templateVisual()}`}templateVisual(){return this.imageSrc?b`<wui-image src=${this.imageSrc} alt=${this.alt??``}></wui-image>`:b`<wui-icon
      data-parent-size="md"
      size="inherit"
      color="inherit"
      name="wallet"
    ></wui-icon>`}};ni.styles=[E,ei],ti([O()],ni.prototype,`imageSrc`,void 0),ti([O()],ni.prototype,`alt`,void 0),ti([O({type:Boolean})],ni.prototype,`borderRadiusFull`,void 0),ni=ti([T(`wui-visual-thumbnail`)],ni);var ri=w`
  :host {
    display: flex;
    justify-content: center;
    gap: ${({spacing:e})=>e[4]};
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`,ii=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ai=class extends y{constructor(){super(...arguments),this.dappImageUrl=l.state.metadata?.icons,this.walletImageUrl=h.getAccountData()?.connectedWalletInfo?.icon}firstUpdated(){let e=this.shadowRoot?.querySelectorAll(`wui-visual-thumbnail`);e?.[0]&&this.createAnimation(e[0],`translate(18px)`),e?.[1]&&this.createAnimation(e[1],`translate(-18px)`)}render(){return b`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${this.dappImageUrl?.[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(e,t){e.animate([{transform:`translateX(0px)`},{transform:t}],{duration:1600,easing:`cubic-bezier(0.56, 0, 0.48, 1)`,direction:`alternate`,iterations:1/0})}};ai.styles=ri,ai=ii([T(`w3m-siwx-sign-message-thumbnails`)],ai);var oi=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},si=class extends y{constructor(){super(...arguments),this.dappName=l.state.metadata?.name,this.isCancelling=!1,this.isSigning=!1}render(){return b`
      <wui-flex justifyContent="center" .padding=${[`8`,`0`,`6`,`0`]}>
        <w3m-siwx-sign-message-thumbnails></w3m-siwx-sign-message-thumbnails>
      </wui-flex>
      <wui-flex .padding=${[`0`,`20`,`5`,`20`]} gap="3" justifyContent="space-between">
        <wui-text variant="lg-medium" align="center" color="primary"
          >${this.dappName??`Dapp`} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${[`0`,`10`,`4`,`10`]} gap="3" justifyContent="space-between">
        <wui-text variant="md-regular" align="center" color="secondary"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${[`4`,`5`,`5`,`5`]} gap="3" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-secondary"
          ?loading=${this.isCancelling}
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          ${this.isCancelling?`Cancelling...`:`Cancel`}
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-primary"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning?`Signing...`:`Sign`}
        </wui-button>
      </wui-flex>
    `}async onSign(){this.isSigning=!0;try{await ue.requestSignMessage()}catch(e){if(e instanceof Error&&e.message.includes(`OTP is required`)){r.showError({message:`Something went wrong. We need to verify your account again.`}),u.replace(`DataCapture`);return}throw e}finally{this.isSigning=!1}}async onCancel(){this.isCancelling=!0,await ue.cancelSignMessage().finally(()=>this.isCancelling=!1)}};oi([A()],si.prototype,`isCancelling`,void 0),oi([A()],si.prototype,`isSigning`,void 0),si=oi([T(`w3m-siwx-sign-message-view`)],si);var ci=e({AppKitAccountButton:()=>De,AppKitButton:()=>Ae,AppKitConnectButton:()=>Le,AppKitNetworkButton:()=>Ge,W3mAccountButton:()=>Ee,W3mAccountSettingsView:()=>Qe,W3mAccountView:()=>Dt,W3mAllWalletsView:()=>sn,W3mButton:()=>ke,W3mChooseAccountNameView:()=>fr,W3mConnectButton:()=>Ie,W3mConnectView:()=>Q,W3mConnectWalletsView:()=>Tr,W3mConnectingExternalView:()=>Bn,W3mConnectingMultiChainView:()=>Un,W3mConnectingWcBasicView:()=>lr,W3mConnectingWcView:()=>sr,W3mDownloadsView:()=>mr,W3mFooter:()=>Ce,W3mFundWalletView:()=>It,W3mGetWalletView:()=>_r,W3mNetworkButton:()=>We,W3mNetworkSwitchView:()=>jr,W3mNetworksView:()=>Lr,W3mProfileWalletsView:()=>q,W3mRouter:()=>we,W3mSIWXSignMessageView:()=>si,W3mSwitchActiveChainView:()=>Vr,W3mUnsupportedChainView:()=>qr,W3mWalletCompatibleNetworksView:()=>$r,W3mWhatIsANetworkView:()=>Wr,W3mWhatIsAWalletView:()=>Sr});export{De as a,Ae as i,Ge as n,Le as r,ci as t};