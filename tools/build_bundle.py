"""
Builds a single classic JS bundle `js/dawamu-bundle.js` from the ES module tree
so Dawamu OS works identically on `file://` (zero CORS restrictions), `http://`,
GitHub Pages, and Electron.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODULES_IN_ORDER = [
    "js/os/state.js",
    "js/os/dialogs.js",
    "js/os/restrictionManager.js",
    "js/os/windowManager.js",
    "js/os/launcher.js",
    "js/os/quickSettings.js",
    "js/os/shelf.js",
    "js/os/contextMenu.js",
    "js/services/eduguardClient.js",
    "js/apps/offlineContent.js",
    "js/apps/books844.js",
    "js/apps/offlineBrowser.js",
    "js/apps/browser.js",
    "js/apps/docs.js",
    "js/apps/classroom.js",
    "js/apps/calculator.js",
    "js/apps/focusTimer.js",
    "js/apps/adminPanel.js",
    "js/apps/installer.js",
    "js/apps/explorer.js",
    "js/apps/settings.js",
    "js/apps/word.js",
    "js/apps/spreadsheet.js",
    "js/apps/database.js",
    "js/apps/eduguard.js",
    "js/app.js",
]


def transform_module(rel_path: str, source: str) -> str:
    exports = []

    # 1. Replace `import { a, b as c } from '...';` with destructuring from window.__dawamuModules
    def replace_import(match):
        specifiers = match.group(1).strip()
        items = []
        for part in specifiers.split(","):
            part = part.strip()
            if not part:
                continue
            if " as " in part:
                orig, alias = [x.strip() for x in part.split(" as ", 1)]
                items.append(f"{orig}: {alias}")
            else:
                items.append(part)
        return f"const {{ {', '.join(items)} }} = window.__dawamuModules;"

    code = re.sub(
        r"^\s*import\s*\{([^}]+)\}\s*from\s*['\"][^'\"]+['\"]\s*;?",
        replace_import,
        source,
        flags=re.MULTILINE,
    )

    # 2. Replace `export function foo(` / `export async function foo(`
    def replace_export_fn(match):
        async_kw = match.group(1) or ""
        fn_name = match.group(2)
        exports.append(fn_name)
        return f"{async_kw}function {fn_name}("

    code = re.sub(
        r"^\s*export\s+(async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(",
        replace_export_fn,
        code,
        flags=re.MULTILINE,
    )

    # 3. Replace `export const/let/var name =` or `export class Name`
    def replace_export_decl(match):
        kind = match.group(1)
        name = match.group(2)
        exports.append(name)
        return f"{kind} {name}"

    code = re.sub(
        r"^\s*export\s+(const|let|var|class)\s+([A-Za-z0-9_$]+)",
        replace_export_decl,
        code,
        flags=re.MULTILINE,
    )

    export_lines = "\n".join(
        [f"  window.__dawamuModules.{name} = {name};" for name in exports]
    )
    return (
        f"// === MODULE: {rel_path} ===\n"
        f"(function() {{\n"
        f"{code}\n"
        f"{export_lines}\n"
        f"}})();\n"
    )


def main():
    chunks = [
        "/* Dawamu OS Universal Bundle (works on file://, http://, and Electron) */\n"
        "window.__dawamuModules = window.__dawamuModules || {};\n"
    ]
    for rel_path in MODULES_IN_ORDER:
        full_path = os.path.join(ROOT, rel_path)
        with open(full_path, "r", encoding="utf-8") as f:
            src = f.read()
        chunks.append(transform_module(rel_path, src))

    out_path = os.path.join(ROOT, "js", "dawamu-bundle.js")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(chunks))
    print(f"Built {out_path} ({os.path.getsize(out_path)} bytes) from {len(MODULES_IN_ORDER)} modules.")


if __name__ == "__main__":
    main()
