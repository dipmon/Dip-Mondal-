import React from 'react';
import { Crown } from 'lucide-react';

interface BannerProps {
  isAdFree?: boolean;
  onOpenSubscription?: () => void;
}

// Stable srcDoc templates declared statically outside components so they never trigger iframe reloads on parent renders
const DESKTOP_728X90_SRCDOC = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base target="_blank">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: transparent;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : 'ee9b31ba00989c69d9d23c1993b47be0',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://www.highrevenueformat.com/ee9b31ba00989c69d9d23c1993b47be0/invoke.js"></script>
  </body>
</html>`;

const MOBILE_468X60_SRCDOC = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base target="_blank">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: transparent;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '1add91423b6873263588d07ff78b5fb3',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://www.highrevenueformat.com/1add91423b6873263588d07ff78b5fb3/invoke.js"></script>
  </body>
</html>`;

const NATIVE_BANNER_SRCDOC = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base target="_blank">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        min-height: 90px;
        background: transparent;
        color: #fff;
        font-family: system-ui, -apple-system, sans-serif;
        overflow-x: hidden;
      }
    </style>
  </head>
  <body>
    <script async="async" data-cfasync="false" src="https://pl29459615.profitableratecpmnetwork.com/4df9596c8f648e571f6ac9ef7ed152ed/invoke.js"></script>
    <div id="container-4df9596c8f648e571f6ac9ef7ed152ed"></div>
  </body>
</html>`;

// Adsterra 728x90 Desktop Banner
export const DesktopBanner728x90 = React.memo<BannerProps>(({ isAdFree, onOpenSubscription }) => {
  if (isAdFree) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center my-2 overflow-hidden" id="ad-banner-728x90-wrapper">
      <div className="w-full max-w-[728px] flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1 px-1">
        <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
          <span>SPONSORED (728x90)</span>
        </div>
        {onOpenSubscription && (
          <button
            onClick={onOpenSubscription}
            className="flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200 transition-colors cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-bold"
            title="Upgrade to Cyber VIP to Remove Ads"
          >
            <Crown className="w-3 h-3 text-amber-400" />
            <span>REMOVE ADS</span>
          </button>
        )}
      </div>
      <div className="rounded-lg overflow-hidden border border-slate-800/80 bg-[#0a0b18]/60 shadow-[0_0_15px_rgba(0,243,255,0.05)] w-[728px] h-[90px] flex items-center justify-center">
        <iframe
          title="Adsterra 728x90 Banner"
          srcDoc={DESKTOP_728X90_SRCDOC}
          width="728"
          height="90"
          className="border-0 block"
          scrolling="no"
          loading="eager"
        />
      </div>
    </div>
  );
});

DesktopBanner728x90.displayName = 'DesktopBanner728x90';

// Adsterra 468x60 Mobile / Compact Banner with responsive scaling
export const MobileBanner468x60 = React.memo<BannerProps>(({ isAdFree, onOpenSubscription }) => {
  if (isAdFree) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center my-1.5 overflow-hidden max-w-full" id="ad-banner-468x60-wrapper">
      <div className="w-full max-w-[468px] flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1 px-2">
        <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
          <span>SPONSORED (468x60)</span>
        </div>
        {onOpenSubscription && (
          <button
            onClick={onOpenSubscription}
            className="flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200 transition-colors cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-bold"
            title="Upgrade to Cyber VIP to Remove Ads"
          >
            <Crown className="w-3 h-3 text-amber-400" />
            <span>REMOVE ADS</span>
          </button>
        )}
      </div>
      {/* Responsive container that scales the 468px banner on mobile screens */}
      <div className="w-full flex justify-center items-center overflow-hidden py-0.5">
        <div className="rounded-lg overflow-hidden border border-slate-800/80 bg-[#0a0b18]/60 shadow-[0_0_15px_rgba(0,243,255,0.05)] shrink-0 origin-center scale-[0.72] sm:scale-[0.88] md:scale-100 transition-transform">
          <iframe
            title="Adsterra 468x60 Banner"
            srcDoc={MOBILE_468X60_SRCDOC}
            width="468"
            height="60"
            className="border-0 block"
            scrolling="no"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
});

MobileBanner468x60.displayName = 'MobileBanner468x60';

// Combined Responsive Banner: Displays 728x90 on Desktop and 468x60 on Mobile/Tablet
export const ResponsiveAdBanner = React.memo<BannerProps>(({ isAdFree, onOpenSubscription }) => {
  if (isAdFree) return null;

  return (
    <div className="w-full flex justify-center items-center my-1.5">
      {/* Desktop & Wide Screens */}
      <div className="hidden lg:flex justify-center w-full">
        <DesktopBanner728x90 isAdFree={isAdFree} onOpenSubscription={onOpenSubscription} />
      </div>

      {/* Mobile, Tablet & Small Screens */}
      <div className="flex lg:hidden justify-center w-full">
        <MobileBanner468x60 isAdFree={isAdFree} onOpenSubscription={onOpenSubscription} />
      </div>
    </div>
  );
});

ResponsiveAdBanner.displayName = 'ResponsiveAdBanner';

// Adsterra Native Banner
export const NativeAdBanner = React.memo<BannerProps>(({ isAdFree, onOpenSubscription }) => {
  if (isAdFree) return null;

  return (
    <div className="w-full max-w-3xl mx-auto my-3 p-2.5 rounded-xl bg-[#0b0c1e]/70 border border-slate-800/80 backdrop-blur-sm" id="native-ad-section">
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2 pb-1 border-b border-slate-800/60">
        <span className="flex items-center gap-1.5 text-cyan-400 font-semibold tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-pulse" />
          SPONSORED CYBER FEED
        </span>
        <div className="flex items-center gap-2">
          {onOpenSubscription && (
            <button
              onClick={onOpenSubscription}
              className="flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200 transition-colors cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-bold"
              title="Remove Ads with VIP Pass"
            >
              <Crown className="w-3 h-3 text-amber-400" />
              <span>REMOVE ADS</span>
            </button>
          )}
          <span className="text-slate-500 uppercase hidden sm:inline">ADSTERRA NATIVE</span>
        </div>
      </div>

      <div className="w-full min-h-[95px] flex items-center justify-center overflow-hidden">
        <iframe
          title="Adsterra Native Ad Banner"
          srcDoc={NATIVE_BANNER_SRCDOC}
          width="100%"
          height="120"
          className="border-0 block w-full rounded-lg"
          scrolling="no"
          loading="eager"
        />
      </div>
    </div>
  );
});

NativeAdBanner.displayName = 'NativeAdBanner';

