# 🎓 Smart School Management System (ERP & Mobile Solution)

[![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge)](LICENSE)

## License

Copyright © 2026 Umar Ajmal. All Rights Reserved.

This source code is publicly available for viewing and educational
reference purposes only.

No permission is granted to copy, reproduce, modify, distribute,
publish, sublicense, sell, or use this code or substantial portions
of this code for commercial or production purposes without prior
written permission from the copyright holder.

For commercial use, redistribution, modification, or any other use
beyond viewing and learning, please contact the copyright holder
for written permission.

---

A commercial, production-ready, enterprise-grade **School Management ERP & Native Mobile Application** suite built for educational institutions, school networks, and multi-branch academies. This product is engineered for high performance, ease of use, dynamic school white-labeling, and zero-headache cloud or on-premise deployment.

---

## 🌟 Live Demo & Cloud Deployment Links

| Environment | Platform | URL / Endpoint | Details |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **Render / Vercel** | [https://sgmschool.onrender.com](https://sgmschool.onrender.com) | Next.js 14 Client Web Portal |
| **Backend REST API** | **Render Cloud** | [https://sgmschool.onrender.com](https://sgmschool.onrender.com) | Node.js / Express Server API |
| **Database Cluster** | **Supabase / PostgreSQL** | Managed Cloud Database | PostgreSQL Relational Engine |
| **Native Mobile App** | **Android / iOS** | Capacitor Cross-Platform | Native Launcher Icons & APK Build Ready |

---

## 🚀 Key Highlights & Commercial Features

- 🏢 **White-Label & Dynamic School Branding**: Automatic live synchronization of School Name, Logo, Tagline, Favicon, Touch Icons, PWA Manifest, and Root Animated Splash Screen from server settings without code rebuilds.
- 👨‍👩‍👧‍👦 **Family ID & Sibling Auto-Grouping Engine**: Automatically groups blood siblings and cousins into unified Family Records (`FAM-YYYY-NNNN`), consolidating family fee vouchers, opening balances, and parent contact details without redundant data entry.
- 💳 **Complete Fee & Financial Voucher System**: Flexible class fee plans, fee heads (Tuition, Transport, Admission, Sports, Exam Fees), family combined fee vouchers, opening balance adjustments, and thermal/PDF printing ready.
- 📊 **Executive & Role-Based Dashboards**: Customized real-time analytics dashboards for **Administrators**, **Accountants/Cashiers**, **Teachers**, and **Students/Parents**.
- 📝 **Exam Marking & Grade Position Sheet**: Test paper creation, term-wise exam scheduling, teacher lock/unlock marks sheet, auto grade computation (A+, A, B, C, D, F), percentage, position ranking, and student report card generation.
- ⚡ **Student Promotion Engine**: Seamless academic year transition module to promote or retain students into next classes with automated record archiving.
- 📊 **Expense & Accounts Management**: Categorized financial tracking (Salaries, Utilities, Maintenance, Supplies, Marketing, Transportation) with visual graphs, vendor records, and payment mode breakdowns.
- 📱 **Native Mobile App (Capacitor)**: Built-in cross-platform support with automated Android mipmap launcher icons generator script (`client/scripts/generate-icon.js`).
- 🔒 **Granular Role-Based Access Control (RBAC)**: Unlimited custom roles creation, role cloning, and fine-grained permission matrix across every single module.
- 📥 **Bulk Excel Student Import**: Instant import of hundreds of student records with smart column mapping and family grouping auto-detection.
- 💾 **System Backup & Recovery**: Scheduled database auto-backups and 1-click manual SQL backup/restore tools.

---

## 📦 System Modules & Complete Capabilities

### 1️⃣ **Student Lifecycle & Family Management**
- **Admission Management**: Complete student registration with auto-generated Roll Numbers, Admission Numbers, photos, and customizable discount percentages (Tuition Discount %, Transport Discount %).
- **Family ID System (`FAM-YYYY-NNNN`)**: Automatically groups children belonging to the same parents or guardians under a single family identifier.
- **Sibling & Cousin Link / Merge Engine**: Intelligently auto-fills Father/Mother details, Guardian CNIC/Phone, Address, and Emergency Contacts when adding siblings.
- **Duplicate Family Detection & Merge Tool**: Scans and identifies duplicate family records by Guardian CNIC or Mobile, allowing 1-click consolidation of all student links.
- **Bulk Excel Import Utility**: Upload `.xlsx` spreadsheets to import hundreds of student records simultaneously, complete with automated data validation and section allocation.
- **Student Directory & Filtering**: Advanced search by Name, Admission Number, Roll No, Class, Section, Gender, Status (Active / Inactive / Left), and Family ID.
- **Student Credentials & Password Reset**: 1-click generation of student portal login accounts and password resets.

### 2️⃣ **Fee Management & Financial Vouchers**
- **Fee Heads Management**: Create and configure recurring or one-time fee heads (Tuition Fee, Admission Fee, Computer Lab, Transport Fee, Library, Sports, Exam Fee).
- **Class-Wise Fee Structure & Plans**: Set base monthly fee amounts per class/section with discount applicability rules.
- **Family Combined Fee Vouchers**: Generates single consolidated monthly fee slips for all siblings in a family, calculating discounts, previous dues, and total payable amount.
- **Fee Collection & Cashier Desk**: Quick search by Family ID, Student Name, or Voucher Number to record payments (Cash, Bank, Cheque, Online Transfer).
- **Opening Balance Management**: Set or adjust initial financial dues/credits per student/family with audit remarks.
- **Thermal & PDF Print Ready**: One-click printable fee receipts formatted for thermal receipt printers or standard A4/A5 slips.
- **Exam Fees Module**: Independent fee collection module dedicated to mid-term and annual examination slips with lock/unlock controls.

### 3️⃣ **Academic Management & Examinations**
- **Academic Years & Terms Configuration**: Configure active academic sessions (e.g. 2025-2026) and multi-term calendars (First Term, Mid-Term, Final Term).
- **Classes, Sections & Subjects Setup**: Multi-section class creation, subject mapping, and subject code assignment.
- **Teacher Class & Subject Allocation**: Map subject teachers and class teachers to specific sections and subjects.
- **Class Tests & Test Papers**: Create class test papers with custom total marks, description, and target subject.
- **Marks Sheet & Entry Lock System**: Interactive mark entry grid for teachers with automatic saving and lock-after-submission mechanism to prevent unauthorized tampering.
- **Automated Grading & Position Calculation**: Computes total marks, percentage, letter grades (A+, A, B, C, D, F), pass/fail status, and class position/rankings automatically.
- **Class Promotion Engine**: Bulk transfer of passed students to the next academic class while handling retained/repeating students seamlessly.

### 4️⃣ **Expense Tracking & Accounts**
- **7 Default Expense Categories**: Salaries & Wages, Utilities (Electricity, Water, Gas, Internet), Office Supplies, Building Maintenance, Transportation & Fuel, Marketing & Promotions, Miscellaneous.
- **Expense Voucher Entry**: Log expenses with expense date, category, amount, payee/vendor name, payment mode (Cash, Bank, Cheque, Card, Online), and reference voucher number.
- **Financial Analytics & Summary Dashboard**: Visual breakdown of institute expenditures with interactive category charts and date-range filters (Daily, Monthly, Yearly).

### 5️⃣ **Human Resource Management (HRM)**
- **Staff Directory**: Master employee database storing personal info, CNIC, qualifications, designation, department, joining date, and salary.
- **Department & Designation Config**: Customizable organizational hierarchy (Teaching Staff, Administration, Accounts, Maintenance, Management).
- **Staff Attendance & Leave Tracking**: Track daily employee clock-in/clock-out, leave applications, and monthly attendance summaries.

### 6️⃣ **Attendance Tracking System**
- **Daily Student Attendance**: Quick section-wise attendance sheet (Present, Absent, Late, Leave) with instant status update.
- **Attendance Registers & Reports**: View monthly attendance percentages, student attendance histories, and generate monthly registers for print/export.

### 7️⃣ **Role-Based Access Control (RBAC) & Security**
- **Pre-Configured System Roles**:
  - 👑 **Administrator / Principal** (Level 100): Full unrestricted access to all modules, financial data, settings, and role management.
  - 💰 **Accountant / Cashier** (Level 70): Access focused on Fee Collection, Slips, Expenses, Financial Reports, and Student Fee Records.
  - 👨‍🏫 **Teacher / Instructor** (Level 50): Access scoped to assigned classes, student lists, attendance marking, and test marks entry.
  - 🎓 **Student / Parent** (Level 10): Portal access to view personal profile, attendance history, fee slips, and exam results.
- **Custom Role Creation & Cloning**: Build custom roles (e.g. Vice Principal, Exam Incharge, Receptionist) with granular Read/Write/Delete switches per module.
- **Bcrypt Password Encryption**: Enterprise-grade password hashing (`bcryptjs`) for all user accounts.

### 8️⃣ **Dynamic School Branding & UI System**
- **Dynamic Live Settings**: Change School Name, Logo Image, Tagline, Phone, Email, and Address from the Settings panel without code deployment.
- **Dynamic Favicon, Apple Touch Icon & PWA Manifest**: Automatically syncs browser tab icons and web manifest data with the uploaded school logo.
- **Root Animated Splash Screen**: 2.3-second smooth animated splash screen displaying the custom school emblem and name on mobile and web launch.
- **Android Mipmap Launcher Icon Generator**: Included Node.js utility (`client/scripts/generate-icon.js`) that automatically builds high-density native Android launcher PNG icons across all densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`).

---

## 🛠️ Technology Stack

### **Frontend (Client)**
- **Framework**: Next.js 14 (React 18, TypeScript)
- **Styling**: Vanilla CSS, Bootstrap 5, Custom Color Tokens
- **Icons**: Bootstrap Icons, Lucide React
- **Data Visualization**: Recharts (Interactive Bar, Line, and Pie Charts)
- **Notifications**: React Toastify
- **Excel Handling**: XLSX SheetJS
- **Native Mobile Runtime**: Capacitor 6 (Android Project configured)

### **Backend (Server)**
- **Runtime**: Node.js & Express.js REST API
- **Database Engine**: PostgreSQL 15+ (`pg` connection pool with SSL support)
- **File Uploads**: Multer
- **Security & Encryption**: Bcryptjs
- **Scheduler**: Node-Cron (Automated daily tasks)

---

## 💻 Local Quick Start (Batch File Menu System)

The project includes an automated Windows control menu for 1-click local setup and management:

### 1️⃣ **First Time Setup**
Double-click `FIRST_TIME_SETUP.bat` in the root folder. This automatically installs all npm packages for both client and server, configures default environments, and sets up database dependencies.

### 2️⃣ **Daily Execution (`RUN_APP.bat`)**
Double-click `RUN_APP.bat` to launch the interactive control launcher:
- **Option 1 (START Application)**: Automatically clears port locks, starts Backend API on `http://localhost:5000`, starts Next.js Client on `http://localhost:3000`, and opens browser automatically.
- **Option 2 (STOP Application)**: Terminates running Node.js server processes and clears port allocations.
- **Option 3 (RESTART Application)**: Performs a clean flush of caches and restarts both frontend and backend servers.
- **Option 4 (EXIT)**: Closes control menu.

### 🔑 **Default Demo Credentials**
- **Admin**: Username `root` | Password `root123`

---

## 🌐 Production Cloud Deployment Guide

### **Backend API Deployment (Render)**
1. Connect GitHub Repository to Render Web Service.
2. Set **Root Directory**: `server`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node index.js`
5. Configure Environment Variables:
   - `DATABASE_URL`: PostgreSQL connection string (Supabase / Render Postgres)
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or default allocated port)

### **Frontend Client Deployment (Vercel / Render)**
1. Connect GitHub Repository to Vercel or Render.
2. Set **Root Directory**: `client`
3. Set **Framework Preset**: Next.js
4. Set **Build Command**: `npm run build`
5. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://sgmschool.onrender.com`)

---

## 📁 Repository Directory Structure

```text
SMS_Pern/
├── RUN_APP.bat                      ⭐ Main interactive control launcher
├── FIRST_TIME_SETUP.bat             ⭐ 1-click initial dependencies setup
├── client/                          📁 Next.js 14 Frontend Application
│   ├── android/                     📱 Native Capacitor Android Project
│   ├── app/                         🌐 Next.js App Router Pages & APIs
│   ├── components/                  🧩 React Components & Dashboards
│   ├── public/                      🖼️ Static Assets & Dynamic Favicons
│   └── scripts/                     ⚙️ Icon Generator Script (generate-icon.js)
├── server/                          📁 Node.js Express Backend REST API
│   ├── routes/                      🔌 Express Route Handlers (25+ Modules)
│   ├── db.js                        🗄️ PostgreSQL Connection Pool
│   ├── index.js                     🚀 Express Server Entrypoint
│   └── migrations.js                🔄 Database Auto-Migration System
├── doc/                             📚 Complete System Documentation & Guides
└── README.md                        📖 Official Commercial Product Guide
```

---

## 📄 License & Commercial Product Notice

**Product**: Smart School Management System (ERP & Mobile App)  
**Developer & Owner**: **Muhammad Umar Ajmal**  
Repository: [https://github.com/UmarAjmal/PAF-Demo-School-Software.git](https://github.com/UmarAjmal/PAF-Demo-School-Software.git)  
**Status**: ✅ Production Ready (v2.0)

**Copyright © 2026 Umar Ajmal. All Rights Reserved.**  
This source code is proprietary and confidential. Strictly for viewing and educational evaluation. For commercial licensing, customization, or deployment inquiries, please contact the author. Refer to the [LICENSE](LICENSE) file for full legal terms.
