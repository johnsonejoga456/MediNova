# MediNova - Healthcare Management System

A comprehensive, full-stack healthcare management system built with **Next.js 16**, **TypeScript**, **Prisma**, and **Supabase**. This application provides complete patient, doctor, appointment, billing, and laboratory management with role-based access control.

---

## 🎯 Project Overview

MediNova is a production-ready healthcare management system designed for hospitals, clinics, and medical facilities. It streamlines patient care, appointment scheduling, medical records, prescriptions, laboratory tests, and billing operations.

### **Key Features**
- 👥 Multi-role authentication (Admin, Doctor, Nurse, Receptionist, Patient)
- 📅 Appointment scheduling with conflict detection
- 📋 Electronic medical records (EMR)
- 💊 Prescription management
- 🧪 Laboratory test ordering and results
- 💰 Billing, invoicing, and payment tracking
- 📊 Analytics dashboard with charts
- 🔍 Global search across all entities
- 🔐 Role-based access control (RBAC)

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Heroicons** - Professional icon library
- **Recharts** - Data visualization

### **Backend**
- **Next.js API Routes** - Serverless functions
- **NextAuth.js v5** - Authentication
- **Prisma ORM** - Database management
- **Server Actions** - Type-safe server operations

### **Database**
- **Supabase (PostgreSQL)** - Cloud database
- **Prisma Client** - Type-safe database queries

### **Additional Libraries**
- `bcryptjs` - Password hashing
- `zod` - Schema validation
- `date-fns` - Date utilities

---

## 📦 Installation

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account (or PostgreSQL database)
- Git

### **Setup Steps**

1. **Clone the repository**
```bash
git clone https://github.com/johnsonejoga456/MediNova.git
cd MediNova
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
npx prisma db push
npx prisma generate
```

5. **Seed initial data (optional)**
```bash
# Create admin user manually via registration
# Or create seed script
```

6. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 👥 User Roles & Permissions

### **1. Admin**
**Full system access**
- Manage all users (patients, doctors, staff)
- View all appointments, records, prescriptions
- Generate invoices and track payments
- Access analytics dashboard
- System configuration

### **2. Doctor**
**Patient care & medical operations**
- View assigned patients
- Manage appointments
- Create/update medical records
- Write prescriptions
- Order laboratory tests
- View lab results

### **3. Nurse**
**Patient support & lab coordination**
- View patient information
- Update appointment status
- Update lab test status
- Add lab test results
- View medical records (read-only)

### **4. Receptionist**
**Administrative & billing**
- Schedule appointments
- Manage patient registration
- Generate invoices
- Record payments
- View appointment calendar

### **5. Patient**
**Personal health access**
- View own appointments
- Access medical records
- View prescriptions
- Check lab test results
- View invoices and payment history

---

## 🔄 Application Workflow

### **Patient Registration & Onboarding**
1. **Receptionist/Admin** creates patient account
2. Patient receives login credentials
3. Patient logs in and updates profile
4. Medical history recorded during first visit

### **Appointment Scheduling**
1. **Receptionist** or **Patient** books appointment
2. Select doctor and appointment type
3. System checks for scheduling conflicts
4. Appointment confirmation sent
5. **Doctor/Nurse** can update status (Scheduled → Completed/Cancelled)

### **Medical Consultation**
1. **Doctor** reviews patient's medical history
2. Doctor creates/updates medical record
3. Diagnosis and treatment plan documented
4. Prescriptions issued if needed
5. Lab tests ordered if required

### **Laboratory Tests**
1. **Doctor** orders lab test for patient
2. Test appears in lab queue with "PENDING" status
3. **Nurse/Lab Staff** updates to "IN_PROGRESS"
4. Test performed, results entered
5. Status updated to "COMPLETED"
6. **Doctor** and **Patient** can view results

### **Billing & Payments**
1. **Receptionist/Admin** creates invoice for services
2. Invoice includes line items (consultation, tests, etc.)
3. Patient receives invoice notification
4. **Receptionist** records payment (full or partial)
5. Invoice status auto-updates (PENDING → PARTIALLY_PAID → PAID)
6. Outstanding balance tracked

### **Analytics & Reporting**
1. **Admin** accesses analytics dashboard
2. View appointment trends (30 days)
3. Monitor revenue & outstanding balances
4. Track patient growth
5. See department distribution

---

## 📊 Core Modules

### **1. Patient Management**
- Complete patient profiles
- Demographics and contact info
- Medical history tracking
- Emergency contact details
- Insurance information

**Key Files:**
- `app/dashboard/patients/` - Patient pages
- `src/actions/patients.ts` - Patient server actions

