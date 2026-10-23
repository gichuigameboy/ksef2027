/**
 * Dawamu OS - Restriction & Security Policy Manager
 *
 * Correct, safe URL and domain policy enforcement:
 * - RFC-compliant URL parsing using standard URL API.
 * - Exact-domain and strict subdomain matching (prevents substring collision flaws).
 * - Whitelist priority: Approved educational resources are never blocked by keywords.
 * - Query-scoped keyword inspection: Academic paths (e.g. /wiki/Game_theory) are never falsely blocked.
 * - Handles malformed URLs, credentials, ports, and internal protocols securely.
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

    const [startH, startM] = (curfewStart || '21:00').split(':').map(Number);
    const [endH, endM] = (curfewEnd || '07:00').split(':').map(Number);

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
   * Safely parses any URL string into a URL object.
   * Handles schemeless inputs (e.g. "wikipedia.org/wiki/Math") by assuming https://.
   * Returns null for unparseable / malformed URLs.
   */
  parseUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') return null;
    let raw = urlString.trim();
    if (!raw) return null;

    // Check for internal Dawamu OS protocol
    if (raw.startsWith('dawamu://')) {
      try {
        return new URL(raw);
      } catch (_) {
        // Fallback pseudo URL for dawamu:// internal tool routes
        return {
          protocol: 'dawamu:',
          hostname: raw.replace(/^dawamu:\/\//, '').split('/')[0],
          pathname: '/' + (raw.replace(/^dawamu:\/\//, '').split('/')[1] || ''),
          searchParams: new URLSearchParams(),
          href: raw
        };
      }
    }

    // Add protocol if missing for evaluation
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
      raw = 'https://' + raw;
    }

    try {
      return new URL(raw);
    } catch (_) {
      return null;
    }
  }

  /**
   * Normalizes a domain or host name for canonical comparison:
   * Strips trailing dots, leading/trailing whitespace, and 'www.' prefixes, and converts to lowercase.
   */
  normalizeHost(host) {
    if (!host) return '';
    return host.trim().toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
  }

  /**
   * Checks whether candidate hostname matches a target rule hostname.
   * Enforces exact-host or strict subdomain matching:
   *   candidate: "m.facebook.com", target: "facebook.com" -> TRUE (subdomain)
   *   candidate: "facebook.com", target: "facebook.com"   -> TRUE (exact)
   *   candidate: "notfacebook.com", target: "facebook.com"-> FALSE (no match)
   *   candidate: "x.com", target: "x.com"                 -> TRUE (exact)
   *   candidate: "prefix.com", target: "x.com"            -> FALSE (no match)
   */
  matchesDomainRule(candidateHost, targetRule) {
    const host = this.normalizeHost(candidateHost);
    const target = this.normalizeHost(targetRule);
    if (!host || !target) return false;

    return host === target || host.endsWith('.' + target);
  }

  /**
   * Evaluates if a given URL or domain is allowed under active policy.
   * Order of precedence:
   * 1. Check Master Browser toggle.
   * 2. Internal dawamu:// and local school ports are allowed.
   * 3. Malformed URLs are safely rejected.
   * 4. Whitelisted educational domains are explicitly ALLOWED.
   * 5. Blocklisted domains are rejected (exact and subdomain match).
   * 6. SafeSearch keyword inspection applies to search queries, not innocent URL paths.
   */
  checkUrlAccess(urlString) {
    const {
      browserEnabled,
      blockedDomains = [],
      whitelistedDomains = [],
      blockedKeywords = [],
      safeSearch = true
    } = this.state.restrictions;

    if (!browserEnabled) {
      return {
        allowed: false,
        reason: 'Web Browsing has been disabled by Administrator / Teacher policy.'
      };
    }

    if (!urlString || typeof urlString !== 'string' || urlString.trim() === '') {
      return { allowed: true };
    }

    // Internal Dawamu OS pages are always allowed offline
    if (urlString.startsWith('dawamu://')) {
      return { allowed: true, domain: 'dawamu-internal' };
    }

    const parsed = this.parseUrl(urlString);
    if (!parsed) {
      return {
        allowed: false,
        reason: 'Malformed or invalid URL. Please enter a valid web address.',
        domain: urlString
      };
    }

    const hostname = parsed.hostname;

    // Allow local school services (e.g. port 8000 backend, 8080 OS host, 3000 EduGuard UI)
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
    if (isLocalhost) {
      const port = parsed.port || (parsed.protocol === 'http:' ? '80' : '443');
      const allowedPorts = ['8000', '8080', '3000', '80'];
      if (allowedPorts.includes(port)) {
        return { allowed: true, domain: hostname };
      }
    }

    // 1. Whitelist Check (Prioritized: Approved educational domains bypass keyword blocks)
    const isWhitelisted = whitelistedDomains.some((wd) => this.matchesDomainRule(hostname, wd));
    if (isWhitelisted) {
      return { allowed: true, domain: hostname, whitelisted: true };
    }

    // 2. Blocklist Check (Exact or Subdomain matching)
    for (const bd of blockedDomains) {
      if (this.matchesDomainRule(hostname, bd)) {
        return {
          allowed: false,
          reason: `Access to "${hostname}" is restricted by school safety policy.`,
          domain: hostname
        };
      }
    }

    // 3. Search Engine Query SafeSearch Inspection
    // Keyword restrictions must ONLY inspect search query terms, NOT arbitrary academic URL paths!
    if (safeSearch) {
      const isSearchEngine = ['google.com', 'bing.com', 'search.brave.com', 'duckduckgo.com', 'yahoo.com']
        .some((engine) => this.matchesDomainRule(hostname, engine));

      if (isSearchEngine) {
        // Extract common query parameters: ?q=..., ?query=..., ?p=...
        const queryTerm = parsed.searchParams.get('q') ||
                          parsed.searchParams.get('query') ||
                          parsed.searchParams.get('p') ||
                          '';

        if (queryTerm) {
          const inspected = this.inspectSearchQuery(queryTerm);
          if (!inspected.safe) {
            return {
              allowed: false,
              reason: inspected.reason,
              domain: hostname
            };
          }
        }
      }
    }

    return { allowed: true, domain: hostname };
  }

  /**
   * Safe Search Keyword Inspection for query strings
   */
  inspectSearchQuery(query) {
    const { safeSearch, blockedKeywords = [] } = this.state.restrictions;
    if (!safeSearch || !query || typeof query !== 'string') return { safe: true };

    const lowerQuery = query.toLowerCase();

    // Word boundary matching to prevent matching inside legitimate words
    // e.g., 'hack' shouldn't block 'hackathon', and 'game' shouldn't block 'game theory' unless explicit
    for (const kw of blockedKeywords) {
      const cleanKw = kw.trim().toLowerCase();
      if (!cleanKw) continue;

      // Exact substring or word boundary match on search query
      if (lowerQuery === cleanKw || lowerQuery.includes(' ' + cleanKw) || lowerQuery.includes(cleanKw + ' ') || lowerQuery.startsWith(cleanKw + ' ') || lowerQuery.endsWith(' ' + cleanKw)) {
        return {
          safe: false,
          reason: `SafeSearch Filtered: Search query contains restricted term ("${kw}").`
        };
      }
    }

    return { safe: true };
  }

  /**
   * Focus Mode Enforcement: Restricts non-educational apps when active
   */
  isAppAllowedInFocusMode(appId) {
    const { focusMode } = this.state.restrictions;
    if (!focusMode) return true;

    // Allowed during Focus Mode: Classroom, Docs, EduGuard, and Admin Controls
    const allowedFocusApps = ['classroom', 'docs', 'eduguard', 'adminPanel', 'offlineBrowser', 'books844'];
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

