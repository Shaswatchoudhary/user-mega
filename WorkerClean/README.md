# WorkEase Professional: Empowering Service Experts 🛠️💼

WorkEase Professional is the dedicated platform for service experts to manage their business, find jobs, and grow their reputation. From seamless registration to real-time job alerts and navigation, everything a professional needs is just a tap away.

[![React Native](https://img.shields.io/badge/React_Native-0.81.0-blue.svg?style=flat-square&logo=react)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_&_Messaging-orange.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Notifee](https://img.shields.io/badge/Notifications-Notifee-green.svg?style=flat-square)](https://notifee.app/)

## 🚀 Key Features

### 📋 Professional Onboarding
- **Multi-step Registration**: Securely collect personal details, ID verification, and service categories.
- **Service Profile**: Create a detailed profile showcasing skills, experience, and pricing.
- **ID Verification**: Built-in support for uploading and verifying professional credentials.

### ⚡ Real-time Job Management
- **Instant Alerts**: Receive high-priority push notifications for new job leads via FCM and Notifee.
- **Single-tap Acceptance**: Accept jobs instantly and see customer location/details immediately.
- **In-progress Tracking**: Manage active orders with status updates (Started, In-Progress, Completed).

### 📊 Performance Dashboard
- **Earnings Tracking**: Monitor daily, weekly, and monthly income at a glance.
- **Service Stats**: Track hours online, jobs completed, and customer ratings.
- **Analytics**: Beautifully visualized data using custom SVG and animated components.

### 📍 In-app Navigation
- **Live Maps**: Integrated Google Maps for precise navigation to customer sites.
- **Distance & ETA**: Real-time distance calculation and estimated time of arrival using `locationUtils`.

## 🛠️ Tech Stack

- **Core**: [React Native CLI](https://reactnative.dev/)
- **Notifications**: [Notifee](https://notifee.app/) & [Firebase Cloud Messaging](https://rnfirebase.io/messaging/usage)
- **Maps & Location**: [React Native Maps](https://github.com/react-native-maps/react-native-maps) & Geolocation API
- **UI Components**: [Lucide React Native](https://lucide.dev/), [React Native Linear Gradient](https://github.com/react-native-linear-gradient/react-native-linear-gradient)
- **Data Fetching**: [Axios](https://axios-http.com/) with centralized config

## 🏗️ Installation & Setup

1.  **Navigate to directory**:
    ```bash
    cd WorkerClean
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Android Setup**:
    - Ensure your `google-services.json` is correctly placed in `android/app/`.
    - Run the development server:
      ```bash
      npx react-native run-android
      ```

4.  **iOS Setup**:
    - Install pods:
      ```bash
      cd ios && pod install && cd ..
      ```
    - Run the application:
      ```bash
      npx react-native run-ios
      ```

## 📐 Project Structure

- `/src/screens/work`: Registration and review screens.
- `/src/screens/jobdetail`: Detailed job views and action screens.
- `/src/services`: Notification and permission handlers.
- `/src/context`: Location simulation and worker state management.
- `/src/utils`: Distance calculation and notification formatting helpers.

---

Built for the experts who build our homes. 🛠️✨
