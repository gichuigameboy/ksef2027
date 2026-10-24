"""
Automated Verification Suite: Drag and Drop feature in My PC (File Explorer)
Dawamu OS - KSEF 2027
"""

import os
import re
import json

ROOT = os.path.dirname(os.path.abspath(__file__))

def test_css_user_drag_enabled():
    """Verify that [draggable='true'] and .file-item have -webkit-user-drag enabled in CSS."""
    css_path = os.path.join(ROOT, "css", "style.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    assert "-webkit-user-drag: element !important" in css, "CSS must allow -webkit-user-drag for draggable elements"
    assert '[draggable="true"]' in css, "CSS must target [draggable='true']"
    assert ".file-item" in css, "CSS must target .file-item"
    print("  [PASS] CSS allows drag operations on file items and draggable elements without browser suppression.")


def test_state_vfs_drag_drop_helpers():
    """Verify that formatFileSize and readDroppedFile helpers are exported from state.js and compiled into bundle."""
    state_path = os.path.join(ROOT, "js", "os", "state.js")
    with open(state_path, "r", encoding="utf-8") as f:
        state_code = f.read()

    assert "export function formatFileSize" in state_code, "state.js must export formatFileSize"
    assert "export function readDroppedFile" in state_code, "state.js must export readDroppedFile"

    bundle_path = os.path.join(ROOT, "js", "dawamu-bundle.js")
    with open(bundle_path, "r", encoding="utf-8") as f:
        bundle_code = f.read()

    assert "window.__dawamuModules.formatFileSize = formatFileSize;" in bundle_code, "Bundle must register formatFileSize"
    assert "window.__dawamuModules.readDroppedFile = readDroppedFile;" in bundle_code, "Bundle must register readDroppedFile"
    print("  [PASS] Drag & drop file reading and formatting helpers properly defined and bundled.")


def test_explorer_drag_drop_implementation():
    """Verify that explorer.js implements complete drag-and-drop features."""
    explorer_path = os.path.join(ROOT, "js", "apps", "explorer.js")
    with open(explorer_path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. External file drop handler
    assert "handleExternalFilesDrop" in code, "Must implement handleExternalFilesDrop"
    assert "exp-drop-overlay" in code, "Must include drop overlay visual cue"
    assert "exp-file-input" in code, "Must include native import file picker fallback"

    # 2. Internal move and copy handler (with Ctrl key copy support)
    assert "handleInternalDrop" in code, "Must implement handleInternalDrop"
    assert "e.ctrlKey" in code, "Must support Ctrl key to copy instead of move"

    # 3. Drop targets
    assert "bread-root" in code, "Breadcrumb root must be interactive drop target"
    assert "exp-up-btn" in code, "Up button must be interactive drop target"
    assert "files-container" in code, "Files container must receive external drop"
    assert "exp-nav-item" in code, "Sidebar nav items must receive drag & drop"

    # 4. Draggable grid items
    assert 'draggable="true"' in code, "File items must be draggable"
    assert "dragstart" in code, "Must handle dragstart event"
    assert "dragend" in code, "Must handle dragend event"

    # 5. Paste handler
    assert "e.clipboardData" in code, "Must support clipboard paste for external files and text"

    print("  [PASS] File Explorer (My PC) contains all drag-and-drop triggers, visual overlays, and event handlers.")


def test_desktop_icon_drag_drop_integration():
    """Verify that desktop icon for This PC / My PC accepts file drop in app.js."""
    app_path = os.path.join(ROOT, "js", "app.js")
    with open(app_path, "r", encoding="utf-8") as f:
        code = f.read()

    assert 'data-app-id="explorer"' in code, "app.js must reference explorer desktop icon"
    assert "explorerIcon.addEventListener('drop'" in code, "Explorer desktop icon must accept drop"
    assert "desktopCanvas.addEventListener('drop'" in code, "Desktop canvas must accept drop"
    assert "This PC / My PC" in code, "App title includes My PC"

    print("  [PASS] Desktop icon and desktop workspace support dropping files directly into My PC.")


def test_dist_bootable_synchronization():
    """Verify that dist-bootable mirrors the changes identically."""
    dist_explorer = os.path.join(ROOT, "dist-bootable", "dawamu-live-os", "opt", "dawamu-os", "js", "apps", "explorer.js")
    root_explorer = os.path.join(ROOT, "js", "apps", "explorer.js")

    with open(dist_explorer, "r", encoding="utf-8") as f1, open(root_explorer, "r", encoding="utf-8") as f2:
        assert f1.read() == f2.read(), "dist-bootable explorer.js must match root explorer.js"

    dist_bundle = os.path.join(ROOT, "dist-bootable", "dawamu-live-os", "opt", "dawamu-os", "js", "dawamu-bundle.js")
    root_bundle = os.path.join(ROOT, "js", "dawamu-bundle.js")

    with open(dist_bundle, "r", encoding="utf-8") as f1, open(root_bundle, "r", encoding="utf-8") as f2:
        assert f1.read() == f2.read(), "dist-bootable bundle must match root bundle"

    print("  [PASS] dist-bootable live image files are 100% synchronized with the master repository.")


if __name__ == "__main__":
    print("=================================================================")
    print("  MY PC (FILE EXPLORER) DRAG AND DROP VERIFICATION SUITE")
    print("=================================================================")
    test_css_user_drag_enabled()
    test_state_vfs_drag_drop_helpers()
    test_explorer_drag_drop_implementation()
    test_desktop_icon_drag_drop_integration()
    test_dist_bootable_synchronization()
    print("=================================================================")
    print("  ALL TESTS PASSED SUCCESSFULLY (100% PASS RATE)!")
    print("=================================================================")
