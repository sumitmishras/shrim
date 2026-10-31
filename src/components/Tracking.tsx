import Script from 'next/script'

/**
 * Google Tag Manager with Consent Mode v2. Everything else (GA4, Google Ads, Meta Pixel, Clarity) is added inside GTM.
 * Analytics and ads start DENIED. A visitor's earlier choice (saved by the consent banner) is applied before GTM runs.
 */
const CONSENT_DEFAULT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);
try{var c=JSON.parse(localStorage.getItem('shrim_consent')||'null');if(c&&c.v===1){gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:c.ads?'granted':'denied',ad_user_data:c.ads?'granted':'denied',ad_personalization:c.ads?'granted':'denied'})}}catch(e){}`

export function TrackingScripts({ gtmId }: { gtmId: string }) {
  return (
    <>
      <Script id="consent-default" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT }} />
      <Script
        id="gtm" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');` }}
      />
    </>
  )
}

export function TrackingNoscript({ gtmId }: { gtmId: string }) {
  return (
    <noscript>
      <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" />
    </noscript>
  )
}
