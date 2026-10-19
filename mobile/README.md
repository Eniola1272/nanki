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
