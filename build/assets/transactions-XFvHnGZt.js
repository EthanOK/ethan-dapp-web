import{A as e,P as t,l as n,z as r}from"./SolanaStoreUtil-BfqeOKJ6.js";import"./wui-text-BBxkFcIb.js";import"./w3m-activity-list-C62W6gDD.js";var i=r`
  :host > wui-flex:first-child {
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }
`,a=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},o=class extends e{render(){return t`
      <wui-flex flexDirection="column" .padding=${[`0`,`3`,`3`,`3`]} gap="3">
        <w3m-activity-list page="activity"></w3m-activity-list>
      </wui-flex>
    `}};o.styles=i,o=a([n(`w3m-transactions-view`)],o);export{o as W3mTransactionsView};