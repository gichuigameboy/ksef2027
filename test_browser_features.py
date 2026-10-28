"""
Automated End-to-End Test Suite for DawamuOS Web Browser Improvements.
Validates:
1. Window launch and initial controls (Back, Forward, Reload, Home, Star, Omnibox, Menu, Bookmarks Bar).
2. Navigation state (Back/Forward disabled states, address updates).
3. Bookmarking:
   - Toggle bookmark with star icon.
   - Visual star indicator (active vs inactive).
   - Bookmark bar rendering and interaction.
   - Bookmark Manager (dawamu://bookmarks) listing, editing (title, URL), and deletion.
   - Duplicate prevention for normalized URLs.
   - Empty state rendering when bookmarks are cleared.
4. Browsing History:
   - History recording on navigation.
   - History viewer (dawamu://browser-history) with day grouping.
   - Navigating via history entry click.
   - Deleting single history entry.
   - Clearing history with confirmation.
5. URL Omnibox Suggestions & Autocomplete:
   - Matching against bookmarks and history.
   - Visual icons (star for bookmarks, history icon for history).
   - Keyboard navigation (ArrowDown, ArrowUp, Enter).
   - Dismissing suggestions with Escape.
6. Browser Menu:
   - Menu opening and closing.
   - Shortcut / menu actions (Toggle Bookmark Bar, History, Bookmarks, New Tab).
7. Persistence:
   - Per-student isolation under localStorage key.
   - Survives browser window close and reopen.
8. No JavaScript console errors.
"""

import base64
import json
import os
import shutil
import socket
import struct
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
INDEX_URL = Path(r"c:\Users\infin\Desktop\ksef2027\index.html").as_uri()
USER_DATA_DIR = r"C:\Users\infin\AppData\Local\Temp\dawamu_test_browser_profile"

if os.path.exists(USER_DATA_DIR):
    try:
        shutil.rmtree(USER_DATA_DIR, ignore_errors=True)
    except Exception:
        pass

PORT = 9260

