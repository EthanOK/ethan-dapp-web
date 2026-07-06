import{d as e,u as t}from"./lit-DYLA5iLF.js";import{K as n,N as r,h as i,n as a}from"./ModalController-BXgD-VWz.js";var o={interpolate(e,t,n){if(e.length!==2||t.length!==2)throw Error(`inputRange and outputRange must be an array of length 2`);let r=e[0]||0,i=e[1]||0,a=t[0]||0,o=t[1]||0;return n<r?a:n>i?o:(o-a)/(i-r)*(n-r)+a}},s={black:`#202020`,white:`#FFFFFF`,white010:`rgba(255, 255, 255, 0.1)`,accent010:`rgba(9, 136, 240, 0.1)`,accent020:`rgba(9, 136, 240, 0.2)`,accent030:`rgba(9, 136, 240, 0.3)`,accent040:`rgba(9, 136, 240, 0.4)`,accent050:`rgba(9, 136, 240, 0.5)`,accent060:`rgba(9, 136, 240, 0.6)`,accent070:`rgba(9, 136, 240, 0.7)`,accent080:`rgba(9, 136, 240, 0.8)`,accent090:`rgba(9, 136, 240, 0.9)`,accent100:`rgba(9, 136, 240, 1.0)`,accentSecondary010:`rgba(199, 185, 148, 0.1)`,accentSecondary020:`rgba(199, 185, 148, 0.2)`,accentSecondary030:`rgba(199, 185, 148, 0.3)`,accentSecondary040:`rgba(199, 185, 148, 0.4)`,accentSecondary050:`rgba(199, 185, 148, 0.5)`,accentSecondary060:`rgba(199, 185, 148, 0.6)`,accentSecondary070:`rgba(199, 185, 148, 0.7)`,accentSecondary080:`rgba(199, 185, 148, 0.8)`,accentSecondary090:`rgba(199, 185, 148, 0.9)`,accentSecondary100:`rgba(199, 185, 148, 1.0)`,productWalletKit:`#FFB800`,productAppKit:`#FF573B`,productCloud:`#0988F0`,productDocumentation:`#008847`,neutrals050:`#F6F6F6`,neutrals100:`#F3F3F3`,neutrals200:`#E9E9E9`,neutrals300:`#D0D0D0`,neutrals400:`#BBB`,neutrals500:`#9A9A9A`,neutrals600:`#6C6C6C`,neutrals700:`#4F4F4F`,neutrals800:`#363636`,neutrals900:`#2A2A2A`,neutrals1000:`#252525`,semanticSuccess010:`rgba(48, 164, 107, 0.1)`,semanticSuccess020:`rgba(48, 164, 107, 0.2)`,semanticSuccess030:`rgba(48, 164, 107, 0.3)`,semanticSuccess040:`rgba(48, 164, 107, 0.4)`,semanticSuccess050:`rgba(48, 164, 107, 0.5)`,semanticSuccess060:`rgba(48, 164, 107, 0.6)`,semanticSuccess070:`rgba(48, 164, 107, 0.7)`,semanticSuccess080:`rgba(48, 164, 107, 0.8)`,semanticSuccess090:`rgba(48, 164, 107, 0.9)`,semanticSuccess100:`rgba(48, 164, 107, 1.0)`,semanticError010:`rgba(223, 74, 52, 0.1)`,semanticError020:`rgba(223, 74, 52, 0.2)`,semanticError030:`rgba(223, 74, 52, 0.3)`,semanticError040:`rgba(223, 74, 52, 0.4)`,semanticError050:`rgba(223, 74, 52, 0.5)`,semanticError060:`rgba(223, 74, 52, 0.6)`,semanticError070:`rgba(223, 74, 52, 0.7)`,semanticError080:`rgba(223, 74, 52, 0.8)`,semanticError090:`rgba(223, 74, 52, 0.9)`,semanticError100:`rgba(223, 74, 52, 1.0)`,semanticWarning010:`rgba(243, 161, 63, 0.1)`,semanticWarning020:`rgba(243, 161, 63, 0.2)`,semanticWarning030:`rgba(243, 161, 63, 0.3)`,semanticWarning040:`rgba(243, 161, 63, 0.4)`,semanticWarning050:`rgba(243, 161, 63, 0.5)`,semanticWarning060:`rgba(243, 161, 63, 0.6)`,semanticWarning070:`rgba(243, 161, 63, 0.7)`,semanticWarning080:`rgba(243, 161, 63, 0.8)`,semanticWarning090:`rgba(243, 161, 63, 0.9)`,semanticWarning100:`rgba(243, 161, 63, 1.0)`},c={core:{backgroundAccentPrimary:`#0988F0`,backgroundAccentCertified:`#C7B994`,backgroundWalletKit:`#FFB800`,backgroundAppKit:`#FF573B`,backgroundCloud:`#0988F0`,backgroundDocumentation:`#008847`,backgroundSuccess:`rgba(48, 164, 107, 0.20)`,backgroundError:`rgba(223, 74, 52, 0.20)`,backgroundWarning:`rgba(243, 161, 63, 0.20)`,textAccentPrimary:`#0988F0`,textAccentCertified:`#C7B994`,textWalletKit:`#FFB800`,textAppKit:`#FF573B`,textCloud:`#0988F0`,textDocumentation:`#008847`,textSuccess:`#30A46B`,textError:`#DF4A34`,textWarning:`#F3A13F`,borderAccentPrimary:`#0988F0`,borderSecondary:`#C7B994`,borderSuccess:`#30A46B`,borderError:`#DF4A34`,borderWarning:`#F3A13F`,foregroundAccent010:`rgba(9, 136, 240, 0.1)`,foregroundAccent020:`rgba(9, 136, 240, 0.2)`,foregroundAccent040:`rgba(9, 136, 240, 0.4)`,foregroundAccent060:`rgba(9, 136, 240, 0.6)`,foregroundSecondary020:`rgba(199, 185, 148, 0.2)`,foregroundSecondary040:`rgba(199, 185, 148, 0.4)`,foregroundSecondary060:`rgba(199, 185, 148, 0.6)`,iconAccentPrimary:`#0988F0`,iconAccentCertified:`#C7B994`,iconSuccess:`#30A46B`,iconError:`#DF4A34`,iconWarning:`#F3A13F`,glass010:`rgba(255, 255, 255, 0.1)`,zIndex:`9999`},dark:{overlay:`rgba(0, 0, 0, 0.50)`,backgroundPrimary:`#202020`,backgroundInvert:`#FFFFFF`,textPrimary:`#FFFFFF`,textSecondary:`#9A9A9A`,textTertiary:`#BBBBBB`,textInvert:`#202020`,borderPrimary:`#2A2A2A`,borderPrimaryDark:`#363636`,borderSecondary:`#4F4F4F`,foregroundPrimary:`#252525`,foregroundSecondary:`#2A2A2A`,foregroundTertiary:`#363636`,iconDefault:`#9A9A9A`,iconInverse:`#FFFFFF`},light:{overlay:`rgba(230 , 230, 230, 0.5)`,backgroundPrimary:`#FFFFFF`,borderPrimaryDark:`#E9E9E9`,backgroundInvert:`#202020`,textPrimary:`#202020`,textSecondary:`#9A9A9A`,textTertiary:`#6C6C6C`,textInvert:`#FFFFFF`,borderPrimary:`#E9E9E9`,borderSecondary:`#D0D0D0`,foregroundPrimary:`#F3F3F3`,foregroundSecondary:`#E9E9E9`,foregroundTertiary:`#D0D0D0`,iconDefault:`#9A9A9A`,iconInverse:`#202020`}},l={colors:s,fontFamily:{regular:`KHTeka`,mono:`KHTekaMono`},fontWeight:{regular:`400`,medium:`500`},textSize:{h1:`50px`,h2:`44px`,h3:`38px`,h4:`32px`,h5:`26px`,h6:`20px`,large:`16px`,medium:`14px`,small:`12px`},typography:{"h1-regular-mono":{lineHeight:`50px`,letterSpacing:`-3px`},"h1-regular":{lineHeight:`50px`,letterSpacing:`-1px`},"h1-medium":{lineHeight:`50px`,letterSpacing:`-0.84px`},"h2-regular-mono":{lineHeight:`44px`,letterSpacing:`-2.64px`},"h2-regular":{lineHeight:`44px`,letterSpacing:`-0.88px`},"h2-medium":{lineHeight:`44px`,letterSpacing:`-0.88px`},"h3-regular-mono":{lineHeight:`38px`,letterSpacing:`-2.28px`},"h3-regular":{lineHeight:`38px`,letterSpacing:`-0.76px`},"h3-medium":{lineHeight:`38px`,letterSpacing:`-0.76px`},"h4-regular-mono":{lineHeight:`32px`,letterSpacing:`-1.92px`},"h4-regular":{lineHeight:`32px`,letterSpacing:`-0.32px`},"h4-medium":{lineHeight:`32px`,letterSpacing:`-0.32px`},"h5-regular-mono":{lineHeight:`26px`,letterSpacing:`-1.56px`},"h5-regular":{lineHeight:`26px`,letterSpacing:`-0.26px`},"h5-medium":{lineHeight:`26px`,letterSpacing:`-0.26px`},"h6-regular-mono":{lineHeight:`20px`,letterSpacing:`-1.2px`},"h6-regular":{lineHeight:`20px`,letterSpacing:`-0.6px`},"h6-medium":{lineHeight:`20px`,letterSpacing:`-0.6px`},"lg-regular-mono":{lineHeight:`16px`,letterSpacing:`-0.96px`},"lg-regular":{lineHeight:`18px`,letterSpacing:`-0.16px`},"lg-medium":{lineHeight:`18px`,letterSpacing:`-0.16px`},"md-regular-mono":{lineHeight:`14px`,letterSpacing:`-0.84px`},"md-regular":{lineHeight:`16px`,letterSpacing:`-0.14px`},"md-medium":{lineHeight:`16px`,letterSpacing:`-0.14px`},"sm-regular-mono":{lineHeight:`12px`,letterSpacing:`-0.72px`},"sm-regular":{lineHeight:`14px`,letterSpacing:`-0.12px`},"sm-medium":{lineHeight:`14px`,letterSpacing:`-0.12px`}},tokens:{core:c.core,theme:c.dark},borderRadius:{1:`4px`,2:`8px`,10:`10px`,3:`12px`,4:`16px`,6:`24px`,5:`20px`,8:`32px`,16:`64px`,20:`80px`,32:`128px`,64:`256px`,128:`512px`,round:`9999px`},spacing:{0:`0px`,"01":`2px`,1:`4px`,2:`8px`,3:`12px`,4:`16px`,5:`20px`,6:`24px`,7:`28px`,8:`32px`,9:`36px`,10:`40px`,12:`48px`,14:`56px`,16:`64px`,20:`80px`,32:`128px`,64:`256px`},durations:{xl:`400ms`,lg:`200ms`,md:`125ms`,sm:`75ms`},easings:{"ease-out-power-2":`cubic-bezier(0.23, 0.09, 0.08, 1.13)`,"ease-out-power-1":`cubic-bezier(0.12, 0.04, 0.2, 1.06)`,"ease-in-power-2":`cubic-bezier(0.92, -0.13, 0.77, 0.91)`,"ease-in-power-1":`cubic-bezier(0.88, -0.06, 0.8, 0.96)`,"ease-inout-power-2":`cubic-bezier(0.77, 0.09, 0.23, 1.13)`,"ease-inout-power-1":`cubic-bezier(0.88, 0.04, 0.12, 1.06)`}},u=`--apkt`;function d(e){if(!e)return{};let t={};return t[`font-family`]=e[`--apkt-font-family`]??e[`--w3m-font-family`]??`KHTeka`,t.accent=e[`--apkt-accent`]??e[`--w3m-accent`]??`#0988F0`,t[`color-mix`]=e[`--apkt-color-mix`]??e[`--w3m-color-mix`]??`#000`,t[`color-mix-strength`]=e[`--apkt-color-mix-strength`]??e[`--w3m-color-mix-strength`]??0,t[`font-size-master`]=e[`--apkt-font-size-master`]??e[`--w3m-font-size-master`]??`10px`,t[`border-radius-master`]=e[`--apkt-border-radius-master`]??e[`--w3m-border-radius-master`]??`4px`,e[`--apkt-z-index`]===void 0?e[`--w3m-z-index`]!==void 0&&(t[`z-index`]=e[`--w3m-z-index`]):t[`z-index`]=e[`--apkt-z-index`],t}var f={createCSSVariables(e){let t={},n={};function r(e,t,n=``){for(let[i,a]of Object.entries(e)){let e=n?`${n}-${i}`:i;a&&typeof a==`object`&&Object.keys(a).length?(t[i]={},r(a,t[i],e)):typeof a==`string`&&(t[i]=`${u}-${e}`)}}function i(e,t){for(let[n,r]of Object.entries(e))r&&typeof r==`object`?(t[n]={},i(r,t[n])):typeof r==`string`&&(t[n]=`var(${r})`)}return r(e,t),i(t,n),{cssVariables:t,cssVariablesVarPrefix:n}},assignCSSVariables(e,t){let n={};function r(e,t,i){for(let[a,o]of Object.entries(e)){let e=i?`${i}-${a}`:a,s=t[a];o&&typeof o==`object`?r(o,s,e):typeof s==`string`&&(n[`${u}-${e}`]=s)}}return r(e,t),n},createRootStyles(e,t){let n={...l,tokens:{...l.tokens,theme:e===`light`?c.light:c.dark}},{cssVariables:r}=f.createCSSVariables(n),i=f.assignCSSVariables(r,n),a=f.generateW3MVariables(t),o=f.generateW3MOverrides(t),s=f.generateScaledVariables(t),u=f.generateBaseVariables(i),d={...i,...u,...a,...o,...s},p=f.applyColorMixToVariables(t,d),m={...d,...p};return`:root {${Object.entries(m).map(([e,t])=>`${e}:${t.replace(`/[:;{}</>]/g`,``)};`).join(``)}}`},generateW3MVariables(e){if(!e)return{};let t=d(e),n={};return n[`--w3m-font-family`]=t[`font-family`],n[`--w3m-accent`]=t.accent,n[`--w3m-color-mix`]=t[`color-mix`],n[`--w3m-color-mix-strength`]=`${t[`color-mix-strength`]}%`,n[`--w3m-font-size-master`]=t[`font-size-master`],n[`--w3m-border-radius-master`]=t[`border-radius-master`],n},generateW3MOverrides(e){if(!e)return{};let t=d(e),n={};if(e[`--apkt-accent`]||e[`--w3m-accent`]){let e=t.accent;n[`--apkt-tokens-core-iconAccentPrimary`]=e,n[`--apkt-tokens-core-borderAccentPrimary`]=e,n[`--apkt-tokens-core-textAccentPrimary`]=e,n[`--apkt-tokens-core-backgroundAccentPrimary`]=e}return(e[`--apkt-font-family`]||e[`--w3m-font-family`])&&(n[`--apkt-fontFamily-regular`]=t[`font-family`]),t[`z-index`]!==void 0&&(n[`--apkt-tokens-core-zIndex`]=`${t[`z-index`]}`),n},generateScaledVariables(e){if(!e)return{};let t=d(e),n={};if(e[`--apkt-font-size-master`]||e[`--w3m-font-size-master`]){let e=parseFloat(t[`font-size-master`].replace(`px`,``));n[`--apkt-textSize-h1`]=`${Number(e)*5}px`,n[`--apkt-textSize-h2`]=`${Number(e)*4.4}px`,n[`--apkt-textSize-h3`]=`${Number(e)*3.8}px`,n[`--apkt-textSize-h4`]=`${Number(e)*3.2}px`,n[`--apkt-textSize-h5`]=`${Number(e)*2.6}px`,n[`--apkt-textSize-h6`]=`${Number(e)*2}px`,n[`--apkt-textSize-large`]=`${Number(e)*1.6}px`,n[`--apkt-textSize-medium`]=`${Number(e)*1.4}px`,n[`--apkt-textSize-small`]=`${Number(e)*1.2}px`}if(e[`--apkt-border-radius-master`]||e[`--w3m-border-radius-master`]){let e=parseFloat(t[`border-radius-master`].replace(`px`,``));n[`--apkt-borderRadius-1`]=`${Number(e)}px`,n[`--apkt-borderRadius-2`]=`${Number(e)*2}px`,n[`--apkt-borderRadius-3`]=`${Number(e)*3}px`,n[`--apkt-borderRadius-4`]=`${Number(e)*4}px`,n[`--apkt-borderRadius-5`]=`${Number(e)*5}px`,n[`--apkt-borderRadius-6`]=`${Number(e)*6}px`,n[`--apkt-borderRadius-8`]=`${Number(e)*8}px`,n[`--apkt-borderRadius-16`]=`${Number(e)*16}px`,n[`--apkt-borderRadius-20`]=`${Number(e)*20}px`,n[`--apkt-borderRadius-32`]=`${Number(e)*32}px`,n[`--apkt-borderRadius-64`]=`${Number(e)*64}px`,n[`--apkt-borderRadius-128`]=`${Number(e)*128}px`}return n},generateColorMixCSS(e,t){if(!e?.[`--w3m-color-mix`]||!e[`--w3m-color-mix-strength`])return``;let n=e[`--w3m-color-mix`],r=e[`--w3m-color-mix-strength`];if(!r||r===0)return``;let i=Object.keys(t||{}).filter(e=>{let t=e.includes(`-tokens-core-background`)||e.includes(`-tokens-core-text`)||e.includes(`-tokens-core-border`)||e.includes(`-tokens-core-foreground`)||e.includes(`-tokens-core-icon`)||e.includes(`-tokens-theme-background`)||e.includes(`-tokens-theme-text`)||e.includes(`-tokens-theme-border`)||e.includes(`-tokens-theme-foreground`)||e.includes(`-tokens-theme-icon`),n=e.includes(`-borderRadius-`)||e.includes(`-spacing-`)||e.includes(`-textSize-`)||e.includes(`-fontFamily-`)||e.includes(`-fontWeight-`)||e.includes(`-typography-`)||e.includes(`-duration-`)||e.includes(`-ease-`)||e.includes(`-path-`)||e.includes(`-width-`)||e.includes(`-height-`)||e.includes(`-visual-size-`)||e.includes(`-modal-width`)||e.includes(`-cover`);return t&&!n});return i.length===0?``:` @supports (background: color-mix(in srgb, white 50%, black)) {
      :root {
        ${i.map(e=>{let i=t?.[e]||``;return i.includes(`color-mix`)||i.startsWith(`#`)||i.startsWith(`rgb`)?`${e}: color-mix(in srgb, ${n} ${r}%, ${i});`:`${e}: color-mix(in srgb, ${n} ${r}%, var(${e}-base, ${i}));`}).join(``)}
      }
    }`},generateBaseVariables(e){let t={},n=e[`--apkt-tokens-theme-backgroundPrimary`];n&&(t[`--apkt-tokens-theme-backgroundPrimary-base`]=n);let r=e[`--apkt-tokens-core-backgroundAccentPrimary`];return r&&(t[`--apkt-tokens-core-backgroundAccentPrimary-base`]=r),t},applyColorMixToVariables(e,t){let n={};t?.[`--apkt-tokens-theme-backgroundPrimary`]&&(n[`--apkt-tokens-theme-backgroundPrimary`]=`var(--apkt-tokens-theme-backgroundPrimary-base)`),t?.[`--apkt-tokens-core-backgroundAccentPrimary`]&&(n[`--apkt-tokens-core-backgroundAccentPrimary`]=`var(--apkt-tokens-core-backgroundAccentPrimary-base)`);let r=d(e),i=r[`color-mix`],a=r[`color-mix-strength`];if(!a||a===0)return n;let o=Object.keys(t||{}).filter(e=>{let t=e.includes(`-tokens-core-background`)||e.includes(`-tokens-core-text`)||e.includes(`-tokens-core-border`)||e.includes(`-tokens-core-foreground`)||e.includes(`-tokens-core-icon`)||e.includes(`-tokens-theme-background`)||e.includes(`-tokens-theme-text`)||e.includes(`-tokens-theme-border`)||e.includes(`-tokens-theme-foreground`)||e.includes(`-tokens-theme-icon`)||e.includes(`-tokens-theme-overlay`),n=e.includes(`-borderRadius-`)||e.includes(`-spacing-`)||e.includes(`-textSize-`)||e.includes(`-fontFamily-`)||e.includes(`-fontWeight-`)||e.includes(`-typography-`)||e.includes(`-duration-`)||e.includes(`-ease-`)||e.includes(`-path-`)||e.includes(`-width-`)||e.includes(`-height-`)||e.includes(`-visual-size-`)||e.includes(`-modal-width`)||e.includes(`-cover`);return t&&!n});return o.length===0||o.forEach(e=>{let r=t?.[e]||``;e.endsWith(`-base`)||(e===`--apkt-tokens-theme-backgroundPrimary`||e===`--apkt-tokens-core-backgroundAccentPrimary`?n[e]=`color-mix(in srgb, ${i} ${a}%, var(${e}-base))`:r.includes(`color-mix`)||r.startsWith(`#`)||r.startsWith(`rgb`)?n[e]=`color-mix(in srgb, ${i} ${a}%, ${r})`:n[e]=`color-mix(in srgb, ${i} ${a}%, var(${e}-base, ${r}))`)}),n}},{cssVariablesVarPrefix:p}=f.createCSSVariables(l);function m(n,...r){return t(n,...r.map(t=>e(typeof t==`function`?t(p):t)))}var h=void 0,g=void 0,_=void 0,v=void 0,y=void 0,b={"KHTeka-500-woff2":`https://fonts.reown.com/KHTeka-Medium.woff2`,"KHTeka-400-woff2":`https://fonts.reown.com/KHTeka-Regular.woff2`,"KHTeka-300-woff2":`https://fonts.reown.com/KHTeka-Light.woff2`,"KHTekaMono-400-woff2":`https://fonts.reown.com/KHTekaMono-Regular.woff2`,"KHTeka-500-woff":`https://fonts.reown.com/KHTeka-Light.woff`,"KHTeka-400-woff":`https://fonts.reown.com/KHTeka-Regular.woff`,"KHTeka-300-woff":`https://fonts.reown.com/KHTeka-Light.woff`,"KHTekaMono-400-woff":`https://fonts.reown.com/KHTekaMono-Regular.woff`};function x(e,t=`dark`){h&&document.head.removeChild(h),h=document.createElement(`style`),h.textContent=f.createRootStyles(t,e),document.head.appendChild(h)}function S(e,t=`dark`){if(y=e,g=document.createElement(`style`),_=document.createElement(`style`),v=document.createElement(`style`),g.textContent=T(e).core.cssText,_.textContent=T(e).dark.cssText,v.textContent=T(e).light.cssText,document.head.appendChild(g),document.head.appendChild(_),document.head.appendChild(v),x(e,t),C(t),!(e?.[`--apkt-font-family`]||e?.[`--w3m-font-family`]))for(let[e,t]of Object.entries(b)){let n=document.createElement(`link`);n.rel=`preload`,n.href=t,n.as=`font`,n.type=e.includes(`woff2`)?`font/woff2`:`font/woff`,n.crossOrigin=`anonymous`,document.head.appendChild(n)}C(t)}function C(e=`dark`){_&&v&&h&&(e===`light`?(x(y,e),_.removeAttribute(`media`),v.media=`enabled`):(x(y,e),v.removeAttribute(`media`),_.media=`enabled`))}function w(e){if(y=e,g&&_&&v){g.textContent=T(e).core.cssText,_.textContent=T(e).dark.cssText,v.textContent=T(e).light.cssText;let t=e?.[`--apkt-font-family`]||e?.[`--w3m-font-family`];t&&(g.textContent=g.textContent?.replace(`font-family: KHTeka`,`font-family: ${t}`),_.textContent=_.textContent?.replace(`font-family: KHTeka`,`font-family: ${t}`),v.textContent=v.textContent?.replace(`font-family: KHTeka`,`font-family: ${t}`))}h&&x(e,v?.media===`enabled`?`light`:`dark`)}function T(n){return{core:t`
      ${n?.[`--apkt-font-family`]||n?.[`--w3m-font-family`]?t``:t`
            @font-face {
              font-family: 'KHTeka';
              src:
                url(${e(b[`KHTeka-400-woff2`])}) format('woff2'),
                url(${e(b[`KHTeka-400-woff`])}) format('woff');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }

            @font-face {
              font-family: 'KHTeka';
              src:
                url(${e(b[`KHTeka-300-woff2`])}) format('woff2'),
                url(${e(b[`KHTeka-300-woff`])}) format('woff');
              font-weight: 300;
              font-style: normal;
            }

            @font-face {
              font-family: 'KHTekaMono';
              src:
                url(${e(b[`KHTekaMono-400-woff2`])}) format('woff2'),
                url(${e(b[`KHTekaMono-400-woff`])}) format('woff');
              font-weight: 400;
              font-style: normal;
            }

            @font-face {
              font-family: 'KHTeka';
              src:
                url(${e(b[`KHTeka-400-woff2`])}) format('woff2'),
                url(${e(b[`KHTeka-400-woff`])}) format('woff');
              font-weight: 400;
              font-style: normal;
            }
          `}

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
      @keyframes w3m-iframe-fade-out {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      @keyframes w3m-iframe-zoom-in {
        0% {
          transform: translateY(50px);
          opacity: 0;
        }
        100% {
          transform: translateY(0px);
          opacity: 1;
        }
      }
      @keyframes w3m-iframe-zoom-in-mobile {
        0% {
          transform: scale(0.95);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      :root {
        --apkt-modal-width: 370px;

        --apkt-visual-size-inherit: inherit;
        --apkt-visual-size-sm: 40px;
        --apkt-visual-size-md: 55px;
        --apkt-visual-size-lg: 80px;

        --apkt-path-network-sm: path(
          'M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z'
        );

        --apkt-path-network-md: path(
          'M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z'
        );

        --apkt-path-network-lg: path(
          'M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z'
        );

        --apkt-width-network-sm: 36px;
        --apkt-width-network-md: 48px;
        --apkt-width-network-lg: 86px;

        --apkt-duration-dynamic: 0ms;
        --apkt-height-network-sm: 40px;
        --apkt-height-network-md: 54px;
        --apkt-height-network-lg: 96px;
      }
    `,dark:t`
      :root {
      }
    `,light:t`
      :root {
      }
    `}}var E=t`
  div,
  span,
  iframe,
  a,
  img,
  form,
  button,
  label,
  *::after,
  *::before {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-style: normal;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    backface-visibility: hidden;
  }

  :host {
    font-family: var(--apkt-fontFamily-regular);
  }
`,D=t`
  button,
  a {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
    outline: none;
    border: none;
    text-decoration: none;
    transition:
      background-color var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2),
      color var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2),
      border var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2),
      box-shadow var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2),
      width var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2),
      height var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2),
      transform var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2),
      opacity var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2),
      scale var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2),
      border-radius var(--apkt-durations-lg) var(--apkt-easings-ease-out-power-2);
    will-change:
      background-color, color, border, box-shadow, width, height, transform, opacity, scale,
      border-radius;
  }

  a:active:not([disabled]),
  button:active:not([disabled]) {
    scale: 0.975;
    transform-origin: center;
  }

  button:disabled {
    cursor: default;
  }

  input {
    border: none;
    outline: none;
    appearance: none;
  }
