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
