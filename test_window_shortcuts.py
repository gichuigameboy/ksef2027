"""
Automated Verification Suite: Window Keyboard Shortcuts & Polished Empty States
Dawamu OS - Quality & Simplification Protocol
"""

import os
import sys
import time
import json
import struct
import socket
import subprocess
import urllib.request
import urllib.parse
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))

# ── Part 1: Static Code Assertions ──
def test_static_code_integrity():
    print("[TEST 1] Verifying WindowManager Keyboard Shortcuts & Method Signatures...")
    wm_path = os.path.join(ROOT, "js", "os", "windowManager.js")
    with open(wm_path, "r", encoding="utf-8") as f:
        wm_code = f.read()

    assert "setupGlobalKeyboardShortcuts" in wm_code, "WindowManager must have setupGlobalKeyboardShortcuts"
    assert "cycleWindows" in wm_code, "WindowManager must have cycleWindows"
    assert "Alt+W" in wm_code or "key === 'w'" in wm_code, "WindowManager must handle Alt+W shortcut"
    assert "Alt+M" in wm_code or "key === 'm'" in wm_code, "WindowManager must handle Alt+M shortcut"
    assert "Alt+Enter" in wm_code or "key === 'Enter'" in wm_code, "WindowManager must handle Alt+Enter shortcut"
    print("  [PASS] WindowManager static code integrity verified.")

    print("[TEST 2] Verifying File Explorer & Docs Empty State Implementation...")
    exp_path = os.path.join(ROOT, "js", "apps", "explorer.js")
    with open(exp_path, "r", encoding="utf-8") as f:
        exp_code = f.read()

    assert "exp-clear-search-btn" in exp_code, "Explorer must support Clear Search button"
    assert "exp-empty-new-file" in exp_code, "Explorer empty state must provide quick New File action"
    assert "exp-empty-file-input" in exp_code, "Explorer empty state must provide quick file import"

    dist_exp = os.path.join(ROOT, "dist-bootable", "dawamu-live-os", "opt", "dawamu-os", "js", "apps", "explorer.js")
    with open(dist_exp, "r", encoding="utf-8") as f:
        dist_code = f.read()
    assert exp_code == dist_code, "dist-bootable explorer.js must match root explorer.js byte-for-byte"

    docs_path = os.path.join(ROOT, "js", "apps", "docs.js")
    with open(docs_path, "r", encoding="utf-8") as f:
        docs_code = f.read()
    assert "doc-empty-new-btn" in docs_code, "Docs app must render empty state button when no note selected"
    print("  [PASS] Empty states and dist-bootable mirroring verified.")


# ── Part 2: Interactive Headless Chrome Verification ──
def ws_connect(url):
    parsed = urllib.parse.urlparse(url)
    sock = socket.create_connection((parsed.hostname, parsed.port), timeout=10)
    key = "dGhlIHNhbXBsZSBub25jZQ=="
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
        header.extend(struct.pack("!H", length))
    else:
        header.append(0x80 | 127)
        header.extend(struct.pack("!Q", length))
    header.extend(mask)
    masked = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
    sock.sendall(bytes(header) + masked)

def ws_recv(sock):
    def recv_exact(n):
        data = b""
        while len(data) < n:
            chunk = sock.recv(n - len(data))
            if not chunk:
                raise ConnectionError("EOF")
            data += chunk
        return data

    b1, b2 = recv_exact(2)
    length = b2 & 0x7F
    if length == 126:
        length = struct.unpack("!H", recv_exact(2))[0]
    elif length == 127:
        length = struct.unpack("!Q", recv_exact(8))[0]
    payload = recv_exact(length)
    return payload.decode("utf-8", errors="replace")

