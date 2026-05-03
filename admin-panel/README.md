# WorkEase Admin Hub 🚀

Premium administrative control center for the WorkEase platform. Built with a focus on high-performance monitoring, secure data management, and a high-end glassmorphic aesthetic.

## 🛠 Tech Stack
- **Frontend**: React.js 19 + Vite 8
- **Styling**: Tailwind CSS 3.4 (Custom Design System)
- **Data Architecture**: Hybrid (MongoDB REST API + Firebase Firestore)
- **Real-time Engine**: Firebase Web SDK
- **Icons**: Lucide-React

## 🔐 Security Architecture
The Admin Hub implements a mandatory **Two-Step Identity Verification** flow:
1. **Google OAuth**: Primary identity verification via Firebase Auth.
2. **Platform Secret Code**: Secondary verification layer for high-privilege access.
3. **Route Protection**: All administrative routes are wrapped in a `ProtectedRoute` layer that validates session integrity in `localStorage`.

## 🛰 Core Features
- **Field Tracker**: Real-time Leaflet GIS tracking with automatic geocoding and live pulse markers.
- **Dynamic Dashboard**: Multi-collection activity feed merging bookings, users, and worker logs.
- **User/Worker Registry**: Full CRUD operations with detailed side-drawer profiles and verification workflows.
- **Reporting System**: Integrated Firestore-based support ticket management.

## 🚀 Getting Started
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Firebase**:
   Configure `src/config/firebase.js` with your project credentials.
3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🎨 Design Principles
- **Contrast**: High-contrast Cardinal Red (`#C41E3A`) on deep Reddish-Black (`#1A1110`).
- **Depth**: Glassmorphism, subtle gradients, and premium shadows.
- **Typography**: `Outfit` for headings and `Jakarta Sans` for data precision.
