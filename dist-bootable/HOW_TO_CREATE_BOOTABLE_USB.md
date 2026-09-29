# 🚀 How to Create a Bootable Dawamu OS USB Drive

Dawamu OS is designed to boot directly from a USB flash drive on any school laptop, desktop, or Chromebook.

---

### 📋 Requirements
1. **1x USB Flash Drive** (4 GB or larger)
2. **Flash Tool:** [BalenaEtcher](https://etcher.balena.io/) (Recommended for Mac/Windows/Linux) or `dd` command line.

---

### ⚡ Method A: Flash with BalenaEtcher (Easiest)
1. Download and install **[BalenaEtcher](https://etcher.balena.io/)**.
2. Insert your USB drive into your computer.
3. Open BalenaEtcher and select:
   - **Flash from file:** Select `/Users/claudiawaithaka/.gemini/antigravity/scratch/chromeos-student-edition/dist-bootable/DawamuOS-2026-x86_64.iso`
   - **Select target:** Choose your USB flash drive.
   - Click **Flash!**
4. Done! Your bootable Dawamu OS USB drive is ready.

---

### 💻 Method B: Flash with Terminal (`dd` Command - macOS / Linux)

```bash
# 1. Identify your USB drive disk identifier (e.g. /dev/disk2 or /dev/sdb):
# On macOS:
diskutil list

# 2. Unmount the disk:
diskutil unmountDisk /dev/diskN

# 3. Flash Dawamu OS image to USB:
sudo dd if=/Users/claudiawaithaka/.gemini/antigravity/scratch/chromeos-student-edition/dist-bootable/DawamuOS-2026-x86_64.iso of=/dev/rdiskN bs=4M status=progress
sync
```

---

### 💻 Booting Laptops / PCs into Dawamu OS:
1. Insert the USB drive into the target computer.
2. Turn on the computer and immediately press the **Boot Menu Key**:
   - **HP:** Press `F9` or `Esc`
   - **Dell:** Press `F12`
   - **Lenovo:** Press `F12` or `Fn+F12`
   - **Asus / Acer:** Press `F8` or `F12`
   - **Mac:** Hold `Option / Alt` key while powering on
3. Select the **USB Storage Device** from the list.
4. Dawamu OS will boot into the high-speed BIOS POST sequence and Student Login Screen!
