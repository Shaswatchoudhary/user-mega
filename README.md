# WorkEase: Home Solutions Hub 🏠✨

WorkEase is a premium, all-in-one home services platform designed to connect users with verified professionals for everything from AC repair to deep cleaning. Built with a focus on ease of use and visual excellence, WorkEase streamlines the booking process with real-time tracking and emergency service capabilities.

[![React Native](https://img.shields.io/badge/React_Native-0.81.0-blue.svg?style=flat-square&logo=react)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_&_DB-orange.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## 🏗 System Architecture
WorkEase utilizes a **Hybrid Multi-Database Architecture** for maximum performance and real-time reliability:
- **Primary Database**: MongoDB (Node.js/Express API) for core relational data, user profiles, and persistent records.
- **Real-time Engine**: Firebase Firestore for live field tracking, service monitoring, and instant support ticket synchronization.

## 📱 Platforms
### 1. User/Worker Mobile App (React Native)
- Real-time service booking and GPS tracking.
- Secure OTP-based authentication.
- Premium, high-converting UI/UX.

### 2. Admin Hub (React + Vite)
- **Live Field Tracking**: Real-time Leaflet GIS integration with automatic geocoding.
- **Dynamic Monitoring**: Centralized dashboard for platform growth, system load, and activity auditing.
- **Dual-Layer Security**: Google Auth combined with a secondary administrative secret code.

## 🌟 Key Features

### 🔍 Smart Service Discovery
*   **Categorized Browsing**: Easily find help for Electrical, Plumbing, Painting, AC Repair, and more.
*   **Emergency Service**: One-tap booking for urgent repairs with prioritized routing.
*   **Seasonal Essentials**: Curated service recommendations based on current weather and local trends.

### 📅 Seamless Booking & Tracking
*   **Real-time Tracking**: Watch your professional's progress on a live map with accurate ETAs.
*   **Transparent Pricing**: Upfront estimates and secure payment processing.
*   **Flexible Scheduling**: Book for today or schedule for a later date with ease.

### 💎 Premium User Experience
*   **Modern Interface**: Stunning design powered by `react-native-linear-gradient` and custom animation logic.
*   **Notifications**: Stay updated with smart push notifications via Notifee and FCM.
*   **Profile Management**: Manage bookings, addresses, and payment methods in a sleek, unified dashboard.

## 🛠️ Tech Stack

- **Core**: [React Native CLI](https://reactnative.dev/)
- **State Management**: React Context API
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Cloud Messaging)
- **UI & Icons**: [Lucide React Native](https://lucide.dev/), [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)
- **Maps**: [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- **Animations**: [Lottie](https://airbnb.io/lottie/) & Native Animated API

## 🚀 Getting Started

### Prerequisites

- Node.js > 18
- Android Studio / Xcode
- Java Development Kit (JDK) 17

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Shaswatchoudhary/user-mega.git
    cd user-mega
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Setup Environment**:
    Create a `src/config/insforge.js` (if using InsForge) or configure your `google-services.json` / `GoogleService-Info.plist` in the respective native directories.

4.  **Run the application**:
    ```bash
    # For Android
    npx react-native run-android

    # For iOS
    npx react-native run-ios
    ```

## 📈 Architecture

The project follows a modular architecture:
- `/src/components`: Reusable UI components.
- `/src/screens`: Individual app pages.
- `/src/navigation`: Navigation configuration using React Navigation.
- `/src/context`: Global state management for Auth and Location.
- `/src/services`: Integration with external services (Firebase, APIs).

---

Designed with ❤️ for a better home service experience.
