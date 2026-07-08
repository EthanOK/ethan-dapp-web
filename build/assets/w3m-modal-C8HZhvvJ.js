import{n as e,t}from"./dist-BSj5CM8B.js";import{n,o as r,r as i}from"./utils-DNdqbV_P.js";import{a,s as o,t as s,u as c}from"./lit-DYLA5iLF.js";import{c as l,l as u,s as d,t as ee}from"./class-map-B3oaB8hb.js";import{A as te,C as f,D as ne,E as re,H as p,K as m,M as h,O as g,P as ie,U as ae,W as _,_ as v,a as oe,b as se,c as y,f as ce,g as le,h as b,i as ue,j as de,k as x,m as fe,n as S,o as pe,p as me,s as he,t as C,w as ge,x as w}from"./ModalController-BcBYWeEl.js";import{n as _e,t as ve}from"./AlertController-E1P9uxZU.js";import{a as ye,d as be,f as xe,i as Se,o as Ce,r as T,s as E,t as D,u as O}from"./HelpersUtil-BxIqNbzp.js";import{t as we}from"./wui-list-item-CF1TN19q.js";var Te={getGasPriceInEther(e,t){let n=t*e;return Number(n)/0xde0b6b3a7640000},getGasPriceInUSD(e,t,n){let r=Te.getGasPriceInEther(t,n);return _.bigNumber(e).times(r).toNumber()},getPriceImpact({sourceTokenAmount:e,sourceTokenPriceInUSD:t,toTokenPriceInUSD:n,toTokenAmount:r}){let i=_.bigNumber(e).times(t),a=_.bigNumber(r).times(n);return i.minus(a).div(i).times(100).toNumber()},getMaxSlippage(e,t){let n=_.bigNumber(e).div(100);return _.multiply(t,n).toNumber()},getProviderFee(e,t=.0085){return _.bigNumber(e).times(t).toString()},isInsufficientNetworkTokenForGas(e,t){let n=t||`0`;return _.bigNumber(e).eq(0)?!0:_.bigNumber(_.bigNumber(n)).gt(e)},isInsufficientSourceTokenForSwap(e,t,n){let r=n?.find(e=>e.address===t)?.quantity?.numeric;return _.bigNumber(r||`0`).lt(e)}},Ee=15e4,k={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:``,sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:``,toTokenPriceInUSD:0,networkPrice:`0`,networkBalanceInUSD:`0`,networkTokenSymbol:``,inputError:void 0,slippage:ie.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:`0`,gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},A=i({...k}),De={state:A,subscribe(e){return r(A,()=>e(A))},subscribeKey(e,t){return n(A,e,t)},getParams(){let e=S.state.activeChain,t=S.getAccountData(e)?.caipAddress??S.state.activeCaipAddress,n=h.getPlainAddress(t),r=ce(),i=b.getConnectorId(S.state.activeChain);if(!n)throw Error(`No address found to swap the tokens from.`);let a=!A.toToken?.address||!A.toToken?.decimals,o=!A.sourceToken?.address||!A.sourceToken?.decimals||!_.bigNumber(A.sourceTokenAmount).gt(0),s=!A.sourceTokenAmount;return{networkAddress:r,fromAddress:n,fromCaipAddress:t,sourceTokenAddress:A.sourceToken?.address,toTokenAddress:A.toToken?.address,toTokenAmount:A.toTokenAmount,toTokenDecimals:A.toToken?.decimals,sourceTokenAmount:A.sourceTokenAmount,sourceTokenDecimals:A.sourceToken?.decimals,invalidToToken:a,invalidSourceToken:o,invalidSourceTokenAmount:s,availableToSwap:t&&!a&&!o&&!s,isAuthConnector:i===m.CONNECTOR_ID.AUTH}},async setSourceToken(e){if(!e){A.sourceToken=e,A.sourceTokenAmount=``,A.sourceTokenPriceInUSD=0;return}A.sourceToken=e,await j.setTokenPrice(e.address,`sourceToken`)},setSourceTokenAmount(e){A.sourceTokenAmount=e},async setToToken(e){if(!e){A.toToken=e,A.toTokenAmount=``,A.toTokenPriceInUSD=0;return}A.toToken=e,await j.setTokenPrice(e.address,`toToken`)},setToTokenAmount(e){A.toTokenAmount=e?_.toFixed(e,6):``},async setTokenPrice(e,t){let n=A.tokensPriceMap[e]||0;n||=(A.loadingPrices=!0,await j.getAddressPrice(e)),t===`sourceToken`?A.sourceTokenPriceInUSD=n:t===`toToken`&&(A.toTokenPriceInUSD=n),A.loadingPrices&&=!1,j.getParams().availableToSwap&&!A.switchingTokens&&j.swapTokens()},async switchTokens(){if(!(A.initializing||!A.initialized||A.switchingTokens)){A.switchingTokens=!0;try{let e=A.toToken?{...A.toToken}:void 0,t=A.sourceToken?{...A.sourceToken}:void 0,n=e&&A.toTokenAmount===``?`1`:A.toTokenAmount;j.setSourceTokenAmount(n),j.setToTokenAmount(``),await j.setSourceToken(e),await j.setToToken(t),A.switchingTokens=!1,j.swapTokens()}catch(e){throw A.switchingTokens=!1,e}}},resetState(){A.myTokensWithBalance=k.myTokensWithBalance,A.tokensPriceMap=k.tokensPriceMap,A.initialized=k.initialized,A.initializing=k.initializing,A.switchingTokens=k.switchingTokens,A.sourceToken=k.sourceToken,A.sourceTokenAmount=k.sourceTokenAmount,A.sourceTokenPriceInUSD=k.sourceTokenPriceInUSD,A.toToken=k.toToken,A.toTokenAmount=k.toTokenAmount,A.toTokenPriceInUSD=k.toTokenPriceInUSD,A.networkPrice=k.networkPrice,A.networkTokenSymbol=k.networkTokenSymbol,A.networkBalanceInUSD=k.networkBalanceInUSD,A.inputError=k.inputError},resetValues(){let{networkAddress:e}=j.getParams(),t=A.tokens?.find(t=>t.address===e);j.setSourceToken(t),j.setToToken(void 0)},getApprovalLoadingState(){return A.loadingApprovalTransaction},clearError(){A.transactionError=void 0},async initializeState(){if(!A.initializing){if(A.initializing=!0,!A.initialized)try{await j.fetchTokens(),A.initialized=!0}catch{A.initialized=!1,g.showError(`Failed to initialize swap`),v.goBack()}A.initializing=!1}},async fetchTokens(){let{networkAddress:e}=j.getParams();await j.getNetworkTokenPrice(),await j.getMyTokensWithBalance();let t=A.myTokensWithBalance?.find(t=>t.address===e);t&&(A.networkTokenSymbol=t.symbol,j.setSourceToken(t),j.setSourceTokenAmount(`0`))},async getTokenList(){let e=S.state.activeCaipNetwork?.caipNetworkId;if(!(A.caipNetworkId===e&&A.tokens))try{A.tokensLoading=!0;let t=await ue.getTokenList(e);A.tokens=t,A.caipNetworkId=e,A.popularTokens=t.sort((e,t)=>e.symbol<t.symbol?-1:+(e.symbol>t.symbol));let n=(e&&ie.SUGGESTED_TOKENS_BY_CHAIN?.[e]||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e),r=(ie.SWAP_SUGGESTED_TOKENS||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e).filter(e=>!n.some(t=>t.address===e.address));A.suggestedTokens=[...n,...r]}catch{A.tokens=[],A.popularTokens=[],A.suggestedTokens=[]}finally{A.tokensLoading=!1}},async getAddressPrice(e){let t=A.tokensPriceMap[e];if(t)return t;let n=(await ne.fetchTokenPrice({addresses:[e]}))?.fungibles||[],r=[...A.tokens||[],...A.myTokensWithBalance||[]].find(t=>t.address===e)?.symbol,i=n.find(e=>e.symbol.toLowerCase()===r?.toLowerCase())?.price||0,a=parseFloat(i.toString());return A.tokensPriceMap[e]=a,a},async getNetworkTokenPrice(){let{networkAddress:e}=j.getParams(),t=(await ne.fetchTokenPrice({addresses:[e]}).catch(()=>(g.showError(`Failed to fetch network token price`),{fungibles:[]}))).fungibles?.[0],n=t?.price.toString()||`0`;A.tokensPriceMap[e]=parseFloat(n),A.networkTokenSymbol=t?.symbol||``,A.networkPrice=n},async getMyTokensWithBalance(e){let t=await he.getMyTokensWithBalance({forceUpdate:e,caipNetwork:S.state.activeCaipNetwork,address:S.getAccountData()?.address}),n=ue.mapBalancesToSwapTokens(t);n&&(await j.getInitialGasPrice(),j.setBalances(n))},setBalances(e){let{networkAddress:t}=j.getParams(),n=S.state.activeCaipNetwork;if(!n)return;let r=e.find(e=>e.address===t);e.forEach(e=>{A.tokensPriceMap[e.address]=e.price||0}),A.myTokensWithBalance=e.filter(e=>e.address.startsWith(n.caipNetworkId)),A.networkBalanceInUSD=r?_.multiply(r.quantity.numeric,r.price).toString():`0`},async getInitialGasPrice(){let e=await ue.fetchGasPrice();if(!e)return{gasPrice:null,gasPriceInUSD:null};switch(S.state?.activeCaipNetwork?.chainNamespace){case m.CHAIN.SOLANA:return A.gasFee=e.standard??`0`,A.gasPriceInUSD=_.multiply(e.standard,A.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(A.gasFee),gasPriceInUSD:Number(A.gasPriceInUSD)};case m.CHAIN.EVM:default:let t=e.standard??`0`,n=BigInt(t),r=BigInt(Ee),i=Te.getGasPriceInUSD(A.networkPrice,r,n);return A.gasFee=t,A.gasPriceInUSD=i,{gasPrice:n,gasPriceInUSD:i}}},async swapTokens(){let e=S.getAccountData()?.address,t=A.sourceToken,n=A.toToken,r=_.bigNumber(A.sourceTokenAmount).gt(0);if(r||j.setToTokenAmount(``),!n||!t||A.loadingPrices||!r||!e)return;A.loadingQuote=!0;let i=_.bigNumber(A.sourceTokenAmount).times(10**t.decimals).round(0).toFixed(0);try{let r=await ne.fetchSwapQuote({userAddress:e,from:t.address,to:n.address,gasPrice:A.gasFee,amount:i.toString()});A.loadingQuote=!1;let a=r?.quotes?.[0]?.toAmount;if(!a){ve.open({displayMessage:`Incorrect amount`,debugMessage:`Please enter a valid amount`},`error`);return}let o=_.bigNumber(a).div(10**n.decimals).toString();j.setToTokenAmount(o),j.hasInsufficientToken(A.sourceTokenAmount,t.address)?A.inputError=`Insufficient balance`:(A.inputError=void 0,j.setTransactionDetails())}catch(e){let t=await ue.handleSwapError(e);A.loadingQuote=!1,A.inputError=t||`Insufficient balance`}},async getTransaction(){let{fromCaipAddress:e,availableToSwap:t}=j.getParams(),n=A.sourceToken,r=A.toToken;if(!(!e||!t||!n||!r||A.loadingQuote))try{A.loadingBuildTransaction=!0;let t=await ue.fetchSwapAllowance({userAddress:e,tokenAddress:n.address,sourceTokenAmount:A.sourceTokenAmount,sourceTokenDecimals:n.decimals}),r;return r=t?await j.createSwapTransaction():await j.createAllowanceTransaction(),A.loadingBuildTransaction=!1,A.fetchError=!1,r}catch{v.goBack(),g.showError(`Failed to check allowance`),A.loadingBuildTransaction=!1,A.approvalTransaction=void 0,A.swapTransaction=void 0,A.fetchError=!0;return}},async createAllowanceTransaction(){let{fromCaipAddress:e,sourceTokenAddress:t,toTokenAddress:n}=j.getParams();if(!(!e||!n)){if(!t)throw Error(`createAllowanceTransaction - No source token address found.`);try{let r=await ne.generateApproveCalldata({from:t,to:n,userAddress:e}),i=h.getPlainAddress(r.tx.from);if(!i)throw Error(`SwapController:createAllowanceTransaction - address is required`);let a={data:r.tx.data,to:i,gasPrice:BigInt(r.tx.eip155.gasPrice),value:BigInt(r.tx.value),toAmount:A.toTokenAmount};return A.swapTransaction=void 0,A.approvalTransaction={data:a.data,to:a.to,gasPrice:a.gasPrice,value:a.value,toAmount:a.toAmount},{data:a.data,to:a.to,gasPrice:a.gasPrice,value:a.value,toAmount:a.toAmount}}catch{v.goBack(),g.showError(`Failed to create approval transaction`),A.approvalTransaction=void 0,A.swapTransaction=void 0,A.fetchError=!0;return}}},async createSwapTransaction(){let{networkAddress:e,fromCaipAddress:t,sourceTokenAmount:n}=j.getParams(),r=A.sourceToken,i=A.toToken;if(!t||!n||!r||!i)return;let a=y.parseUnits(n,r.decimals)?.toString();try{let n=await ne.generateSwapCalldata({userAddress:t,from:r.address,to:i.address,amount:a,disableEstimate:!0}),o=r.address===e,s=BigInt(n.tx.eip155.gas),c=BigInt(n.tx.eip155.gasPrice),l=h.getPlainAddress(n.tx.to);if(!l)throw Error(`SwapController:createSwapTransaction - address is required`);let u={data:n.tx.data,to:l,gas:s,gasPrice:c,value:BigInt(o?a??`0`:`0`),toAmount:A.toTokenAmount};return A.gasPriceInUSD=Te.getGasPriceInUSD(A.networkPrice,s,c),A.approvalTransaction=void 0,A.swapTransaction=u,u}catch{v.goBack(),g.showError(`Failed to create transaction`),A.approvalTransaction=void 0,A.swapTransaction=void 0,A.fetchError=!0;return}},onEmbeddedWalletApprovalSuccess(){g.showLoading(`Approve limit increase in your wallet`),v.replace(`SwapPreview`)},async sendTransactionForApproval(e){let{fromAddress:t,isAuthConnector:n}=j.getParams();A.loadingApprovalTransaction=!0,n?v.pushTransactionStack({onSuccess:j.onEmbeddedWalletApprovalSuccess}):g.showLoading(`Approve limit increase in your wallet`);try{await y.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:m.CHAIN.EVM}),await j.swapTokens(),await j.getTransaction(),A.approvalTransaction=void 0,A.loadingApprovalTransaction=!1}catch(e){let t=e;A.transactionError=t?.displayMessage,A.loadingApprovalTransaction=!1,g.showError(t?.displayMessage||`Transaction error`),w.sendEvent({type:`track`,event:`SWAP_APPROVAL_ERROR`,properties:{message:t?.displayMessage||t?.message||`Unknown`,network:S.state.activeCaipNetwork?.caipNetworkId||``,swapFromToken:j.state.sourceToken?.symbol||``,swapToToken:j.state.toToken?.symbol||``,swapFromAmount:j.state.sourceTokenAmount||``,swapToAmount:j.state.toTokenAmount||``,isSmartAccount:fe(m.CHAIN.EVM)===de.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(e){if(!e)return;let{fromAddress:t,toTokenAmount:n,isAuthConnector:r}=j.getParams();A.loadingTransaction=!0;let i=`Swapping ${A.sourceToken?.symbol} to ${_.formatNumberToLocalString(n,3)} ${A.toToken?.symbol}`,a=`Swapped ${A.sourceToken?.symbol} to ${_.formatNumberToLocalString(n,3)} ${A.toToken?.symbol}`;r?v.pushTransactionStack({onSuccess(){v.replace(`Account`),g.showLoading(i),De.resetState()}}):g.showLoading(`Confirm transaction in your wallet`);try{let n=[A.sourceToken?.address,A.toToken?.address].join(`,`),i=await y.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:m.CHAIN.EVM});return A.loadingTransaction=!1,g.showSuccess(a),w.sendEvent({type:`track`,event:`SWAP_SUCCESS`,properties:{network:S.state.activeCaipNetwork?.caipNetworkId||``,swapFromToken:j.state.sourceToken?.symbol||``,swapToToken:j.state.toToken?.symbol||``,swapFromAmount:j.state.sourceTokenAmount||``,swapToAmount:j.state.toTokenAmount||``,isSmartAccount:fe(m.CHAIN.EVM)===de.ACCOUNT_TYPES.SMART_ACCOUNT}}),De.resetState(),r||v.replace(`Account`),De.getMyTokensWithBalance(n),i}catch(e){let t=e;A.transactionError=t?.displayMessage,A.loadingTransaction=!1,g.showError(t?.displayMessage||`Transaction error`),w.sendEvent({type:`track`,event:`SWAP_ERROR`,properties:{message:t?.displayMessage||t?.message||`Unknown`,network:S.state.activeCaipNetwork?.caipNetworkId||``,swapFromToken:j.state.sourceToken?.symbol||``,swapToToken:j.state.toToken?.symbol||``,swapFromAmount:j.state.sourceTokenAmount||``,swapToAmount:j.state.toTokenAmount||``,isSmartAccount:fe(m.CHAIN.EVM)===de.ACCOUNT_TYPES.SMART_ACCOUNT}});return}},hasInsufficientToken(e,t){return Te.isInsufficientSourceTokenForSwap(e,t,A.myTokensWithBalance)},setTransactionDetails(){let{toTokenAddress:e,toTokenDecimals:t}=j.getParams();!e||!t||(A.gasPriceInUSD=Te.getGasPriceInUSD(A.networkPrice,BigInt(A.gasFee),BigInt(Ee)),A.priceImpact=Te.getPriceImpact({sourceTokenAmount:A.sourceTokenAmount,sourceTokenPriceInUSD:A.sourceTokenPriceInUSD,toTokenPriceInUSD:A.toTokenPriceInUSD,toTokenAmount:A.toTokenAmount}),A.maxSlippage=Te.getMaxSlippage(A.slippage,A.toTokenAmount),A.providerFee=Te.getProviderFee(A.sourceTokenAmount))}},j=re(De),M=i({message:``,open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:`shade`}),N=re({state:M,subscribe(e){return r(M,()=>e(M))},subscribeKey(e,t){return n(M,e,t)},showTooltip({message:e,triggerRect:t,variant:n}){M.open=!0,M.message=e,M.triggerRect=t,M.variant=n},hide(){M.open=!1,M.message=``,M.triggerRect={width:0,height:0,top:0,left:0}}}),Oe={isUnsupportedChainView(){return v.state.view===`UnsupportedChain`||v.state.view===`SwitchNetwork`&&v.state.history.includes(`UnsupportedChain`)},async safeClose(){if(this.isUnsupportedChainView()){C.shake();return}if(await _e.isSIWXCloseDisabled()){C.shake();return}(v.state.view===`DataCapture`||v.state.view===`DataCaptureOtpConfirm`)&&y.disconnect(),C.close()}},ke=O`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:e})=>e[8]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    overflow: hidden;
  }
`,Ae=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},je=class extends s{render(){return a`<slot></slot>`}};je.styles=[E,ke],je=Ae([T(`wui-card`)],je);var Me=O`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[6]};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:e})=>e.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundError};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e[2]};
    background-color: var(--local-icon-bg-value);
  }
`,Ne=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Pe={info:`info`,success:`checkmark`,warning:`warningCircle`,error:`warning`},Fe=class extends s{constructor(){super(...arguments),this.message=``,this.type=`info`}render(){return a`
      <wui-flex
        data-type=${d(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${Pe[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){ve.close()}};Fe.styles=[E,Me],Ne([u()],Fe.prototype,`message`,void 0),Ne([u()],Fe.prototype,`type`,void 0),Fe=Ne([T(`wui-alertbar`)],Fe);var Ie=O`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:e})=>e[3]};
    left: ${({spacing:e})=>e[4]};
    right: ${({spacing:e})=>e[4]};
    opacity: 0;
    pointer-events: none;
  }
