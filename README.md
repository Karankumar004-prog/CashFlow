# CashFlow Pro 

A premium, privacy-focused personal finance application designed for professionals who value efficiency, speed, and complete ownership of their data. Built with React and wrapped in Capacitor for native Android deployment.

## 🚀 Overview

CashFlow Pro moves beyond simple income/expense tracking by implementing a strict **Double-Entry Accounting** system. It allows users to track their external cash flow alongside the internal velocity of their money (transfers) without distorting their true net worth. 

There are no ads, no central servers, and no data harvesting. Your financial data lives entirely on your device.

## ✨ Key Features

* **Privacy-First Architecture:** 100% offline functionality. Data is written directly to local device storage.
* **Double-Entry Ledger:** Seamlessly transfer funds between custom accounts (Bank, Wallet, Brokerage) with perfect balance reconciliation.
* **Scoped Storage Exports:** Export raw JSON backups and CSV reports directly to the native Android `Documents` folder without requiring intrusive, system-wide storage permissions.
* **Cloud Sync:** Optional, user-authenticated Google Drive integration for secure, private cloud backups.
* **Dynamic Analytics:** Instantly toggle between bar charts and native SVG line charts to visualize 6-month capital flow (Income, Expenses, and Internal Transfers).
* **Bank-Grade Security:** Optional PIN-lock screen with device haptic feedback and background-blur auto-locking.
* **Global Ready:** Built-in i18n supporting 8 languages with dynamic currency and number formatting.

## 🛠 Tech Stack

* **Core:** React (Functional Components, Hooks)
* **Native Bridge:** Capacitor (Filesystem, Haptics)
* **Styling:** Custom CSS, Inline SVGs, responsive dark/light mode theming
* **State Management:** Optimized `useMemo` caching and `localStorage` syncing

## 📦 Build Instructions

This project is configured for deployment as a native Android APK via Capacitor.

1. **Install Dependencies:**
   ```bash
   npm install
   
2. **Build the Web Assets:**
   ```bash
   npm run build
   
3. **Sync to Capacitor:**
   ```bash
   npx cap sync android
   
4. **Compile the APK:**
   Open the project in Android Studio to build your signed APK/AAB bundle for deployment.
   ```bash
   npx cap open android

## 📄 License & Ownership

Proprietary software. Owned and maintained by **Engineers Classic Innovator: Mr White**.