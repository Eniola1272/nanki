# Nanki Mobile (React Native / Expo)

Dedicated native mobile application for **Nanki - Master Your Memory**, engineered with Expo SDK 57 and React Native.

## Features
- **Daily Review Queue**: Spaced repetition SM-2 flashcard recall with tactile haptic feedback.
- **Interactive Quiz Player**: Multiple choice questions, True/False multi-branch questions, instant clinical explanations, and scoring.
- **Streak & XP Engine**: Tracks active study streaks and XP awards.
- **Native Haptics**: Uses `expo-haptics` on physical iOS and Android devices for press feedback.
- **Supabase Integration**: Connected with `@react-native-async-storage/async-storage` for auto-refreshing sessions.

## Quick Start

```bash
cd mobile
npm install
npm start
```

### Running on Devices
- **iOS Simulator**: Press `i` in the terminal (requires macOS with Xcode).
- **Android Emulator**: Press `a` in the terminal (requires Android Studio).
- **Physical Device**: Scan the QR code displayed in the terminal with the **Expo Go** app (iOS Camera or Android Expo Go).

## Building for App Store & Google Play
```bash
# Install EAS CLI
npm install -g eas-cli

# Login and build
eas login
eas build --platform ios
eas build --platform android
```

## Personal iPhone installation from a cloud build

The manual GitHub workflow **Build unsigned iPhone app** generates a Release IPA
on `macos-26` with Xcode 26.4.1. It preserves the existing Expo SDK and bundle ID,
generates native files through Expo, and embeds JavaScript so Metro is not needed.
It requires no Apple signing credentials or Expo login in GitHub. This is a
personal sideloading workflow, not App Store distribution. Its first successful
cloud build and physical-device installation are still required to validate it.

1. Push `.github/workflows/ios-unsigned.yml`, `mobile/scripts/build-unsigned-ios.sh`
   and the mobile source to GitHub. The workflow must be on the default branch
   before GitHub shows the manual **Run workflow** button.
2. In the repository's **Actions** tab, choose **Build unsigned iPhone app**, then
   **Run workflow**. It runs only when requested. GitHub-hosted macOS usage is
   subject to your repository/account's Actions allowance and billing settings.
3. After success, download the `Nanki-unsigned-iphone-…` artifact from the run and
   unzip it to obtain `Nanki-unsigned.ipa`. A failed native build uploads its
   `ios-build-log-…` artifact when a log exists.
4. Download Sideloadly from https://sideloadly.io/ on your Mac. Connect and unlock
   your iPhone, trust the computer, select the phone in Sideloadly, and open the IPA.
5. Sign/install using your own Apple Account in Sideloadly. Complete Apple's
   authentication prompts locally; do not put passwords, verification codes or
   signing certificates in this repository or GitHub Actions.
6. Follow any developer trust prompt in **Settings → General → VPN & Device
   Management**. Enable **Settings → Privacy & Security → Developer Mode** when
   requested, restart, and confirm. Launch Nanki.

Free-account installations normally need refreshing within seven days. Keep the
same signing account and installed bundle identifier when refreshing; uninstalling
can erase downloaded content and unsynced progress. If the default identifier is
unavailable, choose a unique identifier in Sideloadly and keep using it thereafter.
Do not use its minimum-iOS override to force an incompatible app to install.

The packaging script rejects a simulator build, a missing JavaScript bundle, or
an app declaring a minimum iOS above 16.7. These checks do not replace a real
iPhone 8 Plus launch test or verify every native dependency's runtime behavior.
If the pinned Xcode version disappears from the runner, select a supported
replacement after checking the runner's software inventory.

For offline acceptance: sign in and download a quiz/deck while online; disconnect
the Mac, enable airplane mode, force-close and reopen Nanki, finish a quiz and
review cards, then reopen again to check saved progress. Restore internet and
keep the app open until its pending count reaches zero. The Supabase migration
described below must be applied for live sync to succeed.

References: [GitHub macOS runner software](https://github.com/actions/runner-images/blob/main/images/macos/macos-26-Readme.md),
[Expo native generation](https://docs.expo.dev/workflow/continuous-native-generation/),
[Sideloadly installation and account support](https://sideloadly.io/).

## Offline study and sync

Quizzes and decks have **Save offline**, **Update copy**, and **Remove download**
controls. Downloads contain the complete question/card text, answer keys and
explanations. They reopen from the Quizzes/Decks library without a network. Built-in
samples and locally authored material are already on-device. Signed-in users can
also download the website's RLS-accessible quizzes/decks when connected.

Quiz results (including the attempted question snapshot and answers), card review
states, and local authoring changes are durably saved to an account-scoped event
log before success is shown. There is no 50-attempt eviction. A failed upload stays
pending; immutable event IDs make retries safe even if a server response is lost.
Removing a downloaded copy does not remove study history or the upload queue.

Sync runs when the app opens/returns to the foreground and every 15 seconds while
active, plus after a local write. It uploads pending events, then pulls the user's
mobile event history. It does not promise execution while the OS has suspended or
terminated the app; pending writes resume next time the app opens. Study content
uses last-edit timestamp plus event ID for deterministic conflict resolution;
review states likewise use the latest saved revision. All underlying events are
retained. Device clocks should be correct. Explicit downloads stay as snapshots
until updated; media attachments are not supported by the mobile content model.

Sign in from Profile before going offline to sync subsequent activity to that
account. Guest/legacy data stays in the guest namespace and is not silently adopted
by another account. Signing out switches namespaces without deleting pending work;
sign back into the original account to retry. First-time sign-in needs internet.
Do not clear app data/uninstall before pending work has synced.

**Backend prerequisite:** apply `supabase/mobile-offline-migration.sql`. It adds
`mobile_sync_events` with per-user RLS and insert-only permissions. Mobile history
and locally authored edits synchronize between mobile installations through this
log. The website's existing history pages do not yet read this mobile log; this
change does not overwrite website quiz/deck records with offline edits. Website
content is available for downloading via the existing authorized library queries.

Validation: `node --test tests/mobile-offline.test.cjs` (from repository root),
mobile TypeScript check and ESLint. Device release checks: download while online,
restart in airplane mode, complete a quiz and rate cards, reopen and verify local
history, reconnect and verify pending count reaches zero; repeat with two accounts
and with a lost upload acknowledgement. Apply the migration before checking live
sync. A new app build is needed to ship these JavaScript changes to users.