`,Le=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Re={info:{backgroundColor:`fg-350`,iconColor:`fg-325`,icon:`info`},success:{backgroundColor:`success-glass-reown-020`,iconColor:`success-125`,icon:`checkmark`},warning:{backgroundColor:`warning-glass-reown-020`,iconColor:`warning-100`,icon:`warningCircle`},error:{backgroundColor:`error-glass-reown-020`,iconColor:`error-125`,icon:`warning`}},ze=class extends s{constructor(){super(),this.unsubscribe=[],this.open=ve.state.open,this.onOpen(!0),this.unsubscribe.push(ve.subscribeKey(`open`,e=>{this.open=e,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t}=ve.state,n=Re[t];return a`
      <wui-alertbar
        message=${e}
        backgroundColor=${n?.backgroundColor}
        iconColor=${n?.iconColor}
        icon=${n?.icon}
        type=${t}
      ></wui-alertbar>
    `}onOpen(e){this.open?(this.animate([{opacity:0,transform:`scale(0.85)`},{opacity:1,transform:`scale(1)`}],{duration:150,fill:`forwards`,easing:`ease`}),this.style.cssText=`pointer-events: auto`):e||(this.animate([{opacity:1,transform:`scale(1)`},{opacity:0,transform:`scale(0.85)`}],{duration:150,fill:`forwards`,easing:`ease`}),this.style.cssText=`pointer-events: none`)}};ze.styles=Ie,Le([l()],ze.prototype,`open`,void 0),ze=Le([T(`w3m-alertbar`)],ze);var Be=O`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,Ve=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},P=class extends s{constructor(){super(...arguments),this.icon=`card`,this.variant=`primary`,this.type=`accent`,this.size=`md`,this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return a`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${d(this.iconSize)}></wui-icon>
    </button>`}};P.styles=[E,ye,Be],Ve([u()],P.prototype,`icon`,void 0),Ve([u()],P.prototype,`variant`,void 0),Ve([u()],P.prototype,`type`,void 0),Ve([u()],P.prototype,`size`,void 0),Ve([u()],P.prototype,`iconSize`,void 0),Ve([u({type:Boolean})],P.prototype,`fullWidth`,void 0),Ve([u({type:Boolean})],P.prototype,`disabled`,void 0),P=Ve([T(`wui-icon-button`)],P);var He=O`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
    border-radius: ${({borderRadius:e})=>e[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:e})=>e[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    opacity: 0.5;
  }
`,Ue=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},We={lg:`lg-regular`,md:`md-regular`,sm:`sm-regular`},Ge={lg:`lg`,md:`md`,sm:`sm`},Ke=class extends s{constructor(){super(...arguments),this.imageSrc=``,this.text=``,this.size=`lg`,this.type=`text-dropdown`,this.disabled=!1}render(){return a`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){let e=We[this.size];return this.text?a`<wui-text color="primary" variant=${e}>${this.text}</wui-text>`:null}imageTemplate(){return this.imageSrc?a`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`:a` <wui-flex class="left-icon-container">
      <wui-icon size=${Ge[this.size]} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};Ke.styles=[E,ye,He],Ue([u()],Ke.prototype,`imageSrc`,void 0),Ue([u()],Ke.prototype,`text`,void 0),Ue([u()],Ke.prototype,`size`,void 0),Ue([u()],Ke.prototype,`type`,void 0),Ue([u({type:Boolean})],Ke.prototype,`disabled`,void 0),Ke=Ue([T(`wui-select`)],Ke),t();var qe={ACCOUNT_TABS:[{label:`Tokens`},{label:`Activity`}],SECURE_SITE_ORIGIN:(e===void 0?void 0:{}.NEXT_PUBLIC_SECURE_SITE_ORIGIN)||`https://secure.walletconnect.org`,VIEW_DIRECTION:{Next:`next`,Prev:`prev`},ANIMATION_DURATIONS:{HeaderText:120,ModalHeight:150,ViewTransition:150},VIEWS_WITH_LEGAL_FOOTER:[`Connect`,`ConnectWallets`,`OnRampTokenSelect`,`OnRampFiatSelect`,`OnRampProviders`],VIEWS_WITH_DEFAULT_FOOTER:[`Networks`]},Je=O`
  button {
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  button[data-variant='accent']:hover:enabled,
  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button[data-variant='primary']:hover:enabled,
  button[data-variant='primary']:focus-visible,
  button[data-variant='secondary']:hover:enabled,
  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  button[data-size='xs'] > wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='xs'],
  button[data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'],
  button[data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='md'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  button:disabled {
    background-color: transparent;
    cursor: not-allowed;
    opacity: 0.5;
  }

  button:hover:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
  }

  button:focus-visible:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
`,Ye=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Xe=class extends s{constructor(){super(...arguments),this.size=`md`,this.disabled=!1,this.icon=`copy`,this.iconColor=`default`,this.variant=`accent`}render(){return a`
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon
          color=${{accent:`accent-primary`,primary:`inverse`,secondary:`default`}[this.variant]||this.iconColor}
          size=${this.size}
          name=${this.icon}
        ></wui-icon>
      </button>
    `}};Xe.styles=[E,ye,Je],Ye([u()],Xe.prototype,`size`,void 0),Ye([u({type:Boolean})],Xe.prototype,`disabled`,void 0),Ye([u()],Xe.prototype,`icon`,void 0),Ye([u()],Xe.prototype,`iconColor`,void 0),Ye([u()],Xe.prototype,`variant`,void 0),Xe=Ye([T(`wui-icon-link`)],Xe);var Ze=o`<svg width="86" height="96" fill="none">
  <path
    d="M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z"
  />
</svg>`,Qe=o`
  <svg fill="none" viewBox="0 0 36 40">
    <path
      d="M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z"
    />
  </svg>
`,$e=O`
  :host {
    position: relative;
    border-radius: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--local-width);
    height: var(--local-height);
  }

  :host([data-round='true']) {
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: 100%;
    outline: 1px solid ${({tokens:e})=>e.core.glass010};
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  svg > path {
    stroke: var(--local-stroke);
  }

  wui-image {
    width: 100%;
    height: 100%;
    -webkit-clip-path: var(--local-path);
    clip-path: var(--local-path);
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-icon {
    transform: translateY(-5%);
    width: var(--local-icon-size);
    height: var(--local-icon-size);
  }
`,et=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},F=class extends s{constructor(){super(...arguments),this.size=`md`,this.name=`uknown`,this.networkImagesBySize={sm:Qe,md:we,lg:Ze},this.selected=!1,this.round=!1}render(){let e={sm:`4`,md:`6`,lg:`10`};return this.round?(this.dataset.round=`true`,this.style.cssText=`
      --local-width: var(--apkt-spacing-10);
      --local-height: var(--apkt-spacing-10);
      --local-icon-size: var(--apkt-spacing-4);
    `):this.style.cssText=`

      --local-path: var(--apkt-path-network-${this.size});
      --local-width:  var(--apkt-width-network-${this.size});
      --local-height:  var(--apkt-height-network-${this.size});
      --local-icon-size:  var(--apkt-spacing-${e[this.size]});
    `,a`${this.templateVisual()} ${this.svgTemplate()} `}svgTemplate(){return this.round?null:this.networkImagesBySize[this.size]}templateVisual(){return this.imageSrc?a`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:a`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`}};F.styles=[E,$e],et([u()],F.prototype,`size`,void 0),et([u()],F.prototype,`name`,void 0),et([u({type:Object})],F.prototype,`networkImagesBySize`,void 0),et([u()],F.prototype,`imageSrc`,void 0),et([u({type:Boolean})],F.prototype,`selected`,void 0),et([u({type:Boolean})],F.prototype,`round`,void 0),F=et([T(`wui-network-image`)],F);var tt=O`
  :host {
    position: relative;
    display: flex;
    width: 100%;
    height: 1px;
    background-color: ${({tokens:e})=>e.theme.borderPrimary};
    justify-content: center;
    align-items: center;
  }

  :host > wui-text {
    position: absolute;
    padding: 0px 8px;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
  }

  :host([data-bg-color='primary']) > wui-text {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  :host([data-bg-color='secondary']) > wui-text {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }
`,nt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},rt=class extends s{constructor(){super(...arguments),this.text=``,this.bgColor=`primary`}render(){return this.dataset.bgColor=this.bgColor,a`${this.template()}`}template(){return this.text?a`<wui-text variant="md-regular" color="secondary">${this.text}</wui-text>`:null}};rt.styles=[E,tt],nt([u()],rt.prototype,`text`,void 0),nt([u()],rt.prototype,`bgColor`,void 0),rt=nt([T(`wui-separator`)],rt);var I={INVALID_PAYMENT_CONFIG:`INVALID_PAYMENT_CONFIG`,INVALID_RECIPIENT:`INVALID_RECIPIENT`,INVALID_ASSET:`INVALID_ASSET`,INVALID_AMOUNT:`INVALID_AMOUNT`,UNKNOWN_ERROR:`UNKNOWN_ERROR`,UNABLE_TO_INITIATE_PAYMENT:`UNABLE_TO_INITIATE_PAYMENT`,INVALID_CHAIN_NAMESPACE:`INVALID_CHAIN_NAMESPACE`,GENERIC_PAYMENT_ERROR:`GENERIC_PAYMENT_ERROR`,UNABLE_TO_GET_EXCHANGES:`UNABLE_TO_GET_EXCHANGES`,ASSET_NOT_SUPPORTED:`ASSET_NOT_SUPPORTED`,UNABLE_TO_GET_PAY_URL:`UNABLE_TO_GET_PAY_URL`,UNABLE_TO_GET_BUY_STATUS:`UNABLE_TO_GET_BUY_STATUS`,UNABLE_TO_GET_TOKEN_BALANCES:`UNABLE_TO_GET_TOKEN_BALANCES`,UNABLE_TO_GET_QUOTE:`UNABLE_TO_GET_QUOTE`,UNABLE_TO_GET_QUOTE_STATUS:`UNABLE_TO_GET_QUOTE_STATUS`,INVALID_RECIPIENT_ADDRESS_FOR_ASSET:`INVALID_RECIPIENT_ADDRESS_FOR_ASSET`},it={[I.INVALID_PAYMENT_CONFIG]:`Invalid payment configuration`,[I.INVALID_RECIPIENT]:`Invalid recipient address`,[I.INVALID_ASSET]:`Invalid asset specified`,[I.INVALID_AMOUNT]:`Invalid payment amount`,[I.INVALID_RECIPIENT_ADDRESS_FOR_ASSET]:`Invalid recipient address for the asset selected`,[I.UNKNOWN_ERROR]:`Unknown payment error occurred`,[I.UNABLE_TO_INITIATE_PAYMENT]:`Unable to initiate payment`,[I.INVALID_CHAIN_NAMESPACE]:`Invalid chain namespace`,[I.GENERIC_PAYMENT_ERROR]:`Unable to process payment`,[I.UNABLE_TO_GET_EXCHANGES]:`Unable to get exchanges`,[I.ASSET_NOT_SUPPORTED]:`Asset not supported by the selected exchange`,[I.UNABLE_TO_GET_PAY_URL]:`Unable to get payment URL`,[I.UNABLE_TO_GET_BUY_STATUS]:`Unable to get buy status`,[I.UNABLE_TO_GET_TOKEN_BALANCES]:`Unable to get token balances`,[I.UNABLE_TO_GET_QUOTE]:`Unable to get quote. Please choose a different token`,[I.UNABLE_TO_GET_QUOTE_STATUS]:`Unable to get quote status`},L=class e extends Error{get message(){return it[this.code]}constructor(t,n){super(it[t]),this.name=`AppKitPayError`,this.code=t,this.details=n,Error.captureStackTrace&&Error.captureStackTrace(this,e)}},at=`https://rpc.walletconnect.org/v1/json-rpc`,ot=`reown_test`;function st(){let{chainNamespace:e}=p.parseCaipNetworkId(z.state.paymentAsset.network);if(!h.isAddress(z.state.recipient,e))throw new L(I.INVALID_RECIPIENT_ADDRESS_FOR_ASSET,`Provide valid recipient address for namespace "${e}"`)}async function ct(e,t,n){if(t!==m.CHAIN.EVM)throw new L(I.INVALID_CHAIN_NAMESPACE);if(!n.fromAddress)throw new L(I.INVALID_PAYMENT_CONFIG,`fromAddress is required for native EVM payments.`);let r=typeof n.amount==`string`?parseFloat(n.amount):n.amount;if(isNaN(r))throw new L(I.INVALID_PAYMENT_CONFIG);let i=e.metadata?.decimals??18,a=y.parseUnits(r.toString(),i);if(typeof a!=`bigint`)throw new L(I.GENERIC_PAYMENT_ERROR);return await y.sendTransaction({chainNamespace:t,to:n.recipient,address:n.fromAddress,value:a,data:`0x`})??void 0}async function lt(e,t){if(!t.fromAddress)throw new L(I.INVALID_PAYMENT_CONFIG,`fromAddress is required for ERC20 EVM payments.`);let n=e.asset,r=t.recipient,i=Number(e.metadata.decimals),a=y.parseUnits(t.amount.toString(),i);if(a===void 0)throw new L(I.GENERIC_PAYMENT_ERROR);return await y.writeContract({fromAddress:t.fromAddress,tokenAddress:n,args:[r,a],method:`transfer`,abi:ae.getERC20Abi(n),chainNamespace:m.CHAIN.EVM})??void 0}async function ut(e,t){if(e!==m.CHAIN.SOLANA)throw new L(I.INVALID_CHAIN_NAMESPACE);if(!t.fromAddress)throw new L(I.INVALID_PAYMENT_CONFIG,`fromAddress is required for Solana payments.`);let n=typeof t.amount==`string`?parseFloat(t.amount):t.amount;if(isNaN(n)||n<=0)throw new L(I.INVALID_PAYMENT_CONFIG,`Invalid payment amount.`);try{if(!oe.getProvider(e))throw new L(I.GENERIC_PAYMENT_ERROR,`No Solana provider available.`);let r=await y.sendTransaction({chainNamespace:m.CHAIN.SOLANA,to:t.recipient,value:n,tokenMint:t.tokenMint});if(!r)throw new L(I.GENERIC_PAYMENT_ERROR,`Transaction failed.`);return r}catch(e){throw e instanceof L?e:new L(I.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${e}`)}}async function dt({sourceToken:e,toToken:t,amount:n,recipient:r}){let i=y.parseUnits(n,e.metadata.decimals),a=y.parseUnits(n,t.metadata.decimals);return Promise.resolve({type:Lt,origin:{amount:i?.toString()??`0`,currency:e},destination:{amount:a?.toString()??`0`,currency:t},fees:[{id:`service`,label:`Service Fee`,amount:`0`,currency:t}],steps:[{requestId:Lt,type:`deposit`,deposit:{amount:i?.toString()??`0`,currency:e.asset,receiver:r}}],timeInSeconds:6})}function ft(e){if(!e)return null;let t=e.steps[0];return!t||t.type!==`deposit`?null:t}function pt(e,t=0){if(!e)return[];let n=e.steps.filter(e=>e.type===Rt),r=n.filter((e,n)=>n+1>t);return n.length>0&&n.length<3?r:[]}var mt=new te({baseUrl:h.getApiUrl(),clientId:null}),ht=class extends Error{};function gt(){return`${at}?projectId=${x.getSnapshot().projectId}`}function _t(){let{projectId:e,sdkType:t,sdkVersion:n}=x.state;return{projectId:e,st:t||`appkit`,sv:n||`html-wagmi-4.2.2`}}async function vt(e,t){let n=gt(),{sdkType:r,sdkVersion:i,projectId:a}=x.getSnapshot(),o={jsonrpc:`2.0`,id:1,method:e,params:{...t||{},st:r,sv:i,projectId:a}},s=await(await fetch(n,{method:`POST`,body:JSON.stringify(o),headers:{"Content-Type":`application/json`}})).json();if(s.error)throw new ht(s.error.message);return s}async function yt(e){return(await vt(`reown_getExchanges`,e)).result}async function bt(e){return(await vt(`reown_getExchangePayUrl`,e)).result}async function xt(e){return(await vt(`reown_getExchangeBuyStatus`,e)).result}async function St(e){let t=_.bigNumber(e.amount).times(10**e.toToken.metadata.decimals).toString(),{chainId:n,chainNamespace:r}=p.parseCaipNetworkId(e.sourceToken.network),{chainId:i,chainNamespace:a}=p.parseCaipNetworkId(e.toToken.network),o=e.sourceToken.asset===`native`?me(r):e.sourceToken.asset,s=e.toToken.asset===`native`?me(a):e.toToken.asset;return await mt.post({path:`/appkit/v1/transfers/quote`,body:{user:e.address,originChainId:n.toString(),originCurrency:o,destinationChainId:i.toString(),destinationCurrency:s,recipient:e.recipient,amount:t},params:_t()})}async function Ct(e){let t=D.isLowerCaseMatch(e.sourceToken.network,e.toToken.network),n=D.isLowerCaseMatch(e.sourceToken.asset,e.toToken.asset);return t&&n?dt(e):St(e)}async function wt(e){return await mt.get({path:`/appkit/v1/transfers/status`,params:{requestId:e.requestId,..._t()}})}async function Tt(e){return await mt.get({path:`/appkit/v1/transfers/assets/exchanges/${e}`,params:_t()})}var Et=[`eip155`,`solana`],Dt={eip155:{native:{assetNamespace:`slip44`,assetReference:`60`},defaultTokenNamespace:`erc20`},solana:{native:{assetNamespace:`slip44`,assetReference:`501`},defaultTokenNamespace:`token`}},Ot={56:`714`,204:`714`};function kt(e,t){let{chainNamespace:n,chainId:r}=p.parseCaipNetworkId(e),i=Dt[n];if(!i)throw Error(`Unsupported chain namespace for CAIP-19 formatting: ${n}`);let a=i.native.assetNamespace,o=i.native.assetReference;return t===`native`?n===`eip155`&&Ot[r]&&(o=Ot[r]):(a=i.defaultTokenNamespace,o=t),`${`${n}:${r}`}/${a}:${o}`}function At(e){let{chainNamespace:t}=p.parseCaipNetworkId(e);return Et.includes(t)}function jt(e){let t=S.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===e.chainId),n=e.address;if(!t)throw Error(`Target network not found for balance chainId "${e.chainId}"`);if(D.isLowerCaseMatch(e.symbol,t.nativeCurrency.symbol))n=`native`;else if(h.isCaipAddress(n)){let{address:e}=p.parseCaipAddress(n);n=e}else if(!n)throw Error(`Balance address not found for balance symbol "${e.symbol}"`);return{network:t.caipNetworkId,asset:n,metadata:{name:e.name,symbol:e.symbol,decimals:Number(e.quantity.decimals),logoURI:e.iconUrl},amount:e.quantity.numeric}}function Mt(e){return{chainId:e.network,address:`${e.network}:${e.asset}`,symbol:e.metadata.symbol,name:e.metadata.name,iconUrl:e.metadata.logoURI||``,price:0,quantity:{numeric:`0`,decimals:e.metadata.decimals.toString()}}}function Nt(e){let t=_.bigNumber(e,{safe:!0});return t.lt(.001)?`<0.001`:t.round(4).toString()}function Pt(e){let t=S.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===e.network);return t?!!t.testnet:!1}var Ft=0,It=`unknown`,Lt=`direct-transfer`,Rt=`transaction`,R=i({paymentAsset:{network:`eip155:1`,asset:`0x0`,metadata:{name:`0x0`,symbol:`0x0`,decimals:0}},recipient:`0x0`,amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0,choice:`pay`,tokenBalances:{[m.CHAIN.EVM]:[],[m.CHAIN.SOLANA]:[]},isFetchingTokenBalances:!1,selectedPaymentAsset:null,quote:void 0,quoteStatus:`waiting`,quoteError:null,isFetchingQuote:!1,selectedExchange:void 0,exchangeUrlForQuote:void 0,requestId:void 0}),z={state:R,subscribe(e){return r(R,()=>e(R))},subscribeKey(e,t){return n(R,e,t)},async handleOpenPay(e){this.resetState(),this.setPaymentConfig(e),this.initializeAnalytics(),st(),await this.prepareTokenLogo(),R.isConfigured=!0,w.sendEvent({type:`track`,event:`PAY_MODAL_OPEN`,properties:{exchanges:R.exchanges,configuration:{network:R.paymentAsset.network,asset:R.paymentAsset.asset,recipient:R.recipient,amount:R.amount}}}),await C.open({view:`Pay`})},resetState(){R.paymentAsset={network:`eip155:1`,asset:`0x0`,metadata:{name:`0x0`,symbol:`0x0`,decimals:0}},R.recipient=`0x0`,R.amount=0,R.isConfigured=!1,R.error=null,R.isPaymentInProgress=!1,R.isLoading=!1,R.currentPayment=void 0,R.selectedExchange=void 0,R.exchangeUrlForQuote=void 0,R.requestId=void 0},resetQuoteState(){R.quote=void 0,R.quoteStatus=`waiting`,R.quoteError=null,R.isFetchingQuote=!1,R.requestId=void 0},setPaymentConfig(e){if(!e.paymentAsset)throw new L(I.INVALID_PAYMENT_CONFIG);try{R.choice=e.choice??`pay`,R.paymentAsset=e.paymentAsset,R.recipient=e.recipient,R.amount=e.amount,R.openInNewTab=e.openInNewTab??!0,R.redirectUrl=e.redirectUrl,R.payWithExchange=e.payWithExchange,R.error=null}catch(e){throw new L(I.INVALID_PAYMENT_CONFIG,e.message)}},setSelectedPaymentAsset(e){R.selectedPaymentAsset=e},setSelectedExchange(e){R.selectedExchange=e},setRequestId(e){R.requestId=e},setPaymentInProgress(e){R.isPaymentInProgress=e},getPaymentAsset(){return R.paymentAsset},getExchanges(){return R.exchanges},async fetchExchanges(){try{R.isLoading=!0,R.exchanges=(await yt({page:Ft})).exchanges.slice(0,2)}catch{throw g.showError(it.UNABLE_TO_GET_EXCHANGES),new L(I.UNABLE_TO_GET_EXCHANGES)}finally{R.isLoading=!1}},async getAvailableExchanges(e){try{let t=e?.asset&&e?.network?kt(e.network,e.asset):void 0;return await yt({page:e?.page??Ft,asset:t,amount:e?.amount?.toString()})}catch{throw new L(I.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(e,t,n=!1){try{let r=Number(t.amount),i=await bt({exchangeId:e,asset:kt(t.network,t.asset),amount:r.toString(),recipient:`${t.network}:${t.recipient}`});return w.sendEvent({type:`track`,event:`PAY_EXCHANGE_SELECTED`,properties:{source:`pay`,exchange:{id:e},configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:r},currentPayment:{type:`exchange`,exchangeId:e},headless:n}}),n&&(this.initiatePayment(),w.sendEvent({type:`track`,event:`PAY_INITIATED`,properties:{source:`pay`,paymentId:R.paymentId||It,configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:r},currentPayment:{type:`exchange`,exchangeId:e}}})),i}catch(e){throw e instanceof Error&&e.message.includes(`is not supported`)?new L(I.ASSET_NOT_SUPPORTED):Error(e.message)}},async generateExchangeUrlForQuote({exchangeId:e,paymentAsset:t,amount:n,recipient:r}){let i=await bt({exchangeId:e,asset:kt(t.network,t.asset),amount:n.toString(),recipient:r});R.exchangeSessionId=i.sessionId,R.exchangeUrlForQuote=i.url},async openPayUrl(e,t,n=!1){try{let r=await this.getPayUrl(e.exchangeId,t,n);if(!r)throw new L(I.UNABLE_TO_GET_PAY_URL);let i=e.openInNewTab??!0?`_blank`:`_self`;return h.openHref(r.url,i),r}catch(e){throw e instanceof L?R.error=e.message:R.error=it.GENERIC_PAYMENT_ERROR,new L(I.UNABLE_TO_GET_PAY_URL)}},async onTransfer({chainNamespace:e,fromAddress:t,toAddress:n,amount:r,paymentAsset:i}){if(R.currentPayment={type:`wallet`,status:`IN_PROGRESS`},!R.isPaymentInProgress)try{this.initiatePayment();let a=S.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===i.network);if(!a)throw Error(`Target network not found`);let o=S.state.activeCaipNetwork;switch(D.isLowerCaseMatch(o?.caipNetworkId,a.caipNetworkId)||await S.switchActiveNetwork(a),e){case m.CHAIN.EVM:i.asset===`native`&&(R.currentPayment.result=await ct(i,e,{recipient:n,amount:r,fromAddress:t})),i.asset.startsWith(`0x`)&&(R.currentPayment.result=await lt(i,{recipient:n,amount:r,fromAddress:t})),R.currentPayment.status=`SUCCESS`;break;case m.CHAIN.SOLANA:R.currentPayment.result=await ut(e,{recipient:n,amount:r,fromAddress:t,tokenMint:i.asset===`native`?void 0:i.asset}),R.currentPayment.status=`SUCCESS`;break;default:throw new L(I.INVALID_CHAIN_NAMESPACE)}}catch(e){throw e instanceof L?R.error=e.message:R.error=it.GENERIC_PAYMENT_ERROR,R.currentPayment.status=`FAILED`,g.showError(R.error),e}finally{R.isPaymentInProgress=!1}},async onSendTransaction(e){try{let{namespace:t,transactionStep:n}=e;z.initiatePayment();let r=S.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===R.paymentAsset?.network);if(!r)throw Error(`Target network not found`);let i=S.state.activeCaipNetwork;if(D.isLowerCaseMatch(i?.caipNetworkId,r.caipNetworkId)||await S.switchActiveNetwork(r),t===m.CHAIN.EVM){let{from:e,to:r,data:i,value:a}=n.transaction;await y.sendTransaction({address:e,to:r,data:i,value:BigInt(a),chainNamespace:t})}else if(t===m.CHAIN.SOLANA){let{instructions:e}=n.transaction;await y.writeSolanaTransaction({instructions:e})}}catch(e){throw e instanceof L?R.error=e.message:R.error=it.GENERIC_PAYMENT_ERROR,g.showError(R.error),e}finally{R.isPaymentInProgress=!1}},getExchangeById(e){return R.exchanges.find(t=>t.id===e)},validatePayConfig(e){let{paymentAsset:t,recipient:n,amount:r}=e;if(!t)throw new L(I.INVALID_PAYMENT_CONFIG);if(!n)throw new L(I.INVALID_RECIPIENT);if(!t.asset)throw new L(I.INVALID_ASSET);if(r==null||r<=0)throw new L(I.INVALID_AMOUNT)},async handlePayWithExchange(e){try{R.currentPayment={type:`exchange`,exchangeId:e};let{network:t,asset:n}=R.paymentAsset,r={network:t,asset:n,amount:R.amount,recipient:R.recipient},i=await this.getPayUrl(e,r);if(!i)throw new L(I.UNABLE_TO_INITIATE_PAYMENT);return R.currentPayment.sessionId=i.sessionId,R.currentPayment.status=`IN_PROGRESS`,R.currentPayment.exchangeId=e,this.initiatePayment(),{url:i.url,openInNewTab:R.openInNewTab}}catch(e){return e instanceof L?R.error=e.message:R.error=it.GENERIC_PAYMENT_ERROR,R.isPaymentInProgress=!1,g.showError(R.error),null}},async getBuyStatus(e,t){try{let n=await xt({sessionId:t,exchangeId:e});return(n.status===`SUCCESS`||n.status===`FAILED`)&&w.sendEvent({type:`track`,event:n.status===`SUCCESS`?`PAY_SUCCESS`:`PAY_ERROR`,properties:{message:n.status===`FAILED`?h.parseError(R.error):void 0,source:`pay`,paymentId:R.paymentId||It,configuration:{network:R.paymentAsset.network,asset:R.paymentAsset.asset,recipient:R.recipient,amount:R.amount},currentPayment:{type:`exchange`,exchangeId:R.currentPayment?.exchangeId,sessionId:R.currentPayment?.sessionId,result:n.txHash}}}),n}catch{throw new L(I.UNABLE_TO_GET_BUY_STATUS)}},async fetchTokensFromEOA({caipAddress:e,caipNetwork:t,namespace:n}){if(!e)return[];let{address:r}=p.parseCaipAddress(e),i=t;return n===m.CHAIN.EVM&&(i=void 0),await he.getMyTokensWithBalance({address:r,caipNetwork:i})},async fetchTokensFromExchange(){if(!R.selectedExchange)return[];let e=await Tt(R.selectedExchange.id),t=Object.values(e.assets).flat();return await Promise.all(t.map(async e=>{let t=Mt(e),{chainNamespace:n}=p.parseCaipNetworkId(t.chainId),r=t.address;if(h.isCaipAddress(r)){let{address:e}=p.parseCaipAddress(r);r=e}return t.iconUrl=await f.getImageByToken(r??``,n).catch(()=>void 0)??``,t}))},async fetchTokens({caipAddress:e,caipNetwork:t,namespace:n}){try{R.isFetchingTokenBalances=!0;let r=await(R.selectedExchange?this.fetchTokensFromExchange():this.fetchTokensFromEOA({caipAddress:e,caipNetwork:t,namespace:n}));R.tokenBalances={...R.tokenBalances,[n]:r}}catch(e){let t=e instanceof Error?e.message:`Unable to get token balances`;g.showError(t)}finally{R.isFetchingTokenBalances=!1}},async fetchQuote({amount:e,address:t,sourceToken:n,toToken:r,recipient:i}){try{z.resetQuoteState(),R.isFetchingQuote=!0;let a=await Ct({amount:e,address:R.selectedExchange?void 0:t,sourceToken:n,toToken:r,recipient:i});if(R.selectedExchange){let e=ft(a);if(e){let t=`${n.network}:${e.deposit.receiver}`,r=_.formatNumber(e.deposit.amount,{decimals:n.metadata.decimals??0,round:8});await z.generateExchangeUrlForQuote({exchangeId:R.selectedExchange.id,paymentAsset:n,amount:r.toString(),recipient:t})}}R.quote=a}catch(e){let t=it.UNABLE_TO_GET_QUOTE;if(e instanceof Error&&e.cause&&e.cause instanceof Response)try{let n=await e.cause.json();n.error&&typeof n.error==`string`&&(t=n.error)}catch{}throw R.quoteError=t,g.showError(t),new L(I.UNABLE_TO_GET_QUOTE)}finally{R.isFetchingQuote=!1}},async fetchQuoteStatus({requestId:e}){try{if(e===`direct-transfer`){let e=R.selectedExchange,t=R.exchangeSessionId;if(e&&t){switch((await this.getBuyStatus(e.id,t)).status){case`IN_PROGRESS`:R.quoteStatus=`waiting`;break;case`SUCCESS`:R.quoteStatus=`success`,R.isPaymentInProgress=!1;break;case`FAILED`:R.quoteStatus=`failure`,R.isPaymentInProgress=!1;break;case`UNKNOWN`:R.quoteStatus=`waiting`;break;default:R.quoteStatus=`waiting`;break}return}R.quoteStatus=`success`;return}let{status:t}=await wt({requestId:e});R.quoteStatus=t}catch{throw R.quoteStatus=`failure`,new L(I.UNABLE_TO_GET_QUOTE_STATUS)}},initiatePayment(){R.isPaymentInProgress=!0,R.paymentId=crypto.randomUUID()},initializeAnalytics(){R.analyticsSet||(R.analyticsSet=!0,this.subscribeKey(`isPaymentInProgress`,e=>{if(R.currentPayment?.status&&R.currentPayment.status!==`UNKNOWN`){let e={IN_PROGRESS:`PAY_INITIATED`,SUCCESS:`PAY_SUCCESS`,FAILED:`PAY_ERROR`}[R.currentPayment.status];w.sendEvent({type:`track`,event:e,properties:{message:R.currentPayment.status===`FAILED`?h.parseError(R.error):void 0,source:`pay`,paymentId:R.paymentId||It,configuration:{network:R.paymentAsset.network,asset:R.paymentAsset.asset,recipient:R.recipient,amount:R.amount},currentPayment:{type:R.currentPayment.type,exchangeId:R.currentPayment.exchangeId,sessionId:R.currentPayment.sessionId,result:R.currentPayment.result}}})}}))},async prepareTokenLogo(){if(!R.paymentAsset.metadata.logoURI)try{let{chainNamespace:e}=p.parseCaipNetworkId(R.paymentAsset.network),t=await f.getImageByToken(R.paymentAsset.asset,e);R.paymentAsset.metadata.logoURI=t}catch{}}},zt=O`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }

  .left-image-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 40px;
    height: 40px;
  }

  .chain-image {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .payment-methods-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[8]};
    border-top-left-radius: ${({borderRadius:e})=>e[8]};
  }
`,Bt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},B=class extends s{constructor(){super(),this.unsubscribe=[],this.amount=z.state.amount,this.namespace=void 0,this.paymentAsset=z.state.paymentAsset,this.activeConnectorIds=b.state.activeConnectorIds,this.caipAddress=void 0,this.exchanges=z.state.exchanges,this.isLoading=z.state.isLoading,this.initializeNamespace(),this.unsubscribe.push(z.subscribeKey(`amount`,e=>this.amount=e)),this.unsubscribe.push(b.subscribeKey(`activeConnectorIds`,e=>this.activeConnectorIds=e)),this.unsubscribe.push(z.subscribeKey(`exchanges`,e=>this.exchanges=e)),this.unsubscribe.push(z.subscribeKey(`isLoading`,e=>this.isLoading=e)),z.fetchExchanges(),z.setSelectedExchange(void 0)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return a`
      <wui-flex flexDirection="column">
        ${this.paymentDetailsTemplate()} ${this.paymentMethodsTemplate()}
      </wui-flex>
    `}paymentMethodsTemplate(){return a`
      <wui-flex flexDirection="column" padding="3" gap="2" class="payment-methods-container">
        ${this.payWithWalletTemplate()} ${this.templateSeparator()}
        ${this.templateExchangeOptions()}
      </wui-flex>
    `}initializeNamespace(){let e=S.state.activeChain;this.namespace=e,this.caipAddress=S.getAccountData(e)?.caipAddress,this.unsubscribe.push(S.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress},e))}paymentDetailsTemplate(){let e=S.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network);return a`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        .padding=${[`6`,`8`,`6`,`8`]}
        gap="2"
      >
        <wui-flex alignItems="center" gap="1">
          <wui-text variant="h1-regular" color="primary">
            ${Nt(this.amount||`0`)}
          </wui-text>

          <wui-flex flexDirection="column">
            <wui-text variant="h6-regular" color="secondary">
              ${this.paymentAsset.metadata.symbol||`Unknown`}
            </wui-text>
            <wui-text variant="md-medium" color="secondary"
              >on ${e?.name||`Unknown`}</wui-text
            >
          </wui-flex>
        </wui-flex>

        <wui-flex class="left-image-container">
          <wui-image
            src=${d(this.paymentAsset.metadata.logoURI)}
            class="token-image"
          ></wui-image>
          <wui-image
            src=${d(f.getNetworkImage(e))}
            class="chain-image"
          ></wui-image>
        </wui-flex>
      </wui-flex>
    `}payWithWalletTemplate(){return At(this.paymentAsset.network)?this.caipAddress?this.connectedWalletTemplate():this.disconnectedWalletTemplate():a``}connectedWalletTemplate(){let{name:e,image:t}=this.getWalletProperties({namespace:this.namespace});return a`
      <wui-flex flexDirection="column" gap="3">
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${this.onWalletPayment}
          .boxed=${!1}
          ?chevron=${!0}
          ?fullSize=${!1}
          ?rounded=${!0}
          data-testid="wallet-payment-option"
          imageSrc=${d(t)}
          imageSize="3xl"
        >
          <wui-text variant="lg-regular" color="primary">Pay with ${e}</wui-text>
        </wui-list-item>

        <wui-list-item
          type="secondary"
          icon="power"
          iconColor="error"
          @click=${this.onDisconnect}
          data-testid="disconnect-button"
          ?chevron=${!1}
          boxColor="foregroundSecondary"
        >
          <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `}disconnectedWalletTemplate(){return a`<wui-list-item
      type="secondary"
      boxColor="foregroundSecondary"
      variant="icon"
      iconColor="default"
      iconVariant="overlay"
      icon="wallet"
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay with wallet</wui-text>
    </wui-list-item>`}templateExchangeOptions(){if(this.isLoading)return a`<wui-flex justifyContent="center" alignItems="center">
        <wui-loading-spinner size="md"></wui-loading-spinner>
      </wui-flex>`;let e=this.exchanges.filter(e=>Pt(this.paymentAsset)?e.id===ot:e.id!==ot);return e.length===0?a`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:e.map(e=>a`
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${()=>this.onExchangePayment(e)}
          data-testid="exchange-option-${e.id}"
          ?chevron=${!0}
          imageSrc=${d(e.imageUrl)}
        >
          <wui-text flexGrow="1" variant="lg-regular" color="primary">
            Pay with ${e.name}
          </wui-text>
        </wui-list-item>
      `)}templateSeparator(){return a`<wui-separator text="or" bgColor="secondary"></wui-separator>`}async onWalletPayment(){if(!this.namespace)throw Error(`Namespace not found`);this.caipAddress?v.push(`PayQuote`):(await b.connect(),await C.open({view:`PayQuote`}))}onExchangePayment(e){z.setSelectedExchange(e),v.push(`PayQuote`)}async onDisconnect(){try{await y.disconnect(),await C.open({view:`Pay`})}catch{console.error(`Failed to disconnect`),g.showError(`Failed to disconnect`)}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let n=b.getConnector({id:t,namespace:e});if(!n)return{name:void 0,image:void 0};let r=f.getConnectorImage(n);return{name:n.name,image:r}}};B.styles=zt,Bt([l()],B.prototype,`amount`,void 0),Bt([l()],B.prototype,`namespace`,void 0),Bt([l()],B.prototype,`paymentAsset`,void 0),Bt([l()],B.prototype,`activeConnectorIds`,void 0),Bt([l()],B.prototype,`caipAddress`,void 0),Bt([l()],B.prototype,`exchanges`,void 0),Bt([l()],B.prototype,`isLoading`,void 0),B=Bt([T(`w3m-pay-view`)],B);var Vt=O`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-container {
    position: relative;
    width: var(--pulse-size);
    height: var(--pulse-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-rings {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--pulse-color);
    opacity: 0;
    animation: pulse var(--pulse-duration, 2s) ease-out infinite;
  }

  .pulse-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: var(--pulse-opacity, 0.3);
    }
    50% {
      opacity: calc(var(--pulse-opacity, 0.3) * 0.5);
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`,Ht=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ut=3,Wt=2,Gt=.3,Kt=`200px`,qt={"accent-primary":be.tokens.core.backgroundAccentPrimary},Jt=class extends s{constructor(){super(...arguments),this.rings=Ut,this.duration=Wt,this.opacity=Gt,this.size=Kt,this.variant=`accent-primary`}render(){let e=qt[this.variant];return this.style.cssText=`
      --pulse-size: ${this.size};
      --pulse-duration: ${this.duration}s;
      --pulse-color: ${e};
      --pulse-opacity: ${this.opacity};
    `,a`
      <div class="pulse-container">
        <div class="pulse-rings">${Array.from({length:this.rings},(e,t)=>this.renderRing(t,this.rings))}</div>
        <div class="pulse-content">
          <slot></slot>
        </div>
      </div>
    `}renderRing(e,t){return a`<div class="pulse-ring" style=${`animation-delay: ${e/t*this.duration}s;`}></div>`}};Jt.styles=[E,Vt],Ht([u({type:Number})],Jt.prototype,`rings`,void 0),Ht([u({type:Number})],Jt.prototype,`duration`,void 0),Ht([u({type:Number})],Jt.prototype,`opacity`,void 0),Ht([u()],Jt.prototype,`size`,void 0),Ht([u()],Jt.prototype,`variant`,void 0),Jt=Ht([T(`wui-pulse`)],Jt);var Yt=[{id:`received`,title:`Receiving funds`,icon:`dollar`},{id:`processing`,title:`Swapping asset`,icon:`recycleHorizontal`},{id:`sending`,title:`Sending asset to the recipient address`,icon:`send`}],Xt=[`success`,`submitted`,`failure`,`timeout`,`refund`],Zt=O`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  .token-badge-container {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: ${({borderRadius:e})=>e[4]};
    z-index: 3;
    min-width: 105px;
  }

  .token-badge-container.loading {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 3px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .token-badge-container.success {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 3px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .token-image-container {
    position: relative;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 64px;
    height: 64px;
  }

  .token-image.success {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .token-image.error {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .token-image.loading {
    background: ${({colors:e})=>e.accent010};
  }

  .token-image wui-icon {
    width: 32px;
    height: 32px;
  }

  .token-badge {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  .token-badge wui-text {
    white-space: nowrap;
  }

  .payment-lifecycle-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[6]};
    border-top-left-radius: ${({borderRadius:e})=>e[6]};
  }

  .payment-step-badge {
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  .payment-step-badge.loading {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .payment-step-badge.error {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  .payment-step-badge.success {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  .step-icon-container {
    position: relative;
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e.round};
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .step-icon-box {
    position: absolute;
    right: -4px;
    bottom: -1px;
    padding: 2px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .step-icon-box.success {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }
`,V=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Qt={received:[`pending`,`success`,`submitted`],processing:[`success`,`submitted`],sending:[`success`,`submitted`]},$t=3e3,H=class extends s{constructor(){super(),this.unsubscribe=[],this.pollingInterval=null,this.paymentAsset=z.state.paymentAsset,this.quoteStatus=z.state.quoteStatus,this.quote=z.state.quote,this.amount=z.state.amount,this.namespace=void 0,this.caipAddress=void 0,this.profileName=null,this.activeConnectorIds=b.state.activeConnectorIds,this.selectedExchange=z.state.selectedExchange,this.initializeNamespace(),this.unsubscribe.push(z.subscribeKey(`quoteStatus`,e=>this.quoteStatus=e),z.subscribeKey(`quote`,e=>this.quote=e),b.subscribeKey(`activeConnectorIds`,e=>this.activeConnectorIds=e),z.subscribeKey(`selectedExchange`,e=>this.selectedExchange=e))}connectedCallback(){super.connectedCallback(),this.startPolling()}disconnectedCallback(){super.disconnectedCallback(),this.stopPolling(),this.unsubscribe.forEach(e=>e())}render(){return a`
      <wui-flex flexDirection="column" .padding=${[`3`,`0`,`0`,`0`]} gap="2">
        ${this.tokenTemplate()} ${this.paymentTemplate()} ${this.paymentLifecycleTemplate()}
      </wui-flex>
    `}tokenTemplate(){let e=Nt(this.amount||`0`),t=this.paymentAsset.metadata.symbol??`Unknown`,n=S.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network),r=this.quoteStatus===`failure`||this.quoteStatus===`timeout`||this.quoteStatus===`refund`;return this.quoteStatus===`success`||this.quoteStatus===`submitted`?a`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image success">
          <wui-icon name="checkmark" color="success" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:r?a`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image error">
          <wui-icon name="close" color="error" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:a`
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image loading">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex
            justifyContent="center"
            alignItems="center"
            class="token-badge-container loading"
          >
            <wui-flex
              alignItems="center"
              justifyContent="center"
              gap="01"
              padding="1"
              class="token-badge"
            >
              <wui-image
                src=${d(f.getNetworkImage(n))}
                class="chain-image"
                size="mdl"
              ></wui-image>

              <wui-text variant="lg-regular" color="primary">${e} ${t}</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}paymentTemplate(){return a`
      <wui-flex flexDirection="column" gap="2" .padding=${[`0`,`6`,`0`,`6`]}>
        ${this.renderPayment()}
        <wui-separator></wui-separator>
        ${this.renderWallet()}
      </wui-flex>
    `}paymentLifecycleTemplate(){let e=this.getStepsWithStatus();return a`
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          ${this.renderPaymentCycleBadge()}
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${[`2`,`0`,`2`,`0`]}>
          ${e.map(e=>this.renderStep(e))}
        </wui-flex>
      </wui-flex>
    `}renderPaymentCycleBadge(){let e=this.quoteStatus===`failure`||this.quoteStatus===`timeout`||this.quoteStatus===`refund`,t=this.quoteStatus===`success`||this.quoteStatus===`submitted`;return e?a`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge error"
          gap="1"
        >
          <wui-icon name="close" color="error" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="error">Failed</wui-text>
        </wui-flex>
      `:t?a`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge success"
          gap="1"
        >
          <wui-icon name="checkmark" color="success" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="success">Completed</wui-text>
        </wui-flex>
      `:a`
      <wui-flex alignItems="center" justifyContent="space-between" gap="3">
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge loading"
          gap="1"
        >
          <wui-icon name="clock" color="default" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="primary">Est. ${this.quote?.timeInSeconds??0} sec</wui-text>
        </wui-flex>

        <wui-icon name="chevronBottom" color="default" size="xxs"></wui-icon>
      </wui-flex>
    `}renderPayment(){let e=S.getAllRequestedCaipNetworks().find(e=>{let t=this.quote?.origin.currency.network;if(!t)return!1;let{chainId:n}=p.parseCaipNetworkId(t);return D.isLowerCaseMatch(e.id.toString(),n.toString())});return a`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${[`3`,`0`,`3`,`0`]}
      >
        <wui-text variant="lg-regular" color="secondary">Payment Method</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">${Nt(_.formatNumber(this.quote?.origin.amount||`0`,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString())}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${this.quote?.origin.currency.metadata.symbol??`Unknown`}</wui-text>
          </wui-flex>

          <wui-flex alignItems="center" gap="1">
            <wui-text variant="md-regular" color="secondary">on</wui-text>
            <wui-image
              src=${d(f.getNetworkImage(e))}
              size="xs"
            ></wui-image>
            <wui-text variant="md-regular" color="secondary">${e?.name}</wui-text>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderWallet(){return a`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${[`3`,`0`,`3`,`0`]}
      >
        <wui-text variant="lg-regular" color="secondary"
          >${this.selectedExchange?`Exchange`:`Wallet`}</wui-text
        >

        ${this.renderWalletText()}
      </wui-flex>
    `}renderWalletText(){let{image:e}=this.getWalletProperties({namespace:this.namespace}),{address:t}=this.caipAddress?p.parseCaipAddress(this.caipAddress):{},n=this.selectedExchange?.name;return this.selectedExchange?a`
        <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
          <wui-text variant="lg-regular" color="primary">${n}</wui-text>
          <wui-image src=${d(this.selectedExchange.imageUrl)} size="mdl"></wui-image>
        </wui-flex>
      `:a`
      <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
        <wui-text variant="lg-regular" color="primary">
          ${Se.getTruncateString({string:this.profileName||t||n||``,charsStart:this.profileName?16:4,charsEnd:this.profileName?0:6,truncate:this.profileName?`end`:`middle`})}
        </wui-text>

        <wui-image src=${d(e)} size="mdl"></wui-image>
      </wui-flex>
    `}getStepsWithStatus(){return this.quoteStatus===`failure`||this.quoteStatus===`timeout`||this.quoteStatus===`refund`?Yt.map(e=>({...e,status:`failed`})):Yt.map(e=>{let t=(Qt[e.id]??[]).includes(this.quoteStatus)?`completed`:`pending`;return{...e,status:t}})}renderStep({title:e,icon:t,status:n}){return a`
      <wui-flex alignItems="center" gap="3">
        <wui-flex justifyContent="center" alignItems="center" class="step-icon-container">
          <wui-icon name=${t} color="default" size="mdl"></wui-icon>

          <wui-flex alignItems="center" justifyContent="center" class=${ee({"step-icon-box":!0,success:n===`completed`})}>
            ${this.renderStatusIndicator(n)}
          </wui-flex>
        </wui-flex>

        <wui-text variant="md-regular" color="primary">${e}</wui-text>
      </wui-flex>
    `}renderStatusIndicator(e){return e===`completed`?a`<wui-icon size="sm" color="success" name="checkmark"></wui-icon>`:e===`failed`?a`<wui-icon size="sm" color="error" name="close"></wui-icon>`:e===`pending`?a`<wui-loading-spinner color="accent-primary" size="sm"></wui-loading-spinner>`:null}startPolling(){this.pollingInterval||=(this.fetchQuoteStatus(),setInterval(()=>{this.fetchQuoteStatus()},$t))}stopPolling(){this.pollingInterval&&=(clearInterval(this.pollingInterval),null)}async fetchQuoteStatus(){let e=z.state.requestId;if(!e||Xt.includes(this.quoteStatus))this.stopPolling();else try{await z.fetchQuoteStatus({requestId:e}),Xt.includes(this.quoteStatus)&&this.stopPolling()}catch{this.stopPolling()}}initializeNamespace(){let e=S.state.activeChain;this.namespace=e,this.caipAddress=S.getAccountData(e)?.caipAddress,this.profileName=S.getAccountData(e)?.profileName??null,this.unsubscribe.push(S.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null},e))}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let n=b.getConnector({id:t,namespace:e});if(!n)return{name:void 0,image:void 0};let r=f.getConnectorImage(n);return{name:n.name,image:r}}};H.styles=Zt,V([l()],H.prototype,`paymentAsset`,void 0),V([l()],H.prototype,`quoteStatus`,void 0),V([l()],H.prototype,`quote`,void 0),V([l()],H.prototype,`amount`,void 0),V([l()],H.prototype,`namespace`,void 0),V([l()],H.prototype,`caipAddress`,void 0),V([l()],H.prototype,`profileName`,void 0),V([l()],H.prototype,`activeConnectorIds`,void 0),V([l()],H.prototype,`selectedExchange`,void 0),H=V([T(`w3m-pay-loading-view`)],H);var en=O`
  button {
    display: flex;
    align-items: center;
    height: 40px;
    padding: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[4]};
    column-gap: ${({spacing:e})=>e[1]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
  }

  wui-image,
  .icon-box {
    width: ${({spacing:e})=>e[6]};
    height: ${({spacing:e})=>e[6]};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    flex: 1;
  }

  .icon-box {
    position: relative;
  }

  .icon-box[data-active='true'] {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .circle {
    position: absolute;
    left: 16px;
    top: 15px;
    width: 8px;
    height: 8px;
    background-color: ${({tokens:e})=>e.core.textSuccess};
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: 50%;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`,U=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},W=class extends s{constructor(){super(...arguments),this.address=``,this.profileName=``,this.alt=``,this.imageSrc=``,this.icon=void 0,this.iconSize=`md`,this.enableGreenCircle=!0,this.loading=!1,this.charsStart=4,this.charsEnd=6}render(){return a`
      <button>
        ${this.leftImageTemplate()} ${this.textTemplate()} ${this.rightImageTemplate()}
      </button>
    `}leftImageTemplate(){let e=this.icon?a`<wui-icon
          size=${d(this.iconSize)}
          color="default"
          name=${this.icon}
          class="icon"
        ></wui-icon>`:a`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`;return a`
      <wui-flex
        alignItems="center"
        justifyContent="center"
        class="icon-box"
        data-active=${!!this.icon}
      >
        ${e}
        ${this.enableGreenCircle?a`<wui-flex class="circle"></wui-flex>`:null}
      </wui-flex>
    `}textTemplate(){return a`
      <wui-text variant="lg-regular" color="primary">
        ${Se.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?16:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?`end`:`middle`})}
      </wui-text>
    `}rightImageTemplate(){return a`<wui-icon name="chevronBottom" size="sm" color="default"></wui-icon>`}};W.styles=[E,ye,en],U([u()],W.prototype,`address`,void 0),U([u()],W.prototype,`profileName`,void 0),U([u()],W.prototype,`alt`,void 0),U([u()],W.prototype,`imageSrc`,void 0),U([u()],W.prototype,`icon`,void 0),U([u()],W.prototype,`iconSize`,void 0),U([u({type:Boolean})],W.prototype,`enableGreenCircle`,void 0),U([u({type:Boolean})],W.prototype,`loading`,void 0),U([u({type:Number})],W.prototype,`charsStart`,void 0),U([u({type:Number})],W.prototype,`charsEnd`,void 0),W=U([T(`wui-wallet-switch`)],W);var tn=c`
  :host {
    display: block;
  }
`,nn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},rn=class extends s{render(){return a`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-shimmer width="60px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Network Fee</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-shimmer
              width="75px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>

            <wui-flex alignItems="center" gap="01">
              <wui-shimmer width="14px" height="14px" rounded variant="light"></wui-shimmer>
              <wui-shimmer
                width="49px"
                height="14px"
                borderRadius="4xs"
                variant="light"
              ></wui-shimmer>
            </wui-flex>
          </wui-flex>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Service Fee</wui-text>
          <wui-shimmer width="75px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>
      </wui-flex>
    `}};rn.styles=[tn],rn=nn([T(`w3m-pay-fees-skeleton`)],rn);var an=O`
  :host {
    display: block;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }
`,on=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},sn=class extends s{constructor(){super(),this.unsubscribe=[],this.quote=z.state.quote,this.unsubscribe.push(z.subscribeKey(`quote`,e=>this.quote=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return a`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">
            ${_.formatNumber(this.quote?.origin.amount||`0`,{decimals:this.quote?.origin.currency.metadata.decimals??0,round:6}).toString()} ${this.quote?.origin.currency.metadata.symbol||`Unknown`}
          </wui-text>
        </wui-flex>

        ${this.quote&&this.quote.fees.length>0?this.quote.fees.map(e=>this.renderFee(e)):null}
      </wui-flex>
    `}renderFee(e){let t=e.id===`network`,n=_.formatNumber(e.amount||`0`,{decimals:e.currency.metadata.decimals??0,round:6}).toString();if(t){let t=S.getAllRequestedCaipNetworks().find(t=>D.isLowerCaseMatch(t.caipNetworkId,e.currency.network));return a`
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">
              ${n} ${e.currency.metadata.symbol||`Unknown`}
            </wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image
                src=${d(f.getNetworkImage(t))}
                size="xs"
              ></wui-image>
              <wui-text variant="sm-regular" color="secondary">
                ${t?.name||`Unknown`}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      `}return a`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>
        <wui-text variant="md-regular" color="primary">
          ${n} ${e.currency.metadata.symbol||`Unknown`}
        </wui-text>
      </wui-flex>
    `}};sn.styles=[an],on([l()],sn.prototype,`quote`,void 0),sn=on([T(`w3m-pay-fees`)],sn);var cn=O`
  :host {
    display: block;
    width: 100%;
  }

  .disabled-container {
    padding: ${({spacing:e})=>e[2]};
    min-height: 168px;
  }

  wui-icon {
    width: ${({spacing:e})=>e[8]};
    height: ${({spacing:e})=>e[8]};
  }

  wui-flex > wui-text {
    max-width: 273px;
  }
`,ln=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},un=class extends s{constructor(){super(),this.unsubscribe=[],this.selectedExchange=z.state.selectedExchange,this.unsubscribe.push(z.subscribeKey(`selectedExchange`,e=>this.selectedExchange=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return a`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
        class="disabled-container"
      >
        <wui-icon name="coins" color="default" size="inherit"></wui-icon>

        <wui-text variant="md-regular" color="primary" align="center">
          You don't have enough funds to complete this transaction
        </wui-text>

        ${this.selectedExchange?null:a`<wui-button
              size="md"
              variant="neutral-secondary"
              @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
              >Connect other wallet</wui-button
            >`}
      </wui-flex>
    `}dispatchConnectOtherWalletEvent(){this.dispatchEvent(new CustomEvent(`connectOtherWallet`,{detail:!0,bubbles:!0,composed:!0}))}};un.styles=[cn],ln([u({type:Array})],un.prototype,`selectedExchange`,void 0),un=ln([T(`w3m-pay-options-empty`)],un);var dn=O`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    min-height: 60px;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .chain-image {
    position: absolute;
    bottom: -3px;
    right: -5px;
    border: 2px solid ${({tokens:e})=>e.theme.foregroundSecondary};
  }
`,fn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},pn=class extends s{render(){return a`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.renderOptionEntry()} ${this.renderOptionEntry()} ${this.renderOptionEntry()}
      </wui-flex>
    `}renderOptionEntry(){return a`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-shimmer
              width="32px"
              height="32px"
              rounded
              variant="light"
              class="token-image"
            ></wui-shimmer>
            <wui-shimmer
              width="16px"
              height="16px"
              rounded
              variant="light"
              class="chain-image"
            ></wui-shimmer>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-shimmer
              width="74px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
            <wui-shimmer
              width="46px"
              height="14px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}};pn.styles=[dn],pn=fn([T(`w3m-pay-options-skeleton`)],pn);var mn=O`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    mask-image: var(--options-mask-image);
    -webkit-mask-image: var(--options-mask-image);
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    cursor: pointer;
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 32px;
    height: 32px;
  }

  .chain-image {
    position: absolute;
    width: 16px;
    height: 16px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  @media (hover: hover) and (pointer: fine) {
    .pay-option-container:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`,hn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},gn=300,_n=class extends s{constructor(){super(),this.unsubscribe=[],this.options=[],this.selectedPaymentAsset=null}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.resizeObserver?.disconnect(),(this.shadowRoot?.querySelector(`.pay-options-container`))?.removeEventListener(`scroll`,this.handleOptionsListScroll.bind(this))}firstUpdated(){let e=this.shadowRoot?.querySelector(`.pay-options-container`);e&&(requestAnimationFrame(this.handleOptionsListScroll.bind(this)),e?.addEventListener(`scroll`,this.handleOptionsListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleOptionsListScroll()}),this.resizeObserver?.observe(e),this.handleOptionsListScroll())}render(){return a`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.options.map(e=>this.payOptionTemplate(e))}
      </wui-flex>
    `}payOptionTemplate(e){let{network:t,metadata:n,asset:r,amount:i=`0`}=e,o=S.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===t),s=`${t}:${r}`==`${this.selectedPaymentAsset?.network}:${this.selectedPaymentAsset?.asset}`,c=_.bigNumber(i,{safe:!0}),l=c.gt(0);return a`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        @click=${()=>this.onSelect?.(e)}
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-image
              src=${d(n.logoURI)}
              class="token-image"
              size="3xl"
            ></wui-image>
            <wui-image
              src=${d(f.getNetworkImage(o))}
              class="chain-image"
              size="md"
            ></wui-image>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="lg-regular" color="primary">${n.symbol}</wui-text>
            ${l?a`<wui-text variant="sm-regular" color="secondary">
                  ${c.round(6).toString()} ${n.symbol}
                </wui-text>`:null}
          </wui-flex>
        </wui-flex>

        ${s?a`<wui-icon name="checkmark" size="md" color="success"></wui-icon>`:null}
      </wui-flex>
    `}handleOptionsListScroll(){let e=this.shadowRoot?.querySelector(`.pay-options-container`);e&&(e.scrollHeight>gn?(e.style.setProperty(`--options-mask-image`,`linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--options-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--options-scroll--top-opacity))) 1px,
          black 50px,
          black calc(100% - 50px),
          rgba(155, 155, 155, calc(1 - var(--options-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--options-scroll--bottom-opacity))) 100%
        )`),e.style.setProperty(`--options-scroll--top-opacity`,xe.interpolate([0,50],[0,1],e.scrollTop).toString()),e.style.setProperty(`--options-scroll--bottom-opacity`,xe.interpolate([0,50],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString())):(e.style.setProperty(`--options-mask-image`,`none`),e.style.setProperty(`--options-scroll--top-opacity`,`0`),e.style.setProperty(`--options-scroll--bottom-opacity`,`0`)))}};_n.styles=[mn],hn([u({type:Array})],_n.prototype,`options`,void 0),hn([u()],_n.prototype,`selectedPaymentAsset`,void 0),hn([u()],_n.prototype,`onSelect`,void 0),_n=hn([T(`w3m-pay-options`)],_n);var vn=O`
  .payment-methods-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[5]};
    border-top-left-radius: ${({borderRadius:e})=>e[5]};
  }

  .pay-options-container {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding: ${({spacing:e})=>e[1]};
  }

  w3m-tooltip-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: fit-content;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  w3m-pay-options.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`,G=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},yn={eip155:`ethereum`,solana:`solana`,bip122:`bitcoin`,ton:`ton`},bn={eip155:{icon:yn.eip155,label:`EVM`},solana:{icon:yn.solana,label:`Solana`},bip122:{icon:yn.bip122,label:`Bitcoin`},ton:{icon:yn.ton,label:`Ton`}},K=class extends s{constructor(){super(),this.unsubscribe=[],this.profileName=null,this.paymentAsset=z.state.paymentAsset,this.namespace=void 0,this.caipAddress=void 0,this.amount=z.state.amount,this.recipient=z.state.recipient,this.activeConnectorIds=b.state.activeConnectorIds,this.selectedPaymentAsset=z.state.selectedPaymentAsset,this.selectedExchange=z.state.selectedExchange,this.isFetchingQuote=z.state.isFetchingQuote,this.quoteError=z.state.quoteError,this.quote=z.state.quote,this.isFetchingTokenBalances=z.state.isFetchingTokenBalances,this.tokenBalances=z.state.tokenBalances,this.isPaymentInProgress=z.state.isPaymentInProgress,this.exchangeUrlForQuote=z.state.exchangeUrlForQuote,this.completedTransactionsCount=0,this.unsubscribe.push(z.subscribeKey(`paymentAsset`,e=>this.paymentAsset=e)),this.unsubscribe.push(z.subscribeKey(`tokenBalances`,e=>this.onTokenBalancesChanged(e))),this.unsubscribe.push(z.subscribeKey(`isFetchingTokenBalances`,e=>this.isFetchingTokenBalances=e)),this.unsubscribe.push(b.subscribeKey(`activeConnectorIds`,e=>this.activeConnectorIds=e)),this.unsubscribe.push(z.subscribeKey(`selectedPaymentAsset`,e=>this.selectedPaymentAsset=e)),this.unsubscribe.push(z.subscribeKey(`isFetchingQuote`,e=>this.isFetchingQuote=e)),this.unsubscribe.push(z.subscribeKey(`quoteError`,e=>this.quoteError=e)),this.unsubscribe.push(z.subscribeKey(`quote`,e=>this.quote=e)),this.unsubscribe.push(z.subscribeKey(`amount`,e=>this.amount=e)),this.unsubscribe.push(z.subscribeKey(`recipient`,e=>this.recipient=e)),this.unsubscribe.push(z.subscribeKey(`isPaymentInProgress`,e=>this.isPaymentInProgress=e)),this.unsubscribe.push(z.subscribeKey(`selectedExchange`,e=>this.selectedExchange=e)),this.unsubscribe.push(z.subscribeKey(`exchangeUrlForQuote`,e=>this.exchangeUrlForQuote=e)),this.resetQuoteState(),this.initializeNamespace(),this.fetchTokens()}disconnectedCallback(){super.disconnectedCallback(),this.resetAssetsState(),this.unsubscribe.forEach(e=>e())}updated(e){super.updated(e),e.has(`selectedPaymentAsset`)&&this.fetchQuote()}render(){return a`
      <wui-flex flexDirection="column">
        ${this.profileTemplate()}

        <wui-flex
          flexDirection="column"
          gap="4"
          class="payment-methods-container"
          .padding=${[`4`,`4`,`5`,`4`]}
        >
          ${this.paymentOptionsViewTemplate()} ${this.amountWithFeeTemplate()}

          <wui-flex
            alignItems="center"
            justifyContent="space-between"
            .padding=${[`1`,`0`,`1`,`0`]}
          >
            <wui-separator></wui-separator>
          </wui-flex>

          ${this.paymentActionsTemplate()}
        </wui-flex>
      </wui-flex>
    `}profileTemplate(){if(this.selectedExchange){let e=_.formatNumber(this.quote?.origin.amount,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return a`
        <wui-flex
          .padding=${[`4`,`3`,`4`,`3`]}
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-text variant="lg-regular" color="secondary">Paying with</wui-text>

          ${this.quote?a`<wui-text variant="lg-regular" color="primary">
                ${_.bigNumber(e,{safe:!0}).round(6).toString()}
                ${this.quote.origin.currency.metadata.symbol}
              </wui-text>`:a`<wui-shimmer width="80px" height="18px" variant="light"></wui-shimmer>`}
        </wui-flex>
      `}let e=h.getPlainAddress(this.caipAddress)??``,{name:t,image:n}=this.getWalletProperties({namespace:this.namespace}),{icon:r,label:i}=bn[this.namespace]??{};return a`
      <wui-flex
        .padding=${[`4`,`3`,`4`,`3`]}
        alignItems="center"
        justifyContent="space-between"
        gap="2"
      >
        <wui-wallet-switch
          profileName=${d(this.profileName)}
          address=${d(e)}
          imageSrc=${d(n)}
          alt=${d(t)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        <wui-wallet-switch
          profileName=${d(i)}
          address=${d(e)}
          icon=${d(r)}
          iconSize="xs"
          .enableGreenCircle=${!1}
          alt=${d(i)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `}initializeNamespace(){let e=S.state.activeChain;this.namespace=e,this.caipAddress=S.getAccountData(e)?.caipAddress,this.profileName=S.getAccountData(e)?.profileName??null,this.unsubscribe.push(S.subscribeChainProp(`accountState`,e=>this.onAccountStateChanged(e),e))}async fetchTokens(){if(this.namespace){let e;if(this.caipAddress){let{chainId:t,chainNamespace:n}=p.parseCaipAddress(this.caipAddress),r=`${n}:${t}`;e=S.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===r)}await z.fetchTokens({caipAddress:this.caipAddress,caipNetwork:e,namespace:this.namespace})}}fetchQuote(){if(this.amount&&this.recipient&&this.selectedPaymentAsset&&this.paymentAsset){let{address:e}=this.caipAddress?p.parseCaipAddress(this.caipAddress):{};z.fetchQuote({amount:this.amount.toString(),address:e,sourceToken:this.selectedPaymentAsset,toToken:this.paymentAsset,recipient:this.recipient})}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let n=b.getConnector({id:t,namespace:e});if(!n)return{name:void 0,image:void 0};let r=f.getConnectorImage(n);return{name:n.name,image:r}}paymentOptionsViewTemplate(){return a`
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>
        <wui-flex class="pay-options-container">${this.paymentOptionsTemplate()}</wui-flex>
      </wui-flex>
    `}paymentOptionsTemplate(){let e=this.getPaymentAssetFromTokenBalances();return this.isFetchingTokenBalances?a`<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`:e.length===0?a`<w3m-pay-options-empty
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-empty>`:a`<w3m-pay-options
      class=${ee({disabled:this.isFetchingQuote})}
      .options=${e}
      .selectedPaymentAsset=${d(this.selectedPaymentAsset)}
      .onSelect=${this.onSelectedPaymentAssetChanged.bind(this)}
    ></w3m-pay-options>`}amountWithFeeTemplate(){return this.isFetchingQuote||!this.selectedPaymentAsset||this.quoteError?a`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`:a`<w3m-pay-fees></w3m-pay-fees>`}paymentActionsTemplate(){let e=this.isFetchingQuote||this.isFetchingTokenBalances,t=this.isFetchingQuote||this.isFetchingTokenBalances||!this.selectedPaymentAsset||!!this.quoteError,n=_.formatNumber(this.quote?.origin.amount??0,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return this.selectedExchange?e||t?a`
          <wui-shimmer width="100%" height="48px" variant="light" ?rounded=${!0}></wui-shimmer>
        `:a`<wui-button
        size="lg"
        fullWidth
        variant="accent-secondary"
        @click=${this.onPayWithExchange.bind(this)}
      >
        ${`Continue in ${this.selectedExchange.name}`}

        <wui-icon name="arrowRight" color="inherit" size="sm" slot="iconRight"></wui-icon>
      </wui-button>`:a`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${e||t?a`<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`:a`<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">${Nt(n)}</wui-text>

                <wui-text variant="lg-regular" color="secondary">
                  ${this.quote?.origin.currency.metadata.symbol||`Unknown`}
                </wui-text>
              </wui-flex>`}
        </wui-flex>

        ${this.actionButtonTemplate({isLoading:e,isDisabled:t})}
      </wui-flex>
    `}actionButtonTemplate(e){let t=pt(this.quote),{isLoading:n,isDisabled:r}=e,i=`Pay`;return t.length>1&&this.completedTransactionsCount===0&&(i=`Approve`),a`
      <wui-button
        size="lg"
        variant="accent-primary"
        ?loading=${n||this.isPaymentInProgress}
        ?disabled=${r||this.isPaymentInProgress}
        @click=${()=>{t.length>0?this.onSendTransactions():this.onTransfer()}}
      >
        ${i}
        ${n?null:a`<wui-icon
              name="arrowRight"
              color="inherit"
              size="sm"
              slot="iconRight"
            ></wui-icon>`}
      </wui-button>
    `}getPaymentAssetFromTokenBalances(){return this.namespace?(this.tokenBalances[this.namespace]??[]).map(e=>{try{return jt(e)}catch{return null}}).filter(e=>!!e).filter(e=>{let{chainId:t}=p.parseCaipNetworkId(e.network),{chainId:n}=p.parseCaipNetworkId(this.paymentAsset.network);return D.isLowerCaseMatch(e.asset,this.paymentAsset.asset)?!0:this.selectedExchange?!D.isLowerCaseMatch(t.toString(),n.toString()):!0}):[]}onTokenBalancesChanged(e){this.tokenBalances=e;let[t]=this.getPaymentAssetFromTokenBalances();t&&z.setSelectedPaymentAsset(t)}async onConnectOtherWallet(){await b.connect(),await C.open({view:`PayQuote`})}onAccountStateChanged(e){let{address:t}=this.caipAddress?p.parseCaipAddress(this.caipAddress):{};if(this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null,t){let{address:e}=this.caipAddress?p.parseCaipAddress(this.caipAddress):{};e?D.isLowerCaseMatch(e,t)||(this.resetAssetsState(),this.resetQuoteState(),this.fetchTokens()):C.close()}}onSelectedPaymentAssetChanged(e){this.isFetchingQuote||z.setSelectedPaymentAsset(e)}async onTransfer(){let e=ft(this.quote);if(e){if(!D.isLowerCaseMatch(this.selectedPaymentAsset?.asset,e.deposit.currency))throw Error(`Quote asset is not the same as the selected payment asset`);let t=this.selectedPaymentAsset?.amount??`0`,n=_.formatNumber(e.deposit.amount,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!_.bigNumber(t).gte(n)){g.showError(`Insufficient funds`);return}if(this.quote&&this.selectedPaymentAsset&&this.caipAddress&&this.namespace){let{address:t}=p.parseCaipAddress(this.caipAddress);await z.onTransfer({chainNamespace:this.namespace,fromAddress:t,toAddress:e.deposit.receiver,amount:n,paymentAsset:this.selectedPaymentAsset}),z.setRequestId(e.requestId),v.push(`PayLoading`)}}}async onSendTransactions(){let e=this.selectedPaymentAsset?.amount??`0`,t=_.formatNumber(this.quote?.origin.amount??0,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!_.bigNumber(e).gte(t)){g.showError(`Insufficient funds`);return}let n=pt(this.quote),[r]=pt(this.quote,this.completedTransactionsCount);r&&this.namespace&&(await z.onSendTransaction({namespace:this.namespace,transactionStep:r}),this.completedTransactionsCount+=1,this.completedTransactionsCount===n.length&&(z.setRequestId(r.requestId),v.push(`PayLoading`)))}onPayWithExchange(){if(this.exchangeUrlForQuote){let e=h.returnOpenHref(``,`popupWindow`,`scrollbar=yes,width=480,height=720`);if(!e)throw Error(`Could not create popup window`);e.location.href=this.exchangeUrlForQuote;let t=ft(this.quote);t&&z.setRequestId(t.requestId),z.initiatePayment(),v.push(`PayLoading`)}}resetAssetsState(){z.setSelectedPaymentAsset(null)}resetQuoteState(){z.resetQuoteState()}};K.styles=vn,G([l()],K.prototype,`profileName`,void 0),G([l()],K.prototype,`paymentAsset`,void 0),G([l()],K.prototype,`namespace`,void 0),G([l()],K.prototype,`caipAddress`,void 0),G([l()],K.prototype,`amount`,void 0),G([l()],K.prototype,`recipient`,void 0),G([l()],K.prototype,`activeConnectorIds`,void 0),G([l()],K.prototype,`selectedPaymentAsset`,void 0),G([l()],K.prototype,`selectedExchange`,void 0),G([l()],K.prototype,`isFetchingQuote`,void 0),G([l()],K.prototype,`quoteError`,void 0),G([l()],K.prototype,`quote`,void 0),G([l()],K.prototype,`isFetchingTokenBalances`,void 0),G([l()],K.prototype,`tokenBalances`,void 0),G([l()],K.prototype,`isPaymentInProgress`,void 0),G([l()],K.prototype,`exchangeUrlForQuote`,void 0),G([l()],K.prototype,`completedTransactionsCount`,void 0),K=G([T(`w3m-pay-quote-view`)],K);var xn=O`
  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  .transfers-badge {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }
`,Sn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Cn=class extends s{constructor(){super(),this.unsubscribe=[],this.paymentAsset=z.state.paymentAsset,this.amount=z.state.amount,this.unsubscribe.push(z.subscribeKey(`paymentAsset`,e=>{this.paymentAsset=e}),z.subscribeKey(`amount`,e=>{this.amount=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=S.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network);return a`<wui-flex
      alignItems="center"
      gap="1"
      .padding=${[`1`,`2`,`1`,`1`]}
      class="transfers-badge"
    >
      <wui-image src=${d(this.paymentAsset.metadata.logoURI)} size="xl"></wui-image>
      <wui-text variant="lg-regular" color="primary">
        ${this.amount} ${this.paymentAsset.metadata.symbol}
      </wui-text>
      <wui-text variant="sm-regular" color="secondary">
        on ${e?.name??`Unknown`}
      </wui-text>
    </wui-flex>`}};Cn.styles=[xn],Sn([u()],Cn.prototype,`paymentAsset`,void 0),Sn([u()],Cn.prototype,`amount`,void 0),Cn=Sn([T(`w3m-pay-header`)],Cn);var wn=O`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:e})=>e[`ease-out-power-2`]},
      slide-down-in 120ms forwards ${({easings:e})=>e[`ease-out-power-2`]};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:e})=>e[`ease-out-power-2`]},
      slide-up-in 120ms forwards ${({easings:e})=>e[`ease-out-power-2`]};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`,Tn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},En=[`SmartSessionList`],Dn={PayWithExchange:be.tokens.theme.foregroundPrimary};function On(){let e=v.state.data?.connector?.name,t=v.state.data?.wallet?.name,n=v.state.data?.network?.name,r=t??e,i=b.getConnectors(),a=i.length===1&&i[0]?.id===`w3m-email`,o=S.getAccountData()?.socialProvider,s=o?o.charAt(0).toUpperCase()+o.slice(1):`Connect Social`;return{Connect:`Connect ${a?`Email`:``} Wallet`,Create:`Create Wallet`,ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:`All Wallets`,ApproveTransaction:`Approve Transaction`,BuyInProgress:`Buy`,UsageExceeded:`Usage Exceeded`,ConnectingExternal:r??`Connect Wallet`,ConnectingWalletConnect:r??`WalletConnect`,ConnectingWalletConnectBasic:`WalletConnect`,ConnectingSiwe:`Sign In`,Convert:`Convert`,ConvertSelectToken:`Select token`,ConvertPreview:`Preview Convert`,Downloads:r?`Get ${r}`:`Downloads`,EmailLogin:`Email Login`,EmailVerifyOtp:`Confirm Email`,EmailVerifyDevice:`Register Device`,GetWallet:`Get a Wallet`,Networks:`Choose Network`,OnRampProviders:`Choose Provider`,OnRampActivity:`Activity`,OnRampTokenSelect:`Select Token`,OnRampFiatSelect:`Select Currency`,Pay:`How you pay`,ProfileWallets:`Wallets`,SwitchNetwork:n??`Switch Network`,Transactions:`Activity`,UnsupportedChain:`Switch Network`,UpgradeEmailWallet:`Upgrade Your Wallet`,UpdateEmailWallet:`Edit Email`,UpdateEmailPrimaryOtp:`Confirm Current Email`,UpdateEmailSecondaryOtp:`Confirm New Email`,WhatIsABuy:`What is Buy?`,RegisterAccountName:`Choose Name`,RegisterAccountNameSuccess:``,WalletReceive:`Receive`,WalletCompatibleNetworks:`Compatible Networks`,Swap:`Swap`,SwapSelectToken:`Select Token`,SwapPreview:`Preview Swap`,WalletSend:`Send`,WalletSendPreview:`Review Send`,WalletSendSelectToken:`Select Token`,WalletSendConfirmed:`Confirmed`,WhatIsANetwork:`What is a network?`,WhatIsAWallet:`What is a Wallet?`,ConnectWallets:`Connect Wallet`,ConnectSocials:`All Socials`,ConnectingSocial:s,ConnectingMultiChain:`Select Chain`,ConnectingFarcaster:`Farcaster`,SwitchActiveChain:`Switch Chain`,SmartSessionCreated:void 0,SmartSessionList:`Smart Sessions`,SIWXSignMessage:`Sign In`,PayLoading:`Processing payment...`,PayQuote:`Payment Quote`,DataCapture:`Profile`,DataCaptureOtpConfirm:`Confirm Email`,FundWallet:`Fund Wallet`,PayWithExchange:`Deposit from Exchange`,PayWithExchangeSelectAsset:`Select Asset`,SmartAccountSettings:`Smart Account Settings`}}var q=class extends s{constructor(){super(),this.unsubscribe=[],this.heading=On()[v.state.view],this.network=S.state.activeCaipNetwork,this.networkImage=f.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=v.state.view,this.viewDirection=``,this.unsubscribe.push(ge.subscribeNetworkImages(()=>{this.networkImage=f.getNetworkImage(this.network)}),v.subscribeKey(`view`,e=>{setTimeout(()=>{this.view=e,this.heading=On()[e]},qe.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),S.subscribeKey(`activeCaipNetwork`,e=>{this.network=e,this.networkImage=f.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=Dn[v.state.view]??be.tokens.theme.backgroundPrimary;return this.style.setProperty(`--local-header-background-color`,e),a`
      <wui-flex
        .padding=${[`0`,`4`,`0`,`4`]}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){w.sendEvent({type:`track`,event:`CLICK_WALLET_HELP`}),v.push(`WhatIsAWallet`)}async onClose(){await Oe.safeClose()}rightHeaderTemplate(){let e=x?.state?.features?.smartSessions;return v.state.view!==`Account`||!e?this.closeButtonTemplate():a`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>v.push(`SmartSessionList`)}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `}closeButtonTemplate(){return a`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){if(this.view===`PayQuote`)return a`<w3m-pay-header></w3m-pay-header>`;let e=En.includes(this.view);return a`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${e?a`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){let{view:e}=v.state,t=e===`Connect`,n=x.state.enableEmbedded,r=e===`ApproveTransaction`,i=e===`ConnectingSiwe`,o=e===`Account`,s=x.state.enableNetworkSwitch,c=r||i||t&&n;return o&&s?a`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${d(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${d(this.networkImage)}
      ></wui-select>`:this.showBack&&!c?a`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:a`<wui-icon-button
      data-hidden=${!t}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(w.sendEvent({type:`track`,event:`CLICK_NETWORKS`}),v.push(`Networks`))}isAllowedNetworkSwitch(){let e=S.getAllRequestedCaipNetworks(),t=e?e.length>1:!1,n=e?.find(({id:e})=>e===this.network?.id);return t||!n}onViewChange(){let{history:e}=v.state,t=qe.VIEW_DIRECTION.Next;e.length<this.prevHistoryLength&&(t=qe.VIEW_DIRECTION.Prev),this.prevHistoryLength=e.length,this.viewDirection=t}async onHistoryChange(){let{history:e}=v.state,t=this.shadowRoot?.querySelector(`#dynamic`);e.length>1&&!this.showBack&&t?(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:`forwards`,easing:`ease`}).finished,this.showBack=!0,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:`forwards`,easing:`ease`})):e.length<=1&&this.showBack&&t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:`forwards`,easing:`ease`}).finished,this.showBack=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:`forwards`,easing:`ease`}))}onGoBack(){v.goBack()}};q.styles=wn,Tn([l()],q.prototype,`heading`,void 0),Tn([l()],q.prototype,`network`,void 0),Tn([l()],q.prototype,`networkImage`,void 0),Tn([l()],q.prototype,`showBack`,void 0),Tn([l()],q.prototype,`prevHistoryLength`,void 0),Tn([l()],q.prototype,`view`,void 0),Tn([l()],q.prototype,`viewDirection`,void 0),q=Tn([T(`w3m-header`)],q);var kn=O`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[2]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:e})=>e.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    border-radius: ${({borderRadius:e})=>e.round} !important;
  }
`,An=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},jn=class extends s{constructor(){super(...arguments),this.message=``,this.variant=`success`}render(){return a`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return this.variant===`loading`?a`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:a`<wui-icon-box
      size="md"
      color=${{success:`success`,error:`error`,warning:`warning`,info:`default`}[this.variant]}
      icon=${{success:`checkmark`,error:`warning`,warning:`warningCircle`,info:`info`}[this.variant]}
    ></wui-icon-box>`}};jn.styles=[E,kn],An([u()],jn.prototype,`message`,void 0),An([u()],jn.prototype,`variant`,void 0),jn=An([T(`wui-snackbar`)],jn);var Mn=c`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`,Nn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Pn=class extends s{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=g.state.open,this.unsubscribe.push(g.subscribeKey(`open`,e=>{this.open=e,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t}=g.state;return a` <wui-snackbar message=${e} variant=${t}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:`translateX(-50%) scale(0.85)`},{opacity:1,transform:`translateX(-50%) scale(1)`}],{duration:150,fill:`forwards`,easing:`ease`}),this.timeout&&clearTimeout(this.timeout),g.state.autoClose&&(this.timeout=setTimeout(()=>g.hide(),2500))):this.animate([{opacity:1,transform:`translateX(-50%) scale(1)`},{opacity:0,transform:`translateX(-50%) scale(0.85)`}],{duration:150,fill:`forwards`,easing:`ease`})}};Pn.styles=Mn,Nn([l()],Pn.prototype,`open`,void 0),Pn=Nn([T(`w3m-snackbar`)],Pn);var Fn=c`
  :host {
    width: 100%;
    display: block;
  }
`,In=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Ln=class extends s{constructor(){super(),this.unsubscribe=[],this.text=``,this.open=N.state.open,this.unsubscribe.push(v.subscribeKey(`view`,()=>{N.hide()}),C.subscribeKey(`open`,e=>{e||N.hide()}),N.subscribeKey(`open`,e=>{this.open=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),N.hide()}render(){return a`
      <div
        @pointermove=${this.onMouseEnter.bind(this)}
        @pointerleave=${this.onMouseLeave.bind(this)}
      >
        ${this.renderChildren()}
      </div>
    `}renderChildren(){return a`<slot></slot> `}onMouseEnter(){let e=this.getBoundingClientRect();if(!this.open){let t=document.querySelector(`w3m-modal`),n={width:e.width,height:e.height,left:e.left,top:e.top};if(t){let r=t.getBoundingClientRect();n.left=e.left-(window.innerWidth-r.width)/2,n.top=e.top-(window.innerHeight-r.height)/2}N.showTooltip({message:this.text,triggerRect:n,variant:`shade`})}}onMouseLeave(e){this.contains(e.relatedTarget)||N.hide()}};Ln.styles=[Fn],In([u()],Ln.prototype,`text`,void 0),In([l()],Ln.prototype,`open`,void 0),Ln=In([T(`w3m-tooltip-trigger`)],Ln);var Rn=O`
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
`,zn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Bn=class extends s{constructor(){super(),this.unsubscribe=[],this.open=N.state.open,this.message=N.state.message,this.triggerRect=N.state.triggerRect,this.variant=N.state.variant,this.unsubscribe.push(N.subscribe(e=>{this.open=e.open,this.message=e.message,this.triggerRect=e.triggerRect,this.variant=e.variant}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){this.dataset.variant=this.variant;let e=this.triggerRect.top,t=this.triggerRect.left;return this.style.cssText=`
    --w3m-tooltip-top: ${e}px;
    --w3m-tooltip-left: ${t}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;
    --w3m-tooltip-display: ${this.open?`flex`:`none`};
    --w3m-tooltip-opacity: ${+!!this.open};
    `,a`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};Bn.styles=[Rn],zn([l()],Bn.prototype,`open`,void 0),zn([l()],Bn.prototype,`message`,void 0),zn([l()],Bn.prototype,`triggerRect`,void 0),zn([l()],Bn.prototype,`variant`,void 0),Bn=zn([T(`w3m-tooltip`)],Bn);var Vn={getTabsByNamespace(e){return e&&e===m.CHAIN.EVM?x.state.remoteFeatures?.activity===!1?qe.ACCOUNT_TABS.filter(e=>e.label!==`Activity`):qe.ACCOUNT_TABS:[]},isValidReownName(e){return/^[a-zA-Z0-9]+$/gu.test(e)},isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(e)},validateReownName(e){return e.replace(/\^/gu,``).toLowerCase().replace(/[^a-zA-Z0-9]/gu,``)},hasFooter(){let e=v.state.view;if(qe.VIEWS_WITH_LEGAL_FOOTER.includes(e)){let{termsConditionsUrl:e,privacyPolicyUrl:t}=x.state,n=x.state.features?.legalCheckbox;return!(!e&&!t||n)}return qe.VIEWS_WITH_DEFAULT_FOOTER.includes(e)}},Hn=O`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:e})=>e[3]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:e})=>e.core.textAccentPrimary};
    font-weight: 500;
  }
