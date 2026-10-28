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

proc = subprocess.Popen(
    [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--window-size=1280,800",
        "--remote-debugging-port=9235",
        "--remote-allow-origins=*",
        "--user-data-dir=C:\\Users\\infin\\AppData\\Local\\Temp\\dawamu_chrome_test_cm",
        index_url,
    ],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

try:
    ws_url = None
    for _ in range(30):
        try:
            with urllib.request.urlopen("http://127.0.0.1:9235/json") as resp:
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
                return data["result"]["result"].get("value")

    time.sleep(0.5)

    # 1. Login with demo user
    step1 = evaluate("""
        (() => {
            document.querySelector('[data-quick-login][data-adm="1001"]').click();
            return {
                booted: Boolean(window.__DAWAMU_OS_BOOTED__),
                contextMenuExists: Boolean(document.getElementById('desktop-context-menu'))
            };
        })()
    """)
    print("Step 1 (Logged In & Booted):", step1)
    assert step1["booted"] is True
    assert step1["contextMenuExists"] is True

    # 2. Trigger Right-Click on Desktop Wallpaper
    step2 = evaluate("""
        (() => {
            const desktop = document.getElementById('desktop');
            const evt = new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: 400,
                clientY: 300,
                button: 2
            });
            desktop.dispatchEvent(evt);

            const menu = document.getElementById('desktop-context-menu');
            const items = Array.from(menu.querySelectorAll('.context-menu-item')).map(el => el.textContent.trim());
            return {
                isOpen: menu.classList.contains('open'),
                opacity: getComputedStyle(menu).opacity,
                left: menu.style.left,
                top: menu.style.top,
                itemsCount: items.length,
                hasNewFolder: items.some(t => t.includes('New Folder')),
                hasSort: items.some(t => t.includes('Sort Icons By')),
                hasWallpaper: items.some(t => t.includes('Change Wallpaper'))
            };
        })()
    """)
    print("Step 2 (Desktop Context Menu Opened):", step2)
    assert step2["isOpen"] is True
    assert step2["itemsCount"] >= 8
    assert step2["hasNewFolder"] is True
    assert step2["hasSort"] is True
    assert step2["hasWallpaper"] is True

    # 3. Test Sort Icons By Name (A -> Z)
    step3 = evaluate("""
        (() => {
            const sortNameBtn = document.querySelector('[data-action="sort-name"]');
            sortNameBtn.click();
            const labels = Array.from(document.querySelectorAll('#desktop-icons .desktop-icon-label')).map(l => l.textContent.trim());
            return {
                firstIcon: labels[0],
                lastIcon: labels[labels.length - 1],
                isSorted: labels[0] <= labels[1] && labels[1] <= labels[2]
            };
        })()
    """)
    print("Step 3 (Sorted Icons A to Z):", step3)
    assert step3["isSorted"] is True

    # 4. Right click on Desktop Icon (Safe Web)
    step4 = evaluate("""
        (() => {
            const icon = document.querySelector('.desktop-icon[data-app-id="browser"]');
            const rect = icon.getBoundingClientRect();
            const evt = new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 10,
                clientY: rect.top + 10,
                button: 2
            });
            icon.dispatchEvent(evt);

            const menu = document.getElementById('desktop-context-menu');
            const header = menu.querySelector('.context-menu-header')?.textContent.trim();
            const openBtn = menu.querySelector('[data-action="open-app"]')?.textContent.trim();
            return {
                isOpen: menu.classList.contains('open'),
                header: header,
                openBtn: openBtn
            };
        })()
    """)
    print("Step 4 (Icon Context Menu for Safe Web):", step4)
    assert step4["isOpen"] is True
    assert "Safe Web" in step4["header"]
    assert "Open" in step4["openBtn"]

    # 5. Click Open on the App Context Menu to launch Safe Web
    step5 = evaluate("""
        (() => {
            const openBtn = document.querySelector('#desktop-context-menu [data-action="open-app"]');
            openBtn.click();
            const win = document.getElementById('window-browser');
            const menu = document.getElementById('desktop-context-menu');
            return {
                menuClosed: !menu.classList.contains('open'),
                browserWindowOpened: Boolean(win)
            };
        })()
    """)
    print("Step 5 (App Launched & Menu Closed):", step5)
    assert step5["menuClosed"] is True
    assert step5["browserWindowOpened"] is True

    # 6. Right click inside open browser window
    step6 = evaluate("""
        (() => {
            const win = document.getElementById('window-browser');
            const rect = win.getBoundingClientRect();
            const evt = new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 50,
                clientY: rect.top + 50,
                button: 2
            });
            win.dispatchEvent(evt);
            const menu = document.getElementById('desktop-context-menu');
            return {
                menuRemainedClosed: !menu.classList.contains('open')
            };
        })()
    """)
    print("Step 6 (Right click inside window ignores desktop context menu):", step6)
    assert step6["menuRemainedClosed"] is True

    # 7. Re-open desktop menu, then test dismiss on Escape
    step7 = evaluate("""
        (() => {
            const desktop = document.getElementById('desktop');
            desktop.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: 300,
                clientY: 300
            }));
            const menuBefore = document.getElementById('desktop-context-menu').classList.contains('open');
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            const menuAfter = document.getElementById('desktop-context-menu').classList.contains('open');
            return {
                openedBefore: menuBefore,
                closedAfterEscape: !menuAfter
            };
        })()
    """)
    print("Step 7 (Dismiss with Escape key):", step7)
    assert step7["openedBefore"] is True
    assert step7["closedAfterEscape"] is True

    print("ALL DESKTOP CONTEXT MENU TESTS PASSED SUCCESSFULLY!")

finally:
    proc.terminate()
