# MAVI — Maharaja Agro Vegetable Inventory

<div align="center">
  <img src="public/mvgr-logo.png" alt="MVGR College Crest" width="130" />
  <br />
  <h3>Maharaj Vijayaram Gajapathi Raj College of Engineering</h3>
  <p><strong>Cultivating connections between fresh campus harvest and smart dining.</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite)](https://www.sqlite.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
</div>

---

## 🌿 About MAVI

**MAVI (Maharaja Agro Vegetable Inventory)** is a state-of-the-art agricultural produce management and self-service ordering platform developed for campus farm operations. 

It bridges the gap between daily organic harvest and campus consumers—enabling students, faculty, and mess administrators to browse fresh produce, order in customizable fractional quantities (250g, 500g, 1kg, bundles), and track inventory in real time through an ultra-responsive digital kiosk and management suite.

---

## ✨ Key Features

### 🛒 Self-Service Kiosk (`/kiosk`)
- **Interactive Digital Catalog**: Browse produce by categories (*Vegetables*, *Fruits*, *Leafy Greens*, *Spices*).
- **Flexible Fractional Quantities**: Add custom weight breakdowns (250g, 500g, 1kg) or unit-based bundles with dynamic price calculation.
- **Unified Search Bar**: Pill-shaped glassmorphic search with instant produce filtering across mobile, tablet, and desktop.
- **Live Campus Announcement Ticker**: Real-time animated ticker at the top of the kiosk broadcasting farm status, harvest schedules, and emergency notices with custom priority color themes.
- **Instant Basket & Checkout**: Streamlined ordering for Students and Staff with real-time stock deductions and printable digital receipts.

### 🛡️ Admin Management Suite (`/admin`)
- **Live Sales & Inventory Dashboard**: Real-time revenue summaries, daily order volumes, low-stock alerts, and category analytics.
- **Produce & Stock Controller**: Add, update, restock, or soft-delete produce items. Customize per-item fractional pricing, units, and upload produce imagery.
- **Live Ticker & Farm Status**: Publish real-time ticker announcements and set broadcast theme colors (Emerald, Amber, Harvest Gold, Emergency Red).
- **Order History & Receipts**: Inspect past orders, filter by Buyer Type (*Student* / *Lecturer*), view line-item breakdowns, and print receipts.
- **Database & Backups**: Built-in SQLite backup manager, Excel/JSON data export, and database health metrics.
- **Security & Session Management**: Secure cookie-based authentication, rate-limiting on API endpoints, and protected admin middleware.

### 🎨 Visual Identity & Experience
- **Interactive Botanical WebGL Shader**: Custom bio-luminescent fiber arc background on the landing page that reacts dynamically to cursor movements.
- **MVGR College Emblem Integration**: Official college crest rendered cleanly with transparent alpha blending.
- **Tailored Agricultural Palette**: Deep forest emerald (`#0F2A22`), botanical mint (`#34D399`), and harvest gold (`#FDE047`) glassmorphic UI.
- **Mobile-First UX**: Responsive touch navigation with zero scrollbar clutter on mobile devices.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Frontend UI** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/), Custom WebGL Shaders |
| **Database** | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (Embedded ACID SQLite) |
| **Networking & Tunnel** | Cloudflare Tunnel integration (`cloudflared`) |
| **Type Safety** | TypeScript 5 |

---

## 📁 Project Structure

```
├── app/
│   ├── admin/                  # Admin portal (Dashboard, Inventory, Orders, Status, Reports, Database)
│   ├── api/                    # Secure REST API endpoints (items, orders, settings, database, auth)
│   ├── kiosk/                  # Self-service ordering kiosk
│   ├── error.tsx               # Root error boundary with automatic chunk recovery
│   ├── globals.css             # Tailwind CSS tokens & theme styling
│   ├── layout.tsx              # Root HTML & chunk load recovery script
│   └── page.tsx                # Hero landing page with WebGL Fibre Arc
├── components/
│   ├── admin/                  # Admin modals, tables, and controllers
│   ├── kiosk/                  # Kiosk product cards and basket drawers
│   ├── ui/                     # FibreArc WebGL component and reusable primitives
│   └── AdminSidebar.tsx        # Responsive navigation sidebar for admin
├── data/                       # Initial data seeds & shared TypeScript schemas
├── lib/
│   ├── auth-util.ts            # Admin session & authentication verification
│   ├── db.ts                   # SQLite database connection, tables, & migrations
│   └── rate-limit.ts           # IP-based rate limiting protection
├── public/                     # Static assets, produce photographs, and college logos
├── utils/                      # Helper utilities, normalization, and ticker themes
├── run.sh                      # Production server & Cloudflare tunnel launch script
└── stop.sh                     # Safe process termination script
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Nitish-vattikuti/MAVI-AGRO.git
cd MAVI-AGRO
npm install
```

### 3. Run Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser to view the application.

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
npm start
```

### 5. Launch with Cloudflare Tunnel (Campus Hosting)
The repository includes automated shell scripts to launch the application and open a public HTTPS tunnel:
```bash
# Start Next.js + Cloudflare Public Tunnel
chmod +x run.sh stop.sh
./run.sh

# To safely shut down all services
./stop.sh
```

---

## 🔐 Admin Access

To access the management portal:
1. Navigate to [http://localhost:3001/admin/login](http://localhost:3001/admin/login) (or click **Admin Access** on the homepage).
2. Enter the administrator credentials configured in your environment or database seed.
3. Access dashboard metrics, inventory management, live announcements, and reports.

---

## 📄 License & Credits

Developed for **Maharaj Vijayaram Gajapathi Raj College of Engineering (MVGR)**.  
All rights reserved © 2026.
