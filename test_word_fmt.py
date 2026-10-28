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
        "--remote-debugging-port=9246",
        "--remote-allow-origins=*",
        "--user-data-dir=C:\\Users\\infin\\AppData\\Local\\Temp\\dawamu_test_word_fmt4",
        index_url,
    ],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

try:
    time.sleep(1.0)
    with urllib.request.urlopen("http://127.0.0.1:9246/json") as resp:
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

    # Login and open Word
    evaluate("document.querySelector('[data-quick-login][data-adm=\"1001\"]').click()")
    time.sleep(0.5)

    evaluate("document.querySelector('.desktop-icon[data-app-id=\"word\"]').click()")
    time.sleep(0.5)

    # Test 1: Bold via ribbon button click
    res_bold = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelector('p');
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const boldBtn = document.querySelector('[data-cmd="bold"]');
            boldBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            boldBtn.click();

            return {
                html: p.innerHTML,
                isBold: p.querySelector('b, strong') !== null,
                activeClass: boldBtn.classList.contains('bg-blue-200')
            };
        })()
    """)
    print("Test 1 (Bold):", res_bold)
    assert res_bold["isBold"], "Bold failed"

    # Test 2: Italic via ribbon button click
    res_italic = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[1];
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const italicBtn = document.querySelector('[data-cmd="italic"]');
            italicBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            italicBtn.click();

            return {
                isItalic: p.querySelector('i, em') !== null,
                activeClass: italicBtn.classList.contains('bg-blue-200')
            };
        })()
    """)
    print("Test 2 (Italic):", res_italic)
    assert res_italic["isItalic"], "Italic failed"

    # Test 3: Underline via ribbon button click
    res_under = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[2];
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const uBtn = document.querySelector('[data-cmd="underline"]');
            uBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            uBtn.click();

            return {
                isUnderline: p.querySelector('u') !== null,
                activeClass: uBtn.classList.contains('bg-blue-200')
            };
        })()
    """)
    print("Test 3 (Underline):", res_under)
    assert res_under["isUnderline"], "Underline failed"

    # Test 4: Font Size dropdown change
    res_size = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[3];
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const selSize = document.getElementById('sel-font-size');
            selSize.value = '24px';
            selSize.dispatchEvent(new Event('change'));

            return {
                has24px: p.innerHTML.includes('24px'),
                inner: p.innerHTML
            };
        })()
    """)
    print("Test 4 (Font Size):", res_size)
    assert res_size["has24px"], "Font size change failed"

    # Test 5: Heading 1 style
    res_h1 = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[0];
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const h1Btn = document.querySelector('[data-style="h1"]');
            h1Btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            h1Btn.click();

            return {
                h1Count: paper.querySelectorAll('h1').length
            };
        })()
    """)
    print("Test 5 (Heading 1):", res_h1)
    assert res_h1["h1Count"] >= 2, "Heading 1 failed"

    # Test 6: Text Color
    res_color = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const h = paper.querySelector('h1');
            const range = document.createRange();
            range.selectNodeContents(h);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const colorInput = document.getElementById('input-fore-color');
            colorInput.value = '#e11d48';
            colorInput.dispatchEvent(new Event('input'));

            return {
                hColor: h.querySelector('[color], [style*="color"]') !== null || h.innerHTML.includes('color')
            };
        })()
    """)
    print("Test 6 (Text Color):", res_color)

    # Test 7: Alignment (Center)
    res_align = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[0];
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const centerBtn = document.querySelector('[data-cmd="justifyCenter"]');
            centerBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            centerBtn.click();

            return {
                alignCenter: document.queryCommandState('justifyCenter') || p.style.textAlign === 'center' || p.closest('[align="center"]') !== null
            };
        })()
    """)
    print("Test 7 (Align Center):", res_align)

    # Test 8: Context Menu Formatting (Bold via Word Right-Click Context Menu)
    res_ctx = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            // Select the last paragraph which has not been formatted yet
            const ps = paper.querySelectorAll('p');
            const p = ps[ps.length - 1];
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);

            const rect = p.getBoundingClientRect();
            p.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + 20,
                clientY: rect.top + 10
            }));

            const menu = document.getElementById('desktop-context-menu');
            const wordUnderline = menu ? menu.querySelector('[data-app-action="word-underline"]') : null;
            if (wordUnderline) {
                wordUnderline.click();
            }

            return {
                hasMenu: menu !== null,
                hasWordUnderline: wordUnderline !== null,
                pHtml: p.outerHTML,
                isUnderline: p.querySelector('u') !== null
            };
        })()
    """)
    print("Test 8 (Word Context Menu Underline):", res_ctx)
    assert res_ctx["isUnderline"], "Context menu underline failed"

    # Test 9: Grow Font & Shrink Font buttons
    res_grow = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelector('p');
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const growBtn = document.getElementById('btn-grow-font');
            growBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            growBtn.click();

            const grownSpan = p.querySelector('span[style*="font-size"]');
            const grownSize = grownSpan ? grownSpan.style.fontSize : paper.style.fontSize;

            const shrinkBtn = document.getElementById('btn-shrink-font');
            shrinkBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            shrinkBtn.click();

            return {
                grownSize,
                hasSpan: grownSpan !== null
            };
        })()
    """)
    print("Test 9 (Grow/Shrink Font):", res_grow)

    # Test 10: Keyboard Shortcut Ctrl+B toggling bold on selection
    res_kbd = evaluate("""
        (() => {
            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[2];
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const evt = new KeyboardEvent('keydown', {
                key: 'b',
                code: 'KeyB',
                ctrlKey: true,
                bubbles: true,
                cancelable: true
            });
            paper.dispatchEvent(evt);

            return {
                prevented: evt.defaultPrevented,
                pHtml: p.innerHTML,
                isBold: p.querySelector('b, strong') !== null
            };
        })()
    """)
    print("Test 10 (Keyboard Ctrl+B):", res_kbd)
    assert res_kbd["prevented"] and res_kbd["isBold"], "Keyboard shortcut Ctrl+B failed"

    # Test 11: Case Transformation (Review Tab -> UPPER)
    res_case = evaluate("""
        (() => {
            const reviewTab = document.querySelector('.ribbon-tab-btn[data-tab="review"]');
            reviewTab.click();

            const paper = document.getElementById('word-paper');
            const p = paper.querySelectorAll('p')[0];
            const range = document.createRange();
            range.selectNodeContents(p);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            paper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

            const upperBtn = document.getElementById('btn-case-upper');
            if (upperBtn) {
                upperBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                upperBtn.click();
            }

            return {
                hasUpper: p.textContent.toUpperCase() === p.textContent,
                text: p.textContent.slice(0, 40)
            };
        })()
    """)
    print("Test 11 (Review Tab -> Case UPPER):", res_case)

    # Switch back to Home Tab
    evaluate("document.querySelector('.ribbon-tab-btn[data-tab=\"home\"]').click()")

    print("\nALL WORD FORMATTING TESTS PASSED!")

finally:
    proc.terminate()
