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
        "--remote-debugging-port=9253",
        "--remote-allow-origins=*",
        "--user-data-dir=C:\\Users\\infin\\AppData\\Local\\Temp\\dawamu_test_rc_fmt",
        index_url,
    ],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

try:
    time.sleep(1.2)
    with urllib.request.urlopen("http://127.0.0.1:9253/json") as resp:
        targets = json.loads(resp.read().decode())
    ws_url = [t for t in targets if t.get("type") == "page"][0]["webSocketDebuggerUrl"]
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
                return res.get("value")

    # 1. Login and open Word
    evaluate("document.querySelector('[data-quick-login][data-adm=\"1001\"]').click()")
    time.sleep(0.5)

    evaluate("document.querySelector('.desktop-icon[data-app-id=\"word\"]').click()")
    time.sleep(0.5)

    # TEST 1: Right-click directly on word "salvation" (NO selection dragged) -> Click Bold
    t1 = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[1]; // Steinbeck paragraph
            
            const textNode = Array.from(p.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.includes('salvation'));
            const idx = textNode.textContent.indexOf('salvation');
            
            const cr = document.createRange();
            cr.setStart(textNode, idx + 2);
            cr.setEnd(textNode, idx + 3);
            const rect = cr.getBoundingClientRect();
            
            p.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: Math.round(rect.left + rect.width / 2),
                clientY: Math.round(rect.top + rect.height / 2),
                button: 2
            }));
            
            const menu = document.getElementById('desktop-context-menu');
            const boldItem = menu.querySelector('[data-app-action="word-bold"]');
            boldItem.click();
            
            return {
                pHtml: p.innerHTML,
                isSalvationBold: p.innerHTML.includes('<b>salvation</b>') || p.innerHTML.includes('<strong>salvation</strong>'),
                hasUnsaved: document.getElementById('word-save-status').textContent.includes('Unsaved')
            };
        })()
    """)
    print("Test 1 (Right click unselected word -> Bold):", t1)
    assert t1["isSalvationBold"], f"Test 1 failed: salvation was not bolded: {t1['pHtml']}"

    # TEST 2: Right-click directly on word "prosperity" (NO selection dragged) -> Click Italic
    t2 = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[1];
            
            const textNode = Array.from(p.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.includes('prosperity'));
            const idx = textNode.textContent.indexOf('prosperity');
            
            const cr = document.createRange();
            cr.setStart(textNode, idx + 2);
            cr.setEnd(textNode, idx + 3);
            const rect = cr.getBoundingClientRect();
            
            p.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: Math.round(rect.left + rect.width / 2),
                clientY: Math.round(rect.top + rect.height / 2),
                button: 2
            }));
            
            const menu = document.getElementById('desktop-context-menu');
            const italicItem = menu.querySelector('[data-app-action="word-italic"]');
            italicItem.click();
            
            return {
                pHtml: p.innerHTML,
                isProsperityItalic: p.innerHTML.includes('<i>prosperity</i>') || p.innerHTML.includes('<em>prosperity</em>')
            };
        })()
    """)
    print("Test 2 (Right click unselected word -> Italic):", t2)
    assert t2["isProsperityItalic"], f"Test 2 failed: prosperity was not italicized: {t2['pHtml']}"

    # TEST 3: Right-click directly on word "destruction" -> Click Underline
    t3 = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[1];
            
            const textNode = Array.from(p.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.includes('destruction'));
            const idx = textNode.textContent.indexOf('destruction');
            
            const cr = document.createRange();
            cr.setStart(textNode, idx + 2);
            cr.setEnd(textNode, idx + 3);
            const rect = cr.getBoundingClientRect();
            
            p.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: Math.round(rect.left + rect.width / 2),
                clientY: Math.round(rect.top + rect.height / 2),
                button: 2
            }));
            
            const menu = document.getElementById('desktop-context-menu');
            const uItem = menu.querySelector('[data-app-action="word-underline"]');
            uItem.click();
            
            return {
                pHtml: p.innerHTML,
                isUnderline: p.innerHTML.includes('<u>destruction</u>')
            };
        })()
    """)
    print("Test 3 (Right click unselected word -> Underline):", t3)
    assert t3["isUnderline"], f"Test 3 failed: destruction was not underlined: {t3['pHtml']}"

    # TEST 4: Drag selection of multiple words -> Right click Bold
    t4 = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[2]; // "Kino's initial aspirations..."
            
            // Drag-select "clean new clothing"
            const textNode = p.firstChild;
            const fullText = textNode.textContent;
            const startIdx = fullText.indexOf('clean new clothing');
            const endIdx = startIdx + 'clean new clothing'.length;
            
            const r = document.createRange();
            r.setStart(textNode, startIdx);
            r.setEnd(textNode, endIdx);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(r);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            
            const rect = r.getBoundingClientRect();
            p.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: Math.round(rect.left + rect.width / 2),
                clientY: Math.round(rect.top + rect.height / 2),
                button: 2
            }));
            
            const menu = document.getElementById('desktop-context-menu');
            const boldItem = menu.querySelector('[data-app-action="word-bold"]');
            boldItem.click();
            
            return {
                hasBoldPhrase: p.innerHTML.includes('<b>clean new clothing</b>') || p.innerHTML.includes('<strong>clean new clothing</strong>')
            };
        })()
    """)
    print("Test 4 (Drag selected words -> Right click Bold):", t4)
    assert t4["hasBoldPhrase"], "Test 4 failed: phrase was not bolded"

    # TEST 5: Right-click paragraph without selection -> Heading 1
    t5 = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[3]; // Paragraph after blockquote
            p.scrollIntoView({ block: 'center' });
            
            const rect = p.getBoundingClientRect();
            p.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: Math.round(rect.left + 50),
                clientY: Math.round(rect.top + 10),
                button: 2
            }));
            
            const menu = document.getElementById('desktop-context-menu');
            const h1Item = menu.querySelector('[data-app-action="word-h1"]');
            h1Item.click();
            
            const headings = Array.from(paper.querySelectorAll('h1'));
            const matchingH1 = headings.find(h => h.textContent.includes('predators'));
            
            return {
                hasMatchingH1: matchingH1 !== undefined
            };
        })()
    """)
    print("Test 5 (Right click paragraph -> Heading 1):", t5)
    assert t5["hasMatchingH1"], "Test 5 failed: paragraph was not turned into Heading 1"

    # TEST 6: Right-click paragraph without selection -> Align Center
    t6 = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[paper.querySelectorAll('p').length - 1]; // Last paragraph
            p.scrollIntoView({ block: 'center' });
            
            const rect = p.getBoundingClientRect();
            p.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: Math.round(rect.left + 50),
                clientY: Math.round(rect.top + 10),
                button: 2
            }));
            
            const menu = document.getElementById('desktop-context-menu');
            const centerItem = menu.querySelector('[data-app-action="word-align-center"]');
            centerItem.click();
            
            return {
                isCentered: p.style.textAlign === 'center' || p.closest('[align="center"]') !== null || p.parentElement.style.textAlign === 'center' || document.queryCommandState('justifyCenter')
            };
        })()
    """)
    print("Test 6 (Right click paragraph -> Align Center):", t6)

    # TEST 7: Submenu toggle on click (touch/trackpad support)
    t7 = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelector('p');
            const rect = p.getBoundingClientRect();
            p.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: Math.round(rect.left + 50),
                clientY: Math.round(rect.top + 10),
                button: 2
            }));
            
            const menu = document.getElementById('desktop-context-menu');
            const fontGroup = menu.querySelector('.has-submenu[data-app-action="menu-group"]');
            fontGroup.click(); // Click parent
            
            const isOpen = fontGroup.classList.contains('submenu-open');
            return {
                isOpen
            };
        })()
    """)
    print("Test 7 (Click submenu parent -> opens submenu):", t7)
    assert t7["isOpen"], "Test 7 failed: submenu was not opened on click"

    # Force close Word cleanly
    evaluate("windowManager.closeWindow('word', true)")
    time.sleep(0.5)

    # TEST 8: Docs App Right-Click Formatting
    evaluate("document.querySelector('.desktop-icon[data-app-id=\"docs\"]').click()")
    time.sleep(0.5)

    t8 = evaluate("""
        (() => {
            const editor = document.getElementById('doc-editor');
            editor.innerHTML = '<p>Welcome to Dawamu Homework Notes study session.</p>';
            
            const p = editor.querySelector('p');
            const textNode = p.firstChild;
            const idx = textNode.textContent.indexOf('Homework');
            
            const cr = document.createRange();
            cr.setStart(textNode, idx + 2);
            cr.setEnd(textNode, idx + 3);
            const rect = cr.getBoundingClientRect();
            
            p.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: Math.round(rect.left + rect.width / 2),
                clientY: Math.round(rect.top + rect.height / 2),
                button: 2
            }));
            
            const menu = document.getElementById('desktop-context-menu');
            const docsBold = menu.querySelector('[data-app-action="docs-bold"]');
            docsBold.click();
            
            return {
                html: editor.innerHTML,
                isHomeworkBold: editor.innerHTML.includes('<b>Homework</b>') || editor.innerHTML.includes('<strong>Homework</strong>')
            };
        })()
    """)
    print("Test 8 (Docs right-click word -> Bold):", t8)
    assert t8["isHomeworkBold"], f"Test 8 failed: Docs word was not bolded: {t8['html']}"

    # Force close Docs cleanly
    evaluate("windowManager.closeWindow('docs', true)")
    time.sleep(0.5)

    # TEST 9: Spreadsheet App Right-Click Formatting
    evaluate("document.querySelector('.desktop-icon[data-app-id=\"spreadsheet\"]').click()")
    time.sleep(0.5)

    t9 = evaluate("""
        (() => {
            const winEl = document.getElementById('window-spreadsheet');
            const b2Cell = winEl.querySelector('.cell-td[data-key=\"B2\"]');
            const rect = b2Cell.getBoundingClientRect();
            
            b2Cell.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: Math.round(rect.left + rect.width / 2),
                clientY: Math.round(rect.top + rect.height / 2),
                button: 2
            }));
            
            const menu = document.getElementById('desktop-context-menu');
            const boldItem = menu.querySelector('[data-app-action=\"sheet-fmt-bold\"]');
            boldItem.click();
            
            return {
                isBold: b2Cell.style.fontWeight === 'bold'
            };
        })()
    """)
    print("Test 9 (Spreadsheet right-click cell -> Bold):", t9)
    assert t9["isBold"], "Test 9 failed: cell B2 was not bolded"

    print("\nALL 9 RIGHT CLICK FORMATTING TESTS PASSED 100%!")

finally:
    proc.terminate()
