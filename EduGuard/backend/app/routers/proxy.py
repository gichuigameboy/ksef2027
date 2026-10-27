"""
Dawamu OS & EduGuard - Safe Web Proxy Router
Enables secure, policy-filtered live web browsing inside Dawamu OS web sandbox by
removing restrictive iframe embedding headers (X-Frame-Options, CSP frame-ancestors)
while strictly enforcing school safety blocklists and SafeSearch keyword inspection.
"""

import re
import urllib.parse
from fastapi import APIRouter, Query, Response, status
from fastapi.responses import HTMLResponse
import httpx

router = APIRouter(prefix="/proxy", tags=["Safe Web Proxy"])

BLOCKED_DOMAINS = [
    "facebook.com", "instagram.com", "tiktok.com", "twitter.com",
    "x.com", "youtube.com", "netflix.com", "gaming.com", "roblox.com",
    "twitch.tv", "snapchat.com", "discord.com", "reddit.com"
]

WHITELISTED_DOMAINS = [
    "wikipedia.org", "khanacademy.org", "kicd.ac.ke", "education.go.ke",
    "github.com", "stackoverflow.com", "sciencedirect.com", "britannica.com",
    "nasa.gov", "mathsisfun.com", "duolingo.com", "google.com", "bing.com",
    "search.brave.com", "duckduckgo.com", "w3schools.com", "geeksforgeeks.org",
    "nationalgeographic.com", "bbc.co.uk", "reuters.com"
]

BLOCKED_KEYWORDS = ["porn", "gambling", "casino", "betting", "games", "arcade", "xxx", "sex"]

def matches_domain(host: str, target: str) -> bool:
    host = host.lower().strip().replace("www.", "")
    target = target.lower().strip().replace("www.", "")
    return host == target or host.endswith("." + target)

def check_url_security(url_str: str):
    """
    Evaluates whether the target URL is permitted under Dawamu OS safety policies.
    """
    if not url_str or not isinstance(url_str, str):
        return False, "Empty or invalid URL"

    url_str = url_str.strip()
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*://', url_str):
        url_str = "https://" + url_str

    try:
        parsed = urllib.parse.urlparse(url_str)
        host = (parsed.hostname or "").lower().strip()
        query = (parsed.query or "").lower().strip()

        # 1. Whitelist priority
        for wd in WHITELISTED_DOMAINS:
            if matches_domain(host, wd):
                # Still check query keywords on search engines
                if any(engine in host for engine in ["google", "bing", "brave", "duckduckgo"]):
                    for kw in BLOCKED_KEYWORDS:
                        if re.search(r'\b' + re.escape(kw) + r'\b', query):
                            return False, f"SafeSearch Filter: Restricted search query keyword ('{kw}')"
                return True, "Whitelisted Educational Domain"

        # 2. Blocked domains
        for bd in BLOCKED_DOMAINS:
            if matches_domain(host, bd):
                return False, f"School Safety Policy: Domain '{bd}' is restricted"

        # 3. Blocked keywords in query
        for kw in BLOCKED_KEYWORDS:
            if re.search(r'\b' + re.escape(kw) + r'\b', query):
                return False, f"SafeSearch Filter: Restricted search term ('{kw}')"

        return True, "Allowed"
    except Exception as e:
        return False, f"Malformed URL: {e}"

