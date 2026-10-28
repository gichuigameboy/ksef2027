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
        "--remote-debugging-port=9238",
        "--remote-allow-origins=*",
        "--user-data-dir=C:\\Users\\infin\\AppData\\Local\\Temp\\dawamu_chrome_test_cm_all",
        index_url,
    ],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

try:
    ws_url = None
    for _ in range(30):
        try:
            with urllib.request.urlopen("http://127.0.0.1:9238/json") as resp:
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
                if "value" in res:
                    return res["value"]
                if "description" in res:
                    print("EVAL ERROR:", res["description"])
                return None

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

    # 2. Desktop Wallpaper Right-Click & Translucency
    step2 = evaluate("""
        (() => {
            const desktop = document.getElementById('desktop');
            desktop.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: 400,
                clientY: 300,
                button: 2
            }));

            const menu = document.getElementById('desktop-context-menu');
            const style = getComputedStyle(menu);
            const items = Array.from(menu.querySelectorAll('.context-menu-item')).map(el => el.textContent.trim());
            return {
                isOpen: menu.classList.contains('open'),
                hasBlur: style.backdropFilter.includes('blur') || style.webkitBackdropFilter.includes('blur'),
                itemsCount: items.length,
                hasNewFolder: items.some(t => t.includes('New Folder')),
                hasSort: items.some(t => t.includes('Sort Icons By')),
                hasWallpaper: items.some(t => t.includes('Change Wallpaper'))
            };
        })()
    """)
    print("Step 2 (Desktop Context Menu Opened & Translucent):", step2)
    assert step2["isOpen"] is True
    assert step2["hasBlur"] is True
    assert step2["hasNewFolder"] is True
    assert step2["hasSort"] is True
    assert step2["hasWallpaper"] is True

    # 3. Desktop Icon Right-Click (Safe Web)
    step3 = evaluate("""
        (() => {
            const icon = document.querySelector('.desktop-icon[data-app-id="browser"]');
            const rect = icon.getBoundingClientRect();
            icon.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 10,
                clientY: rect.top + 10,
                button: 2
            }));

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
    print("Step 3 (Desktop Icon Menu for Safe Web):", step3)
    assert step3["isOpen"] is True
    assert "Safe Web" in step3["header"]
    assert "Open" in step3["openBtn"]

    # 4. In-App Right-Click in Word (Formatting, Insert Table, Word Tools)
    step4 = evaluate("""
        (() => {
            // Launch Word app
            const wordIcon = document.querySelector('.desktop-icon[data-app-id="word"]');
            wordIcon.click();

            const wordWin = document.getElementById('window-word');
            const paper = wordWin.querySelector('#word-paper');
            const rect = paper.getBoundingClientRect();

            // Right click on document paper
            paper.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 100,
                clientY: rect.top + 100,
                button: 2
            }));

            const menu = document.getElementById('desktop-context-menu');
            const header = menu.querySelector('.context-menu-header')?.textContent.trim();
            const items = Array.from(menu.querySelectorAll('.context-menu-item')).map(el => el.textContent.trim());

            const hasCut = items.some(t => t.includes('Cut'));
            const hasCopy = items.some(t => t.includes('Copy'));
            const hasPaste = items.some(t => t.includes('Paste'));
            const hasFormat = items.some(t => t.includes('Format Font'));
            const hasInsert = items.some(t => t.includes('Insert Tools'));
            const hasStats = items.some(t => t.includes('Document Statistics'));

            // Click "Insert Tools" -> "Insert Table (3×3)"
            const insertTableBtn = menu.querySelector('[data-app-action="word-insert-table"]');
            const tableCountBefore = paper.querySelectorAll('table').length;
            if (insertTableBtn) insertTableBtn.click();
            const tableCountAfter = paper.querySelectorAll('table').length;

            return {
                header: header,
                hasCut: hasCut,
                hasCopy: hasCopy,
                hasPaste: hasPaste,
                hasFormat: hasFormat,
                hasInsert: hasInsert,
                hasStats: hasStats,
                tableInserted: tableCountAfter > tableCountBefore
            };
        })()
    """)
    print("Step 4 (In-App Right-Click in Word & Insert Table):", step4)
    assert "Word" in step4["header"]
    assert step4["hasCut"] is True
    assert step4["hasFormat"] is True
    assert step4["hasInsert"] is True
    assert step4["hasStats"] is True
    assert step4["tableInserted"] is True

    # 5. In-App Right-Click in Spreadsheet (Formulas & Formatting)
    step5 = evaluate("""
        (() => {
            // Launch Spreadsheet app
            const sheetIcon = document.querySelector('.desktop-icon[data-app-id="spreadsheet"]');
            sheetIcon.click();

            const sheetWin = document.getElementById('window-spreadsheet');
            const targetCell = sheetWin.querySelector('.cell-td[data-key="B2"]');
            const rect = targetCell.getBoundingClientRect();

            // Right click on B2 cell
            targetCell.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 5,
                clientY: rect.top + 5,
                button: 2
            }));

            const menu = document.getElementById('desktop-context-menu');
            const header = menu.querySelector('.context-menu-header')?.textContent.trim();
            const items = Array.from(menu.querySelectorAll('.context-menu-item')).map(el => el.textContent.trim());

            const hasCut = items.some(t => t.includes('Cut Cell'));
            const hasCopy = items.some(t => t.includes('Copy Cell'));
            const hasFormat = items.some(t => t.includes('Format Cell'));
            const hasFormula = items.some(t => t.includes('Insert Formula'));

            // Click =SUM formula action
            const sumBtn = menu.querySelector('[data-app-action="sheet-fml-sum"]');
            if (sumBtn) sumBtn.click();
            const formulaBarVal = sheetWin.querySelector('#formula-bar').value;

            return {
                header: header,
                hasCut: hasCut,
                hasCopy: hasCopy,
                hasFormat: hasFormat,
                hasFormula: hasFormula,
                formulaApplied: formulaBarVal.includes('=SUM')
            };
        })()
    """)
    print("Step 5 (In-App Right-Click in Spreadsheet & Formulas):", step5)
    assert "Spreadsheet" in step5["header"] or "Sheets" in step5["header"]
    assert step5["hasCut"] is True
    assert step5["hasFormat"] is True
    assert step5["hasFormula"] is True
    assert step5["formulaApplied"] is True

    # 6. In-App Right-Click in File Explorer
    step6 = evaluate("""
        (() => {
            // Launch Explorer
            const expIcon = document.querySelector('.desktop-icon[data-app-id="explorer"]');
            expIcon.click();

            const expWin = document.getElementById('window-explorer');
            const container = expWin.querySelector('#files-container');
            const rect = container.getBoundingClientRect();

            // Right click on empty area in Explorer
            container.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 150,
                clientY: rect.top + 150,
                button: 2
            }));

            const menu = document.getElementById('desktop-context-menu');
            const header = menu.querySelector('.context-menu-header')?.textContent.trim();
            const items = Array.from(menu.querySelectorAll('.context-menu-item')).map(el => el.textContent.trim());

            const hasNewFolder = items.some(t => t.includes('New Folder'));
            const hasNewFile = items.some(t => t.includes('New Document'));
            const hasRefresh = items.some(t => t.includes('Refresh Folder'));

            // Dismiss menu
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            // Right click on a file item
            const firstFile = expWin.querySelector('.file-item');
            if (firstFile) {
                const fRect = firstFile.getBoundingClientRect();
                firstFile.dispatchEvent(new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                    clientX: fRect.left + 10,
                    clientY: fRect.top + 10,
                    button: 2
                }));
            }
            const itemMenu = document.getElementById('desktop-context-menu');
            const fileItems = Array.from(itemMenu.querySelectorAll('.context-menu-item')).map(el => el.textContent.trim());
            const hasOpen = fileItems.some(t => t.includes('Open'));
            const hasRename = fileItems.some(t => t.includes('Rename'));
            const hasDelete = fileItems.some(t => t.includes('Delete'));

            return {
                header: header,
                hasNewFolder: hasNewFolder,
                hasNewFile: hasNewFile,
                hasRefresh: hasRefresh,
                hasOpenItem: hasOpen,
                hasRenameItem: hasRename,
                hasDeleteItem: hasDelete
            };
        })()
    """)
    print("Step 6 (In-App Right-Click in File Explorer):", step6)
    assert "This PC" in step6["header"]
    assert step6["hasNewFolder"] is True
    assert step6["hasNewFile"] is True
    assert step6["hasRefresh"] is True
    assert step6["hasOpenItem"] is True

    # 7. In-App Right-Click in Calculator
    step7 = evaluate("""
        (() => {
            // Launch Calculator
            const calcIcon = document.querySelector('.desktop-icon[data-app-id="calculator"]');
            calcIcon.click();

            const calcWin = document.getElementById('window-calculator');
            const rect = calcWin.getBoundingClientRect();

            calcWin.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 50,
                clientY: rect.top + 50,
                button: 2
            }));

            const menu = document.getElementById('desktop-context-menu');
            const header = menu.querySelector('.context-menu-header')?.textContent.trim();
            const items = Array.from(menu.querySelectorAll('.context-menu-item')).map(el => el.textContent.trim());

            return {
                header: header,
                hasCopy: items.some(t => t.includes('Copy Result')),
                hasClear: items.some(t => t.includes('Clear Display')),
                hasSqrt: items.some(t => t.includes('Square Root')),
                hasPercent: items.some(t => t.includes('Percentage'))
            };
        })()
    """)
    print("Step 7 (In-App Right-Click in Calculator):", step7)
    assert "Calculator" in step7["header"]
    assert step7["hasCopy"] is True
    assert step7["hasClear"] is True
    assert step7["hasSqrt"] is True

    # 8. In-App Right-Click in Safe Web Browser
    step8 = evaluate("""
        (() => {
            const browserIcon = document.querySelector('.desktop-icon[data-app-id="browser"]');
            browserIcon.click();

            const browserWin = document.getElementById('window-browser');
            const rect = browserWin.getBoundingClientRect();

            browserWin.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 100,
                clientY: rect.top + 100,
                button: 2
            }));

            const menu = document.getElementById('desktop-context-menu');
            const header = menu.querySelector('.context-menu-header')?.textContent.trim();
            const items = Array.from(menu.querySelectorAll('.context-menu-item')).map(el => el.textContent.trim());

            return {
                header: header,
                hasBack: items.some(t => t.includes('Back')),
                hasReload: items.some(t => t.includes('Reload Page')),
                hasHome: items.some(t => t.includes('Go to Homepage')),
                hasNewTab: items.some(t => t.includes('New Tab')),
                hasSavePage: items.some(t => t.includes('Save Page to Downloads'))
            };
        })()
    """)
    print("Step 8 (In-App Right-Click in Safe Web Browser):", step8)
    assert "Browser" in step8["header"] or "Safe Web" in step8["header"]
    assert step8["hasBack"] is True
    assert step8["hasReload"] is True
    assert step8["hasNewTab"] is True

    # 9. Window controls via context menu (Minimize / Close)
    step9 = evaluate("""
        (() => {
            const calcWin = document.getElementById('window-calculator');
            const rect = calcWin.getBoundingClientRect();
            calcWin.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 50,
                clientY: rect.top + 50,
                button: 2
            }));

            const menu = document.getElementById('desktop-context-menu');
            const closeBtn = menu.querySelector('[data-app-action="win-close"]');
            if (closeBtn) closeBtn.click();

            return {
                calculatorClosed: !document.getElementById('window-calculator')
            };
        })()
    """)
    print("Step 9 (Window Control via Context Menu - Close Window):", step9)
    assert step9["calculatorClosed"] is True

    # 10. Dismiss with Escape
    step10 = evaluate("""
        (() => {
            const desktop = document.getElementById('desktop');
            desktop.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: 300,
                clientY: 300,
                button: 2
            }));
            const opened = document.getElementById('desktop-context-menu').classList.contains('open');
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            const closed = !document.getElementById('desktop-context-menu').classList.contains('open');
            return { opened: opened, closed: closed };
        })()
    """)
    print("Step 10 (Dismiss with Escape Key):", step10)
    assert step10["opened"] is True
    assert step10["closed"] is True

    print("ALL 10 CONTEXT MENU INTEGRATION TESTS PASSED 100%!")

finally:
    proc.terminate()
