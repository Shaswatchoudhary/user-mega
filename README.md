<div align="center">

<img src="https://img.shields.io/badge/WorkEase-Home%20Services%20Platform-E53935?style=for-the-badge&logoColor=white" alt="WorkEase"/>

# WorkEase — India's Smart Home Services Platform

### *Connecting Every Home to Trusted Professionals, Instantly.*

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_API-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Google Maps](https://img.shields.io/badge/Google_Maps-Live_Tracking-4285F4?style=flat-square&logo=googlemaps&logoColor=white)](https://developers.google.com/maps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)
[![Research Paper](https://img.shields.io/badge/Published-IJSREM_2026-8A2BE2?style=flat-square)](https://ijsrem.com/)

<br/>

> **WorkEase** is a full-stack, production-grade on-demand home services platform built for urban and semi-urban India — where skilled workers meet verified customers through intelligent, real-time matching.

<br/>

[📱 User App](#-user-app) · [🔧 Worker App](#-worker-app-pro) · [🖥 Admin Dashboard](#-admin-dashboard) · [🏗 Architecture](#-system-architecture) · [🆚 Why WorkEase](#-workease-vs-competition)

</div>

---

## 🌍 Vision

India has **50+ million skilled workers** — electricians, plumbers, carpenters, AC technicians — who are invisible to the digital world. At the same time, millions of households struggle daily to find *trustworthy, available professionals on demand*.

**WorkEase bridges this gap.**

We are not just an app. We are a digital infrastructure for the informal skilled services economy — giving workers digital identities, consistent income, and professional visibility, while giving customers instant access to verified, rated, GPS-tracked professionals at their doorstep.

---
<br/>

<div align="center">
  <table style="border: none; background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 20px; padding: 24px 32px; margin: 20px 0;">
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/🔐-PROPRIETARY%20CODE-E53935?style=for-the-badge&labelColor=1a1a1a" alt="Proprietary Code"/>
        <br/><br/>
        <h3 style="color: #ffffff; margin: 0; font-weight: 600;">⚠️ Intellectual Property & Usage Terms</h3>
        <p style="color: #b0b0b0; margin: 12px 0 8px 0; font-size: 15px; line-height: 1.5;">
          WorkEase is a <strong>research-backed, production-grade platform</strong> published in IJSREM (April 2026).<br/>
          This repository is shared <strong>strictly for academic review and portfolio demonstration</strong>.
        </p>
        <p style="color: #e0e0e0; margin: 8px 0; font-size: 14px;">
          ❌ No copying · ❌ No forking · ❌ No deployment · ❌ No commercial use
        </p>
        <p style="color: #b0b0b0; margin: 12px 0 8px 0; font-size: 14px;">
          📧 <strong>Request license or collaboration:</strong>  
          <a href="mailto:kaushikchoudhary33@gmail.com" style="color: #E53935; text-decoration: none;">kaushikchoudhary33@gmail.com</a> · 
          <a href="https://www.linkedin.com/in/shaswat-choudhary-6a36b824b/" style="color: #E53935; text-decoration: none;">LinkedIn</a>
        </p>
        <hr style="width: 60px; border-color: #333; margin: 16px 0 8px 0;"/>
        <p style="color: #808080; margin: 0; font-size: 12px;">© 2026 WorkEase Team · All Rights Reserved</p>
      </td>
    </tr>
  </table>
</div>

<br/>

## 🚀 Three Platforms. One Ecosystem.

WorkEase operates as a unified ecosystem of three deeply connected platforms:

| Platform | Users | Core Purpose |
|----------|-------|-------------|
| 📱 **WorkEase** (User App) | Homeowners & Tenants | Book verified professionals, track in real-time, pay & rate |
| 🔧 **WorkEase Pro** (Worker App) | Skilled Professionals | Receive jobs, navigate to customers, manage earnings |
| 🖥 **WorkEase Admin** (Web Dashboard) | Platform Administrators | Monitor operations, verify workers, manage issues |

---

## 📱 User App

The customer-facing mobile application — built for simplicity, speed, and trust.

### ✨ Core Features

**🔐 Secure Authentication**
- Firebase OTP-based phone authentication
- Session persistence — log in once, stay logged in forever
- Firebase App Check security layer preventing bot access

**🗺 Swiggy-Style Location Experience**
- Draggable map pin for precise location selection
- Google Maps Reverse Geocoding — shows area name, not coordinates
- Save complete address: flat number, wing, building, landmark
- Multiple saved addresses (Home / Work / Other)

**🏠 Smart Service Discovery**
- 6+ service categories: Electrician, Plumber, Carpenter, AC Repair, Cleaner, Painter
- Single unified ServiceScreen — consistent experience across all categories
- Real worker data from Firestore — no dummy listings
- Worker cards showing: name, rating, distance, jobs completed, availability

**📋 End-to-End Booking Flow**
```
Select Service → Choose Worker → Confirm Address → Book
       ↓
Worker Receives Request → Accepts/Rejects (2-min timeout)
       ↓
User Sees "Booking Confirmed" → Live Tracking Screen
       ↓
Worker Navigates to User → Marks Work Complete
       ↓
User Confirms → Rates Worker → Back to Home
```

**🗺 Zomato-Style Live Tracking**
- Real-time worker location updating every 30 seconds via Firestore
- Smooth animated marker interpolation (Zomato algorithm) — continuous movement feel
- Google Directions API route line drawn between worker and user
- Live ETA countdown as worker approaches
- Status progress bar: ACCEPTED → ON WAY → ARRIVED → WORKING

**🎫 Service Ticket System**
- Job ticket opens when worker accepts
- Payment unlocks only after user confirms completion
- Raise issue option if work is unsatisfactory

**⭐ Premium Feedback System**
- 5-star animated rating
- Quick-tag reviews (Professional, On Time, Clean Work, etc.)
- Worker's Firestore rating updates automatically
- Review saved to `reviews` collection

**🔔 Push Notifications (FCM)**
- Background, foreground, and killed-state notifications
- Notifee for rich Android notification channels
- Triggered on: booking accepted, work completed, issue closed

**👤 Profile Management**
- View booking history
- Manage saved addresses
- Notification history screen

---

## 🔧 Worker App (Pro)

The professional-facing app — built to maximize job acceptance and earnings transparency.

### ✨ Core Features

**📲 Job Request System**
- Dedicated JobRequestsScreen for pending bookings
- Full customer address shown: flat, wing, landmark, area
- Accept / Reject with one tap
- Auto-cancel if no response within 2 minutes

**🗺 In-App Navigation (No Google Maps Required)**
- Built-in Google Maps inside the worker app
- Route line drawn from worker to customer
- Real-time ETA and distance display
- Worker location saved to Firestore every 30 seconds
- Auto-detects arrival within 100 meters

**💼 Job Management**
- Active job tracking screen
- Mark work as complete
- Earnings dashboard: today / this week / total

**📊 Worker Dashboard**
- Real-time profile data from Firestore
- Rating, total jobs, success rate
- Hours online tracking
- Pending job counter

**🔐 Authentication**
- Firebase OTP phone login
- Session persistence — no re-login on app restart
- Worker profile fetches fresh from Firestore on every open

---

## 🖥 Admin Dashboard

A powerful React.js web dashboard for platform operations.

### ✨ Core Features

**📊 Analytics Overview**
- Total bookings, active users, active workers, revenue metrics
- Real-time stat cards with Firestore live listeners

**👥 Worker Management**
- Verify / unverify workers
- View complete worker profiles
- Monitor availability status

**📋 Booking Management**
- View all bookings with status filters
- Booking timeline (Created → Accepted → Completed)
- Worker-user assignment visibility

**🐛 Issues & Support**
- View issues from both `issues` and `support_tickets` Firestore collections
- Click three dots → view full worker + booking details in slide-over panel
- Close issues with one click (updates Firestore directly)

**📜 System Activity Logs**
- Real-time booking activity feed from Firestore
- Filter by: Today / This Week / This Month
- Filter by: All / Bookings / Completed / Cancelled
- Export filtered logs as CSV

---

## 🆚 WorkEase vs Competition

| Feature | WorkEase | Urban Company | Housejoy | NoBroker | HiCare |
|---------|----------|--------------|----------|----------|--------|
| Real-time GPS tracking (live map) | ✅ Full | ✅ Full | ❌ None | ❌ None | ❌ None |
| In-app worker navigation | ✅ Built-in | ❌ External | ❌ None | ❌ None | ❌ None |
| OTP-only login (no passwords) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Session persistence (stay logged in) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Swiggy-style location picker | ✅ | ✅ | ❌ | ❌ | ❌ |
| Worker accepts/rejects per booking | ✅ | ❌ Auto-assign | ❌ | ❌ | ❌ |
| Service ticket system (job confirmation) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Payment locked until user confirms | ✅ | ❌ | ❌ | ❌ | ❌ |
| Worker sees customer address before accepting | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dedicated worker navigation app | ✅ | ❌ | ❌ | ❌ | ❌ |
| Admin dashboard with live logs | ✅ | ✅ Enterprise | ❌ | ❌ | ❌ |
| Open source & customizable | ✅ MIT | ❌ Closed | ❌ Closed | ❌ Closed | ❌ Closed |
| Works in semi-urban cities | ✅ | ❌ Metro only | ❌ Metro only | ❌ Metro only | ❌ Metro only |
| Research-published architecture | ✅ IJSREM 2026 | ❌ | ❌ | ❌ | ❌ |

### 🏆 Key Advantages Over Competitors

**1. Worker Transparency**
Unlike Urban Company's auto-assignment, WorkEase shows workers the full customer address *before* they accept. Workers make informed decisions, reducing cancellations.

**2. Mutual Confirmation Flow**
The unique Service Ticket System ensures payment is only unlocked after the user explicitly confirms the work is done — protecting customers from premature charges.

**3. True Semi-Urban Reach**
Built with Kolhapur (Tier-2 city) as the primary market. No metro-city bias. Works wherever Google Maps and mobile internet works.

**4. In-App Worker Navigation**
Workers don't need to switch to Google Maps. Navigation is built directly into WorkEase Pro, keeping workers in the app and improving data completeness.

**5. Smooth Live Tracking**
Our Zomato-algorithm smooth marker animation makes tracking feel continuous even with 30-second update intervals — better UX than most Indian apps at any price tier.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WorkEase Ecosystem                    │
├─────────────┬──────────────────────┬────────────────────┤
│  User App   │     Worker App Pro   │  Admin Dashboard   │
│ (React      │    (React Native     │  (React + Vite     │
│  Native)    │     Bare CLI)        │   + Tailwind)      │
└──────┬──────┴──────────┬───────────┴─────────┬──────────┘
       │                 │                     │
       ▼                 ▼                     ▼
┌──────────────────────────────────────────────────────────┐
│              Firebase Layer (Real-Time)                  │
│  • Firestore (bookings, workers, users, issues)         │
│  • Firebase Auth (OTP Phone Login)                      │
│  • FCM (Push Notifications)                             │
│  • App Check (Security)                                 │
└──────────────────────────────┬───────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────┐
│           Node.js + Express Backend (Render)             │
│  • REST API for persistent records                      │
│  • MongoDB Atlas (booking history, profiles)            │
│  • Google Maps Directions API integration               │
│  • FCM Notification triggers                            │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Books Service
        │
        ▼
Firestore: bookings/{id} created (status: "pending")
        │
        ▼
Worker App: onSnapshot listener fires → JobRequestsScreen
        │
    Accept / Reject
        │
        ▼
Firestore: status → "accepted" + worker location saved
        │
        ▼
User App: TrackingScreen — onSnapshot on workers/{workerId}
        │
Worker moves → location updates every 30 seconds
        │
        ▼
Worker: "Mark Work Complete" → status: "work_completed"
        │
        ▼
User: Completion modal → "Yes, Close Job"
        │
        ▼
Firestore: status → "completed", paymentUnlocked: true
        │
        ▼
FeedbackScreen → rating saved → worker.rating updated
```

---

## 🛠 Tech Stack

### Mobile Apps (User + Worker)
| Technology | Purpose |
|-----------|---------|
| React Native 0.81.5 (Bare CLI) | Cross-platform mobile framework |
| @react-native-firebase/auth | OTP phone authentication |
| @react-native-firebase/firestore | Real-time database |
| @react-native-firebase/messaging | Push notifications (FCM) |
| @react-native-firebase/app-check | Security against bots |
| @notifee/react-native | Rich notification channels |
| react-native-maps | Google Maps integration |
| @react-native-community/geolocation | GPS location access |
| React Navigation 6 | Screen navigation |
| React Context API | Global state management |
| react-native-linear-gradient | Premium UI gradients |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB Atlas | Persistent booking records |
| Firebase Admin SDK | Server-side Firestore access |
| Google Directions API | Route calculation |
| Render.com | Cloud hosting |

### Admin Dashboard
| Technology | Purpose |
|-----------|---------|
| React + Vite | Fast web build |
| Tailwind CSS | Utility-first styling |
| Firebase Firestore | Live data (no backend needed) |
| Lucide React | Icon system |
| Recharts | Analytics charts |
| Axios | API communication |

---

## 📁 Project Structure

```
WorkEase/
├── USERFinal/                    # User Mobile App
│   ├── src/
│   │   ├── screens/              # All app screens
│   │   │   ├── HomeScreen.js
│   │   │   ├── ServiceScreen.js  # Unified service screen
│   │   │   ├── TrackingScreen.js # Live tracking
│   │   │   ├── FeedbackScreen.js # Rating & review
│   │   │   └── ...
│   │   ├── components/           # Reusable UI components
│   │   │   ├── CustomModal.js    # Premium modal system
│   │   │   └── ...
│   │   ├── context/              # Global state
│   │   │   ├── AuthContext.js
│   │   │   └── LocationContext.js
│   │   ├── services/             # External integrations
│   │   │   ├── bookingService.js
│   │   │   ├── notificationService.js
│   │   │   └── locationTracker.js
│   │   └── constants/
│   │       └── config.js         # API keys & config
│   └── android/                  # Android native code
│
├── USERFinal/WorkerClean/        # Worker Mobile App
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.js
│   │   │   ├── JobRequestsScreen.js
│   │   │   ├── WorkerNavigationScreen.js
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   └── services/
│   │       └── locationTracker.js # 30-sec Firestore updates
│   └── android/
│
└── admin-dashboard/              # Admin Web App
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Issues.jsx
    │   │   ├── SystemLogs.jsx
    │   │   └── Workers.jsx
    │   ├── components/
    │   │   ├── WorkerDetailsPanel.jsx
    │   │   └── DetailPanel.jsx
    │   └── utils/
    │       └── api.js
    └── vite.config.js
```

---

## 📖 Research Publication

WorkEase has been peer-reviewed and published in an international journal:

> **"WorkEase: An Intelligent On-Demand Platform for Local Skilled Service Allocation Using Location-Based Services and Multi-Criteria Weighted Ranking"**
>
> *International Journal of Scientific Research in Engineering and Management (IJSREM)*
> Volume 10, Issue 04 | April 2026 | SJIF Rating: 8.659
> ISSN: 2582-3930 | DOI: 10.55041/IJSREM61161

**Key technical contributions highlighted:**
- Haversine Formula for hyper-local proximity filtering
- Multi-Criteria Weighted Ranking Algorithm for worker allocation
- Real-time route optimization using Linear Velocity Model
- Dual-database architecture (Firestore + MongoDB)

---

## 🗺 Roadmap

| Version | Feature | Status |
|---------|---------|--------|
| v1.0 | Core booking flow | ✅ Complete |
| v1.0 | Live GPS tracking | ✅ Complete |
| v1.0 | FCM notifications | ✅ Complete |
| v1.0 | Admin dashboard | ✅ Complete |
| v1.1 | Service ticket system | ✅ Complete |
| v1.1 | Feedback & rating | ✅ Complete |
| v1.1 | In-app worker navigation | ✅ Complete |
| v2.0 | Razorpay/UPI payments | 🔄 Planned |
| v2.0 | AI-powered service search | 🔄 Planned |
| v2.0 | Multi-language (Hindi/Marathi) | 🔄 Planned |
| v2.0 | Predictive demand heatmaps | 🔄 Planned |
| v3.0 | Worker subscription plans | 💡 Future |
| v3.0 | B2B enterprise bookings | 💡 Future |

---

## 👥 Team

Built as a final-year mega project at **Kolhapur, Maharashtra, India**.

---

<br/>

<div align="center">
  <table style="border: none; background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 20px; padding: 24px 32px; margin: 20px 0;">
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/📄-LICENSE%20TERMS-E53935?style=for-the-badge&labelColor=1a1a1a" alt="License Terms"/>
        <br/><br/>
        <h3 style="color: #ffffff; margin: 0; font-weight: 600;">Proprietary License – Not Open Source</h3>
        <p style="color: #b0b0b0; margin: 12px 0 8px 0; font-size: 14px; line-height: 1.5;">
          While this repository is publicly accessible, the code is shared <strong>exclusively for academic review and portfolio demonstration</strong> as part of a published research paper (IJSREM, April 2026).
        </p>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; margin: 16px 0;">
          <div style="text-align: left;">
            <p style="color: #E53935; margin: 4px 0;">❌ <strong style="color: #ffffff;">NOT Permitted</strong></p>
            <p style="color: #b0b0b0; margin: 2px 0; font-size: 13px;">Commercial use or deployment</p>
            <p style="color: #b0b0b0; margin: 2px 0; font-size: 13px;">Personal or production hosting</p>
            <p style="color: #b0b0b0; margin: 2px 0; font-size: 13px;">Forking or derivative apps</p>
            <p style="color: #b0b0b0; margin: 2px 0; font-size: 13px;">Copying/cloning without permission</p>
          </div>
          <div style="text-align: left;">
            <p style="color: #34A853; margin: 4px 0;">✅ <strong style="color: #ffffff;">Permitted</strong></p>
            <p style="color: #b0b0b0; margin: 2px 0; font-size: 13px;">Educational review & reading</p>
            <p style="color: #b0b0b0; margin: 2px 0; font-size: 13px;">Research citations & references</p>
            <p style="color: #b0b0b0; margin: 2px 0; font-size: 13px;">Portfolio showcase (view only)</p>
            <p style="color: #b0b0b0; margin: 2px 0; font-size: 13px;">Contact for licensing options</p>
          </div>
        </div>
        <hr style="width: 60px; border-color: #333; margin: 16px 0 8px 0;"/>
        <p style="color: #808080; margin: 8px 0 4px 0; font-size: 13px;">
          📧 <strong>Inquiries & collaborations:</strong>  
          <a href="mailto:kaushikchoudhary33@gmail.com" style="color: #E53935; text-decoration: none;">kaushikchoudhary33@gmail.com</a> · 
          <a href="https://www.linkedin.com/in/shaswat-choudhary-6a36b824b/" style="color: #E53935; text-decoration: none;">LinkedIn</a>
        </p>
        <p style="color: #808080; margin: 12px 0 0 0; font-size: 12px;">© 2026 WorkEase Team · All Rights Reserved</p>
      </td>
    </table>
  </table>
</div>

<br/>

<div align="center">

**WorkEase** — *Turning India's informal service economy into a reliable digital ecosystem.*

Made with ❤️ in Kolhapur, Maharashtra 🇮🇳

[![GitHub stars](https://img.shields.io/github/stars/Shaswatchoudhary/user-mega?style=social)](https://github.com/Shaswatchoudhary/user-mega)

</div>
