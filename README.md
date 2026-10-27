# 🎓 EduPulse - Smart School & Student Management System

> **A modern, cross-platform mobile ecosystem for schools, teachers, students, and administrators.** Built with **React Native (Expo SDK 57)** and powered by **Supabase (PostgreSQL & Edge Functions)** with seamless **Razorpay** payment integration.

---

## 📌 Project Overview

**EduPulse** is designed to streamline academic operations, communication, and fee management into a single intuitive mobile experience. It provides role-based access control (RBAC) ensuring admins, educators, and students have dedicated dashboards tailored to their daily tasks.

### 🌟 Key Highlights
- **Role-Based Access Control (RBAC):** Tailored views for `Admin`, `Teacher`, and `Student`.
- **Serverless Architecture:** Fast, scalable real-time database powered by Supabase.
- **Automated Fee Management:** Razorpay-powered online fee checkout with webhook verification.
- **Attendance & Timetable Tracking:** Real-time updates for classes, subjects, and daily attendance.
- **Cross-Platform:** Runs seamlessly on Android, iOS, and Web.

---

## 🛠️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   EduPulse Mobile App                  │
│       React Native 0.86  •  Expo SDK 57  •  TypeScript   │
│             Expo Router (File-based Routing)           │
│        TanStack React Query  •  React Hook Form        │
└──────────────────────────┬─────────────────────────────┘
                           │
             REST / Supabase Client (RLS)
                           │
┌──────────────────────────▼─────────────────────────────┐
│                    Supabase Backend                    │
│   • PostgreSQL Database (Row Level Security Enabled)   │
│   • Supabase Auth (JWT & Role verification)            │
│   • Edge Functions (Deno / Node serverless runtimes)   │
└──────────────────────────┬─────────────────────────────┘
                           │
             Payment APIs / Webhooks
                           │
┌──────────────────────────▼─────────────────────────────┐
│                   Razorpay Gateway                     │
│      Order Creation  •  Secure Checkout  •  Webhooks   │
└────────────────────────────────────────────────────────┘
```

### 📱 Frontend
- **Framework:** [Expo](https://expo.dev/) (SDK 57) + [React Native](https://reactnative.dev/) (v0.86)
- **Routing:** Expo Router (File-based navigation)
- **State & Data Fetching:** TanStack React Query v5
- **Forms & Validation:** React Hook Form + Zod
- **UI & Animations:** React Native Reanimated, Safe Area Context, Vector Icons

### 🗄️ Backend & Database
- **Backend-as-a-Service (BaaS):** [Supabase](https://supabase.com/)
- **Database:** PostgreSQL with Row Level Security (RLS) policies
- **Authentication:** Supabase Auth (JWT-based role authentication)
- **Serverless Functions:** Supabase Edge Functions (`razorpay-create-order`, `razorpay-webhook`)
- **Payment Gateway:** Razorpay API integration

---

## 👥 Role Features & Capabilities

| Module | 👑 Admin | 👨‍🏫 Teacher | 🎓 Student |
| :--- | :---: | :---: | :---: |
| **Dashboard & Analytics** | Full School Metrics | Class Summary | Personal Progress |
| **Student Management** | Create / Update / Delete | View Class Students | Profile View |
| **Teacher Management** | Assign Classes & Subjects | Profile Edit | View Teachers |
| **Attendance** | System-wide Reports | Mark Daily Attendance | View Attendance % |
| **Class & Timetable** | Create / Manage Schedule | View Assigned Classes | Class Schedule |
| **Fee Management** | Fee Structure & Status | - | Pay Fees via Razorpay |
| **Notice & Notifications**| Broadcast to all/roles | Class Notifications | Receive Alerts |

---

## 📂 Project Structure

```text
├── assets/                  # App icons, splash screens, and images
├── src/
│   ├── app/                 # Expo Router file-based screens & navigation
│   │   ├── (auth)/          # Login & registration screens
│   │   ├── (admin)/         # Admin dashboard and management flows
│   │   ├── (teacher)/       # Teacher dashboard and attendance flows
│   │   ├── (student)/       # Student dashboard, timetable, fee flows
│   │   └── _layout.tsx      # Root layout & route guards
│   ├── components/          # Reusable UI components (Buttons, Inputs, Cards)
│   ├── constants/           # Design tokens, theme colors, config
│   ├── hooks/               # Custom React hooks
│   ├── providers/           # Context providers (Auth, Theme, QueryClient)
│   ├── services/            # Supabase API client & database service layers
│   ├── types/               # TypeScript interfaces & types
│   └── utils/               # Helper utilities & Razorpay handler
├── supabase/
│   ├── schema.sql           # Database schema, triggers, and RLS policies
│   └── functions/           # Supabase Edge Functions (Razorpay orders/webhooks)
├── app.json                 # Expo app configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or newer
- **npm** or **yarn**
- **Expo Go App** (on your physical Android/iOS device) or **Android Studio / Xcode** emulators
- A free **[Supabase](https://supabase.com/)** account
- A free **[Razorpay](https://razorpay.com/)** account (test mode)

### 2. Installation
Clone the repository and install the dependencies:

```bash
git clone <your-repository-url>
cd student-management-system-app
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-supabase-anon-key

# Razorpay Backend Endpoint (Supabase Edge Function or custom server)
EXPO_PUBLIC_RAZORPAY_ENDPOINT=https://your-project.supabase.co/functions/v1/razorpay-create-order
```

### 4. Supabase Setup
1. Log in to your **Supabase Dashboard** and create a new project.
2. Go to the **SQL Editor** tab.
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and execute it.
4. Go to **Authentication > Users** and create your first administrator user.
5. In the **SQL Editor**, link the created Auth user to the `public.users` table with the `admin` role:

```sql
INSERT INTO public.users (id, role, full_name, email)
VALUES ('<your-auth-user-id>', 'admin', 'System Administrator', 'admin@example.com');
```

### 5. Running the Application
Start the Expo development server:

```bash
npx expo start
```

- **Run on Android Emulator:** Press `a`
- **Run on iOS Simulator:** Press `i`
- **Run on Physical Device:** Scan the QR code using the **Expo Go** app
- **Run on Web:** Press `w` (or `npm run web`)

---

## 💳 Payment Gateway Setup (Razorpay)

For detailed instructions on configuring Razorpay keys, testing test-mode payments, and setting up Supabase Edge Functions, refer to [`README_RAZORPAY.md`](./README_RAZORPAY.md).

---

## 🛡️ Security & Privacy
- **Row Level Security (RLS):** Every database table is protected by PostgreSQL RLS policies to prevent unauthorized data access across roles.
- **Client Key Safety:** Sensitive payment secrets (`RAZORPAY_KEY_SECRET`) are stored strictly inside backend serverless functions and never exposed to the client app.

---

## 📄 License
This project is open-source and available under the [MIT License](./LICENSE).