### **2. Doctor & Staff Management**
- Doctor profiles with specializations
- Staff (Nurse, Receptionist) management
- Department assignments
- Employee ID tracking

**Key Files:**
- `app/dashboard/doctors/` - Doctor pages
- `app/dashboard/staff/` - Staff pages
- `src/actions/doctors.ts` - Doctor actions
- `src/actions/staff.ts` - Staff actions

### **3. Appointment System**
- Calendar-based scheduling
- Appointment types (Consultation, Follow-up, Emergency, etc.)
- Status tracking (Scheduled, Completed, Cancelled, No-show)
- Conflict detection
- Duration management

**Key Files:**
- `app/dashboard/appointments/` - Appointment pages
- `src/actions/appointments.ts` - Appointment actions
- `src/components/appointments/` - Appointment components

### **4. Medical Records**
- Electronic medical records (EMR)
- Diagnosis and symptoms
- Treatment plans
- Vital signs tracking
- Medical history

**Key Files:**
- `app/dashboard/medical-records/` - Medical record pages
- `src/actions/medical-records.ts` - Medical record actions

### **5. Prescription Management**
- Medication tracking
- Dosage and frequency
- Refill management
- Prescription status (Active, Completed, Discontinued)

**Key Files:**
- `app/dashboard/prescriptions/` - Prescription pages
- `src/actions/prescriptions.ts` - Prescription actions
- `src/lib/prescription-utils.ts` - Prescription utilities

### **6. Laboratory & Diagnostics**
- Test ordering (Blood, Urine, Imaging, Biopsy, etc.)
- Test catalog with predefined tests
- Status tracking (Pending, In Progress, Completed)
- Results entry with reference ranges
- Interpretation and attachments

**Key Files:**
- `app/dashboard/lab-tests/` - Lab test pages
- `src/actions/lab-tests.ts` - Lab test actions
- `src/components/lab-tests/` - Lab test components

### **7. Billing & Payments**
- Invoice generation with line items
- Multiple payment methods (Cash, Card, Insurance, etc.)
- Payment tracking and history
- Outstanding balance calculation
- Automatic status updates
- Overdue invoice detection

**Key Files:**
- `app/dashboard/billing/invoices/` - Invoice pages
- `src/actions/invoices.ts` - Invoice actions
- `src/actions/payments.ts` - Payment actions
- `src/components/billing/` - Billing components

### **8. Analytics & Reports**
- Interactive charts (Line, Bar, Area, Pie)
- Key metrics dashboard
- Appointment trends
- Revenue overview
- Patient growth tracking
- Department distribution

**Key Files:**
- `app/dashboard/analytics/` - Analytics page
- `src/actions/analytics.ts` - Analytics actions

### **9. Global Search**
- Real-time search across entities
- Search patients, doctors, appointments, invoices, lab tests
- Role-based results filtering
- Debounced search for performance
- Keyboard navigation

**Key Files:**
- `src/components/search/GlobalSearch.tsx` - Search component
- `src/actions/search.ts` - Search actions

---

## 🗄️ Database Schema

### **Core Models**

**User** - Base authentication
- id, email, password, role, firstName, lastName, phoneNumber, isActive

**Patient** (extends User)
- dateOfBirth, gender, address, bloodType, allergies, emergencyContact

**Doctor** (extends User)
- specialization, licenseNumber, yearsOfExperience, qualifications

**Nurse/Receptionist** (Staff model)
- department, position, employeeId

**Appointment**
- patient, doctor, appointmentDate, duration, type, status, reason, notes

**MedicalRecord**
- patient, doctor, diagnosis, symptoms, treatment, vitals, notes, attachments

**Prescription**
- patient, doctor, medication, dosage, frequency, duration, refillsAllowed, status

**LabTest**
- patient, doctor, testType, testName, status, results, referenceRange, interpretation

**Invoice**
- patient, invoiceNumber, amount, amountPaid, status, items (line items)

**Payment**
- invoice, amount, paymentMethod, paymentDate, transactionId

### **Enums**
- `Role`: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT
- `AppointmentType`: CONSULTATION, FOLLOW_UP, EMERGENCY, SURGERY, CHECKUP
- `AppointmentStatus`: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
- `LabTestStatus`: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- `BillingStatus`: PENDING, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED
- `PaymentMethod`: CASH, CREDIT_CARD, DEBIT_CARD, INSURANCE, BANK_TRANSFER, MOBILE_PAYMENT

---

## 🎨 Design System

### **Color Palette**
```css
--primary: #006BA6 (Medical Blue)
--success: #10B981 (Green)
--warning: #F59E0B (Orange)
--danger: #EF4444 (Red)
--purple: #8B5CF6 (Purple)
```

