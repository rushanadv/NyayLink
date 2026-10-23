# NyayLink — Legal Services Marketplace

> **Access to Justice, Simplified.**  
> India's verified legal services marketplace connecting citizens with Bar Council-enrolled advocates through transparent flat fees, AI-guided legal intake, milestone escrow, and secure case dockets.

- **Production Domain**: [https://nyay.live](https://nyay.live/)
- **Repository**: [rushanadv/NyayLink](https://github.com/rushanadv/NyayLink)
- **Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (Auth, Postgres, RLS), Framer Motion, Lenis, OpenRouter.

---

## 🏛️ Application Architecture

NyayLink provides three distinct authenticated environments governed strictly by database-level Row Level Security (RLS) on PostgreSQL:

### 1. Client Legal Workspace (`/dashboard`)
- **Matter Management**: Register, track, and review active legal dockets with chronological case timelines.
- **Advocate Search & Consultations**: Search Bar Council verified advocates across High Courts and request preliminary conferences.
- **Nyay AI Legal Intake**: Structured, plain-language legal triage grounded in Indian law (BNS, CPC, Consumer Protection, RERA).
- **Evidentiary Vault**: Encrypted repository for statutory notices, contracts, and case briefs under DPDP Act 2023 compliance.
- **Client Profile**: Self-service profile updates and authenticated session management.

### 2. Advocate Chambers Portal (`/lawyer/dashboard`)
- **Client Requests**: Actionable review interface to Accept or Decline incoming consultation requests, schedule appointment times, and provide instructions.
- **Assigned Dockets**: Real-time management of active legal matters, procedural status changes, and chronological event logging.
- **Chambers Calendar**: Centralized docket of confirmed conferences and hearing consultations.
- **Professional Practice Profile**: State Bar Council roll tracking, practice areas, bio, and directory publication controls.
- **Evidentiary Vault**: Case file repository protected by Section 126 Attorney-Client privilege.

### 3. Operations Administration (`/admin/dashboard`)
- Centralized administration console for verified lawyer onboarding, audit trails, invitations, and compliance metrics.

---

## ⚡ Demo Accounts (For Evaluation & Inspection)

NyayLink includes two genuine Supabase Auth accounts pre-configured with distinct database roles and sample legal matters:

| Role | Email | Destination |
| :--- | :--- | :--- |
| **Demo Client** | `demo.client@nyay.live` | `/dashboard` |
| **Demo Lawyer** | `demo.lawyer@nyay.live` | `/lawyer/dashboard` |

### Instant Quick Login
On the login screen (`/auth/login`), click either **Continue as Demo Client** or **Continue as Demo Lawyer**. These shortcuts initiate a server-side SSR authentication handler (`/api/auth/demo-login`), establish authentic Supabase session cookies, verify the user's actual database role in `public.user_roles`, and redirect directly to the respective portal.

---

## 🛠️ Local Development

### 1. Clone & Install
```bash
git clone https://github.com/rushanadv/NyayLink.git
cd NyayLink/nyayalink-app
npm install
```

### 2. Environment Variables
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> # Server-side only
OPENROUTER_API_KEY=<your-openrouter-key>
```

### 3. Database Migrations
Migrations are managed in `supabase/migrations/`:
```bash
npx supabase db push # or apply via Supabase CLI
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚖️ Legal & Regulatory Compliance
NyayLink is an informational infrastructure and technology platform, not a law firm. In strict compliance with Section 36 of the Advocates Act, 1961, and the Bar Council of India Rules, NyayLink does not advertise legal services, solicit briefs, or receive referral commissions.