def generate_block_page(url: str, reason: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dawamu OS • Access Restricted</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body {{
      margin: 0; padding: 0;
      background: radial-gradient(circle at 50% 20%, #1e131d 0%, #0d060e 100%);
      color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center; min-height: 100vh;
    }}
    .card {{
      background: rgba(30, 18, 28, 0.9);
      border: 1px solid rgba(244, 63, 94, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border-radius: 24px; max-width: 520px; width: 90%; padding: 36px; text-align: center;
    }}
    .icon {{
      width: 64px; height: 64px; border-radius: 50%;
      background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.4);
      color: #fb7185; display: flex; align-items: center; justify-content: center;
      font-size: 28px; margin: 0 auto 20px;
    }}
    h1 {{ font-size: 22px; font-weight: 800; margin: 0 0 10px; color: #fff; }}
    p {{ color: #cbd5e1; font-size: 13px; line-height: 1.6; margin: 0 0 20px; }}
    .details {{
      background: #09030a; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 14px; font-family: monospace; font-size: 11px;
      color: #fda4af; text-align: left; margin-bottom: 24px; word-break: break-all;
    }}
    .btn {{
      background: #059669; color: #fff; text-decoration: none; padding: 10px 22px;
      border-radius: 12px; font-weight: 700; font-size: 12px; display: inline-flex;
      align-items: center; gap: 8px; transition: all 0.2s; cursor: pointer; border: none;
    }}
    .btn:hover {{ background: #10b981; transform: translateY(-1px); }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon"><i class="fas fa-shield-halved"></i></div>
    <h1>Access Restricted by School Policy</h1>
    <p>{reason}</p>
    <div class="details">
      <b>URL:</b> {url}<br>
      <b>Enforcement:</b> Dawamu OS Network Safety Filter
    </div>
    <button class="btn" onclick="history.back()"><i class="fas fa-arrow-left"></i> Return to Previous Page</button>
  </div>
</body>
</html>"""

@router.get("")
async def safe_web_proxy(url: str = Query(..., description="Target URL to securely retrieve")):
    # Normalize scheme
    target_url = url.strip()
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*://', target_url):
        target_url = "https://" + target_url

    allowed, reason = check_url_security(target_url)
    if not allowed:
        return HTMLResponse(content=generate_block_page(target_url, reason), status_code=status.HTTP_403_FORBIDDEN)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 DawamuOS/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Upgrade-Insecure-Requests": "1"
    }

    try:
        async with httpx.AsyncClient(timeout=14.0, follow_redirects=True, verify=False) as client:
            resp = await client.get(target_url, headers=headers)

        content_type = resp.headers.get("content-type", "text/html")

        if "text/html" in content_type.lower():
            html_text = resp.text
            final_url = str(resp.url)

            # 1. Inject <base href="..."> so relative links, images, styles load from target origin
            base_tag = f'<base href="{final_url}">'
            if "<head>" in html_text:
                html_text = html_text.replace("<head>", f"<head>\n  {base_tag}", 1)
            elif "<HEAD>" in html_text:
                html_text = html_text.replace("<HEAD>", f"<HEAD>\n  {base_tag}", 1)
            else:
                html_text = base_tag + html_text

            # 2. Inject lightweight security header pill
            safe_banner = f"""
            <div id="__dawamu_safe_bar" style="position:sticky;top:0;left:0;right:0;z-index:999999;background:#09121f;border-bottom:1px solid #10b981;padding:6px 16px;display:flex;align-items:center;justify-content:between;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:11px;color:#94a3b8;box-shadow:0 2px 10px rgba(0,0,0,0.5);">
              <div style="display:flex;align-items:center;gap:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                <span style="background:#064e3b;color:#34d399;font-weight:bold;font-size:9px;padding:2px 8px;border-radius:10px;text-transform:uppercase;letter-spacing:0.05em;border:1px solid #059669;">Safe Web Active</span>
                <span style="color:#f1f5f9;font-weight:600;overflow:hidden;text-overflow:ellipsis;">{urllib.parse.urlparse(final_url).netloc}</span>
              </div>
              <div style="margin-left:auto;display:flex;align-items:center;gap:12px;">
                <a href="{final_url}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;text-decoration:none;font-weight:600;font-size:10px;">External View ↗</a>
              </div>
            </div>
            """

            if "<body" in html_text:
                # Insert immediately after <body ...>
                html_text = re.sub(r'(<body[^>]*>)', r'\1' + safe_banner, html_text, count=1, flags=re.IGNORECASE)
            else:
                html_text = safe_banner + html_text

            # 3. Intercept relative / same-site anchor clicks so browsing remains in safe proxy
            interceptor_script = f"""
            <script>
            (function() {{
              document.addEventListener('click', function(e) {{
                var a = e.target.closest('a');
                if (!a || !a.href || a.getAttribute('target') === '_blank') return;
                var href = a.href;
                if (href.startsWith('http://') || href.startsWith('https://')) {{
                  e.preventDefault();
                  window.location.href = '/api/v1/proxy?url=' + encodeURIComponent(href);
                }}
              }}, true);
            }})();
            </script>
            """
            html_text += interceptor_script

            response_headers = {
                "Content-Type": "text/html; charset=utf-8",
                "X-Frame-Options": "ALLOWALL",
                "Cache-Control": "public, max-age=60"
            }
            return HTMLResponse(content=html_text, status_code=resp.status_code, headers=response_headers)
        else:
            return Response(content=resp.content, media_type=content_type, status_code=resp.status_code)

    except httpx.TimeoutException:
        error_html = f"""<!DOCTYPE html>
        <html><head><meta charset="utf-8"><title>Request Timeout</title><style>body{{background:#0b1322;color:#f1f5f9;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}} .box{{background:#111e35;padding:32px;border-radius:20px;max-width:440px;text-align:center;border:1px solid #1e293b;}} h2{{color:#38bdf8;}} p{{font-size:13px;color:#94a3b8;}} a{{color:#34d399;}}</style></head><body><div class="box"><h2>Web Page Timed Out</h2><p>The destination server took too long to respond. You can retry or open it directly.</p><p><a href="{target_url}" target="_blank">Open in External Window</a></p></div></body></html>"""
        return HTMLResponse(content=error_html, status_code=status.HTTP_504_GATEWAY_TIMEOUT)
    except Exception as ex:
        error_html = f"""<!DOCTYPE html>
        <html><head><meta charset="utf-8"><title>Web Sandbox Notice</title><style>body{{background:#0b1322;color:#f1f5f9;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}} .box{{background:#111e35;padding:32px;border-radius:20px;max-width:440px;text-align:center;border:1px solid #1e293b;}} h2{{color:#fb7185;}} p{{font-size:13px;color:#94a3b8;}} a{{color:#38bdf8;text-decoration:none;font-weight:bold;}}</style></head><body><div class="box"><h2>Unable to load page inside sandbox</h2><p>{str(ex)}</p><p><a href="{target_url}" target="_blank">Open "{target_url}" in External Window &rarr;</a></p></div></body></html>"""
        return HTMLResponse(content=error_html, status_code=status.HTTP_502_BAD_GATEWAY)