`,Un=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Wn=class extends s{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=x.state.remoteFeatures,this.unsubscribe.push(x.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=x.state,n=x.state.features?.legalCheckbox;return!e&&!t||n?a`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `:a`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${[`4`,`3`,`3`,`3`]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}andTemplate(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=x.state;return e&&t?`and`:``}termsTemplate(){let{termsConditionsUrl:e}=x.state;return e?a`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){let{privacyPolicyUrl:e}=x.state;return e?a`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(e=!1){return this.remoteFeatures?.reownBranding?e?a`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:a`<wui-ux-by-reown></wui-ux-by-reown>`:null}};Wn.styles=[Hn],Un([l()],Wn.prototype,`remoteFeatures`,void 0),Wn=Un([T(`w3m-legal-footer`)],Wn);var Gn=c``,Kn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},qn=class extends s{render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=x.state;return!e&&!t?null:a`
      <wui-flex
        .padding=${[`4`,`3`,`3`,`3`]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `}howDoesItWorkTemplate(){return a` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){w.sendEvent({type:`track`,event:`SELECT_WHAT_IS_A_BUY`,properties:{isSmartAccount:fe(S.state.activeChain)===de.ACCOUNT_TYPES.SMART_ACCOUNT}}),v.push(`WhatIsABuy`)}};qn.styles=[Gn],qn=Kn([T(`w3m-onramp-providers-footer`)],qn);var Jn=O`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`,Yn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Xn=class extends s{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status=`hide`,this.view=v.state.view}firstUpdated(){this.status=Vn.hasFooter()?`show`:`hide`,this.unsubscribe.push(v.subscribeKey(`view`,e=>{this.view=e,this.status=Vn.hasFooter()?`show`:`hide`,this.status===`hide`&&document.documentElement.style.setProperty(`--apkt-footer-height`,`0px`)})),this.resizeObserver=new ResizeObserver(e=>{for(let t of e)if(t.target===this.getWrapper()){let e=`${t.contentRect.height}px`;document.documentElement.style.setProperty(`--apkt-footer-height`,e)}}),this.resizeObserver.observe(this.getWrapper())}render(){return a`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return Vn.hasFooter()?a` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case`Networks`:return this.templateNetworksFooter();case`Connect`:case`ConnectWallets`:case`OnRampFiatSelect`:case`OnRampTokenSelect`:return a`<w3m-legal-footer></w3m-legal-footer>`;case`OnRampProviders`:return a`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return a` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){w.sendEvent({type:`track`,event:`CLICK_NETWORK_HELP`}),v.push(`WhatIsANetwork`)}getWrapper(){return this.shadowRoot?.querySelector(`div.container`)}};Xn.styles=[Jn],Yn([l()],Xn.prototype,`status`,void 0),Yn([l()],Xn.prototype,`view`,void 0),Xn=Yn([T(`w3m-footer`)],Xn);var Zn=O`
  :host {
    display: block;
    width: inherit;
  }
`,Qn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$n=class extends s{constructor(){super(),this.unsubscribe=[],this.viewState=v.state.view,this.history=v.state.history.join(`,`),this.unsubscribe.push(v.subscribeKey(`view`,()=>{this.history=v.state.history.join(`,`),document.documentElement.style.setProperty(`--apkt-duration-dynamic`,`var(--apkt-durations-lg)`)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),document.documentElement.style.setProperty(`--apkt-duration-dynamic`,`0s`)}render(){return a`${this.templatePageContainer()}`}templatePageContainer(){return a`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=v.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(e){switch(e){case`AccountSettings`:return a`<w3m-account-settings-view></w3m-account-settings-view>`;case`Account`:return a`<w3m-account-view></w3m-account-view>`;case`AllWallets`:return a`<w3m-all-wallets-view></w3m-all-wallets-view>`;case`ApproveTransaction`:return a`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case`BuyInProgress`:return a`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case`ChooseAccountName`:return a`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case`Connect`:return a`<w3m-connect-view></w3m-connect-view>`;case`Create`:return a`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case`ConnectingWalletConnect`:return a`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case`ConnectingWalletConnectBasic`:return a`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case`ConnectingExternal`:return a`<w3m-connecting-external-view></w3m-connecting-external-view>`;case`ConnectingSiwe`:return a`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case`ConnectWallets`:return a`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case`ConnectSocials`:return a`<w3m-connect-socials-view></w3m-connect-socials-view>`;case`ConnectingSocial`:return a`<w3m-connecting-social-view></w3m-connecting-social-view>`;case`DataCapture`:return a`<w3m-data-capture-view></w3m-data-capture-view>`;case`DataCaptureOtpConfirm`:return a`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case`Downloads`:return a`<w3m-downloads-view></w3m-downloads-view>`;case`EmailLogin`:return a`<w3m-email-login-view></w3m-email-login-view>`;case`EmailVerifyOtp`:return a`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case`EmailVerifyDevice`:return a`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case`GetWallet`:return a`<w3m-get-wallet-view></w3m-get-wallet-view>`;case`Networks`:return a`<w3m-networks-view></w3m-networks-view>`;case`SwitchNetwork`:return a`<w3m-network-switch-view></w3m-network-switch-view>`;case`ProfileWallets`:return a`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case`Transactions`:return a`<w3m-transactions-view></w3m-transactions-view>`;case`OnRampProviders`:return a`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case`OnRampTokenSelect`:return a`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case`OnRampFiatSelect`:return a`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case`UpgradeEmailWallet`:return a`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case`UpdateEmailWallet`:return a`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case`UpdateEmailPrimaryOtp`:return a`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case`UpdateEmailSecondaryOtp`:return a`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case`UnsupportedChain`:return a`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case`Swap`:return a`<w3m-swap-view></w3m-swap-view>`;case`SwapSelectToken`:return a`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case`SwapPreview`:return a`<w3m-swap-preview-view></w3m-swap-preview-view>`;case`WalletSend`:return a`<w3m-wallet-send-view></w3m-wallet-send-view>`;case`WalletSendSelectToken`:return a`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case`WalletSendPreview`:return a`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case`WalletSendConfirmed`:return a`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case`WhatIsABuy`:return a`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case`WalletReceive`:return a`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case`WalletCompatibleNetworks`:return a`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case`WhatIsAWallet`:return a`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case`ConnectingMultiChain`:return a`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case`WhatIsANetwork`:return a`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case`ConnectingFarcaster`:return a`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case`SwitchActiveChain`:return a`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case`RegisterAccountName`:return a`<w3m-register-account-name-view></w3m-register-account-name-view>`;case`RegisterAccountNameSuccess`:return a`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case`SmartSessionCreated`:return a`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case`SmartSessionList`:return a`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case`SIWXSignMessage`:return a`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case`Pay`:return a`<w3m-pay-view></w3m-pay-view>`;case`PayLoading`:return a`<w3m-pay-loading-view></w3m-pay-loading-view>`;case`PayQuote`:return a`<w3m-pay-quote-view></w3m-pay-quote-view>`;case`FundWallet`:return a`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case`PayWithExchange`:return a`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case`PayWithExchangeSelectAsset`:return a`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`;case`UsageExceeded`:return a`<w3m-usage-exceeded-view></w3m-usage-exceeded-view>`;case`SmartAccountSettings`:return a`<w3m-smart-account-settings-view></w3m-smart-account-settings-view>`;default:return a`<w3m-connect-view></w3m-connect-view>`}}};$n.styles=[Zn],Qn([l()],$n.prototype,`viewState`,void 0),Qn([l()],$n.prototype,`history`,void 0),$n=Qn([T(`w3m-router`)],$n);var er=O`
  :host {
    z-index: ${({tokens:e})=>e.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:e})=>e.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      backdrop-filter ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    transition-delay: ${({durations:e})=>e.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:e})=>e.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:e})=>e[`ease-out-power-2`]};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:e})=>e[`ease-out-power-2`]};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      w3m-shake ${({durations:e})=>e.xl}
        ${({easings:e})=>e[`ease-out-power-2`]};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:e})=>e[`ease-out-power-2`]};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
  }