`,O=`.`,k={getSpacingStyles(e,t){if(Array.isArray(e))return e[t]?`var(--apkt-spacing-${e[t]})`:void 0;if(typeof e==`string`)return`var(--apkt-spacing-${e})`},getFormattedDate(e){return new Intl.DateTimeFormat(`en-US`,{month:`short`,day:`numeric`}).format(e)},formatCurrency(e=0,t={}){let n=Number(e);return isNaN(n)?`$0.00`:new Intl.NumberFormat(`en-US`,{style:`currency`,currency:`USD`,minimumFractionDigits:2,maximumFractionDigits:2,...t}).format(n)},getHostName(e){try{return new URL(e).hostname}catch{return``}},getTruncateString({string:e,charsStart:t,charsEnd:n,truncate:r}){return e.length<=t+n?e:r===`end`?`${e.substring(0,t)}...`:r===`start`?`...${e.substring(e.length-n)}`:`${e.substring(0,Math.floor(t))}...${e.substring(e.length-Math.floor(n))}`},generateAvatarColors(e){let t=e.toLowerCase().replace(/^0x/iu,``).replace(/[^a-f0-9]/gu,``).substring(0,6).padEnd(6,`0`),n=this.hexToRgb(t),r=getComputedStyle(document.documentElement).getPropertyValue(`--w3m-border-radius-master`),i=100-3*Number(r?.replace(`px`,``)),a=`${i}% ${i}% at 65% 40%`,o=[];for(let e=0;e<5;e+=1){let t=this.tintColor(n,.15*e);o.push(`rgb(${t[0]}, ${t[1]}, ${t[2]})`)}return`
    --local-color-1: ${o[0]};
    --local-color-2: ${o[1]};
    --local-color-3: ${o[2]};
    --local-color-4: ${o[3]};
    --local-color-5: ${o[4]};
    --local-radial-circle: ${a}
   `},hexToRgb(e){let t=parseInt(e,16);return[t>>16&255,t>>8&255,t&255]},tintColor(e,t){let[n,r,i]=e;return[Math.round(n+(255-n)*t),Math.round(r+(255-r)*t),Math.round(i+(255-i)*t)]},isNumber(e){return{number:/^[0-9]+$/u}.number.test(e)},getColorTheme(e){return e||(typeof window<`u`&&window.matchMedia&&typeof window.matchMedia==`function`?window.matchMedia(`(prefers-color-scheme: dark)`)?.matches?`dark`:`light`:`dark`)},splitBalance(e){let t=e.split(`.`);return t.length===2?[t[0],t[1]]:[`0`,`00`]},roundNumber(e,t,n){return e.toString().length>=t?Number(e).toFixed(n):e},cssDurationToNumber(e){return e.endsWith(`s`)?Number(e.replace(`s`,``))*1e3:e.endsWith(`ms`)?Number(e.replace(`ms`,``)):0},maskInput({value:e,decimals:t,integers:n}){if(e=e.replace(`,`,`.`),e===O)return`0${O}`;let[r=``,i]=e.split(O).map(e=>e.replace(/[^0-9]/gu,``)),a=n?r.substring(0,n):r,o=a.length===2?String(Number(a)):a,s=typeof t==`number`?i?.substring(0,t):i;return(typeof s==`string`&&(typeof t!=`number`||t>0)?[o,s].join(O):o)??``},capitalize(e){return e?e.charAt(0).toUpperCase()+e.slice(1):``}};function A(e,t){let{kind:n,elements:r}=t;return{kind:n,elements:r,finisher(t){customElements.get(e)||customElements.define(e,t)}}}function j(e,t){return customElements.get(e)||customElements.define(e,t),t}function M(e){return function(t){return typeof t==`function`?j(e,t):A(e,t)}}var N={METMASK_CONNECTOR_NAME:`MetaMask`,TRUST_CONNECTOR_NAME:`Trust Wallet`,SOLFLARE_CONNECTOR_NAME:`Solflare`,PHANTOM_CONNECTOR_NAME:`Phantom`,COIN98_CONNECTOR_NAME:`Coin98`,MAGIC_EDEN_CONNECTOR_NAME:`Magic Eden`,BACKPACK_CONNECTOR_NAME:`Backpack`,BITGET_CONNECTOR_NAME:`Bitget Wallet`,FRONTIER_CONNECTOR_NAME:`Frontier`,XVERSE_CONNECTOR_NAME:`Xverse Wallet`,LEATHER_CONNECTOR_NAME:`Leather`,OKX_CONNECTOR_NAME:`OKX Wallet`,BINANCE_CONNECTOR_NAME:`Binance Wallet`,EIP155:n.CHAIN.EVM,ADD_CHAIN_METHOD:`wallet_addEthereumChain`,EIP6963_ANNOUNCE_EVENT:`eip6963:announceProvider`,EIP6963_REQUEST_EVENT:`eip6963:requestProvider`,CONNECTOR_RDNS_MAP:{coinbaseWallet:`com.coinbase.wallet`,coinbaseWalletSDK:`com.coinbase.wallet`},CONNECTOR_TYPE_EXTERNAL:`EXTERNAL`,CONNECTOR_TYPE_WALLET_CONNECT:`WALLET_CONNECT`,CONNECTOR_TYPE_INJECTED:`INJECTED`,CONNECTOR_TYPE_ANNOUNCED:`ANNOUNCED`,CONNECTOR_TYPE_AUTH:`AUTH`,CONNECTOR_TYPE_MULTI_CHAIN:`MULTI_CHAIN`,CONNECTOR_TYPE_W3M_AUTH:`AUTH`,getSDKVersionWarningMessage(e,t){return`
     @@@@@@@           @@@@@@@@@@@@@@@@@@      
   @@@@@@@@@@@      @@@@@@@@@@@@@@@@@@@@@@@@   
  @@@@@@@@@@@@@    @@@@@@@@@@@@@@@@@@@@@@@@@@  
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@  
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@   @@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@   @@@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@  @@@@@@@@@@@@@
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@   @@@@@@@@@@@@@    
 @@@@@@   @@@@@@  @@@@@@@@@@@   @@@@@@@@@@@@@@    
 @@@@@@   @@@@@@  @@@@@@@@@@@  @@@@@@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@   @@@@@@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@  
  @@@@@@@@@@@@@    @@@@@@@@@@@@@@@@@@@@@@@@@@  
   @@@@@@@@@@@      @@@@@@@@@@@@@@@@@@@@@@@@   
      @@@@@            @@@@@@@@@@@@@@@@@@  
      
