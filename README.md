# Silver Potato

An Expo Go + React Native + TypeScript mobile app starter on Expo SDK 54.

## Scripts

- `npm run dev` starts Expo on your local network for Expo Go while skipping Expo dependency API checks.
- `npm start` starts Expo for Expo Go.
- `npm run start:lan` starts Expo on your local network.
- `npm run start:lan:no-check` starts Expo on your local network without dependency API checks.
- `npm run start:offline` starts Expo without Expo API checks.
- `npm run start:tunnel` starts Expo through a tunnel when LAN is blocked.
- `npm run android` starts Expo and opens the Android target.
- `npm run ios` starts Expo and opens the iOS target.
- `npm run web` opens the web target.

## Expo Go

Install Expo Go on your phone, run `npm run start:lan`, then scan the QR code printed in the terminal. If your phone and computer cannot see each other on Wi-Fi, use `npm run start:tunnel`.

## Auth

Authentication is frontend-only for now. Mock accounts and the active session are stored on-device with AsyncStorage in `src/auth/mockAuth.ts`, so the service can be replaced later with backend auth.

## Onboarding

After login or sign up, users complete a frontend-only onboarding flow before entering the app. Progress and completion are stored locally per user in `src/onboarding/onboardingStorage.ts`.
