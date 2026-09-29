#!/bin/bash
# ==============================================================================
# DAWAMU OS - PHYSICAL DISK INSTALLATION SCRIPT
# ==============================================================================
# Run this script on any physical computer (from a Live USB) to install Dawamu OS
# permanently to an internal Hard Drive or NVMe/SATA SSD.
# ==============================================================================

set -e

if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root: sudo $0 <target_disk>"
  echo "   Example: sudo $0 /dev/sda  OR  sudo $0 /dev/nvme0n1"
  exit 1
fi

TARGET_DISK="$1"

if [ -z "$TARGET_DISK" ]; then
  echo "===================================================================="
  echo "  💻 DAWAMU OS HARD DRIVE INSTALLER"
  echo "===================================================================="
  echo "Available disks on this machine:"
  lsblk -d -p -n -l -o NAME,SIZE,MODEL,TYPE | grep -E "disk"
  echo "===================================================================="
  read -p "Enter disk to install Dawamu OS to (e.g., /dev/sda): " TARGET_DISK
fi

if [ ! -b "$TARGET_DISK" ]; then
  echo "❌ Error: Disk $TARGET_DISK not found!"
  exit 1
fi

echo ""
echo "⚠️  WARNING: ALL DATA ON $TARGET_DISK WILL BE COMPLETELY ERASED!"
echo "   Target: $TARGET_DISK"
read -p "Are you sure you want to proceed with installing Dawamu OS? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Installation aborted."
  exit 0
fi

echo ""
echo "🚀 Step 1: Partitioning $TARGET_DISK with GPT..."
parted -s "$TARGET_DISK" mklabel gpt
parted -s "$TARGET_DISK" mkpart ESP fat32 1MiB 513MiB
parted -s "$TARGET_DISK" set 1 esp on
parted -s "$TARGET_DISK" mkpart DawamuRoot ext4 513MiB 100%

# Format partitions
echo "⚙️ Step 2: Formatting partitions..."
if [[ "$TARGET_DISK" =~ "nvme" ]]; then
  EFI_PART="${TARGET_DISK}p1"
  ROOT_PART="${TARGET_DISK}p2"
else
  EFI_PART="${TARGET_DISK}1"
  ROOT_PART="${TARGET_DISK}2"
fi

mkfs.vfat -F32 -n "DAWAMU_ESP" "$EFI_PART"
mkfs.ext4 -F -L "DAWAMU_ROOT" "$ROOT_PART"

# Mount partitions
echo "📦 Step 3: Mounting and copying Dawamu OS system files..."
MOUNT_DIR="/mnt/dawamu_install"
mkdir -p "$MOUNT_DIR"
mount "$ROOT_PART" "$MOUNT_DIR"
mkdir -p "$MOUNT_DIR/boot/efi"
mount "$EFI_PART" "$MOUNT_DIR/boot/efi"

# Copy base rootfs and application
mkdir -p "$MOUNT_DIR/opt/dawamu-os"
cp -r /opt/dawamu-os/* "$MOUNT_DIR/opt/dawamu-os/" 2>/dev/null || cp -r ./* "$MOUNT_DIR/opt/dawamu-os/"

# Setup autostart service
cat << 'EOF' > "$MOUNT_DIR/etc/systemd/system/dawamu-kiosk.service"
[Unit]
Description=Dawamu OS Student Kiosk Display Manager
After=network.target sound.target

[Service]
Type=simple
User=student
Environment=DISPLAY=:0
ExecStart=/usr/bin/xinit /usr/bin/electron /opt/dawamu-os/main.js --kiosk --no-sandbox
Restart=always

[Install]
WantedBy=graphical.target
EOF

# Install Bootloader
echo "🔧 Step 4: Installing UEFI GRUB Bootloader..."
if command -v grub-install &> /dev/null; then
  grub-install --target=x86_64-efi --efi-directory="$MOUNT_DIR/boot/efi" --boot-directory="$MOUNT_DIR/boot" --bootloader-id=DawamuOS --recheck
  update-grub 2>/dev/null || true
fi

# Cleanup
sync
umount "$MOUNT_DIR/boot/efi"
umount "$MOUNT_DIR"
rm -rf "$MOUNT_DIR"

echo ""
echo "===================================================================="
echo "  ✅ DAWAMU OS SUCCESSFULLY INSTALLED TO $TARGET_DISK!"
echo "===================================================================="
echo "  You can now remove the USB drive and reboot the computer."
echo "===================================================================="
