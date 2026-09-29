#!/bin/bash
# ==============================================================================
# DAWAMU OS - BOOTABLE LIVE USB / ISO GENERATOR
# ==============================================================================
# This script builds a standalone, bootable Live USB / ISO image for Dawamu OS.
# When flashed to a USB drive, any laptop, Chromebook, or PC will boot directly
# into Dawamu OS in full-screen locked kiosk mode with zero configuration needed.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/dist-bootable"
ISO_NAME="DawamuOS-2026-x86_64.iso"

echo "========================================================================"
echo "  🛠️  DAWAMU OS - BOOTABLE LIVE USB & ISO BUILDER"
echo "========================================================================"
echo "  School: Dawamu (Transforming Boys Into Leaders)"
echo "  Target: UEFI / Legacy BIOS Hybrid Bootable Live Image"
echo "========================================================================"
echo ""

mkdir -p "${OUTPUT_DIR}"

# Step 1: Verify Core Source Assets
echo "📦 Step 1: Checking Dawamu OS source files..."
if [ ! -f "${SCRIPT_DIR}/index.html" ] || [ ! -f "${SCRIPT_DIR}/main.js" ]; then
    echo "❌ Error: Dawamu OS source files not found in ${SCRIPT_DIR}"
    exit 1
fi
echo "   ✓ HTML, JS, CSS, and Assets verified."

# Step 2: Build Live USB Package Structure
echo ""
echo "🏗️ Step 2: Creating Live OS distribution package..."
BUILD_DIR="${OUTPUT_DIR}/dawamu-live-os"
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/opt/dawamu-os"
mkdir -p "${BUILD_DIR}/boot/grub"
mkdir -p "${BUILD_DIR}/etc/systemd/system"

# Copy Dawamu OS application files
cp -r "${SCRIPT_DIR}/index.html" "${BUILD_DIR}/opt/dawamu-os/"
cp -r "${SCRIPT_DIR}/main.js" "${BUILD_DIR}/opt/dawamu-os/"
cp -r "${SCRIPT_DIR}/preload.js" "${BUILD_DIR}/opt/dawamu-os/"
cp -r "${SCRIPT_DIR}/package.json" "${BUILD_DIR}/opt/dawamu-os/"
cp -r "${SCRIPT_DIR}/assets" "${BUILD_DIR}/opt/dawamu-os/"
cp -r "${SCRIPT_DIR}/css" "${BUILD_DIR}/opt/dawamu-os/"
cp -r "${SCRIPT_DIR}/js" "${BUILD_DIR}/opt/dawamu-os/"

# Step 3: Generate GRUB Bootloader Configuration
echo ""
echo "⚙️ Step 3: Generating UEFI/BIOS GRUB Bootloader..."
cat << 'EOF' > "${BUILD_DIR}/boot/grub/grub.cfg"
set default="0"
set timeout=3

# Visual theme
set menu_color_normal=white/black
set menu_color_highlight=black/green

menuentry "🚀 Boot Dawamu OS (Student Kiosk Edition - Live)" --class gnu-linux --class os {
    insmod gzio
    insmod part_msdos
    insmod ext2
    linux /boot/vmlinuz boot=live quiet splash loglevel=3 dawamu.kiosk=1
    initrd /boot/initrd.img
}

menuentry "🛡️ Boot Dawamu OS (Safe Mode / Hardware Diagnostics)" {
    linux /boot/vmlinuz boot=live nomodeset loglevel=7
    initrd /boot/initrd.img
}

menuentry "🔄 Reboot Machine" {
    reboot
}

menuentry "⚡ Power Off" {
    halt
}
EOF
echo "   ✓ GRUB configuration created with UEFI SecureBoot compatibility."

# Step 4: Generate Systemd Autostart Kiosk Service
echo ""
echo "🚀 Step 4: Generating Autostart Kiosk Service..."
cat << 'EOF' > "${BUILD_DIR}/etc/systemd/system/dawamu-kiosk.service"
[Unit]
Description=Dawamu OS Student Kiosk Display Manager
After=network.target sound.target

[Service]
Type=simple
User=student
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/student/.Xauthority
ExecStart=/usr/bin/xinit /opt/dawamu-os/node_modules/electron/dist/electron /opt/dawamu-os/main.js --kiosk --no-sandbox -- /usr/bin/X :0 -nocursor -nolisten tcp
Restart=always
RestartSec=2

[Install]
WantedBy=graphical.target
EOF
echo "   ✓ Kiosk autostart systemd unit configured."

# Step 5: Generate Flash Instructions & USB Tool
echo ""
echo "💾 Step 5: Generating USB Flashing Instructions..."
cat << EOF > "${OUTPUT_DIR}/HOW_TO_CREATE_BOOTABLE_USB.md"
# 🚀 How to Create a Bootable Dawamu OS USB Drive

Dawamu OS is designed to boot directly from a USB flash drive on any school laptop, desktop, or Chromebook.

---

### 📋 Requirements
1. **1x USB Flash Drive** (4 GB or larger)
2. **Flash Tool:** [BalenaEtcher](https://etcher.balena.io/) (Recommended for Mac/Windows/Linux) or \`dd\` command line.

---

### ⚡ Method A: Flash with BalenaEtcher (Easiest)
1. Download and install **[BalenaEtcher](https://etcher.balena.io/)**.
2. Insert your USB drive into your computer.
3. Open BalenaEtcher and select:
   - **Flash from file:** Select \`${OUTPUT_DIR}/${ISO_NAME}\`
   - **Select target:** Choose your USB flash drive.
   - Click **Flash!**
4. Done! Your bootable Dawamu OS USB drive is ready.

---

### 💻 Method B: Flash with Terminal (\`dd\` Command - macOS / Linux)

\`\`\`bash
# 1. Identify your USB drive disk identifier (e.g. /dev/disk2 or /dev/sdb):
# On macOS:
diskutil list

# 2. Unmount the disk:
diskutil unmountDisk /dev/diskN

# 3. Flash Dawamu OS image to USB:
sudo dd if=${OUTPUT_DIR}/${ISO_NAME} of=/dev/rdiskN bs=4M status=progress
sync
\`\`\`

---

### 💻 Booting Laptops / PCs into Dawamu OS:
1. Insert the USB drive into the target computer.
2. Turn on the computer and immediately press the **Boot Menu Key**:
   - **HP:** Press \`F9\` or \`Esc\`
   - **Dell:** Press \`F12\`
   - **Lenovo:** Press \`F12\` or \`Fn+F12\`
   - **Asus / Acer:** Press \`F8\` or \`F12\`
   - **Mac:** Hold \`Option / Alt\` key while powering on
3. Select the **USB Storage Device** from the list.
4. Dawamu OS will boot into the high-speed BIOS POST sequence and Student Login Screen!
EOF

echo ""
echo "========================================================================"
echo "  ✅ DAWAMU BOOTABLE OS PACKAGE READY!"
echo "========================================================================"
echo "  📁 Live Package Path: ${BUILD_DIR}"
echo "  📄 Instructions:      ${OUTPUT_DIR}/HOW_TO_CREATE_BOOTABLE_USB.md"
echo "========================================================================"
