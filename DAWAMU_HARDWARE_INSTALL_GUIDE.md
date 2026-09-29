# 🚀 Dawamu OS — Hardware Installation & Deployment Guide

> **Dawamu OS ("Transforming Boys Into Leaders")** is an ultra-lightweight, high-speed educational operating system built for laptops, Chromebooks, and desktop PCs.

---

## ⚡ 1. System Requirements

Dawamu OS is designed to be **incredibly lightweight** and can run smoothly on even 10-year-old school computers:

| Component | Minimum | Recommended |
|---|---|---|
| **Processor (CPU)** | 64-bit Dual-Core (Intel / AMD) | Intel Core i3 / Celeron or better |
| **Memory (RAM)** | 2 GB RAM | 4 GB RAM |
| **Internal Storage** | 8 GB Free Space | 16 GB+ SSD / eMMC |
| **Display** | 1024 × 600 resolution | 1366 × 768 or 1920 × 1080 |
| **Boot Mode** | UEFI or Legacy BIOS | UEFI with Secure Boot |

---

## 🛠️ 2. How to Create a Bootable USB (From Any Computer)

### Requirements:
- 1x USB Flash Drive (**4 GB or larger**)
- Flashing software: **[BalenaEtcher](https://etcher.balena.io/)** (Windows / macOS / Linux) or **[Rufus](https://rufus.ie/)** (Windows).

### Step-by-Step Flashing:
1. Download **[BalenaEtcher](https://etcher.balena.io/)** and plug in your USB drive.
2. Run the build script in this repository:
   ```bash
   ./create-bootable-live-usb.sh
   ```
3. Open BalenaEtcher:
   - Click **Flash from file** and select the generated ISO or live package.
   - Click **Select target** and pick your USB Flash Drive.
   - Click **Flash!** (takes ~1 minute).

---

## 💻 3. Booting the Target Computer from USB

1. Plug the bootable USB drive into the target computer.
2. Turn on the computer and immediately tap the **Boot Menu Key**:
   - **HP:** Tap `F9` or `Esc`
   - **Dell:** Tap `F12`
   - **Lenovo:** Tap `F12` or `Fn + F12`
   - **Asus / Acer:** Tap `F8` or `F12`
   - **Mac (Intel):** Hold `Option / Alt` key immediately upon power chime
3. Select **"UEFI: USB Flash Drive"** or **"USB Storage Device"**.
4. Dawamu OS will boot into the **Dawamu Secure Bootloader** and load into Live Mode.

---

## 💾 4. Installing Dawamu OS to the Internal Hard Drive / SSD

Once booted into Dawamu OS:
1. Log in with test student credentials:
   - **Admission No:** `1001`
   - **Password:** `dawamu2026`
2. Click the **"Install Dawamu OS to PC"** icon (green download icon) on the shelf or launcher.
3. Follow the graphical installer:
   - **Step 1:** System Compatibility check.
   - **Step 2:** Select the target internal Hard Drive or NVMe/SATA SSD (e.g. `/dev/sda` or `/dev/nvme0n1`).
   - **Step 3:** Click **"Erase & Install Dawamu OS"**.
   - **Step 4:** In ~90 seconds, the installation completes.
4. Remove the USB drive and click **"Reboot Computer Now"**.
5. The computer now boots directly into **Dawamu OS** permanently!

---

## 🛡️ 5. Teacher & Administrator PIN
- **Admin Security PIN:** `1234`
- Access parental controls, change curfew bedtime hours, unlock restricted sites, or modify student policies via the **Teacher & Parent Controls** panel on the shelf.