`,J=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},tr=`scroll-lock`,nr={PayWithExchange:`0`,PayWithExchangeSelectAsset:`0`,Pay:`0`,PayQuote:`0`,PayLoading:`0`},Y=class extends s{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=x.state.enableEmbedded,this.open=C.state.open,this.caipAddress=S.state.activeCaipAddress,this.caipNetwork=S.state.activeCaipNetwork,this.shake=C.state.shake,this.filterByNamespace=b.state.filterByNamespace,this.padding=be.spacing[1],this.mobileFullScreen=x.state.enableMobileFullScreen,this.initializeTheming(),se.prefetchAnalyticsConfig(),this.unsubscribe.push(C.subscribeKey(`open`,e=>e?this.onOpen():this.onClose()),C.subscribeKey(`shake`,e=>this.shake=e),S.subscribeKey(`activeCaipNetwork`,e=>this.onNewNetwork(e)),S.subscribeKey(`activeCaipAddress`,e=>this.onNewAddress(e)),x.subscribeKey(`enableEmbedded`,e=>this.enableEmbedded=e),b.subscribeKey(`filterByNamespace`,e=>{this.filterByNamespace!==e&&!S.getAccountData(e)?.caipAddress&&(se.fetchRecommendedWallets(),this.filterByNamespace=e)}),v.subscribeKey(`view`,()=>{this.dataset.border=Vn.hasFooter()?`true`:`false`,this.padding=nr[v.state.view]??be.spacing[1]}))}firstUpdated(){if(this.dataset.border=Vn.hasFooter()?`true`:`false`,this.mobileFullScreen&&this.setAttribute(`data-mobile-fullscreen`,`true`),this.caipAddress){if(this.enableEmbedded){C.close(),this.prefetch();return}this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.style.setProperty(`--local-modal-padding`,this.padding),this.enableEmbedded?a`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?a`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return a` <wui-card
      shake="${this.shake}"
      data-embedded="${d(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){if(e.target===e.currentTarget){if(this.mobileFullScreen)return;await this.handleClose()}}async handleClose(){await Oe.safeClose()}initializeTheming(){let{themeVariables:e,themeMode:t}=le.state;Ce(e,Se.getColorTheme(t))}onClose(){this.open=!1,this.classList.remove(`open`),this.onScrollUnlock(),g.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add(`open`),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){let e=document.createElement(`style`);e.dataset.w3m=tr,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){let e=document.head.querySelector(`style[data-w3m="${tr}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;let e=this.shadowRoot?.querySelector(`wui-card`);e?.focus(),window.addEventListener(`keydown`,t=>{if(t.key===`Escape`)this.handleClose();else if(t.key===`Tab`){let{tagName:n}=t.target;n&&!n.includes(`W3M-`)&&!n.includes(`WUI-`)&&e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(e){let t=S.state.isSwitchingNamespace,n=v.state.view===`ProfileWallets`;!e&&!t&&!n&&C.close(),await _e.initializeIfEnabled(e),this.caipAddress=e,S.setIsSwitchingNamespace(!1)}onNewNetwork(e){let t=this.caipNetwork?.caipNetworkId?.toString()!==e?.caipNetworkId?.toString(),n=v.state.view===`UnsupportedChain`,r=C.state.open,i=!1;this.enableEmbedded&&v.state.view===`SwitchNetwork`&&(i=!0),t&&j.resetState(),r&&n&&(i=!0),i&&v.state.view!==`SIWXSignMessage`&&v.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||=(se.prefetch(),se.fetchWalletsByPage({page:1}),!0)}};Y.styles=er,J([u({type:Boolean})],Y.prototype,`enableEmbedded`,void 0),J([l()],Y.prototype,`open`,void 0),J([l()],Y.prototype,`caipAddress`,void 0),J([l()],Y.prototype,`caipNetwork`,void 0),J([l()],Y.prototype,`shake`,void 0),J([l()],Y.prototype,`filterByNamespace`,void 0),J([l()],Y.prototype,`padding`,void 0),J([l()],Y.prototype,`mobileFullScreen`,void 0);var rr=class extends Y{};rr=J([T(`w3m-modal`)],rr);var ir=class extends Y{};ir=J([T(`appkit-modal`)],ir);var ar=O`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: ${({borderRadius:e})=>e[5]};
    background-color: ${({colors:e})=>e.semanticError010};
  }
`,or=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},sr=class extends s{constructor(){super()}render(){return a`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${[`1`,`3`,`4`,`3`]}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="error" name="warningCircle"></wui-icon>
        </wui-flex>

        <wui-text variant="lg-medium" color="primary" align="center">
          The app isn't responding as expected
        </wui-text>
        <wui-text variant="md-regular" color="secondary" align="center">
          Try again or reach out to the app team for help.
        </wui-text>

        <wui-button
          variant="neutral-secondary"
          size="md"
          @click=${this.onTryAgainClick.bind(this)}
          data-testid="w3m-usage-exceeded-button"
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try Again
        </wui-button>
      </wui-flex>
    `}onTryAgainClick(){v.goBack()}};sr.styles=ar,sr=or([T(`w3m-usage-exceeded-view`)],sr);var cr=O`
  :host {
    width: 100%;
  }
`,X=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Z=class extends s{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc=``,this.name=``,this.size=`md`,this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor=`accent-100`,this.rdnsId=``,this.displayIndex=void 0,this.walletRank=void 0,this.namespaces=[]}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(e){super.updated(e),(e.has(`name`)||e.has(`imageSrc`)||e.has(`walletRank`))&&(this.hasImpressionSent=!1),e.has(`walletRank`)&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&!this.loading&&!this.hasImpressionSent&&this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&=(this.intersectionObserver.disconnect(),void 0)}sendImpressionEvent(){!this.name||this.hasImpressionSent||!this.walletRank||(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&w.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:v.state.view,displayIndex:this.displayIndex}))}handleGetWalletNamespaces(){return Object.keys(pe.state.adapters).length>1?this.namespaces:[]}render(){return a`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${d(this.imageSrc)}
        name=${this.name}
        size=${d(this.size)}
        tagLabel=${d(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
        .namespaces=${this.handleGetWalletNamespaces()}
      ></wui-list-wallet>
    `}};Z.styles=cr,X([u({type:Array})],Z.prototype,`walletImages`,void 0),X([u()],Z.prototype,`imageSrc`,void 0),X([u()],Z.prototype,`name`,void 0),X([u()],Z.prototype,`size`,void 0),X([u()],Z.prototype,`tagLabel`,void 0),X([u()],Z.prototype,`tagVariant`,void 0),X([u()],Z.prototype,`walletIcon`,void 0),X([u()],Z.prototype,`tabIdx`,void 0),X([u({type:Boolean})],Z.prototype,`disabled`,void 0),X([u({type:Boolean})],Z.prototype,`showAllWallets`,void 0),X([u({type:Boolean})],Z.prototype,`loading`,void 0),X([u({type:String})],Z.prototype,`loadingSpinnerColor`,void 0),X([u()],Z.prototype,`rdnsId`,void 0),X([u()],Z.prototype,`displayIndex`,void 0),X([u()],Z.prototype,`walletRank`,void 0),X([u({type:Array})],Z.prototype,`namespaces`,void 0),Z=X([T(`w3m-list-wallet`)],Z);var lr=O`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:e})=>e.lg};
    --local-transition: ${({easings:e})=>e[`ease-out-power-2`]};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`,Q=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ur=60,$=class extends s{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration=`0.15s`,this.transitionFunction=``,this.history=``,this.view=``,this.setView=void 0,this.viewDirection=``,this.historyState=``,this.previousHeight=`0px`,this.mobileFullScreen=x.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(e){if(e.has(`history`)){let e=this.history;this.historyState!==``&&this.historyState!==e&&this.onViewChange(e)}e.has(`transitionDuration`)&&this.style.setProperty(`--local-duration`,this.transitionDuration),e.has(`transitionFunction`)&&this.style.setProperty(`--local-transition`,this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty(`--local-transition`,this.transitionFunction),this.style.setProperty(`--local-duration`,this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(e=>{for(let t of e)if(t.target===this.getWrapper()){let e=t.contentRect.height,n=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--apkt-footer-height`)||`0`);this.mobileFullScreen?(e=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-n,this.style.setProperty(`--local-border-bottom-radius`,`0px`)):(e+=n,this.style.setProperty(`--local-border-bottom-radius`,n?`var(--apkt-borderRadius-5)`:`0px`)),this.style.setProperty(`--local-container-height`,`${e}px`),this.previousHeight!==`0px`&&this.style.setProperty(`--local-duration-height`,this.transitionDuration),this.previousHeight=`${e}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener(`resize`,this.onViewportResize),window.visualViewport?.addEventListener(`resize`,this.onViewportResize)}disconnectedCallback(){let e=this.getWrapper();e&&this.resizeObserver&&this.resizeObserver.unobserve(e),window.removeEventListener(`resize`,this.onViewportResize),window.visualViewport?.removeEventListener(`resize`,this.onViewportResize)}render(){return a`
      <div class="container" data-mobile-fullscreen="${d(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${d(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(e){let t=e.split(`,`).filter(Boolean),n=this.historyState.split(`,`).filter(Boolean),r=n.length,i=t.length,a=t[t.length-1]||``,o=Se.cssDurationToNumber(this.transitionDuration),s=``;i>r?s=`next`:i<r?s=`prev`:i===r&&t[i-1]!==n[r-1]&&(s=`next`),this.viewDirection=`${s}-${a}`,setTimeout(()=>{this.historyState=e,this.setView?.(a)},o),setTimeout(()=>{this.viewDirection=``},o*2)}getWrapper(){return this.shadowRoot?.querySelector(`div.page`)}updateContainerHeight(){let e=this.getWrapper();if(!e)return;let t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--apkt-footer-height`)||`0`),n=0;this.mobileFullScreen?(n=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-t,this.style.setProperty(`--local-border-bottom-radius`,`0px`)):(n=e.getBoundingClientRect().height+t,this.style.setProperty(`--local-border-bottom-radius`,t?`var(--apkt-borderRadius-5)`:`0px`)),this.style.setProperty(`--local-container-height`,`${n}px`),this.previousHeight!==`0px`&&this.style.setProperty(`--local-duration-height`,this.transitionDuration),this.previousHeight=`${n}px`}getHeaderHeight(){return ur}};$.styles=[lr],Q([u({type:String})],$.prototype,`transitionDuration`,void 0),Q([u({type:String})],$.prototype,`transitionFunction`,void 0),Q([u({type:String})],$.prototype,`history`,void 0),Q([u({type:String})],$.prototype,`view`,void 0),Q([u({attribute:!1})],$.prototype,`setView`,void 0),Q([l()],$.prototype,`viewDirection`,void 0),Q([l()],$.prototype,`historyState`,void 0),Q([l()],$.prototype,`previousHeight`,void 0),Q([l()],$.prototype,`mobileFullScreen`,void 0),$=Q([T(`w3m-router-container`)],$);export{ir as AppKitModal,Z as W3mListWallet,rr as W3mModal,Y as W3mModalBase,$ as W3mRouterContainer,sr as W3mUsageExceededView};