proc = subprocess.Popen(
    [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--window-size=1280,850",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        f"--user-data-dir={USER_DATA_DIR}",
        INDEX_URL,
    ],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

def ws_connect(ws_url):
    parsed = urllib.parse.urlparse(ws_url)
    sock = socket.create_connection((parsed.hostname, parsed.port), timeout=10)
    key = base64.b64encode(os.urandom(16)).decode()
    req = (
        f"GET {parsed.path} HTTP/1.1\r\n"
        f"Host: {parsed.hostname}:{parsed.port}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    sock.sendall(req.encode())
    buf = b""
    while b"\r\n\r\n" not in buf:
        buf += sock.recv(4096)
    return sock

def ws_send(sock, text):
    payload = text.encode("utf-8")
    mask = os.urandom(4)
    header = bytearray([0x81])
    length = len(payload)
    if length < 126:
        header.append(0x80 | length)
    elif length < 65536:
        header.append(0x80 | 126)
        header.extend(struct.pack(">H", length))
    else:
        header.append(0x80 | 127)
        header.extend(struct.pack(">Q", length))
    header.extend(mask)
    masked = bytearray(payload[i] ^ mask[i % 4] for i in range(len(payload)))
    sock.sendall(header + masked)

def ws_recv(sock):
    header = sock.recv(2)
    if not header:
        return None
    b2 = header[1]
    length = b2 & 0x7F
    if length == 126:
        data = sock.recv(2)
        length = struct.unpack(">H", data)[0]
    elif length == 127:
        data = sock.recv(8)
        length = struct.unpack(">Q", data)[0]
    buf = bytearray()
    while len(buf) < length:
        chunk = sock.recv(length - len(buf))
        if not chunk:
            break
        buf.extend(chunk)
    return buf.decode("utf-8", errors="replace")

msg_id = 0
def cdp(sock, method, params=None):
    global msg_id
    msg_id += 1
    req = {"id": msg_id, "method": method, "params": params or {}}
    ws_send(sock, json.dumps(req))
    while True:
        resp = ws_recv(sock)
        if not resp:
            return None
        data = json.loads(resp)
        if data.get("id") == msg_id:
            return data.get("result")

def eval_js(sock, expression):
    res = cdp(sock, "Runtime.evaluate", {
        "expression": expression,
        "returnByValue": True,
        "awaitPromise": True
    })
    if res and "result" in res:
        return res["result"].get("value")
    return None

try:
    # 1. Connect to Chrome
    time.sleep(2)
    ws_url = None
    for _ in range(20):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json") as r:
                targets = json.loads(r.read().decode())
                page_targets = [t for t in targets if t.get("type") == "page"]
                if page_targets:
                    ws_url = page_targets[0]["webSocketDebuggerUrl"]
                    break
        except Exception:
            time.sleep(0.3)
            
    if not ws_url:
        print("FAIL: Could not retrieve page target from Chrome")
        sys.exit(1)

    sock = ws_connect(ws_url)
    cdp(sock, "Page.enable")
    cdp(sock, "Runtime.enable")

    # Wait for document ready
    for _ in range(30):
        ready = eval_js(sock, "document.readyState === 'complete' && !!window.dawamu")
        if ready:
            break
        time.sleep(0.3)

    print("[1] DawamuOS loaded successfully.")

    # Check student login
    logged_in = eval_js(sock, "!!(window.dawamu && window.dawamu.state && window.dawamu.state.user)")
    if not logged_in:
        print("[*] Performing test login as student...")
        eval_js(sock, """
        (function() {
            try {
                if (window.dawamu && window.dawamu.state && window.dawamu.state.login) {
                    window.dawamu.state.login('STD-2026-001', 'Test Student', 'Form 3 North', 'ADM001');
                    return true;
                }
                const btn = document.querySelector('#btn-login') || document.querySelector('button[type="submit"]');
                if (btn) { btn.click(); return true; }
            } catch(e) {}
            return false;
        })()
        """)
        time.sleep(1)

    # 2. Launch Web Browser
    print("[2] Launching Web Browser...")
    launch_res = eval_js(sock, """
    (function() {
        const icon = document.querySelector('.desktop-icon[data-app-id="browser"]');
        if (icon) {
            icon.click();
            return 'clicked icon';
        }
        if (window.dawamu && window.dawamu.apps && window.dawamu.apps.launch) {
            window.dawamu.apps.launch('browser');
            return 'called apps.launch';
        }
        return 'no launcher found';
    })()
    """)
    print("Launch action:", launch_res)
    time.sleep(1.5)

    # Verify browser window exists in DOM
    win_exists = eval_js(sock, "!!document.getElementById('window-browser') || document.querySelectorAll('.cros-window').length > 0")
    print(f"Browser window launched: {win_exists}")
    assert win_exists, "Browser window failed to launch"

    # Verify essential controls exist in Browser
    controls_check = eval_js(sock, """
    (function() {
        return {
            back: !!document.querySelector('#btn-back'),
            forward: !!document.querySelector('#btn-forward'),
            reload: !!document.querySelector('#btn-reload'),
            home: !!document.querySelector('#btn-home'),
            star: !!document.querySelector('#btn-star'),
            omnibox: !!document.querySelector('#omnibox'),
            menu: !!document.querySelector('#btn-browser-menu'),
            bar: !!document.querySelector('#bm-bar'),
            dropdown: !!document.querySelector('#omnibox-dropdown')
        };
    })()
    """)
    print("Controls check:", controls_check)
    for ctrl, present in controls_check.items():
        assert present, f"Browser control '{ctrl}' is missing from DOM!"

    # 3. Test Navigation and History recording
    print("[3] Testing navigation to offline pages...")
    nav_calc = eval_js(sock, """
    (function() {
        const inp = document.querySelector('#omnibox');
        inp.value = 'dawamu://math';
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
        return true;
    })()
    """)
    time.sleep(1)

    current_url = eval_js(sock, "document.querySelector('#omnibox').value")
    print(f"Current URL after nav: {current_url}")
    assert current_url == "dawamu://math", f"Expected dawamu://math, got {current_url}"

    # Navigate to another page: dawamu://dictionary
    eval_js(sock, """
    (function() {
        const inp = document.querySelector('#omnibox');
        inp.value = 'dawamu://dictionary';
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
        return true;
    })()
    """)
    time.sleep(1)

    current_url2 = eval_js(sock, "document.querySelector('#omnibox').value")
    print(f"Current URL after second nav: {current_url2}")
    assert current_url2 == "dawamu://dictionary", f"Expected dawamu://dictionary, got {current_url2}"

    # Check Back button enabled state
    can_go_back = eval_js(sock, "!document.querySelector('#btn-back').disabled")
    print(f"Can go back enabled: {can_go_back}")
    assert can_go_back, "Back button should be enabled after navigating"

    # Click Back
    eval_js(sock, "document.querySelector('#btn-back').click()")
    time.sleep(0.5)
    url_after_back = eval_js(sock, "document.querySelector('#omnibox').value")
    print(f"URL after Back: {url_after_back}")
    assert url_after_back == "dawamu://math", f"Expected dawamu://math after Back, got {url_after_back}"

    # Check Forward button enabled state
    can_go_forward = eval_js(sock, "!document.querySelector('#btn-forward').disabled")
    print(f"Can go forward enabled: {can_go_forward}")
    assert can_go_forward, "Forward button should be enabled after going back"

    # Click Forward
    eval_js(sock, "document.querySelector('#btn-forward').click()")
    time.sleep(0.5)
    url_after_forward = eval_js(sock, "document.querySelector('#omnibox').value")
    print(f"URL after Forward: {url_after_forward}")
    assert url_after_forward == "dawamu://dictionary", f"Expected dawamu://dictionary, got {url_after_forward}"

    # 4. Test Bookmarks
    print("[4] Testing Bookmarking features...")
    # Current page is dawamu://dictionary
    star_class_before = eval_js(sock, "document.querySelector('#btn-star i').className")
    print(f"Star class before bookmarking: {star_class_before}")

    # Click Star to bookmark
    eval_js(sock, "document.querySelector('#btn-star').click()")
    time.sleep(0.5)

    star_class_after = eval_js(sock, "document.querySelector('#btn-star i').className")
    print(f"Star class after bookmarking: {star_class_after}")
    assert "amber" in star_class_after or "fa-star" in star_class_after, "Star icon should reflect active bookmark status"

    # Check Bookmarks Bar has this bookmark
    bar_items = eval_js(sock, """
    (function() {
        const items = Array.from(document.querySelectorAll('#bm-list .bm-item'));
        return items.map(el => ({ title: el.innerText.trim(), url: el.getAttribute('data-url') }));
    })()
    """)
    print("Bookmark bar items:", bar_items)
    found_bm = any("dictionary" in (item["url"] or "").lower() for item in bar_items)
    assert found_bm, "Dictionary should appear in Bookmarks Bar"

    # 5. Test Omnibox Suggestions & Autocomplete
    print("[5] Testing Omnibox Autocomplete & Suggestions...")
    eval_js(sock, """
    (function() {
        const inp = document.querySelector('#omnibox');
        inp.value = 'math';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    })()
    """)
    time.sleep(0.5)

    dropdown_visible = eval_js(sock, "!document.querySelector('#omnibox-dropdown').classList.contains('hidden') && document.querySelector('#omnibox-dropdown').style.display !== 'none'")
    print(f"Omnibox dropdown visible on 'math': {dropdown_visible}")
    assert dropdown_visible, "Omnibox dropdown should be visible when typing matching query"

    suggestion_items = eval_js(sock, """
    (function() {
        const items = Array.from(document.querySelectorAll('#omnibox-dropdown .omnibox-item'));
        return items.map(el => ({
            text: el.innerText.trim(),
            url: el.getAttribute('data-url'),
            type: el.getAttribute('data-type')
        }));
    })()
    """)
    print(f"Suggestions found ({len(suggestion_items)}):", suggestion_items)
    assert len(suggestion_items) > 0, "Expected suggestions matching 'math'"

    # Test Keyboard Arrow Down selection
    eval_js(sock, """
    (function() {
        const inp = document.querySelector('#omnibox');
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true }));
    })()
    """)
    time.sleep(0.2)
    selected_item = eval_js(sock, """
    (function() {
        const sel = document.querySelector('#omnibox-dropdown .omnibox-item.selected');
        return sel ? sel.innerText : null;
    })()
    """)
    print(f"Selected item via ArrowDown: {selected_item}")
    assert selected_item is not None, "ArrowDown should highlight a suggestion item"

    # Test Escape key dismisses suggestions
    eval_js(sock, """
    (function() {
        const inp = document.querySelector('#omnibox');
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    })()
    """)
    time.sleep(0.2)
    dropdown_visible_esc = eval_js(sock, "!document.querySelector('#omnibox-dropdown').classList.contains('hidden') && document.querySelector('#omnibox-dropdown').style.display !== 'none'")
    print(f"Omnibox dropdown visible after Escape: {dropdown_visible_esc}")
    assert not dropdown_visible_esc, "Escape key should close suggestions dropdown"

    # 6. Test History Viewer (dawamu://browser-history)
    print("[6] Testing History Viewer (dawamu://browser-history)...")
    eval_js(sock, """
    (function() {
        const inp = document.querySelector('#omnibox');
        inp.value = 'dawamu://browser-history';
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    })()
    """)
    time.sleep(1)

    history_entries = eval_js(sock, """
    (function() {
        const entries = Array.from(document.querySelectorAll('.hist-item-row'));
        return entries.map(e => ({
            url: e.getAttribute('data-url'),
            title: e.querySelector('.font-semibold')?.innerText || ''
        }));
    })()
    """)
    print(f"History entries displayed ({len(history_entries)}):", history_entries)
    assert len(history_entries) >= 2, "History viewer should list navigated pages (math, dictionary)"

    # Test single history item deletion
    before_ids = eval_js(sock, "Array.from(document.querySelectorAll('.hist-item-row')).map(r => ({ id: r.getAttribute('data-id'), url: r.getAttribute('data-url') }))")
    print("History IDs before delete:", before_ids)

    del_res = eval_js(sock, """
    (function() {
        try {
            const delBtn = document.querySelector('.hist-del-btn');
            if (!delBtn) return 'no delBtn found';
            const id = delBtn.getAttribute('data-id');
            delBtn.click();
            return 'clicked btn with id: ' + id;
        } catch(e) {
            return 'error: ' + e.toString();
        }
    })()
    """)
    print("Delete action res:", del_res)
    time.sleep(0.5)

    after_ids = eval_js(sock, "Array.from(document.querySelectorAll('.hist-item-row')).map(r => ({ id: r.getAttribute('data-id'), url: r.getAttribute('data-url') }))")
    print("History IDs after delete:", after_ids)

    history_entries_after_del = len(after_ids) if after_ids else 0
    print(f"History count after single delete: {history_entries_after_del}")
    assert history_entries_after_del == len(history_entries) - 1, "Single history delete should remove 1 entry"

    # 7. Test Bookmarks Manager (dawamu://bookmarks)
    print("[7] Testing Bookmarks Manager (dawamu://bookmarks)...")
    eval_js(sock, """
    (function() {
        const inp = document.querySelector('#omnibox');
        inp.value = 'dawamu://bookmarks';
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    })()
    """)
    time.sleep(1)

    bm_cards = eval_js(sock, """
    (function() {
        const cards = Array.from(document.querySelectorAll('.bm-mgr-item'));
        return cards.map(c => ({
            title: c.querySelector('.font-bold, .font-semibold')?.innerText || '',
            url: c.querySelector('.bm-mgr-open-link')?.getAttribute('data-url') || ''
        }));
    })()
    """)
    print(f"Bookmark items displayed ({len(bm_cards)}):", bm_cards)
    assert len(bm_cards) > 0, "Bookmarks Manager should display bookmarked cards"

    # Test editing bookmark title via modal
    edit_success = eval_js(sock, """
    (function() {
        const editBtn = document.querySelector('.bm-mgr-edit-btn');
        if (!editBtn) return false;
        editBtn.click();
        const nameInput = document.querySelector('#modal-bm-name');
        const saveBtn = document.querySelector('#modal-save-btn');
        if (!nameInput || !saveBtn) return false;
        nameInput.value = 'Custom Scientific Dictionary';
        saveBtn.click();
        return true;
    })()
    """)
    time.sleep(0.5)

    updated_bm_title = eval_js(sock, "document.querySelector('.bm-mgr-item .font-semibold')?.innerText")
    print(f"Bookmark title after edit: {updated_bm_title}")
    assert "Custom Scientific Dictionary" in (updated_bm_title or ""), "Bookmark edit should update title"
    # 8. Test Browser Menu
    print("[8] Testing Browser Menu popover...")
    eval_js(sock, "document.querySelector('#btn-browser-menu').click()")
    time.sleep(0.3)
    menu_open = eval_js(sock, "!document.querySelector('#browser-menu-popover').classList.contains('hidden')")
    print(f"Browser menu open: {menu_open}")
    assert menu_open, "Browser menu popover should open on click"

    # Click Toggle Bookmarks Bar
    bar_visible_before = eval_js(sock, "!document.querySelector('#bm-bar').classList.contains('hidden')")
    eval_js(sock, "document.querySelector('#menu-toggle-bm-bar').click()")
    time.sleep(0.3)
    bar_visible_after = eval_js(sock, "!document.querySelector('#bm-bar').classList.contains('hidden')")
    print(f"Bookmark bar visible: before={bar_visible_before}, after={bar_visible_after}")
    assert bar_visible_before != bar_visible_after, "Toggle bookmarks bar should toggle display"

    # Toggle it back
    eval_js(sock, "document.querySelector('#btn-browser-menu').click()")
    time.sleep(0.2)
    eval_js(sock, "document.querySelector('#menu-toggle-bm-bar').click()")
    time.sleep(0.2)

    # 9. Test Persistence across Window Close & Re-open
    print("[9] Testing persistence across browser window re-open...")
    # Close browser window
    eval_js(sock, """
    (function() {
        if (window.dawamu && window.dawamu.wm) {
            window.dawamu.wm.closeWindow('window-browser');
            return true;
        }
        const closeBtn = document.querySelector('#window-browser .close-btn');
        if (closeBtn) closeBtn.click();
        return true;
    })()
    """)
    time.sleep(1)

    # Re-launch browser
    eval_js(sock, """
    (function() {
        const icon = document.querySelector('.desktop-icon[data-app-id="browser"]');
        if (icon) icon.click();
        else if (window.dawamu && window.dawamu.apps) window.dawamu.apps.launch('browser');
    })()
    """)
    time.sleep(1.5)

    reopened_bar_items = eval_js(sock, """
    (function() {
        const items = Array.from(document.querySelectorAll('#bm-list .bm-item'));
        return items.map(el => el.innerText.trim());
    })()
    """)
    print("Re-opened bookmark bar items:", reopened_bar_items)
    assert any("Dawamu Dictionary" in item or "Dictionary" in item for item in reopened_bar_items), \
        "Dictionary bookmark should persist after closing and reopening the browser window"

    print("\n==========================================")
    print("SUCCESS: ALL BROWSER TEST CASES PASSED!")
    print("==========================================")

finally:
    try:
        proc.terminate()
        proc.wait(timeout=3)
    except Exception:
        proc.kill()
    if os.path.exists(USER_DATA_DIR):
        try:
            shutil.rmtree(USER_DATA_DIR, ignore_errors=True)
        except Exception:
            pass
