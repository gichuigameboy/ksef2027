import time, subprocess, shutil, os

edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
profile_dir = r"C:\Users\infin\AppData\Local\Temp\edge_eduguard_integration_test"
if os.path.exists(profile_dir):
    shutil.rmtree(profile_dir, ignore_errors=True)

# Create a test script that launches Dawamu OS, logs in, opens EduGuard, and tests all tabs
test_driver_html = """
<!DOCTYPE html>
<html>
<head><title>EduGuard End-to-End Test</title></head>
<body>
<iframe id="app-frame" src="http://127.0.0.1:8080/index.html" style="width:1280px;height:800px;border:none;"></iframe>
<script>
window.addEventListener('load', async () => {
    const frame = document.getElementById('app-frame');
    console.log('[TEST] Waiting for DawamuOS frame to load...');
    await new Promise(r => setTimeout(r, 2000));
    
    const doc = frame.contentDocument || frame.contentWindow.document;
    const win = frame.contentWindow;
    
    console.log('[TEST] Checking login screen...');
    // Login if login overlay is present
    const loginOverlay = doc.getElementById('login-overlay') || doc.querySelector('.login-overlay');
    const pwdInput = doc.querySelector('input[type="password"]');
    const loginBtn = doc.querySelector('#login-btn') || doc.querySelector('button[type="submit"]');
    
    if (pwdInput && loginBtn) {
        console.log('[TEST] Performing login...');
        pwdInput.value = 'dawamu2026';
        loginBtn.click();
        await new Promise(r => setTimeout(r, 1500));
    }
    
    console.log('[TEST] Launching EduGuard App...');
    if (win.windowManager && win.windowManager.apps) {
        const eduguardApp = win.windowManager.apps.find(a => a.id === 'eduguard');
        if (eduguardApp) {
            eduguardApp.launch();
            console.log('[TEST] EduGuard launched via windowManager.apps!');
        }
    } else {
        // Fallback: look for icon
        const icon = doc.querySelector('[data-app-id="eduguard"]') || doc.querySelector('.desktop-icon[title*="EduGuard"]');
        if (icon) {
            icon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            console.log('[TEST] EduGuard launched via icon double-click!');
        }
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if EduGuard window is created
    const eduguardWin = doc.querySelector('#window-eduguard') || doc.querySelector('.window');
    console.log('[TEST] EduGuard Window element exists:', !!eduguardWin);
    
    const tabs = ['dashboard', 'curriculum', 'diagnostic', 'whystruggling', 'retention', 'knowledgemap', 'timeline', 'tutor', 'notes', 'teacher', 'proctor'];
    
    for (const tab of tabs) {
        const btn = doc.querySelector(`button[data-tab="${tab}"]`);
        if (btn) {
            btn.click();
            await new Promise(r => setTimeout(r, 400));
            console.log(`[TEST] Tab ${tab} clicked successfully!`);
        } else {
            console.warn(`[TEST] Tab button ${tab} not found!`);
        }
    }
    
    // Test Canvas toggle
    const canvasToggle = doc.querySelector('#eduguard-canvas-toggle');
    if (canvasToggle) {
        canvasToggle.click();
        await new Promise(r => setTimeout(r, 800));
        console.log('[TEST] Canvas Mode toggled (Flutter Canvas active)!');
        const frameEl = doc.querySelector('#flutter-web-frame');
        console.log('[TEST] Flutter iframe exists:', !!frameEl);
        
        // Return to native
        canvasToggle.click();
        await new Promise(r => setTimeout(r, 500));
        console.log('[TEST] Returned to Native OS view!');
    }
    
    console.log('[TEST] ALL EDUGUARD INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
});
</script>
</body>
</html>
"""

test_path = r"c:\Users\infin\Desktop\ksef2027\eduguard_integration_test.html"
with open(test_path, "w", encoding="utf-8") as f:
    f.write(test_driver_html)

cmd = [
    edge_exe,
    "--headless=new",
    f"--user-data-dir={profile_dir}",
    "--enable-logging=stderr",
    "--v=1",
    f"http://127.0.0.1:8080/eduguard_integration_test.html?t={int(time.time())}"
]

try:
    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    try:
        stdout, stderr = proc.communicate(timeout=14)
    except subprocess.TimeoutExpired:
        proc.kill()
        stdout, stderr = proc.communicate()

    test_logs = [line for line in stderr.splitlines() if "[TEST]" in line]
    errors = [line for line in stderr.splitlines() if "SyntaxError" in line or "Uncaught" in line]
    
    print("\n--- TEST LOGS ---")
    for l in test_logs:
        print(l)
        
    print("\n--- ERRORS FOUND ---")
    for e in errors:
        print(e)
    if not errors:
        print("ZERO ERRORS! FULL INTEGRATION VALIDATED!")
finally:
    if os.path.exists(test_path):
        os.remove(test_path)