### **UI Components**
- **Cards** - Rounded, shadowed containers
- **Badges** - Status indicators with colored dots
- **Buttons** - Primary, secondary, danger variants
- **Tables** - Responsive with hover effects
- **Forms** - Clean input fields with validation
- **Charts** - Recharts with healthcare color scheme

### **Icons**
All UI uses **Heroicons (24/outline)** for consistency:
- UserIcon, CalendarIcon, BeakerIcon, BanknotesIcon, ChartBarIcon, etc.

---

## 🔐 Security Features

### **Authentication**
- Bcrypt password hashing
- JWT session tokens
- Secure HTTP-only cookies
- Session expiration

### **Authorization**
- Role-based access control (RBAC)
- Server-side permission checks
- UI element visibility based on role
- Protected API routes

### **Data Protection**
- Input validation with Zod schemas
- SQL injection prevention (Prisma ORM)
- XSS protection (React auto-escaping)
- CSRF protection (NextAuth)

---

## 🚀 Deployment

### **Vercel (Recommended)**

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Import GitHub repository
- Configure environment variables
- Deploy

3. **Environment Variables**
```
DATABASE_URL
DIRECT_URL
NEXTAUTH_SECRET
NEXTAUTH_URL=https://your-domain.vercel.app
```

### **Other Platforms**
Compatible with any Node.js hosting:
- Railway
- Render
- AWS
- DigitalOcean

---

## 📚 Project Structure

```
healthcare-system/
├── app/                      # Next.js App Router
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/            # Main application
│   │   ├── analytics/        # Analytics & reports
│   │   ├── appointments/     # Appointments
│   │   ├── billing/          # Invoices & payments
│   │   ├── doctors/          # Doctor management
│   │   ├── lab-tests/        # Laboratory tests
│   │   ├── medical-records/  # Medical records
│   │   ├── patients/         # Patient management
│   │   ├── prescriptions/    # Prescriptions
│   │   └── staff/            # Staff management
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── actions/              # Server actions
│   │   ├── analytics.ts
│   │   ├── appointments.ts
│   │   ├── auth.ts
│   │   ├── doctors.ts
│   │   ├── invoices.ts
│   │   ├── lab-tests.ts
│   │   ├── medical-records.ts
│   │   ├── patients.ts
│   │   ├── payments.ts
│   │   ├── prescriptions.ts
│   │   ├── search.ts
│   │   └── staff.ts
│   ├── components/           # Reusable components
│   │   ├── appointments/
│   │   ├── billing/
│   │   ├── lab-tests/
│   │   ├── prescriptions/
│   │   ├── search/
│   │   └── staff/
│   ├── lib/
│   │   └── db/
│   │       └── prisma.ts     # Prisma client
│   └── auth.ts               # NextAuth config
├── .env.local                # Environment variables
├── next.config.ts            # Next.js config
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind config
└── tsconfig.json             # TypeScript config
```

---

## 🔮 Future Enhancements

### **Planned Features**
- 📧 **Email Notifications** - Appointment reminders, test results
- 📄 **PDF Reports** - Generate printable medical reports
- 📁 **File Uploads** - Profile pictures, test attachments, medical documents
- 📱 **Mobile App** - React Native companion app
- 🔔 **Real-time Notifications** - WebSocket-based updates
- 📊 **Advanced Reporting** - Custom report builder
- 🌐 **Multi-language Support** - Internationalization (i18n)
- 🔗 **API Integration** - Third-party lab systems, insurance providers

### **Potential Improvements**
- Unit & integration testing (Jest, Playwright)
- Performance monitoring (Sentry)
- Audit logging
- Data export functionality
- Appointment calendar integration (Google Calendar)
- Telemedicine video calls

---

## 🤝 Contributing

This is a production MVP. For feature requests or bug reports:
1. Open an issue
2. Fork the repository
3. Create a feature branch
4. Submit a pull request

---

## 📄 License

This project is proprietary software developed for healthcare management.

---

## 👨‍💻 Developer

**Johnson Ejoga**
- GitHub: [@johnsonejoga456](https://github.com/johnsonejoga456)
- Project: MediNova Healthcare System

---

## 🎉 Acknowledgments

Built with modern technologies:
- Next.js team for the amazing framework
- Vercel for seamless deployment
- Supabase for reliable database hosting
- Prisma for type-safe database operations
- The open-source community

---

## 📞 Support

For technical support or questions:
- Create an issue on GitHub
- Review the documentation above
- Check existing issues for solutions

---

**Version:** 1.0.0 (MVP)  
**Last Updated:** December 2024  
**Status:** Production Ready ✅
