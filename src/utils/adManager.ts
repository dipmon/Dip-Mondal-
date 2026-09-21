/**
 * Adsterra & Cyber Ads Orchestration Service
 * Handles Popunder re-triggering on level completion, Social Bar persistence,
 * frequency cap resetting, and strict suppression for VIP users.
 */

const POPUNDER_URL = 'https://pl29459614.profitableratecpmnetwork.com/6b/18/b1/6b18b18306fb23f5abf6da6c1c44add8.js';
const SOCIALBAR_URL = 'https://pl29459616.profitableratecpmnetwork.com/4d/77/75/4d7775518b4541a82bc623381378d804.js';

export function isUserVip(): boolean {
  if (typeof window === 'undefined') return false;
  const isVip = localStorage.getItem('cyber_ad_free_vip') === 'true';
  const hasUtr = !!localStorage.getItem('cyber_vip_utr');
  return isVip && hasUtr;
}

/**
 * Resets Adsterra frequency capping cookies and window flags
 * so popunder ads can trigger reliably on each level completion.
 */
export function resetAdCapping(): void {
  if (typeof window === 'undefined') return;
  try {
    // 1. Clear Adsterra / CPM cookies that enforce cooldowns
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      if (/^(_?as_|cpm|pu_|pop)/i.test(name) || /adsterra/i.test(name)) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      }
    }

    // 2. Clear Adsterra storage flags
    for (let j = localStorage.length - 1; j >= 0; j--) {
      const key = localStorage.key(j);
      if (key && !key.startsWith('cyber_') && !key.startsWith('wire_')) {
        if (/^(_?as_|cpm|pu_|pop)/i.test(key) || /adsterra/i.test(key)) {
          localStorage.removeItem(key);
        }
      }
    }

    // 3. Clear window global variables initialized by Adsterra
    const win = window as any;
    const adsterraKeys = Object.keys(win).filter(
      (k) => /^_as_/i.test(k) || /^__as_/i.test(k) || /adsterra/i.test(k)
    );
    adsterraKeys.forEach((k) => {
      try {
        delete win[k];
      } catch (e) {}
    });
  } catch (err) {
    // Quiet handling
  }
}

/**
 * Triggers Popunder ads and refreshes ad state on level completion
 */
export function triggerLevelCompleteAds(): void {
  if (typeof window === 'undefined') return;

  // Never show ads to verified VIP subscribers
  if (isUserVip()) {
    removeAdScripts();
    return;
  }

  try {
    // Reset frequency capping so popunder can trigger on every level completion
    resetAdCapping();

    // 1. Remove previous popunder script tag
    const oldPopunder = document.getElementById('adsterra-popunder-script');
    if (oldPopunder && oldPopunder.parentNode) {
      oldPopunder.parentNode.removeChild(oldPopunder);
    }

    // 2. Inject fresh popunder script tag with clean URL
    const popScript = document.createElement('script');
    popScript.id = 'adsterra-popunder-script';
    popScript.type = 'text/javascript';
    popScript.async = true;
    popScript.src = POPUNDER_URL;
    document.body.appendChild(popScript);

    // 3. Ensure social bar is running for free users
    const oldSocial = document.getElementById('adsterra-socialbar-script');
    if (!oldSocial) {
      const socialScript = document.createElement('script');
      socialScript.id = 'adsterra-socialbar-script';
      socialScript.type = 'text/javascript';
      socialScript.async = true;
      socialScript.src = SOCIALBAR_URL;
      document.body.appendChild(socialScript);
    }
  } catch (err) {
    console.warn('Ad trigger notice:', err);
  }
}

/**
 * Completely purges all ad scripts from the DOM for VIP users
 */
export function removeAdScripts(): void {
  if (typeof window === 'undefined') return;
  try {
    const s1 = document.getElementById('adsterra-socialbar-script');
    if (s1 && s1.parentNode) s1.parentNode.removeChild(s1);

    const s2 = document.getElementById('adsterra-popunder-script');
    if (s2 && s2.parentNode) s2.parentNode.removeChild(s2);
  } catch (e) {}
}
