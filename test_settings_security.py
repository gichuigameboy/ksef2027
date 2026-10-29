"""
Verification test for Milestone 2:
Settings Parental & District Policy consolidation with PIN authentication.
"""
import base64
import json
import os
import socket
import struct
import subprocess
import time
import urllib.parse
import urllib.request
from pathlib import Path

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
index_url = Path(r"c:\Users\infin\Desktop\ksef2027\index.html").as_uri()

proc = subprocess.Popen(
    [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--window-size=1280,800",
        "--remote-debugging-port=9255",
        "--remote-allow-origins=*",
        "--user-data-dir=C:\\Users\\infin\\AppData\\Local\\Temp\\dawamu_chrome_test_sec_check",
        index_url,
    ],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

def ws_connect(ws_url):
    parsed = urllib.parse.urlparse(ws_url)
    sock = socket.create_connection((parsed.hostname, parsed.port), timeout=5)
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
        header.extend(struct.pack("!H", length))
    else:
        header.append(0x80 | 127)
        header.extend(struct.pack("!Q", length))
    header.extend(mask)
    masked = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
    sock.sendall(bytes(header) + masked)

def ws_recv(sock):
    def recv_exact(n):
        buf = b""
        while len(buf) < n:
            chunk = sock.recv(n - len(buf))
            if not chunk:
                raise ConnectionError("Connection closed while receiving")
            buf += chunk
        return buf

    b1, b2 = recv_exact(2)
    length = b2 & 0x7F
    if length == 126:
        length = struct.unpack("!H", recv_exact(2))[0]
    elif length == 127:
        length = struct.unpack("!Q", recv_exact(8))[0]
    payload = recv_exact(length)
    return payload.decode("utf-8", errors="replace")

try:
    ws_url = None
    for _ in range(30):
        try:
            with urllib.request.urlopen("http://127.0.0.1:9255/json") as resp:
                targets = json.loads(resp.read().decode())
            page_targets = [t for t in targets if t.get("type") == "page"]
            if page_targets:
                ws_url = page_targets[0]["webSocketDebuggerUrl"]
                break
        except Exception:
            time.sleep(0.2)
    assert ws_url, "Failed to connect to headless Chrome"

    sock = ws_connect(ws_url)
    msg_id = 0

    def evaluate(expr):
        global msg_id
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
                if "exceptionDetails" in data["result"]:
                    print("EVAL ERROR:", data["result"]["exceptionDetails"])
                return res.get("value")

    time.sleep(0.5)

    # 1. Login with demo user
    evaluate("document.querySelector('[data-quick-login][data-adm=\"1001\"]').click()")
    time.sleep(0.6)
    step1 = evaluate("""
        (() => {
            return {
                booted: Boolean(window.__DAWAMU_OS_BOOTED__),
                contextMenuExists: Boolean(document.getElementById('desktop-context-menu'))
            };
        })()
    """)
    print("Step 1 (Logged In & Booted):", step1)

    # 2. Open Settings and navigate to Security tab
    step2 = evaluate("""
        (() => {
            const settingsIcon = document.querySelector('.desktop-icon[data-app-id="settings"]');
            if (!settingsIcon) return { error: 'Settings icon not found on desktop' };
            settingsIcon.click();

            const win = document.getElementById('window-settings');
            if (!win) return { error: 'window-settings not found after clicking icon' };

            const secNavBtn = win.querySelector('.settings-nav-btn[data-cat="security"]');
            if (secNavBtn) secNavBtn.click();

            const hasUnlockBtn = win.querySelector('#policy-unlock-btn') !== null;
            const hasPinInput = win.querySelector('#policy-pin-input') !== null;
            const hasRelockBtn = win.querySelector('#policy-relock-btn') !== null;

            return {
                winExists: true,
                hasUnlockBtn: hasUnlockBtn,
                hasPinInput: hasPinInput,
                hasRelockBtn: hasRelockBtn
            };
        })()
    """)
    print("Step 2 (Settings Policy Locked State):", step2)
    assert step2 and step2.get("winExists") is True, f"Failed step 2: {step2}"
    assert step2["hasUnlockBtn"] is True
    assert step2["hasPinInput"] is True
    assert step2["hasRelockBtn"] is False

    # 3. Enter PIN 1234 and Unlock
    step3 = evaluate("""
        (() => {
            const win = document.getElementById('window-settings');
            const pinInput = win.querySelector('#policy-pin-input');
            pinInput.value = '1234';
            const unlockBtn = win.querySelector('#policy-unlock-btn');
            unlockBtn.click();

            const hasRelockBtn = win.querySelector('#policy-relock-btn') !== null;
            const hasBrowserToggle = win.querySelector('#set-toggle-browser') !== null;
            const hasSafeSearchToggle = win.querySelector('#set-toggle-safesearch') !== null;
            const hasAddDomainBtn = win.querySelector('#set-add-domain-btn') !== null;

            return {
                hasRelockBtn: hasRelockBtn,
                hasBrowserToggle: hasBrowserToggle,
                hasSafeSearchToggle: hasSafeSearchToggle,
                hasAddDomainBtn: hasAddDomainBtn
            };
        })()
    """)
    print("Step 3 (Settings Policy Unlocked State):", step3)
    assert step3["hasRelockBtn"] is True
    assert step3["hasBrowserToggle"] is True
    assert step3["hasSafeSearchToggle"] is True
    assert step3["hasAddDomainBtn"] is True

    # 4. Toggle a restriction and verify stateStore updates
    step4 = evaluate("""
        (() => {
            const store = window.stateStore || window.__dawamuModules.stateStore;
            const win = document.getElementById('window-settings');
            const browserToggle = win.querySelector('#set-toggle-browser');
            const originalState = browserToggle.checked;
            browserToggle.checked = !originalState;
            browserToggle.dispatchEvent(new Event('change', { bubbles: true }));

            const storedState = store.getState().restrictions.browserEnabled;
            return {
                originalState: originalState,
                storedState: storedState,
                matches: storedState === !originalState
            };
        })()
    """)
    print("Step 4 (Restriction Toggle Mutator):", step4)
    assert step4["matches"] is True

    # 5. Add a blocked domain
    step5 = evaluate("""
        (() => {
            const store = window.stateStore || window.__dawamuModules.stateStore;
            const win = document.getElementById('window-settings');
            const dInput = win.querySelector('#set-new-domain');
            dInput.value = 'distracting-arcade.com';
            const addBtn = win.querySelector('#set-add-domain-btn');
            addBtn.click();

            const blockedList = store.getState().restrictions.blockedDomains;
            return {
                hasDomain: blockedList.includes('distracting-arcade.com')
            };
        })()
    """)
    print("Step 5 (Add Blocked Domain):", step5)
    assert step5["hasDomain"] is True

    # 6. Re-lock policy controls
    step6 = evaluate("""
        (() => {
            const win = document.getElementById('window-settings');
            const relockBtn = win.querySelector('#policy-relock-btn');
            relockBtn.click();

            const hasUnlockBtn = win.querySelector('#policy-unlock-btn') !== null;
            const hasRelockBtn = win.querySelector('#policy-relock-btn') !== null;
            return {
                isLocked: hasUnlockBtn && !hasRelockBtn
            };
        })()
    """)
    print("Step 6 (Re-lock Policy Controls):", step6)
    assert step6["isLocked"] is True

    print("\nALL SETTINGS SECURITY POLICY CONSOLIDATION TESTS PASSED 100%!")

finally:
    proc.terminate()