AppKit SDK version ${e} is outdated. Latest version is ${t}. Please update to the latest version for bug fixes and new features.
            
Changelog: https://github.com/reown-com/appkit/releases
NPM Registry: https://www.npmjs.com/package/@reown/appkit`}},P={getCaipTokens(e){if(!e)return;let t={};return Object.entries(e).forEach(([e,n])=>{t[`${N.EIP155}:${e}`]=n}),t},isLowerCaseMatch(e,t){return e?.toLowerCase()===t?.toLowerCase()},getActiveNamespaceConnectedToAuth(){let e=a.state.activeChain;return n.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(t=>i.getConnectorId(t)===n.CONNECTOR_ID.AUTH&&t===e)},withRetry({conditionFn:e,intervalMs:t,maxRetries:n}){let r=0;return new Promise(i=>{async function a(){return r+=1,await e()?i(!0):r>=n?i(!1):(setTimeout(a,t),null)}a()})},userChainIdToChainNamespace(e){if(typeof e==`number`)return n.CHAIN.EVM;let[t]=e.split(`:`);return t},getOtherAuthNamespaces(e){return e?n.AUTH_CONNECTOR_SUPPORTED_CHAINS.filter(t=>t!==e):[]},getConnectorStorageInfo(e,t){let n=r.getConnections()[t]??[];return{hasDisconnected:r.isConnectorDisconnected(e,t),hasConnected:n.some(t=>P.isLowerCaseMatch(t.connectorId,e))}}};export{D as a,C as c,p as d,o as f,k as i,w as l,N as n,S as o,M as r,E as s,P as t,m as u};