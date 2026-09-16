/**
 * ChromeOS Student Edition - Restriction & Security Policy Manager
 */

import { stateStore } from './state.js';

class RestrictionManager {
  constructor() {
    this.state = stateStore.getState();
    stateStore.subscribe((newState) => {
      this.state = newState;
      this.evaluateSecurityRules();
    });
  }

  evaluateSecurityRules() {
    this.checkCurfew();
    this.checkFocusMode();
  }

  /**
   * Checks if current local time falls within Curfew hours (e.g., 21:00 - 07:00)
   */
  isCurfewActive() {
    const { curfewEnabled, curfewStart, curfewEnd } = this.state.restrictions;
    if (!curfewEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = curfewStart.split(':').map(Number);
    const [endH, endM] = curfewEnd.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes > endMinutes) {
      // Overnight curfew (e.g. 21:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      // Same day curfew (e.g. 13:00 to 15:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * Evaluates if a given URL or domain is blocked by administrator policy
   */
  checkUrlAccess(urlString) {
    const { browserEnabled, blockedDomains, whitelistedDomains, blockedKeywords } = this.state.restrictions;

    if (!browserEnabled) {
      return {
        allowed: false,
        reason: 'Web Browsing has been completely disabled by your Administrator/Teacher.'
      };
    }

    if (!urlString || urlString.trim() === '') {
      return { allowed: true };
    }

    let cleanUrl = urlString.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    const domainPart = cleanUrl.split('/')[0];

    // Check exact blocked domains
    const isBlockedDomain = blockedDomains.some((bd) => domainPart.includes(bd));
    if (isBlockedDomain) {
      return {
        allowed: false,
        reason: `Access to "${domainPart}" is restricted by school/parent safety policy.`,
        domain: domainPart
      };
    }

    // Check keyword rules in query or URL
    const hasBlockedKeyword = blockedKeywords.some((kw) => cleanUrl.includes(kw.toLowerCase()));
    if (hasBlockedKeyword) {
      return {
        allowed: false,
        reason: 'URL or search request contains restricted keywords.',
        domain: domainPart
      };
    }

    return { allowed: true, domain: domainPart };
  }

  /**
   * Safe Search Keyword Inspection
   */
  inspectSearchQuery(query) {
    const { safeSearch, blockedKeywords } = this.state.restrictions;
    if (!safeSearch) return { safe: true };

    const lowerQuery = query.toLowerCase();
    const matched = blockedKeywords.find((kw) => lowerQuery.includes(kw.toLowerCase()));

    if (matched) {
      return {
        safe: false,
        reason: `SafeSearch Filtered: The query contains restricted terms ("${matched}").`
      };
    }

    return { safe: true };
  }

  /**
   * Focus Mode Enforcement: Restricts non-educational apps when active
   */
  isAppAllowedInFocusMode(appId) {
    const { focusMode } = this.state.restrictions;
    if (!focusMode) return true;

    // Allowed during Focus Mode: Classroom and Docs/Notes
    const allowedFocusApps = ['classroom', 'docs', 'adminPanel'];
    return allowedFocusApps.includes(appId);
  }

  checkCurfew() {
    const overlay = document.getElementById('curfew-lockout-screen');
    if (!overlay) return;

    if (this.isCurfewActive()) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }

  checkFocusMode() {
    const badge = document.getElementById('focus-mode-badge');
    if (badge) {
      if (this.state.restrictions.focusMode) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }
}

export const restrictionManager = new RestrictionManager();