def test_interactive_browser_features():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

    user_data = r"C:\Users\infin\AppData\Local\Temp\dawamu_test_shortcuts_run"
    if os.path.exists(user_data):
        try:
            shutil.rmtree(user_data, ignore_errors=True)
        except Exception:
            pass

    index_url = "file:///" + os.path.abspath(os.path.join(ROOT, "index.html")).replace("\\", "/")
    port = 9260

    proc = subprocess.Popen(
        [
            chrome_path,
            "--headless=new",
            "--disable-gpu",
            "--window-size=1280,800",
            f"--remote-debugging-port={port}",
            "--remote-allow-origins=*",
            f"--user-data-dir={user_data}",
            index_url,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        time.sleep(1.5)
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/json") as resp:
            targets = json.loads(resp.read().decode())
        ws_url = [t for t in targets if t.get("type") == "page"][0]["webSocketDebuggerUrl"]
        sock = ws_connect(ws_url)
        msg_id = 0

        def evaluate(expr):
            nonlocal msg_id
            msg_id += 1
            ws_send(sock, json.dumps({
                "id": msg_id,
                "method": "Runtime.evaluate",
                "params": {"expression": expr, "returnByValue": True}
            }))
            while True:
                data = json.loads(ws_recv(sock))
                if data.get("id") == msg_id:
                    res = data["result"].get("result", {})
                    return res.get("value")

        # 1. Quick Login
        evaluate("document.querySelector('[data-quick-login][data-adm=\"1001\"]').click()")
        time.sleep(0.5)

        # 2. Launch Word
        evaluate("document.querySelector('.desktop-icon[data-app-id=\"word\"]').click()")
        time.sleep(0.5)

        # Test 3: Keyboard Shortcut Alt+Enter (Maximize Window)
        res_max = evaluate("""
            (() => {
                const win = windowManager.windows.get('word');
                const wasMax = win.maximized;
                
                // Dispatch Alt+Enter
                window.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    altKey: true,
                    bubbles: true
                }));
                
                return {
                    wasMax,
                    isMax: win.maximized,
                    hasMaxClass: win.element.classList.contains('maximized')
                };
            })()
        """)
        print("[TEST 3] Alt+Enter Maximize Window:", res_max)
        assert res_max["isMax"] and res_max["hasMaxClass"], f"Alt+Enter failed to maximize window: {res_max}"

        # Test 4: Keyboard Shortcut Alt+Down (Restore Maximized Window)
        res_restore = evaluate("""
            (() => {
                const win = windowManager.windows.get('word');
                
                // Dispatch Alt+ArrowDown
                window.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'ArrowDown',
                    code: 'ArrowDown',
                    altKey: true,
                    bubbles: true
                }));
                
                return {
                    isMax: win.maximized,
                    hasMaxClass: win.element.classList.contains('maximized')
                };
            })()
        """)
        print("[TEST 4] Alt+Down Restore Window:", res_restore)
        assert not res_restore["isMax"] and not res_restore["hasMaxClass"], f"Alt+Down failed to restore: {res_restore}"

        # Test 5: Keyboard Shortcut Alt+M (Minimize Window)
        res_min = evaluate("""
            (() => {
                const win = windowManager.windows.get('word');
                
                // Dispatch Alt+M
                window.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'm',
                    code: 'KeyM',
                    altKey: true,
                    bubbles: true
                }));
                
                return {
                    isMin: win.minimized,
                    hasMinClass: win.element.classList.contains('minimized')
                };
            })()
        """)
        print("[TEST 5] Alt+M Minimize Window:", res_min)
        assert res_min["isMin"] and res_min["hasMinClass"], f"Alt+M failed to minimize window: {res_min}"

        # Test 6: Restore window, then Alt+W (Close Window)
        res_close = evaluate("""
            (() => {
                windowManager.restoreWindow('word');
                const beforeCount = windowManager.windows.size;
                
                // Dispatch Alt+W
                window.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'w',
                    code: 'KeyW',
                    altKey: true,
                    bubbles: true
                }));
                
                return {
                    beforeCount,
                    hasWord: windowManager.windows.has('word')
                };
            })()
        """)
        print("[TEST 6] Alt+W Close Window:", res_close)
        assert not res_close["hasWord"], f"Alt+W failed to close window: {res_close}"

        # Test 7: File Explorer Empty Search State & Clear Search Button
        evaluate("document.querySelector('.desktop-icon[data-app-id=\"explorer\"]').click()")
        time.sleep(0.5)

        res_search_empty = evaluate("""
            (() => {
                const expWin = document.getElementById('window-explorer');
                const searchInput = expWin.querySelector('#exp-search');
                searchInput.value = 'nonexistent_qwerty_999';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                const clearBtn = expWin.querySelector('#exp-clear-search-btn');
                const noFilesText = expWin.querySelector('#files-container').textContent;
                
                return {
                    hasClearBtn: !!clearBtn,
                    hasNoFilesMsg: noFilesText.includes('No files found')
                };
            })()
        """)
        print("[TEST 7] Explorer Empty Search State:", res_search_empty)
        assert res_search_empty["hasClearBtn"] and res_search_empty["hasNoFilesMsg"], f"Empty search state failed: {res_search_empty}"

        # Test 8: Click Clear Search Button -> Restores files
        res_clear_click = evaluate("""
            (() => {
                const expWin = document.getElementById('window-explorer');
                const clearBtn = expWin.querySelector('#exp-clear-search-btn');
                clearBtn.click();
                
                const itemsCount = expWin.querySelectorAll('.file-item').length;
                return {
                    itemsCount,
                    searchVal: expWin.querySelector('#exp-search').value
                };
            })()
        """)
        print("[TEST 8] Explorer Clear Search Click:", res_clear_click)
        assert res_clear_click["itemsCount"] > 0, f"Clear search failed to restore files: {res_clear_click}"
        evaluate("windowManager.closeWindow('explorer', true)")
        time.sleep(0.3)

        # Test 9: Study Notes Empty State & Action Button
        evaluate("document.querySelector('.desktop-icon[data-app-id=\"docs\"]').click()")
        time.sleep(0.5)

        res_docs_empty = evaluate("""
            (() => {
                const docsWin = document.getElementById('window-docs');
                const app = docsWin.querySelector('#body-docs').firstElementChild;
                const controller = app.__dawamuAppController;
                
                // Explicitly test loadDoc(null)
                controller.loadDoc(null, true);
                
                const emptyCard = docsWin.querySelector('#doc-empty-new-btn');
                const hasEmptyCard = !!emptyCard;
                
                // Click create first note button
                emptyCard?.click();
                
                return {
                    hasEmptyCard,
                    activeTitle: docsWin.querySelector('#doc-title-input').value,
                    editorEditable: docsWin.querySelector('#doc-editor').getAttribute('contenteditable')
                };
            })()
        """)
        print("[TEST 9] Docs Empty State:", res_docs_empty)
        assert res_docs_empty["hasEmptyCard"], "Empty state card was not rendered on loadDoc(null)"
        assert len(res_docs_empty["activeTitle"]) > 0, "Clicking create note failed to create a note"
        evaluate("windowManager.closeWindow('docs', true)")

        print("\nALL 9 WINDOW SHORTCUT & EMPTY STATE TESTS PASSED 100%!")

    finally:
        proc.terminate()

if __name__ == "__main__":
    test_static_code_integrity()
    test_interactive_browser_features()
