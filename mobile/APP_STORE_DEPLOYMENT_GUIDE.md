# 📱 Nanki Mobile — App Store & Google Play Store Deployment Guide

This guide contains everything required to build, test, and release **Nanki** on the **Apple App Store** and **Google Play Store**.

---

## 🛠️ 1. Prerequisites & EAS Setup

Ensure you have EAS CLI installed globally or use `npx eas-cli`:

```bash
cd mobile
npm install -g eas-cli # or run via npx eas
eas login
```

Link your project to your Expo account:
```bash
eas project:init
```

---

## 🚀 2. Building Standalone Binaries

We have configured `eas.json` with three optimized environments:

### A. Direct Install Android APK (For Testing on Physical Devices)
Generate a standalone `.apk` you can download and install on any Android phone directly without going through the Play Store:
```bash
npm run build:apk
# or: eas build -p android --profile preview
```

### B. iOS Simulator Build
Generate an archive that runs directly on Mac iOS Simulators without needing an Apple Developer account:
```bash
npm run build:ios-sim
# or: eas build -p ios --profile preview
```

### C. Production Release Builds (Store Submissions)
- **Android Google Play Store Bundle (`.aab`)**:
  ```bash
  npm run build:prod:android
  ```
- **Apple App Store Archive (`.ipa`)**:
  ```bash
  npm run build:prod:ios
  ```
- **Both simultaneously**:
  ```bash
  npm run build:prod
  ```

---

## 🍏 3. Apple App Store Connect Checklist

1. **Bundle Identifier**:
   - Registered in Apple Developer Portal: `com.nanki.app`
2. **App Store Connect App Creation**:
   - **Name**: `Nanki — Medical Study & Quizzes`
   - **Primary Language**: English
   - **Primary Category**: Medical
   - **Secondary Category**: Education
3. **Export Compliance**:
   - Configured in `app.json` with `"ITSAppUsesNonExemptEncryption": false`.
   - Apple will automatically skip the cryptographic declaration prompt on TestFlight and store builds.
4. **App Privacy (Nutrition Label)**:
   - **Data Used to Track You**: None.
   - **Data Linked to You**: User ID / Email (if signed in via Supabase cloud sync).
   - **Data Not Linked to You**: Crash analytics, quiz performance metrics (stored locally in `AsyncStorage`).
5. **App Review Information**:
   - Provide demo credentials (e.g., Guest access is enabled by default in the app so Apple reviewers can immediately test without needing to sign up).

---

## 🤖 4. Google Play Console Checklist

1. **Package Name**:
   - Configured in `app.json`: `com.nanki.app`
2. **Target Android API**:
   - Target SDK: Android 14+ (API Level 34+).
3. **App Category**:
   - **Category**: Medical
   - **Tags**: Medical, Education, Flashcards, Quiz
4. **Data Safety Questionnaire**:
   - **Does your app collect or share user data?**: Yes (Email for optional cloud sync accounts; all study data is stored locally by default).
   - **Data types**: Email address (optional), App interactions (anonymous quiz completions).
   - **Is data encrypted in transit?**: Yes (HTTPS / TLS 1.3 via Supabase).
5. **Internal Testing Track**:
   - Upload the `.aab` output from `npm run build:prod:android`.
   - Add tester email addresses to test in-app updates.

---

## 📦 5. Asset Specifications

| Asset | Path | Dimensions | Notes |
| :--- | :--- | :--- | :--- |
| **App Icon** | `assets/icon.png` | 1024 × 1024 px | Square, no alpha/transparency (iOS requirement) |
| **Splash Screen** | `assets/splash-icon.png` | 1024 × 1024 px | Centered brand logo on `#562788` |
| **Android Foreground** | `assets/android-icon-foreground.png` | 432 × 432 px | Adaptive vector foreground |
| **Android Background** | `assets/android-icon-background.png` | 432 × 432 px | Adaptive background (`#562788`) |
